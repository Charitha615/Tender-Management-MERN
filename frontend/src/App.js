import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import SuperAdminDashboard from './components/pages/SuperAdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/super-admin-dashboard" element={<SuperAdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;