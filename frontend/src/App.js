import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import SuperAdminDashboard from './components/pages/SuperAdminDashboard';
import HODDashboard from './components/pages/Users/HOD/hodDashboard';
import RequestStatus from './components/pages/RequestStatus';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/request-status" element={<RequestStatus />} />

        {/* SUPER ADMIN */}
        <Route path="/super-admin-dashboard" element={<SuperAdminDashboard />} />
        

        {/* HOD */}
        <Route path="/hod-dashboard" element={<HODDashboard />} />


      </Routes>
    </Router>
  );
}

export default App;