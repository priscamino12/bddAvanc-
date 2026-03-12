import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'; 
import Produits from './pages/Produits'; 
import Fournisseurs from './pages/Fournisseurs'; 
import Audits from './pages/Audits'; 
import Approvisionnements from './pages/Approvisionnements'; 

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/produits" element={<PrivateRoute><Produits /></PrivateRoute>} />
          <Route path="/fournisseurs" element={<PrivateRoute><Fournisseurs /></PrivateRoute>} /> 
          <Route path="/approvisionnements" element={<PrivateRoute><Approvisionnements /></PrivateRoute>} />
          <Route path="/audits" element={<PrivateRoute adminOnly><Audits /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;