import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../../api';
import logo from '../../../assets/img/navlogo.png';
import background from '../../../assets/img/background.jpg';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Paper,
  TextField,
  Box,
  Grid,
} from '@mui/material';

const HODDashboard = () => {
  const navigate = useNavigate();
  const [requestData, setRequestData] = useState({
    category: '',
    subCategory: '',
    title: '',
    reason: '',
    colorPickup: '',
    currentItemCount: '',
    damagedItemCount: '',
    newItemRequestCount: '',
    note: '',
    requestStage: 'Logistics Officer',
    isApproved: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRequestData({ ...requestData, [name]: value });
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setRequestData({ ...requestData, [name]: parseInt(value) || 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !requestData.category ||
      !requestData.subCategory ||
      !requestData.title ||
      !requestData.reason ||
      !requestData.colorPickup ||
      requestData.currentItemCount === '' ||
      requestData.damagedItemCount === '' ||
      requestData.newItemRequestCount === ''
    ) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please fill all required fields!',
      });
      return;
    }

    try {
      // Get user info from localStorage
      const userId = localStorage.getItem('userId');
      const userRole = localStorage.getItem('userRole');

      if (!userId || !userRole) {
        throw new Error('User information not found. Please login again.');
      }

      // Prepare the request payload
      const payload = {
        ...requestData,
        requestedUserID: userId,
        requestedUserRole: userRole,
        HODisApproved: true,
        HODcreatedAt: Date.now(),
        HODUserID: userId,
        currentItemCount: parseInt(requestData.currentItemCount),
        damagedItemCount: parseInt(requestData.damagedItemCount),
        newItemRequestCount: parseInt(requestData.newItemRequestCount)
      };

      // Submit to API
      const response = await api.post('api/requests', payload);

      console.log("response", response);

      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Request submitted successfully!',
      });

      // Reset form
      setRequestData({
        category: '',
        subCategory: '',
        title: '',
        reason: '',
        colorPickup: '',
        currentItemCount: '',
        damagedItemCount: '',
        newItemRequestCount: '',
        note: '',
        requestStage: 'HOD',
        isApproved: false
      });

    } catch (error) {
      console.error('Request submission failed:', error);
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: error.response?.data?.message || error.message || 'Failed to submit request',
      });
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
       background: 'linear-gradient(145deg, #ffffff, #f5f5f5)'
     }).then((result) => {
       if (result.isConfirmed) {
         localStorage.clear();
         navigate('/');
       }
     });
   };

  return (
    <Box
      sx={{
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AppBar position="static" sx={{ 
              background: 'linear-gradient(135deg, #253B80 0%, #1E88E5 100%)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
        <Toolbar>
          <img src={logo} alt="Logo" style={{ height: 50 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}></Typography>
          <Button color="inherit" onClick={() => navigate('/hod-dashboard')}>Home</Button>
          <Button color="inherit" onClick={() => navigate('/request-status')}>Request Status</Button>
          {/* <Button color="inherit" onClick={() => navigate('/contact-us')}>Contact Us</Button> */}
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Container
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          py: 4,
          flexGrow: 1,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: '800px',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            borderRadius: 3,
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>Request Items</Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Category"
                  name="category"
                  value={requestData.category}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Sub Category"
                  name="subCategory"
                  value={requestData.subCategory}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={requestData.title}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason"
                  name="reason"
                  value={requestData.reason}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Color Pickup"
                  name="colorPickup"
                  value={requestData.colorPickup}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Current Item Count"
                  name="currentItemCount"
                  type="number"
                  value={requestData.currentItemCount}
                  onChange={handleNumberChange}
                  inputProps={{ min: 0 }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Damaged Item Count"
                  name="damagedItemCount"
                  type="number"
                  value={requestData.damagedItemCount}
                  onChange={handleNumberChange}
                  inputProps={{ min: 0 }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="New Item Request Count"
                  name="newItemRequestCount"
                  type="number"
                  value={requestData.newItemRequestCount}
                  onChange={handleNumberChange}
                  inputProps={{ min: 0 }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Note"
                  name="note"
                  value={requestData.note}
                  onChange={handleChange}
                  multiline
                  rows={4}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={{
                    backgroundColor: '#253B80',
                    '&:hover': { backgroundColor: '#1a2d5a' }
                  }}
                >
                  Submit Request
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default HODDashboard;