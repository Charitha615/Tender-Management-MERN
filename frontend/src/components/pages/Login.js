import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Swal from 'sweetalert2'; // Import SweetAlert2
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
} from '@mui/material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  if (email === 'admin' && password === 'admin') {
    navigate('/super-admin-dashboard');
    return;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Hardcoded admin login for testing
  

    try {
      const response = await api.post('api/auth/login', { email, password });

      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: 'You have successfully logged in!',
      });

    

      // Redirect based on user role
      if (response.data.user.isActive) {
          // Store user data in local storage
      localStorage.setItem('userId', response.data.user._id);
      localStorage.setItem('userRole', response.data.user.userRole);
        switch (response.data.user.userRole) {
          case 'HOD':
            navigate('/hod-dashboard');
            break;
          case 'Logistics Officer':
            navigate('/logistics-officer-dashboard');
            break;
          case 'Warehouse Officer':
            navigate('/warehouse-officer-dashboard');
            break;
          case 'Rector':
            navigate('/rector-dashboard');
            break;
          case 'Supplier':
            navigate('/supplier-dashboard');
            break;
          case 'Procurement Officer':
            navigate('/procurement-officer-dashboard');
            break;
          default:
            navigate('/user-dashboard');
        }
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Account Inactive',
          text: 'Your account is not active. Please contact the administrator.',
        });
      }
    } catch (error) {
      // Show error message
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: error.response?.data?.message || 'An error occurred. Please try again.',
      });
      console.error('Login Error:', error);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        background: '#f5f5f5', // Light background for the entire page
      }}
    >
      {/* Left Section: Visual Design */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
          color: 'white',
          p: 4,
          borderRadius: '0 20px 20px 0',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Box sx={{ textAlign: 'center', maxWidth: '600px' }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          General Sir John Kotelawala Defence University Southern campus 
          </Typography>
          <Typography variant="h5" sx={{ lineHeight: 1.6, mb: 4 }}>
          Tender Management System
          </Typography>
          {/* <Button
            variant="outlined"
            sx={{
              color: 'white',
              borderColor: 'white',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
              px: 5,
              py: 1.5,
              fontSize: '1.1rem',
            }}
          >
            Learn More
          </Button> */}
        </Box>
      </Box>

      {/* Right Section: Login Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 4,
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: '400px',
            borderRadius: '10px',
            background: 'white',
          }}
        >
          <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
            Login
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                mb: 2,
                py: 1.5,
                background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #2575fc 0%, #6a11cb 100%)' },
              }}
            >
              Login
            </Button>
          </Box>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Link href="/register" variant="body2" sx={{ color: '#2575fc', fontWeight: 'bold' }}>
                Register
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login;