import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api';
import Swal from 'sweetalert2';
import logo from '../../../assets/img/navlogo.png';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
  Paper,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import EventIcon from '@mui/icons-material/Event';
import CategoryIcon from '@mui/icons-material/Category';
import TitleIcon from '@mui/icons-material/Title';
import DescriptionIcon from '@mui/icons-material/Description';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import NoteIcon from '@mui/icons-material/Note';
import CancelIcon from '@mui/icons-material/Cancel';

const RequestStatus = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) throw new Error('User not logged in');
        const response = await api.get(`api/requests/user/${userId}`);
        setRequests(response.data.data || []);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to fetch requests',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRequest(null);
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
      background: 'linear-gradient(145deg, #ffffff, #f5f5f5)'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        navigate('/');
      }
    });
  };

  const statusColors = {
    'HOD': 'warning',
    'Logistics Officer': 'success',
    'Warehouse Officer': 'info',
    'Rector': 'secondary',
    'Procurement Officer': 'error',
    'Rejected Logistics Officer': 'error',
    'Rejected Rector': 'error',
    'Rejected Procurement Officer': 'error'
  };

  const getApprovalStatus = (request) => {
    if (request.requestStage.includes('Rejected')) {
      return {
        label: 'Rejected',
        color: 'error',
        icon: <CancelIcon color="error" />
      };
    }
    if (request.isApproved === true) {
      return {
        label: 'Approved',
        color: 'success',
        icon: <CheckCircleIcon color="success" />
      };
    }
    if (request.isApproved === false) {
      return {
        label: 'Pending',
        color: 'warning',
        icon: <PendingIcon color="warning" />
      };
    }
    return {
      label: 'Pending',
      color: 'warning',
      icon: <PendingIcon color="warning" />
    };
  };

  const getRejectionDetails = (request) => {
    if (request.requestStage === 'Rejected Logistics Officer') {
      return {
        rejectedBy: 'Logistics Officer',
        rejectedAt: request.LogisticscreatedAt,
        rejectedByUser: request.LogisticsUserID,
        note: request.note
      };
    }
    if (request.requestStage === 'Rejected Rector') {
      return {
        rejectedBy: 'Rector',
        rejectedAt: request.RectorcreatedAt,
        rejectedByUser: request.RectorUserID,
        note: request.note
      };
    }
    if (request.requestStage === 'Rejected Procurement Officer') {
      return {
        rejectedBy: 'Procurement Officer',
        rejectedAt: request.ProcurementcreatedAt,
        rejectedByUser: request.ProcurementUserID,
        note: request.note
      };
    }
    return null;
  };

  const approvalSteps = [
    { key: 'HODUser', label: 'HOD Requested' },
    { key: 'LogisticsUser', label: 'Logistics Approval' },
    { key: 'RectorUser', label: 'Rector Approval' },
    { key: 'ProcurementUser', label: 'Procurement Approval' }
  ];

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <Typography variant="h6">Loading requests...</Typography>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <AppBar position="static" sx={{
        background: 'linear-gradient(135deg, #253B80 0%, #1E88E5 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <Toolbar>
          <img src={logo} alt="Logo" style={{ height: 50 }} />
          <Box sx={{ flexGrow: 1 }} />
          <Button color="inherit" onClick={() => navigate('/hod-dashboard')}>Home</Button>
          <Button color="inherit" onClick={() => navigate('/request-status')}>Request Status</Button>
          <Button color="inherit" onClick={() => navigate('/contact-us')}>Contact Us</Button>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4 }}>
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              My Requests
            </Typography>
            {requests.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography variant="body1">No requests found.</Typography>
                <Button
                  variant="contained"
                  sx={{ mt: 2, backgroundColor: '#253B80' }}
                  onClick={() => navigate('/hod-dashboard')}
                >
                  Create New Request
                </Button>
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Request ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Approval</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {requests.map((request) => {
                      const approvalStatus = getApprovalStatus(request);
                      return (
                        <TableRow key={request._id} hover>
                          <TableCell>{request._id.substring(0, 8)}...</TableCell>
                          <TableCell>{request.category}</TableCell>
                          <TableCell>{request.title}</TableCell>
                          <TableCell>
                            <Chip
                              label={request.requestStage}
                              color={statusColors[request.requestStage] || 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={approvalStatus.label}
                              size="small"
                              color={approvalStatus.color}
                              variant="outlined"
                              icon={approvalStatus.icon}
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(request.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              onClick={() => handleViewDetails(request)}
                              color="primary"
                              size="small"
                            >
                              <InfoIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Container>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#253B80',
          color: 'white'
        }}>
          <Box display="flex" alignItems="center">
            <DescriptionIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Request Details</Typography>
          </Box>
          <IconButton onClick={handleCloseDialog} color="inherit">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ py: 3 }}>
          {selectedRequest && (
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <EventIcon color="action" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">
                          <b>Request ID:</b> {selectedRequest._id}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" mb={1}>
                        <CategoryIcon color="action" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">
                          <b>Category:</b> {selectedRequest.category}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <CategoryIcon color="action" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">
                          <b>Sub Category:</b> {selectedRequest.subCategory}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <PendingIcon color="action" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">
                          <b>Status:</b>
                          <Chip
                            label={selectedRequest.requestStage}
                            color={statusColors[selectedRequest.requestStage] || 'default'}
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" mb={1}>
                        <CheckCircleIcon color="action" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">
                          <b>Approval:</b>
                          <Chip
                            label={getApprovalStatus(selectedRequest).label}
                            size="small"
                            color={getApprovalStatus(selectedRequest).color}
                            variant="outlined"
                            icon={getApprovalStatus(selectedRequest).icon}
                            sx={{ ml: 1 }}
                          />
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <EventIcon color="action" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">
                          <b>Date Created:</b> {new Date(selectedRequest.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>

              {/* Request Details */}
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <TitleIcon sx={{ mr: 1 }} /> Request Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Box mb={3}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Title</Typography>
                    <Typography>{selectedRequest.title}</Typography>
                  </Box>

                  <Box mb={3}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Reason</Typography>
                    <Typography>{selectedRequest.reason}</Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box mb={2}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                          <ColorLensIcon sx={{ mr: 1, fontSize: '1rem' }} /> Color Pickup
                        </Typography>
                        <Typography>{selectedRequest.colorPickup}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box mb={2}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Current Item Count</Typography>
                        <Typography>{selectedRequest.currentItemCount}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box mb={2}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Damaged Item Count</Typography>
                        <Typography>{selectedRequest.damagedItemCount}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box mb={2}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>New Item Request Count</Typography>
                        <Typography>{selectedRequest.newItemRequestCount}</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>

              {/* Rejection Details (if rejected) */}
              {selectedRequest.requestStage.includes('Rejected') && (
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ p: 2, borderColor: 'error.main' }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
                      <CancelIcon sx={{ mr: 1 }} /> Rejection Details
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    {getRejectionDetails(selectedRequest) && (
                      <>
                        <Box mb={2}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Rejected By</Typography>
                          <Typography>{getRejectionDetails(selectedRequest).rejectedBy}</Typography>
                        </Box>
                        <Box mb={2}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Rejected At</Typography>
                          <Typography>
                            {new Date(getRejectionDetails(selectedRequest).rejectedAt).toLocaleString()}
                          </Typography>
                        </Box>
                        {/* <Box mb={2}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Rejected By User</Typography>
                          <Typography>{getRejectionDetails(selectedRequest).rejectedByUser?.fullName || 'N/A'}</Typography>
                        </Box> */}
                        <Box mb={2}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Rejection Note</Typography>
                          <Typography>{getRejectionDetails(selectedRequest).note || 'No reason provided'}</Typography>
                        </Box>
                      </>
                    )}
                  </Card>
                </Grid>
              )}

              {/* Approval Flow Stepper */}
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon sx={{ mr: 1 }} /> Request Approval Flow
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Stepper activeStep={approvalSteps.findIndex(step => !selectedRequest[step.key])} alternativeLabel>
                    {approvalSteps.map((step) => {
                      const user = selectedRequest[step.key];
                      const isRejected = selectedRequest.requestStage.includes('Rejected');
                      const isRejectedAtThisStep = 
                        (step.label === 'Logistics Approval' && selectedRequest.requestStage === 'Rejected Logistics Officer') ||
                        (step.label === 'Rector Approval' && selectedRequest.requestStage === 'Rejected Rector') ||
                        (step.label === 'Procurement Approval' && selectedRequest.requestStage === 'Rejected Procurement Officer');

                      return (
                        <Step key={step.key}>
                          <StepLabel
                            icon={
                              isRejectedAtThisStep ? 
                                <CancelIcon color="error" /> : 
                                user ? 
                                  <CheckCircleIcon color={isRejected ? 'disabled' : 'success'} /> : 
                                  <PendingIcon color={isRejected ? 'disabled' : 'action'} />
                            }
                          >
                            {step.label}
                            {user && (
                              <Typography variant="body2" color={isRejected ? 'text.disabled' : 'text.secondary'}>
                                Requested by {user.fullName} ({user.email}) ({user._id})
                              </Typography>
                            )}
                            {isRejectedAtThisStep && (
                              <Typography variant="body2" color="error">
                                Rejected on {new Date(getRejectionDetails(selectedRequest).rejectedAt).toLocaleDateString()}
                              </Typography>
                            )}
                          </StepLabel>
                        </Step>
                      );
                    })}
                  </Stepper>
                </Card>
              </Grid>

              {/* Additional Notes */}
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <NoteIcon sx={{ mr: 1 }} /> Additional Notes
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography>
                    {selectedRequest.note || 'No additional notes provided'}
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={handleCloseDialog}
            variant="contained"
            sx={{ backgroundColor: '#253B80' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RequestStatus;