import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import logo from '../../../assets/img/navlogo.png';
import background from '../../../assets/img/background.jpg'; // Add a background image
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
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRequestData({ ...requestData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !requestData.category ||
      !requestData.subCategory ||
      !requestData.title ||
      !requestData.reason ||
      !requestData.colorPickup ||
      !requestData.currentItemCount ||
      !requestData.damagedItemCount ||
      !requestData.newItemRequestCount
    ) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please fill all required fields!',
      });
      return;
    }
    const newRequest = {
      ...requestData,
      id: Date.now(),
      status: 'Pending',
    };
    const existingRequests = JSON.parse(localStorage.getItem('requests')) || [];
    localStorage.setItem('requests', JSON.stringify([...existingRequests, newRequest]));
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: 'Request submitted successfully!',
    });
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
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <Box
      sx={{
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AppBar position="static" sx={{ backgroundColor: '#253B80' }}>
        <Toolbar>
          <img src={logo} alt="Logo" style={{ height: 50 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}></Typography>
          <Button color="inherit" onClick={() => navigate('/hod-dashboard')}>Home</Button>
          <Button color="inherit" onClick={() => navigate('/request-status')}>Request Status</Button>
          <Button color="inherit" onClick={() => navigate('/contact-us')}>Contact Us</Button>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Container
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '50%',
            backdropFilter: 'blur(100px)',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 3,
          }}
        >
          <Typography variant="h5" gutterBottom>Request Items</Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Category" name="category" value={requestData.category} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Sub Category" name="subCategory" value={requestData.subCategory} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Title" name="title" value={requestData.title} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Reason" name="reason" value={requestData.reason} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Color Pickup" name="colorPickup" value={requestData.colorPickup} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Current Item Count" name="currentItemCount" type="number" value={requestData.currentItemCount} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Damaged Item Count" name="damagedItemCount" type="number" value={requestData.damagedItemCount} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="New Item Request Count" name="newItemRequestCount" type="number" value={requestData.newItemRequestCount} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Note" name="note" value={requestData.note} onChange={handleChange} multiline rows={4} />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" style={{ background: "#253B80" }}>Submit Request</Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default HODDashboard;
