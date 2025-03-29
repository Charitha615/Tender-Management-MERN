import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api';
import Swal from 'sweetalert2';
import logo from '../../../assets/img/navlogo.png';
import background from '../../../assets/img/background.jpg';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Inventory as InventoryIcon
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
  Badge
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Info as DetailsIcon,
  Close as CloseIcon,
  School as SchoolIcon,
  Gavel as GavelIcon,
  Logout as LogoutIcon,
  Home as HomeIcon,
  Star as FeaturesIcon,
  BarChart as StatsIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';

// Custom styled components
const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(12px)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.25)'
  }
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.25)',
    minWidth: '600px',
    border: '1px solid rgba(255, 255, 255, 0.18)'
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
  })
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const RectorDashboard = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const userId = localStorage.getItem('userId');
    try {
      const [pendingResponse, approvedResponse, rejectedResponse] = await Promise.all([
        api.get('/api/rector/pending'),
        api.get(`/api/rector/approved/${userId}`),
        api.get(`/api/rector/rejected/${userId}`)
      ]);

      setRequests(pendingResponse.data);
      setStats({
        pending: pendingResponse.data.length,
        approved: approvedResponse.data.length,
        rejected: rejectedResponse.data.length
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
    } else {
      fetchRejectedRequests();
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await api.get('/api/rector/pending');
      setRequests(response.data);
      setStats(prev => ({ ...prev, pending: response.data.length }));
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const fetchApprovedRequests = async () => {
    const userId = localStorage.getItem('userId');
    try {
      const response = await api.get(`/api/rector/approved/${userId}`);
      setRequests(response.data);
      setStats(prev => ({ ...prev, approved: response.data.length }));
    } catch (error) {
      console.error('Error fetching approved requests:', error);
    }
  };

  const fetchRejectedRequests = async () => {
    const userId = localStorage.getItem('userId');
    try {
      const response = await api.get(`/api/rector/rejected/${userId}`);
      setRequests(response.data);
      setStats(prev => ({ ...prev, rejected: response.data.length }));
    } catch (error) {
      console.error('Error fetching rejected requests:', error);
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRequest(null);
    setRejectionReason('');
  };

  const handleApprove = async (requestId) => {
    const result = await Swal.fire({
      title: 'Confirm Approval',
      text: 'Are you sure you want to approve this request?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#9C27B0',
      cancelButtonColor: '#F44336',
      confirmButtonText: 'Yes, approve it!',
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(5px)'
    });

    if (result.isConfirmed) {
      try {
        const userId = localStorage.getItem('userId');
        await api.post(`/api/rector/approve/${requestId}`, {
          rectorIsApproved: true,
          rectorUserID: userId
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
        await api.patch(`/api/rector/rector-reject/${selectedRequest._id}`, {
          rectorRejectionReason: rejectionReason,
          rectorUserID: userId
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
          <LinearProgress color="secondary" sx={{ height: 8, borderRadius: 4, mb: 2 }} />
          <Typography variant="h6" color="secondary">Loading requests...</Typography>
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
        background: 'linear-gradient(135deg, #6A1B9A 0%, #9C27B0 100%)',
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
              Rector Dashboard
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              color="inherit"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/rector-dashboard')}
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
              onClick={() => navigate('/rector-statistics')}
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
              onClick={() => navigate('/rector-features')}
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
          <Grid item xs={12} md={4}>
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
          <Grid item xs={12} md={4}>
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
          <Grid item xs={12} md={4}>
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
                    background: 'linear-gradient(90deg, #9C27B0 0%, #E91E63 100%)',
                    borderRadius: '4px 4px 0 0'
                  }
                }}
              >
                <Tab
                  label={
                    <Badge badgeContent={stats.pending} color="warning" sx={{ mr: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <GavelIcon sx={{ mr: 1 }} />
                        Pending Approval
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
                    tabValue === 1 ? 'No approved requests' : 'No rejected requests'}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {tabValue === 0 ? 'All clear!' :
                    tabValue === 1 ? 'You haven\'t approved any requests yet' : 'You haven\'t rejected any requests yet'}
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
                              {request.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              ID: {request._id.substring(0, 8)}... • {request.category} / {request.subCategory}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              <StatusChip
                                status={request.requestStage}
                                label={request.requestStage}
                                size="small"
                              />
                              <Chip
                                label={
                                  request.isApproved === null
                                    ? 'Rejected'
                                    : request.isApproved
                                      ? 'Approved'
                                      : 'Pending'
                                }
                                size="small"
                                color={
                                  request.isApproved === null
                                    ? 'error'
                                    : request.isApproved
                                      ? 'success'
                                      : 'warning'
                                }
                                variant="outlined"
                              />
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
                            <IconButton
                              onClick={() => handleViewDetails(request)}
                              sx={{
                                color: 'secondary.main',
                                background: 'rgba(156, 39, 176, 0.1)',
                                '&:hover': { background: 'rgba(156, 39, 176, 0.2)' }
                              }}
                            >
                              <DetailsIcon />
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
          background: 'linear-gradient(135deg, #6A1B9A 0%, #9C27B0 100%)',
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
                background: 'rgba(106, 27, 154, 0.05)',
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
                      selectedRequest.isApproved === null
                        ? 'Rejected'
                        : selectedRequest.isApproved
                          ? 'Approved'
                          : 'Pending'
                    }
                    size="small"
                    color={
                      selectedRequest.isApproved === null
                        ? 'error'
                        : selectedRequest.isApproved
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
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'secondary.main' }}>
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

                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'secondary.main' }}>
                      <InventoryIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Item Details
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">Color</Typography>
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
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'secondary.main' }}>
                      <TimelineIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Approval Timeline
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        HOD Approval
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
                            {selectedRequest.HODIsApproved ?
                              `Approved on ${new Date(selectedRequest.HODApprovalDate).toLocaleString()}` :
                              'Pending approval'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {selectedRequest.LogisticsUser && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                          Logistics Approval
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
                              {selectedRequest.logisticsIsApproved ?
                                `Approved on ${new Date(selectedRequest.logisticsApprovalDate).toLocaleString()}` :
                                'Pending approval'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}

                    {selectedRequest.rectorRejectionReason && (
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                          Rejection Reason
                        </Typography>
                        <Paper elevation={0} sx={{ p: 2, background: 'rgba(244, 67, 54, 0.05)', borderRadius: 2 }}>
                          <Typography>{selectedRequest.rectorRejectionReason}</Typography>
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
            color="secondary"
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #9C27B0 30%, #E91E63 90%)',
              borderRadius: 2,
              boxShadow: '0 3px 5px 2px rgba(156, 39, 176, 0.1)',
              '&:hover': {
                boxShadow: '0 3px 10px 2px rgba(156, 39, 176, 0.2)'
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </StyledDialog>
    </Box>
  );
};

export default RectorDashboard;