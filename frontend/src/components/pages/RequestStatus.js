import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/img/navlogo.png';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
} from '@mui/material';

const RequestStatus = () => {
  const navigate = useNavigate();

  // Fetch requests from local storage
  const requests = JSON.parse(localStorage.getItem('requests')) || [];

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Top Navigation Bar */}
      <AppBar position="static" sx={{ backgroundColor: '#253B80' }}>
      <Toolbar>
        <img src={logo} alt="Logo" style={{ height: 50 }} /> 
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {/* Removed the text "HOD Dashboard" */}
        </Typography>
        <Button color="inherit" onClick={() => navigate('/hod-dashboard')}>
          Home
        </Button>
        <Button color="inherit" onClick={() => navigate('/request-status')}>
          Request Status
        </Button>
        <Button color="inherit" onClick={() => navigate('/contact-us')}>
          Contact Us
        </Button>
        <Button color="inherit" onClick={handleLogout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>

      {/* Request Status Table */}
      <Container sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Request Status
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.id}</TableCell>
                    <TableCell>{request.category}</TableCell>
                    <TableCell>{request.title}</TableCell>
                    <TableCell>{request.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </Box>
  );
};

export default RequestStatus;