import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api';
import Swal from 'sweetalert2';
import {
    Box, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, Chip, Dialog, DialogTitle, DialogContent,Grid,
    DialogActions, IconButton, LinearProgress
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Description as DescriptionIcon,
    DateRange as DateRangeIcon,
    LocationOn as LocationIcon,
    Category as CategoryIcon,
    ConfirmationNumber as ReferenceIcon,
    ArrowBack as BackIcon,
    Close as CloseIcon,
    Visibility as ViewIcon,
    VisibilityOff as DisabledIcon
} from '@mui/icons-material';

const TendersPage = () => {
    const navigate = useNavigate();
    const [tenders, setTenders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTender, setSelectedTender] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        fetchTenders();
    }, []);

    const fetchTenders = async () => {
        try {
            const response = await api.get('/api/tenders');
            setTenders(response.data.data.tenders);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to fetch tenders',
                background: 'rgba(255, 255, 255, 0.9)'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleViewTender = (tender) => {
        // Check if closing date has passed
        const isClosed = new Date(tender.closingDate) < new Date();
        if (isClosed) {
            setSelectedTender(tender);
            setOpenDialog(true);
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Tender Not Closed',
                text: 'This tender is still active and cannot be viewed until the closing date has passed.',
                background: 'rgba(255, 255, 255, 0.9)'
            });
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedTender(null);
    };

    const handleBack = () => {
        navigate('/procurement-officer-dashboard');
    };

    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <Paper elevation={3} sx={{ p: 4, textAlign: 'center', width: 400 }}>
                    <LinearProgress color="primary" sx={{ height: 8, borderRadius: 4, mb: 2 }} />
                    <Typography variant="h6" color="primary">Loading tenders...</Typography>
                </Paper>
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    All Tenders
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<BackIcon />}
                    onClick={handleBack}
                    sx={{
                        background: 'linear-gradient(45deg, #2E7D32 30%, #4CAF50 90%)',
                        borderRadius: 2,
                        boxShadow: '0 3px 5px 2px rgba(46, 125, 50, 0.1)',
                        '&:hover': {
                            boxShadow: '0 3px 10px 2px rgba(46, 125, 50, 0.2)'
                        }
                    }}
                >
                    Back to Dashboard
                </Button>
            </Box>

            <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Reference No</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Closing Date</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tenders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <Typography variant="body1" color="text.secondary">
                                            No tenders found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tenders.map((tender) => {
                                    const isClosed = new Date(tender.closingDate) < new Date();
                                    return (
                                        <TableRow key={tender._id}>
                                            <TableCell>{tender.referenceNo}</TableCell>
                                            <TableCell>{tender.title}</TableCell>
                                            <TableCell>{tender.category}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={isClosed ? 'Closed' : 'Active'}
                                                    color={isClosed ? 'error' : 'success'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {new Date(tender.closingDate).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <IconButton
                                                    onClick={() => handleViewTender(tender)}
                                                    color={isClosed ? "primary" : "default"}
                                                    disabled={!isClosed}
                                                >
                                                    {isClosed ? <ViewIcon /> : <DisabledIcon />}
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Tender Details Dialog */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
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
                        <DescriptionIcon sx={{ mr: 1 }} />
                        <Typography variant="h6">Tender Details</Typography>
                    </Box>
                    <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ py: 3 }}>
                    {selectedTender && (
                        <Box>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    {selectedTender.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Reference No: {selectedTender.referenceNo}
                                </Typography>
                            </Box>

                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                                        <Typography>{selectedTender.category}</Typography>
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                                        <Typography>{selectedTender.location}</Typography>
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Starting Date</Typography>
                                        <Typography>
                                            {new Date(selectedTender.startingDate).toLocaleString()}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Closing Date</Typography>
                                        <Typography>
                                            {new Date(selectedTender.closingDate).toLocaleString()}
                                        </Typography>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Tender Details</Typography>
                                        <Typography>{selectedTender.details}</Typography>
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                                        <Chip
                                            label={new Date(selectedTender.closingDate) < new Date() ? 'Closed' : 'Active'}
                                            color={new Date(selectedTender.closingDate) < new Date() ? 'error' : 'success'}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>
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
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default TendersPage;