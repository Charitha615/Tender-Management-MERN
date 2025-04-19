import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api';
import Swal from 'sweetalert2';
import logo from '../../../assets/img/navlogo.png';
import background from '../../../assets/img/procurement-bg.jpg'; // Different background image
import HistoryIcon from '@mui/icons-material/History';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import {
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Inventory as InventoryIcon,
    Assignment as TenderIcon,
    Gavel as GavelIcon,
    Description as DescriptionIcon,
    DateRange as DateRangeIcon,
    LocationOn as LocationIcon,
    Category as CategoryIcon,
    ConfirmationNumber as ReferenceIcon
} from '@mui/icons-material';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Container,
    Tabs,
    Tab,
    Box,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    Grid,
    DialogActions,
    TextField,
    IconButton,
    Avatar,
    Divider,
    LinearProgress,
    Paper,
    styled,
    Slide,
    Badge,
    Menu,
    MenuItem,
    InputAdornment
} from '@mui/material';
import {
    CheckCircle as ApproveIcon,
    Cancel as RejectIcon,
    Info as DetailsIcon,
    Close as CloseIcon,
    School as SchoolIcon,
    Logout as LogoutIcon,
    Home as HomeIcon,
    Star as FeaturesIcon,
    BarChart as StatsIcon,
    Timeline as TimelineIcon,
    Add as AddIcon,
    MoreVert as MoreIcon,
    ArrowBack as BackIcon
} from '@mui/icons-material';

// Custom styled components
const GlassCard = styled(Card)(({ theme }) => ({
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(12px)',
    borderRadius: '12px',
    boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 8px 30px 0 rgba(0, 0, 0, 0.15)'
    }
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
        minWidth: '600px'
    }
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontSize: '0.7rem',
    ...(status === 'Logistics Officer' && {
        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
        color: 'white'
    }),
    ...(status === 'Rector' && {
        background: 'linear-gradient(45deg, #9C27B0 30%, #E91E63 90%)',
        color: 'white'
    }),
    ...(status === 'HOD' && {
        background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
        color: 'white'
    }),
    ...(status === 'Procurement Officer' && {
        background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
        color: 'white'
    })
}));

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const ProcurementDashboard = () => {
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [openTenderDetailsDialog, setOpenTenderDetailsDialog] = useState(false);
    const [openTenderDialog, setOpenTenderDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        rejected: 0,
        tenders: 0
    });
    const [anchorEl, setAnchorEl] = useState(null);
    const [tenderForm, setTenderForm] = useState({
        title: '',
        location: '',
        category: '',
        referenceNo: `T-${Math.floor(100000 + Math.random() * 900000)}`, // Auto-generated reference
        startingDate: '',
        closingDate: '',
        details: ''
    });

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        const userId = localStorage.getItem('userId');
        try {
            const [pendingResponse, approvedResponse, rejectedResponse, tendersResponse] = await Promise.all([
                api.get('/api/procurement/pending'),
                api.get(`/api/procurement/approved/${userId}`),
                api.get(`/api/procurement/rejected/${userId}`),
                api.get('/api/tenders/count')
            ]);

            setRequests(pendingResponse.data);
            setStats({
                pending: pendingResponse.data.length,
                approved: approvedResponse.data.length,
                rejected: rejectedResponse.data.length,
                tenders: tendersResponse.data.count
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to fetch requests',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(5px)'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        if (newValue === 0) {
            fetchPendingRequests();
        } else if (newValue === 1) {
            fetchApprovedRequests();
        } else if (newValue === 2) {
            fetchRejectedRequests();
        } else {
            fetchTenders();
        }
    };

    const fetchPendingRequests = async () => {
        try {
            const response = await api.get('/api/procurement/pending');
            setRequests(response.data);
            setStats(prev => ({ ...prev, pending: response.data.length }));
        } catch (error) {
            console.error('Error fetching pending requests:', error);
        }
    };

    const fetchApprovedRequests = async () => {
        const userId = localStorage.getItem('userId');
        try {
            const response = await api.get(`/api/procurement/approved/${userId}`);
            setRequests(response.data);
            setStats(prev => ({ ...prev, approved: response.data.length }));
        } catch (error) {
            console.error('Error fetching approved requests:', error);
        }
    };

    const fetchRejectedRequests = async () => {
        const userId = localStorage.getItem('userId');
        try {
            const response = await api.get(`/api/procurement/rejected/${userId}`);
            setRequests(response.data);
            setStats(prev => ({ ...prev, rejected: response.data.length }));
        } catch (error) {
            console.error('Error fetching rejected requests:', error);
        }
    };

    const fetchTenders = async () => {
        try {
            const response = await api.get('/api/tenders');
            console.log("response.data are", response.data.data.tenders)
            setRequests(response.data.data.tenders);
        } catch (error) {
            console.error('Error fetching tenders:', error);
        }
    };

    const handleViewDetails = (request) => {
        setSelectedRequest(request);
        setOpenDialog(true);
    };

    const handleViewTender = (request) => {
        setSelectedRequest(request);
        setOpenTenderDetailsDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setOpenTenderDetailsDialog(false);
        setSelectedRequest(null);
        setRejectionReason('');
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleCreateTender = (request) => {
        setSelectedRequest(request);
        setTenderForm({
            ...tenderForm,
            title: `${request.title} - Procurement`,
            category: request.category,
            details: `Tender for ${request.newItemRequestCount} units of ${request.title} (${request.colorPickup})`
        });
        setOpenTenderDialog(true);
        handleMenuClose();
    };

    const handleTenderFormChange = (e) => {
        const { name, value } = e.target;
        setTenderForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmitTender = async () => {
        if (!tenderForm.title || !tenderForm.startingDate || !tenderForm.closingDate) {
            Swal.fire({
                icon: 'error',
                title: 'Missing Information',
                text: 'Please fill in all required fields',
                background: 'rgba(255, 255, 255, 0.9)'
            });
            return;
        }

        try {

            const userId = localStorage.getItem('userId');
            const response = await api.post('/api/tenders', {
                ...tenderForm,
                requestId: selectedRequest._id,
                procurementUserID: userId
            });

            Swal.fire({
                title: 'Success!',
                text: 'Tender created successfully!',
                icon: 'success',
                background: 'rgba(255, 255, 255, 0.9)',
                showConfirmButton: false,
                timer: 1500
            });

            setOpenTenderDialog(false);
            fetchPendingRequests();
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || 'Failed to create tender',
                icon: 'error',
                background: 'rgba(255, 255, 255, 0.9)'
            });
        }
    };

    const handleApprove = async (requestId) => {
        const result = await Swal.fire({
            title: 'Confirm Approval',
            text: 'Are you sure you want to approve this request?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4CAF50',
            cancelButtonColor: '#F44336',
            confirmButtonText: 'Yes, approve it!',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(5px)'
        });

        if (result.isConfirmed) {
            try {
                const userId = localStorage.getItem('userId');
                await api.post(`/api/procurement/approve/${requestId}`, {
                    procurementIsApproved: true,
                    procurementUserID: userId
                });

                Swal.fire({
                    title: 'Approved!',
                    text: 'Request approved successfully!',
                    icon: 'success',
                    background: 'rgba(255, 255, 255, 0.9)',
                    showConfirmButton: false,
                    timer: 1500
                });

                fetchPendingRequests();
            } catch (error) {
                Swal.fire({
                    title: 'Error',
                    text: error.response?.data?.message || 'Approval failed',
                    icon: 'error',
                    background: 'rgba(255, 255, 255, 0.9)'
                });
            }
        }
    };

    const handleReject = async () => {
        setOpenDialog(false);
        if (!rejectionReason) {
            Swal.fire({
                title: 'Error',
                text: 'Please provide a rejection reason',
                icon: 'error',
                background: 'rgba(255, 255, 255, 0.9)'
            });
            return;
        }

        const result = await Swal.fire({
            title: 'Confirm Rejection',
            text: 'Are you sure you want to reject this request?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#F44336',
            cancelButtonColor: '#2196F3',
            confirmButtonText: 'Yes, reject it!',
            background: 'rgba(255, 255, 255, 0.9)'
        });

        if (result.isConfirmed) {
            try {
                const userId = localStorage.getItem('userId');
                await api.patch(`/api/procurement/reject/${selectedRequest._id}`, {
                    procurementRejectionReason: rejectionReason,
                    procurementUserID: userId
                });

                Swal.fire({
                    title: 'Rejected!',
                    text: 'Request rejected successfully!',
                    icon: 'success',
                    background: 'rgba(255, 255, 255, 0.9)',
                    showConfirmButton: false,
                    timer: 1500
                });

                fetchPendingRequests();
                handleCloseDialog();
            } catch (error) {
                Swal.fire({
                    title: 'Error',
                    text: error.response?.data?.message || 'Rejection failed',
                    icon: 'error',
                    background: 'rgba(255, 255, 255, 0.9)'
                });
            }
        }
    };

    const handleLogout = () => {
        Swal.fire({
            title: 'Logout?',
            text: 'Are you sure you want to logout?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#253B80',
            cancelButtonColor: '#F44336',
            confirmButtonText: 'Yes, logout!',
            background: 'rgba(255, 255, 255, 0.9)'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.clear();
                navigate('/');
            }
        });
    };

    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundImage: `url(${background})`,
                backgroundSize: 'cover'
            }}>
                <GlassCard sx={{ p: 4, textAlign: 'center', width: 400 }}>
                    <LinearProgress color="primary" sx={{ height: 8, borderRadius: 4, mb: 2 }} />
                    <Typography variant="h6" color="primary">Loading requests...</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>Please wait while we fetch your data</Typography>
                </GlassCard>
            </Box>
        );
    }

    return (
        <Box sx={{
            backgroundImage: `url(${background})`,
            backgroundSize: 'cover',
            backgroundAttachment: 'fixed',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <AppBar position="static" sx={{
                background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
                <Toolbar>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                        <img src={logo} alt="Logo" style={{ height: 40, marginRight: 16 }} />
                        <Typography variant="h6" component="div" sx={{
                            fontWeight: 'bold',
                            background: 'linear-gradient(45deg, #FFFFFF 30%, #EEEEEE 90%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Procurement Dashboard
                        </Typography>
                    </Box>

                    <Box sx={{ flexGrow: 1 }} />

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            color="inherit"
                            startIcon={<HomeIcon />}
                            onClick={() => navigate('/procurement-dashboard')}
                            sx={{
                                '&:hover': {
                                    background: 'rgba(255,255,255,0.1)',
                                    transform: 'translateY(-2px)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Home
                        </Button>
                        <Button
                            color="inherit"
                            startIcon={<StatsIcon />}
                            onClick={() => navigate('/procurement-statistics')}
                            sx={{
                                '&:hover': {
                                    background: 'rgba(255,255,255,0.1)',
                                    transform: 'translateY(-2px)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Statistics
                        </Button>
                        <Button
                            color="inherit"
                            startIcon={<FeaturesIcon />}
                            onClick={() => navigate('/procurement-features')}
                            sx={{
                                '&:hover': {
                                    background: 'rgba(255,255,255,0.1)',
                                    transform: 'translateY(-2px)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Features
                        </Button>
                        <Button
                            color="inherit"
                            startIcon={<LogoutIcon />}
                            onClick={handleLogout}
                            sx={{
                                '&:hover': {
                                    background: 'rgba(255,0,0,0.1)',
                                    transform: 'translateY(-2px)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Logout
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            <Container sx={{ py: 4, flexGrow: 1 }}>
                {/* Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={3}>
                        <GlassCard>
                            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{
                                    mr: 3,
                                    background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)'
                                }}>
                                    <GavelIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Pending Requests</Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.pending}</Typography>
                                </Box>
                            </CardContent>
                        </GlassCard>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <GlassCard>
                            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{
                                    mr: 3,
                                    background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)'
                                }}>
                                    <CheckCircleIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Approved Requests</Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.approved}</Typography>
                                </Box>
                            </CardContent>
                        </GlassCard>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <GlassCard>
                            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{
                                    mr: 3,
                                    background: 'linear-gradient(45deg, #F44336 30%, #E57373 90%)'
                                }}>
                                    <CancelIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Rejected Requests</Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.rejected}</Typography>
                                </Box>
                            </CardContent>
                        </GlassCard>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <GlassCard>
                            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{
                                    mr: 3,
                                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)'
                                }}>
                                    <TenderIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Active Tenders</Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.tenders}</Typography>
                                </Box>
                            </CardContent>
                        </GlassCard>
                    </Grid>
                </Grid>

                <GlassCard>
                    <CardContent>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                            <Tabs
                                value={tabValue}
                                onChange={handleTabChange}
                                variant="fullWidth"
                                sx={{
                                    '& .MuiTabs-indicator': {
                                        height: 4,
                                        background: 'linear-gradient(90deg, #2E7D32 0%, #4CAF50 100%)',
                                        borderRadius: '4px 4px 0 0'
                                    }
                                }}
                            >
                                <Tab
                                    label={
                                        <Badge badgeContent={stats.pending} color="warning" sx={{ mr: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <GavelIcon sx={{ mr: 1 }} />
                                                Pending
                                            </Box>
                                        </Badge>
                                    }
                                    sx={{ fontWeight: 'bold' }}
                                />
                                <Tab
                                    label={
                                        <Badge badgeContent={stats.approved} color="success" sx={{ mr: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <CheckCircleIcon sx={{ mr: 1 }} />
                                                Approved
                                            </Box>
                                        </Badge>
                                    }
                                    sx={{ fontWeight: 'bold' }}
                                />
                                <Tab
                                    label={
                                        <Badge badgeContent={stats.rejected} color="error" sx={{ mr: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <CancelIcon sx={{ mr: 1 }} />
                                                Rejected
                                            </Box>
                                        </Badge>
                                    }
                                    sx={{ fontWeight: 'bold' }}
                                />
                                <Tab
                                    label={
                                        <Badge badgeContent={stats.tenders} color="info" sx={{ mr: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <TenderIcon sx={{ mr: 1 }} />
                                                Tenders
                                            </Box>
                                        </Badge>
                                    }
                                    sx={{ fontWeight: 'bold' }}
                                />
                            </Tabs>
                        </Box>

                        {requests.length === 0 ? (
                            <Box sx={{
                                textAlign: 'center',
                                py: 8,
                                background: 'rgba(255, 255, 255, 0.7)',
                                borderRadius: 2,
                                backdropFilter: 'blur(5px)'
                            }}>
                                <SchoolIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary">
                                    {tabValue === 0 ? 'No pending requests' :
                                        tabValue === 1 ? 'No approved requests' :
                                            tabValue === 2 ? 'No rejected requests' : 'No active tenders'}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    {tabValue === 0 ? 'All clear!' :
                                        tabValue === 1 ? 'You haven\'t approved any requests yet' :
                                            tabValue === 2 ? 'You haven\'t rejected any requests yet' : 'No tenders created yet'}
                                </Typography>
                            </Box>
                        ) : (
                            <Grid container spacing={3}>
                                {requests.map((request) => (
                                    <Grid item xs={12} key={request._id}>
                                        <GlassCard>
                                            <CardContent>
                                                <Box sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    gap: 2
                                                }}>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                            {request.title || request.tenderTitle}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                            {request._id.substring(0, 8)}... • {request.category || request.tenderCategory}
                                                            {request.subCategory && ` / ${request.subCategory}`}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                            <StatusChip
                                                                status={request.requestStage || 'Tender'}
                                                                label={request.requestStage || 'Tender'}
                                                                size="small"
                                                            />
                                                            {tabValue !== 3 && (
                                                                <Chip
                                                                    label={
                                                                        request.procurementIsApproved === null
                                                                            ? 'Rejected'
                                                                            : request.procurementIsApproved
                                                                                ? 'Approved'
                                                                                : 'Pending'
                                                                    }
                                                                    size="small"
                                                                    color={
                                                                        request.procurementIsApproved === null
                                                                            ? 'error'
                                                                            : request.procurementIsApproved
                                                                                ? 'success'
                                                                                : 'warning'
                                                                    }
                                                                    variant="outlined"
                                                                />
                                                            )}
                                                            {tabValue === 3 && (
                                                                <Chip
                                                                    label={
                                                                        new Date(request.closingDate) > new Date() ? 'Active' : 'Closed'
                                                                    }
                                                                    size="small"
                                                                    color={
                                                                        new Date(request.closingDate) > new Date() ? 'success' : 'error'
                                                                    }
                                                                    variant="outlined"
                                                                />
                                                            )}
                                                        </Box>
                                                    </Box>
                                                    <Box sx={{ display: 'flex' }}>
                                                        {tabValue === 0 && (
                                                            <>
                                                                <IconButton
                                                                    onClick={() => handleApprove(request._id)}
                                                                    sx={{
                                                                        color: 'success.main',
                                                                        background: 'rgba(76, 175, 80, 0.1)',
                                                                        '&:hover': { background: 'rgba(76, 175, 80, 0.2)' },
                                                                        mr: 1
                                                                    }}
                                                                >
                                                                    <ApproveIcon />
                                                                </IconButton>
                                                                <IconButton
                                                                    onClick={() => handleViewDetails(request)}
                                                                    sx={{
                                                                        color: 'error.main',
                                                                        background: 'rgba(244, 67, 54, 0.1)',
                                                                        '&:hover': { background: 'rgba(244, 67, 54, 0.2)' },
                                                                        mr: 1
                                                                    }}
                                                                >
                                                                    <RejectIcon />
                                                                </IconButton>
                                                            </>
                                                        )}
                                                        {tabValue === 1 && selectedRequest?.Tender !== true && (
                                                            <IconButton
                                                                onClick={() => handleCreateTender(request)}
                                                                sx={{
                                                                    color: 'info.main',
                                                                    background: 'rgba(33, 150, 243, 0.1)',
                                                                    '&:hover': { background: 'rgba(33, 150, 243, 0.2)' },
                                                                    mr: 1
                                                                }}
                                                            >
                                                                <TenderIcon />
                                                            </IconButton>
                                                        )}
                                                        <IconButton
                                                            onClick={(e) => {
                                                                setSelectedRequest(request);
                                                                handleMenuOpen(e);
                                                            }}
                                                            sx={{
                                                                color: 'primary.main',
                                                                background: 'rgba(46, 125, 50, 0.1)',
                                                                '&:hover': { background: 'rgba(46, 125, 50, 0.2)' }
                                                            }}
                                                        >
                                                            <MoreIcon />
                                                        </IconButton>
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </GlassCard>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </CardContent>
                </GlassCard>
            </Container>

            {/* Request Details Dialog */}
            <StyledDialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
                TransitionComponent={Transition}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
                    color: 'white',
                    py: 2
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SchoolIcon sx={{ mr: 1 }} />
                        <Typography variant="h6">Request Details</Typography>
                    </Box>
                    <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ py: 3 }}>
                    {selectedRequest && (
                        <Box>
                            {/* Header Section */}
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 3,
                                p: 2,
                                background: 'rgba(46, 125, 50, 0.05)',
                                borderRadius: 2,
                                backdropFilter: 'blur(5px)'
                            }}>
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{selectedRequest.title}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        ID: {selectedRequest._id} • Created: {new Date(selectedRequest.createdAt).toLocaleString()}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <StatusChip
                                        status={selectedRequest.requestStage}
                                        label={selectedRequest.requestStage}
                                    />
                                    <Chip
                                        label={
                                            selectedRequest.procurementIsApproved === null
                                                ? 'Rejected'
                                                : selectedRequest.procurementIsApproved
                                                    ? 'Approved'
                                                    : 'Pending'
                                        }
                                        size="small"
                                        color={
                                            selectedRequest.procurementIsApproved === null
                                                ? 'error'
                                                : selectedRequest.procurementIsApproved
                                                    ? 'success'
                                                    : 'warning'
                                        }
                                        variant="outlined"
                                    />
                                </Box>
                            </Box>

                            <Grid container spacing={3}>
                                {/* Left Column */}
                                <Grid item xs={12} md={6}>
                                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, height: '100%', background: 'transparent' }}>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                                            <DetailsIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                            Request Information
                                        </Typography>

                                        <Box sx={{ mb: 3 }}>
                                            <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                                            <Typography sx={{ mb: 2 }}>{selectedRequest.category} / {selectedRequest.subCategory}</Typography>

                                            <Typography variant="subtitle2" color="text.secondary">Reason</Typography>
                                            <Typography sx={{ mb: 2 }}>{selectedRequest.reason}</Typography>

                                            {selectedRequest.note && (
                                                <>
                                                    <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
                                                    <Typography>{selectedRequest.note}</Typography>
                                                </>
                                            )}
                                        </Box>

                                        <Divider sx={{ my: 2 }} />

                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                                            <InventoryIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                            Item Details
                                        </Typography>

                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Typography variant="subtitle2" color="text.secondary">Color/Specification</Typography>
                                                <Typography>{selectedRequest.colorPickup}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="subtitle2" color="text.secondary">Current Qty</Typography>
                                                <Typography>{selectedRequest.currentItemCount}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="subtitle2" color="text.secondary">Damaged Qty</Typography>
                                                <Typography>{selectedRequest.damagedItemCount}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="subtitle2" color="text.secondary">Requested Qty</Typography>
                                                <Typography>{selectedRequest.newItemRequestCount}</Typography>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Grid>

                                {/* Right Column */}
                                <Grid item xs={12} md={6}>
                                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, height: '100%', background: 'transparent' }}>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                                            <TimelineIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                            Approval Timeline
                                        </Typography>

                                        <Box sx={{ mb: 3 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                HOD
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <Avatar sx={{
                                                    mr: 2,
                                                    background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)'
                                                }}>
                                                    {selectedRequest.HODUser?.fullName?.charAt(0) || 'H'}
                                                </Avatar>
                                                <Box>
                                                    <Typography>{selectedRequest.HODUser?.fullName || 'Not available'}</Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {selectedRequest.HODUser?.email || ''}
                                                    </Typography>
                                                    <Typography variant="caption" display="block">
                                                        {selectedRequest.HODcreatedAt ?
                                                            `Requested on ${new Date(selectedRequest.HODcreatedAt).toLocaleString()}` :
                                                            'Pending approval'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>

                                        {selectedRequest.LogisticsUser && (
                                            <Box sx={{ mb: 3 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                    Logistics
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Avatar sx={{
                                                        mr: 2,
                                                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)'
                                                    }}>
                                                        {selectedRequest.LogisticsUser.fullName.charAt(0)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography>{selectedRequest.LogisticsUser.fullName}</Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {selectedRequest.LogisticsUser.email}
                                                        </Typography>
                                                        <Typography variant="caption" display="block">
                                                            {selectedRequest.LogisticscreatedAt ?
                                                                `Approved on ${new Date(selectedRequest.LogisticscreatedAt).toLocaleString()}` :
                                                                'Pending approval'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        )}

                                        {selectedRequest.RectorUser && (
                                            <Box sx={{ mb: 3 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                    Rector
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Avatar sx={{
                                                        mr: 2,
                                                        background: 'linear-gradient(135deg, #6A1B9A 0%, #9C27B0 100%)',
                                                    }}>
                                                        {selectedRequest.RectorUser.fullName.charAt(0)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography>{selectedRequest.RectorUser.fullName}</Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {selectedRequest.RectorUser.email}
                                                        </Typography>
                                                        <Typography variant="caption" display="block">
                                                            {selectedRequest.RectorcreatedAt ?
                                                                `Approved on ${new Date(selectedRequest.RectorcreatedAt).toLocaleString()}` :
                                                                'Pending approval'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        )}

                                        {selectedRequest.ProcurementUser && (
                                            <Box sx={{ mb: 3 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                    Procurement Officer
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Avatar sx={{
                                                        mr: 2,
                                                        background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)'
                                                    }}>
                                                        {selectedRequest.ProcurementUser.fullName.charAt(0)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography>{selectedRequest.ProcurementUser.fullName}</Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {selectedRequest.ProcurementUser.email}
                                                        </Typography>
                                                        <Typography variant="caption" display="block">
                                                            {selectedRequest.ProcurementcreatedAt ?
                                                                `Approved on ${new Date(selectedRequest.ProcurementcreatedAt).toLocaleString()}` :
                                                                'Pending approval'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        )}

                                        {selectedRequest.requestStage === "Rejected Logistics Officer" && (
                                            <Box sx={{ mt: 2, p: 2, background: 'rgba(244, 67, 54, 0.05)', borderRadius: 2 }}>
                                                <Typography variant="subtitle2" color="error" sx={{ fontWeight: 'bold' }}>
                                                    Rejected by Logistics Officer
                                                </Typography>
                                                <Typography variant="body2">{selectedRequest.note}</Typography>
                                                <Typography variant="caption" display="block">
                                                    {new Date(selectedRequest.LogisticscreatedAt).toLocaleString()}
                                                </Typography>
                                            </Box>
                                        )}

                                        {selectedRequest.requestStage === "Rejected Rector" && (
                                            <Box sx={{ mt: 2, p: 2, background: 'rgba(244, 67, 54, 0.05)', borderRadius: 2 }}>
                                                <Typography variant="subtitle2" color="error" sx={{ fontWeight: 'bold' }}>
                                                    Rejected by Rector
                                                </Typography>
                                                <Typography variant="body2">{selectedRequest.note}</Typography>
                                                <Typography variant="caption" display="block">
                                                    {new Date(selectedRequest.RectorcreatedAt).toLocaleString()}
                                                </Typography>
                                            </Box>
                                        )}

                                        {selectedRequest.requestStage === "Rejected Procurement Officer" && (
                                            <Box sx={{ mt: 2, p: 2, background: 'rgba(244, 67, 54, 0.05)', borderRadius: 2 }}>
                                                <Typography variant="subtitle2" color="error" sx={{ fontWeight: 'bold' }}>
                                                    Rejected by Procurement Officer
                                                </Typography>
                                                <Typography variant="body2">{selectedRequest.note}</Typography>
                                                <Typography variant="caption" display="block">
                                                    {new Date(selectedRequest.ProcurementcreatedAt).toLocaleString()}
                                                </Typography>
                                            </Box>
                                        )}

                                        {selectedRequest.procurementRejectionReason && (
                                            <Box>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                    Rejection Reason
                                                </Typography>
                                                <Paper elevation={0} sx={{ p: 2, background: 'rgba(244, 67, 54, 0.05)', borderRadius: 2 }}>
                                                    <Typography>{selectedRequest.procurementRejectionReason}</Typography>
                                                </Paper>
                                            </Box>
                                        )}
                                    </Paper>
                                </Grid>
                            </Grid>

                            {tabValue === 0 && (
                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                        <RejectIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'error.main' }} />
                                        Rejection Reason
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Please provide a detailed reason for rejection..."
                                        variant="outlined"
                                        sx={{ mb: 2 }}
                                        InputProps={{
                                            sx: {
                                                borderRadius: 2,
                                                borderColor: 'divider',
                                                background: 'rgba(255, 255, 255, 0.7)',
                                                backdropFilter: 'blur(5px)'
                                            }
                                        }}
                                    />
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{
                    p: 2,
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderTop: '1px solid rgba(0,0,0,0.1)'
                }}>
                    {tabValue === 0 && (
                        <Button
                            onClick={handleReject}
                            color="error"
                            variant="contained"
                            startIcon={<RejectIcon />}
                            sx={{
                                background: 'linear-gradient(45deg, #F44336 30%, #E57373 90%)',
                                borderRadius: 2,
                                boxShadow: '0 3px 5px 2px rgba(244, 67, 54, 0.1)',
                                '&:hover': {
                                    boxShadow: '0 3px 10px 2px rgba(244, 67, 54, 0.2)'
                                }
                            }}
                        >
                            Reject Request
                        </Button>
                    )}
                    <Button
                        onClick={handleCloseDialog}
                        color="primary"
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(45deg, #2E7D32 30%, #4CAF50 90%)',
                            borderRadius: 2,
                            boxShadow: '0 3px 5px 2px rgba(46, 125, 50, 0.1)',
                            '&:hover': {
                                boxShadow: '0 3px 10px 2px rgba(46, 125, 50, 0.2)'
                            }
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </StyledDialog>



            {/* Tender Details Dialog */}
            <StyledDialog
                open={openTenderDetailsDialog}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
                TransitionComponent={Transition}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
                    color: 'white',
                    py: 2
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SchoolIcon sx={{ mr: 1 }} />
                        <Typography variant="h6">Tender & Request Details</Typography>
                    </Box>
                    <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ py: 3 }}>
                    {selectedRequest && (
                        <Box>
                            {/* Header Section */}
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 3,
                                p: 2,
                                background: 'rgba(46, 125, 50, 0.05)',
                                borderRadius: 2,
                                backdropFilter: 'blur(5px)'
                            }}>
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{selectedRequest.title}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Reference No: {selectedRequest.referenceNo} • Created: {new Date(selectedRequest.createdAt).toLocaleString()}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Location: {selectedRequest.location}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                                    <StatusChip
                                        status={selectedRequest.status}
                                        label={selectedRequest.status === 'active' ? 'Active Tender' : 'Inactive'}
                                    />
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                        <Chip
                                            label={`${new Date(selectedRequest.startingDate).toLocaleDateString()} - ${new Date(selectedRequest.closingDate).toLocaleDateString()}`}
                                            size="small"
                                            color="info"
                                            variant="outlined"
                                            icon={<EventIcon fontSize="small" />}
                                        />
                                    </Box>
                                </Box>
                            </Box>

                            <Grid container spacing={3}>
                                {/* Left Column - Tender Information */}
                                <Grid item xs={12} md={6}>
                                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, height: '100%', border: '1px solid rgba(0,0,0,0.1)' }}>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                                            <DescriptionIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                            Tender Information
                                        </Typography>

                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" color="text.secondary">Tender Details</Typography>
                                            <Typography sx={{ mb: 2 }}>{selectedRequest.details}</Typography>
                                        </Box>

                                        <Grid container spacing={2} sx={{ mb: 2 }}>
                                            <Grid item xs={6}>
                                                <Typography variant="subtitle2" color="text.secondary">Starting Date</Typography>
                                                <Typography>
                                                    {new Date(selectedRequest.startingDate).toLocaleString()}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="subtitle2" color="text.secondary">Closing Date</Typography>
                                                <Typography>
                                                    {new Date(selectedRequest.closingDate).toLocaleString()}
                                                </Typography>
                                            </Grid>
                                        </Grid>

                                        <Divider sx={{ my: 2 }} />

                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                                            <PersonIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                            Procurement Officer
                                        </Typography>

                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                                {(selectedRequest.ProcurementUser?.fullName || selectedRequest.createdBy?.fullName || '').charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography>{selectedRequest.ProcurementUser?.fullName || selectedRequest.createdBy?.fullName}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {(selectedRequest.ProcurementUser?.email || selectedRequest.createdBy?.email)} /
                                                    {(selectedRequest.ProcurementUser?.phoneNumber || selectedRequest.createdBy?.phoneNumber)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Grid>

                                {/* Right Column - Request Information */}
                                <Grid item xs={12} md={6}>
                                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, height: '100%', border: '1px solid rgba(0,0,0,0.1)' }}>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                                            <DetailsIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                            Original Request Information
                                        </Typography>

                                        <Box sx={{ mb: 3 }}>
                                            <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                                            <Typography sx={{ mb: 2 }}>
                                                {selectedRequest.category || selectedRequest.requestId?.category} / {selectedRequest.subCategory || selectedRequest.requestId?.subCategory}
                                            </Typography>

                                            <Typography variant="subtitle2" color="text.secondary">Reason</Typography>
                                            <Typography sx={{ mb: 2 }}>{selectedRequest.reason || selectedRequest.requestId?.reason}</Typography>

                                            {(selectedRequest.note || selectedRequest.requestId?.note) && (
                                                <>
                                                    <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
                                                    <Typography>{selectedRequest.note || selectedRequest.requestId?.note}</Typography>
                                                </>
                                            )}
                                        </Box>

                                        <Divider sx={{ my: 2 }} />

                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                                            <InventoryIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                            Item Details
                                        </Typography>

                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Typography variant="subtitle2" color="text.secondary">Color/Specification</Typography>
                                                <Typography>{selectedRequest.colorPickup || selectedRequest.requestId?.colorPickup}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="subtitle2" color="text.secondary">Current Qty</Typography>
                                                <Typography>{selectedRequest.currentItemCount || selectedRequest.requestId?.currentItemCount}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="subtitle2" color="text.secondary">Damaged Qty</Typography>
                                                <Typography>{selectedRequest.damagedItemCount || selectedRequest.requestId?.damagedItemCount}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="subtitle2" color="text.secondary">Requested Qty</Typography>
                                                <Typography>{selectedRequest.newItemRequestCount || selectedRequest.requestId?.newItemRequestCount}</Typography>
                                            </Grid>
                                        </Grid>

                                        <Divider sx={{ my: 2 }} />

                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                                            <HowToRegIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                            Approval Status
                                        </Typography>

                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            <Chip
                                                label={`HOD: ${selectedRequest.HODisApproved || selectedRequest.requestId?.HODisApproved ? 'Approved' : 'Pending'}`}
                                                color={(selectedRequest.HODisApproved || selectedRequest.requestId?.HODisApproved) ? 'success' : 'warning'}
                                                size="small"
                                                variant="outlined"
                                            />
                                            <Chip
                                                label={`Logistics: ${selectedRequest.LogisticsisApproved || selectedRequest.requestId?.LogisticsisApproved ? 'Approved' : 'Pending'}`}
                                                color={(selectedRequest.LogisticsisApproved || selectedRequest.requestId?.LogisticsisApproved) ? 'success' : 'warning'}
                                                size="small"
                                                variant="outlined"
                                            />
                                            <Chip
                                                label={`Rector: ${selectedRequest.RectorisApproved || selectedRequest.requestId?.RectorisApproved ? 'Approved' : 'Pending'}`}
                                                color={(selectedRequest.RectorisApproved || selectedRequest.requestId?.RectorisApproved) ? 'success' : 'warning'}
                                                size="small"
                                                variant="outlined"
                                            />
                                            <Chip
                                                label={`Procurement: ${selectedRequest.ProcurementisApproved || selectedRequest.requestId?.ProcurementisApproved ? 'Approved' : 'Pending'}`}
                                                color={(selectedRequest.ProcurementisApproved || selectedRequest.requestId?.ProcurementisApproved) ? 'success' : 'warning'}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid>

                            {/* Timeline Section - Custom implementation without @mui/lab */}
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                                    <HistoryIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                    Approval History
                                </Typography>
                                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.1)' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {/* HOD Approval */}
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Box sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                bgcolor: (selectedRequest.HODisApproved || selectedRequest.requestId?.HODisApproved) ? 'success.main' : 'grey.300',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mr: 2
                                            }}>
                                                <HowToRegIcon sx={{ color: 'white' }} />
                                            </Box>
                                            <Box>
                                                <Typography fontWeight="bold">HOD Approval</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {(selectedRequest.HODisApproved || selectedRequest.requestId?.HODisApproved) ?
                                                        `Approved on ${new Date(selectedRequest.HODcreatedAt || selectedRequest.requestId?.HODcreatedAt).toLocaleString()}` :
                                                        'Pending'}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Logistics Approval */}
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Box sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                bgcolor: (selectedRequest.LogisticsisApproved || selectedRequest.requestId?.LogisticsisApproved) ? 'success.main' : 'grey.300',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mr: 2
                                            }}>
                                                <LocalShippingIcon sx={{ color: 'white' }} />
                                            </Box>
                                            <Box>
                                                <Typography fontWeight="bold">Logistics Approval</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {(selectedRequest.LogisticsisApproved || selectedRequest.requestId?.LogisticsisApproved) ?
                                                        `Approved on ${new Date(selectedRequest.LogisticscreatedAt || selectedRequest.requestId?.LogisticscreatedAt).toLocaleString()}` :
                                                        'Pending'}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Rector Approval */}
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Box sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                bgcolor: (selectedRequest.RectorisApproved || selectedRequest.requestId?.RectorisApproved) ? 'success.main' : 'grey.300',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mr: 2
                                            }}>
                                                <SchoolIcon sx={{ color: 'white' }} />
                                            </Box>
                                            <Box>
                                                <Typography fontWeight="bold">Rector Approval</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {(selectedRequest.RectorisApproved || selectedRequest.requestId?.RectorisApproved) ?
                                                        `Approved on ${new Date(selectedRequest.RectorcreatedAt || selectedRequest.requestId?.RectorcreatedAt).toLocaleString()}` :
                                                        'Pending'}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Procurement Approval */}
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Box sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                bgcolor: (selectedRequest.ProcurementisApproved || selectedRequest.requestId?.ProcurementisApproved) ? 'success.main' : 'grey.300',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mr: 2
                                            }}>
                                                <ShoppingBasketIcon sx={{ color: 'white' }} />
                                            </Box>
                                            <Box>
                                                <Typography fontWeight="bold">Procurement Approval</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {(selectedRequest.ProcurementisApproved || selectedRequest.requestId?.ProcurementisApproved) ?
                                                        `Approved on ${new Date(selectedRequest.ProcurementcreatedAt || selectedRequest.requestId?.ProcurementcreatedAt).toLocaleString()}` :
                                                        'Pending'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{
                    p: 2,
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderTop: '1px solid rgba(0,0,0,0.1)'
                }}>
                    <Button
                        onClick={handleCloseDialog}
                        color="primary"
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(45deg, #2E7D32 30%, #4CAF50 90%)',
                            borderRadius: 2,
                            boxShadow: '0 3px 5px 2px rgba(46, 125, 50, 0.1)',
                            '&:hover': {
                                boxShadow: '0 3px 10px 2px rgba(46, 125, 50, 0.2)'
                            }
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </StyledDialog>

            {/* Tender Creation Dialog */}
            <StyledDialog
                open={openTenderDialog}
                onClose={() => setOpenTenderDialog(false)}
                maxWidth="md"
                fullWidth
                TransitionComponent={Transition}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #1565C0 0%, #2196F3 100%)',
                    color: 'white',
                    py: 2
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TenderIcon sx={{ mr: 1 }} />
                        <Typography variant="h6">Create New Tender</Typography>
                    </Box>
                    <IconButton onClick={() => setOpenTenderDialog(false)} sx={{ color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ py: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Tender Title"
                                name="title"
                                value={tenderForm.title}
                                onChange={handleTenderFormChange}
                                variant="outlined"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <DescriptionIcon color="primary" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ mb: 2 }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Location"
                                name="location"
                                value={tenderForm.location}
                                onChange={handleTenderFormChange}
                                variant="outlined"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LocationIcon color="primary" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Tender Category"
                                name="category"
                                value={tenderForm.category}
                                onChange={handleTenderFormChange}
                                variant="outlined"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <CategoryIcon color="primary" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Tender Reference No"
                                name="referenceNo"
                                value={tenderForm.referenceNo}
                                variant="outlined"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <ReferenceIcon color="primary" />
                                        </InputAdornment>
                                    ),
                                    readOnly: true
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Starting Date & Time"
                                name="startingDate"
                                type="datetime-local"
                                value={tenderForm.startingDate}
                                onChange={handleTenderFormChange}
                                variant="outlined"
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <DateRangeIcon color="primary" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Closing Date & Time"
                                name="closingDate"
                                type="datetime-local"
                                value={tenderForm.closingDate}
                                onChange={handleTenderFormChange}
                                variant="outlined"
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <DateRangeIcon color="primary" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                                Tender Details (from request)
                            </Typography>
                            <Paper elevation={0} sx={{ p: 2, background: 'rgba(33, 150, 243, 0.05)', borderRadius: 2 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" color="text.secondary">Title</Typography>
                                        <Typography>{selectedRequest?.title}</Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                                        <Typography>{selectedRequest?.category} / {selectedRequest?.subCategory}</Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" color="text.secondary">Reason for Tender</Typography>
                                        <Typography>{selectedRequest?.reason}</Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" color="text.secondary">Required Color/Specification</Typography>
                                        <Typography>{selectedRequest?.colorPickup}</Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" color="text.secondary">New Item Request Count</Typography>
                                        <Typography>{selectedRequest?.newItemRequestCount}</Typography>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Additional Tender Details"
                                name="details"
                                value={tenderForm.details}
                                onChange={handleTenderFormChange}
                                multiline
                                rows={4}
                                variant="outlined"
                                sx={{ mt: 2 }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{
                    p: 2,
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderTop: '1px solid rgba(0,0,0,0.1)'
                }}>
                    <Button
                        onClick={() => setOpenTenderDialog(false)}
                        color="primary"
                        variant="outlined"
                        startIcon={<BackIcon />}
                        sx={{
                            borderRadius: 2,
                            borderColor: 'primary.main',
                            '&:hover': {
                                borderColor: 'primary.dark'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmitTender}
                        color="primary"
                        variant="contained"
                        startIcon={<CheckCircleIcon />}
                        sx={{
                            background: 'linear-gradient(45deg, #1565C0 30%, #2196F3 90%)',
                            borderRadius: 2,
                            boxShadow: '0 3px 5px 2px rgba(21, 101, 192, 0.1)',
                            '&:hover': {
                                boxShadow: '0 3px 10px 2px rgba(21, 101, 192, 0.2)'
                            }
                        }}
                    >
                        Create Tender
                    </Button>
                </DialogActions>
            </StyledDialog>

            {/* Context Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                        },
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >

                {tabValue !== 3 && (
                    <MenuItem onClick={() => {
                        handleViewDetails(selectedRequest);
                        handleMenuClose();
                    }}>
                        <Avatar sx={{ background: 'rgba(33, 150, 243, 0.1)', color: '#2196F3' }}>
                            <DetailsIcon fontSize="small" />
                        </Avatar>
                        View Details
                    </MenuItem>

                )}
                {tabValue === 1 && selectedRequest?.Tender !== true && (
                    <MenuItem onClick={() => {
                        handleCreateTender(selectedRequest);
                        handleMenuClose();
                    }}>
                        <Avatar sx={{ background: 'rgba(33, 150, 243, 0.1)', color: '#2196F3' }}>
                            <TenderIcon fontSize="small" />
                        </Avatar>
                        Create Tender
                    </MenuItem>
                )}
                {tabValue === 3 && (
                    <MenuItem onClick={() => {
                        handleViewTender(selectedRequest);
                        handleMenuClose();
                    }}>
                        <Avatar sx={{ background: 'rgba(33, 150, 243, 0.1)', color: '#2196F3' }}>
                            <TenderIcon fontSize="small" />
                        </Avatar>
                        View Tender
                    </MenuItem>
                )}
            </Menu>
        </Box>
    );
};

export default ProcurementDashboard;