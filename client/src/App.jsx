// App.jsx
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Produits from './pages/Produits';
import Fournisseurs from './pages/Fournisseurs';
import Approvisionnements from './pages/Approvisionnements';
import Audits from './pages/Audits';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Pas d'utilisateur → redirection login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Route admin uniquement
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />

          <Route path="/produits" element={
            <PrivateRoute>
              <Produits />
            </PrivateRoute>
          } />

          <Route path="/fournisseurs" element={
            <PrivateRoute>
              <Fournisseurs />
            </PrivateRoute>
          } />

          <Route path="/approvisionnements" element={
            <PrivateRoute>
              <Approvisionnements />
            </PrivateRoute>
          } />

          <Route path="/audits" element={
            <PrivateRoute adminOnly={true}>
              <Audits />
            </PrivateRoute>
          } />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;