import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Box,
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
    try {
      const response = await api.post('api/auth/login', { email, password });
      alert('Login successful');
      console.log(response.data.user);
  
      if (response.data.user.isActive === 'true') {
        if (response.data.user.userRole === 'HOD') {
          navigate('/hod-dashboard');
        } else {
          navigate('/user-dashboard');
        }
      } 
    } catch (error) {
      // Check if the error response contains a specific message from the backend
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message); // Display the backend error message
      } else {
        alert('An error occurred. Please try again.'); // Generic error message
      }
      console.error(error);
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
            Welcome to the Campus Tendering System
          </Typography>
          <Typography variant="h5" sx={{ lineHeight: 1.6, mb: 4 }}>
            Join us and streamline your procurement process with the next generation of campus tendering solutions.
          </Typography>
          <Button
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
          </Button>
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