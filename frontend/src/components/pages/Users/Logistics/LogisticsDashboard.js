import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api';
import Swal from 'sweetalert2';
import logo from '../../../assets/img/navlogo.png';
import background from '../../../assets/img/background.jpg';
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
  IconButton
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Info as DetailsIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const LogisticsDashboard = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      // Fetch all requests (no authentication in backend)
      const response = await api.get('/api/logistics/pending');
      setRequests(response.data);
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // When switching tabs, fetch the appropriate data
    if (newValue === 0) {
      fetchPendingRequests();
    } else {
      fetchApprovedRequests();
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await api.get('/api/logistics/pending');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const fetchApprovedRequests = async () => {
    try {
      const logisticsUserID = localStorage.getItem('userId');
      const response = await api.get(`/api/logistics/by-logistics-user/${logisticsUserID}`);
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching approved requests:', error);
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
    try {
      const userId = localStorage.getItem('userId');
      await api.post(`/api/logistics/approve/${requestId}`, {
        logisticsIsApproved: true,
        // logisticsCreatedAt: Date.now(),
        logisticsUserID: userId
      });
      Swal.fire('Success', 'Request approved successfully!', 'success');
      fetchPendingRequests(); // Refresh the pending requests list
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Approval failed', 'error');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) {
      Swal.fire('Error', 'Please provide a rejection reason', 'error');
      return;
    }

    try {
      await api.patch(`/api/logistics/reject/${selectedRequest._id}`, {
        reason: rejectionReason
      });
      Swal.fire('Success', 'Request rejected successfully!', 'success');
      fetchPendingRequests(); // Refresh the pending requests list
      handleCloseDialog();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Rejection failed', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6">Loading requests...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      backgroundImage: `url(${background})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <AppBar position="static" sx={{ backgroundColor: '#253B80' }}>
        <Toolbar>
          <img src={logo} alt="Logo" style={{ height: 50 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} />
          <Button color="inherit" onClick={() => navigate('/logistics-dashboard')}>Home</Button>
          <Button color="inherit" onClick={() => navigate('/logistics-features')}>Special Features</Button>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4, flexGrow: 1 }}>
        <Card sx={{ borderRadius: 3, backgroundColor: 'rgba(255, 255, 255, 0.85)' }}>
          <CardContent>
            <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
              <Tab label="Pending Approval" />
              <Tab label="My Approved Requests" />
            </Tabs>

            {requests.length === 0 ? (
              <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
                {tabValue === 0 ? 'No pending requests' : 'No approved requests found'}
              </Typography>
            ) : (
              <Box>
                {requests.map((request) => (
                  <Card key={request._id} sx={{ mb: 2, p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle1">
                          <strong>Request ID:</strong> {request._id.substring(0, 8)}...
                        </Typography>
                        <Typography variant="body1">
                          <strong>Title:</strong> {request.title}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Category:</strong> {request.category} / {request.subCategory}
                        </Typography>
                        <Chip
                          label={request.requestStage}
                          color={
                            request.requestStage === 'Logistics Officer' ? 'primary' :
                              request.requestStage === 'Warehouse Officer' ? 'success' : 'default'
                          }
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      <Box>
                        {tabValue === 0 && (
                          <>
                            <IconButton
                              color="success"
                              onClick={() => handleApprove(request._id)}
                              sx={{ mr: 1 }}
                            >
                              <ApproveIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleViewDetails(request)}
                            >
                              <RejectIcon />
                            </IconButton>
                          </>
                        )}
                        <IconButton
                          color="info"
                          onClick={() => handleViewDetails(request)}
                          sx={{ ml: 1 }}
                        >
                          <DetailsIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </Card>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>

      {/* Request Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Request Details
          <IconButton onClick={handleCloseDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedRequest && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>Request Information</Typography>
              <Box sx={{ mb: 3 }}>
                <Typography><strong>ID:</strong> {selectedRequest._id}</Typography>
                <Typography><strong>Title:</strong> {selectedRequest.title}</Typography>
                <Typography><strong>Category:</strong> {selectedRequest.category} / {selectedRequest.subCategory}</Typography>
                <Typography><strong>Status:</strong>
                  <Chip
                    label={selectedRequest.requestStage}
                    color={
                      selectedRequest.requestStage === 'Logistics Officer' ? 'primary' :
                        selectedRequest.requestStage === 'Warehouse Officer' ? 'success' : 'default'
                    }
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Box>

              <Typography variant="h6" gutterBottom>Requested By</Typography>
              <Box sx={{ mb: 3 }}>
                <Typography><strong>User ID:</strong> {selectedRequest.HODUser._id}</Typography>
                <Typography><strong>Officer Name:</strong> {selectedRequest.HODUser.fullName}</Typography>
                <Typography><strong>Officer Email:</strong> {selectedRequest.HODUser.email}</Typography>

              </Box>

              <Typography variant="h6" gutterBottom>Item Details</Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={4}>
                  <Typography><strong>Color:</strong> {selectedRequest.colorPickup}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography><strong>Current Qty:</strong> {selectedRequest.currentItemCount}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography><strong>Damaged Qty:</strong> {selectedRequest.damagedItemCount}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography><strong>Requested Qty:</strong> {selectedRequest.newItemRequestCount}</Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>Reason</Typography>
              <Typography sx={{ mb: 3 }}>{selectedRequest.reason}</Typography>

              {selectedRequest.note && (
                <>
                  <Typography variant="h6" gutterBottom>Notes</Typography>
                  <Typography sx={{ mb: 3 }}>{selectedRequest.note}</Typography>
                </>
              )}

              {tabValue === 0 && (
                <>
                  <Typography variant="h6" gutterBottom>Rejection Reason</Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a reason for rejection..."
                    sx={{ mb: 2 }}
                  />
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {tabValue === 0 && (
            <Button
              onClick={handleReject}
              color="error"
              variant="contained"
              startIcon={<RejectIcon />}
            >
              Reject Request
            </Button>
          )}
          <Button
            onClick={handleCloseDialog}
            color="primary"
            variant="contained"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LogisticsDashboard;