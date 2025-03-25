import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Icon
} from '@mui/material';
import logo from '../../../assets/img/navlogo.png';
import background from '../../../assets/img/background.jpg';

const LogisticsFeatures = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

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
          <Button color="inherit" onClick={() => navigate('/logistics-officer-dashboard')}>Dashboard</Button>
          <Button color="inherit" onClick={() => navigate('/logistics-features')}>Special Features</Button>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4, flexGrow: 1 }}>
        <Card sx={{ borderRadius: 3, backgroundColor: 'rgba(255, 255, 255, 0.85)' }}>
          <CardHeader
            title="Special Features Coming Soon"
            titleTypographyProps={{ variant: 'h4', align: 'center' }}
            avatar={
              <Avatar sx={{ bgcolor: '#253B80' }}>
                <Icon>construction</Icon>
              </Avatar>
            }
          />
          <CardContent>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              minHeight: '300px'
            }}>
              <Typography variant="h5" sx={{ mb: 2 }}>Exclusive Logistics Tools</Typography>
              <Typography variant="body1" sx={{ mb: 4, textAlign: 'center' }}>
                We're working on special features exclusively for Logistics Officers.
                Check back soon for inventory management tools, reporting dashboards,
                and workflow automation features.
              </Typography>
              <Avatar sx={{ 
                bgcolor: '#253B80', 
                width: 80, 
                height: 80,
                mb: 3
              }}>
                <Icon sx={{ fontSize: 40 }}>hourglass_empty</Icon>
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default LogisticsFeatures;