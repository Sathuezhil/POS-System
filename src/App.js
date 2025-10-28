import React, { useEffect } from 'react';
import styled from 'styled-components';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { POSProvider } from './context/POSContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ProductManagement from './pages/admin/ProductManagement';
import SalesReport from './pages/admin/SalesReport';

// Cashier Pages
import Billing from './pages/cashier/Billing';
import SalesHistory from './pages/cashier/SalesHistory';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #fef7ed 0%, #fef3c7 100%);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 80%, rgba(217, 119, 6, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(180, 83, 9, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 280px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-left: 1px solid rgba(217, 119, 6, 0.2);
  position: relative;
  z-index: 1;
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: transparent;
`;

const AppContent = () => {
  const { isAuthenticated, loading, role } = useAuth();

  useEffect(() => {
    // Listen for new sale events from Electron
    if (window.electronAPI) {
      window.electronAPI.onNewSale(() => {
        console.log('New sale requested from menu');
        // Handle new sale logic here
      });
    }
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#64748b',
        background: 'linear-gradient(135deg, #fef7ed 0%, #fef3c7 100%)'
      }}>
        <div style={{
          background: 'white',
          padding: '20px 40px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <AppContainer>
      <Sidebar />
      <MainContent>
        <Header />
        <ContentArea>
          <Routes key={role}>
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute permission="view_dashboard">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/products" element={
              <ProtectedRoute permission="manage_products">
                <ProductManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute permission="view_reports">
                <SalesReport />
              </ProtectedRoute>
            } />
            {/* Settings page removed as per requirements */}
            
            {/* Cashier Routes */}
            <Route path="/cashier/billing" element={
              <ProtectedRoute permission="process_sales">
                <Billing />
              </ProtectedRoute>
            } />
            <Route path="/cashier/sales" element={
              <ProtectedRoute permission="view_sales">
                <SalesHistory />
              </ProtectedRoute>
            } />
            
            {/* Default redirects based on role */}
            <Route path="/" element={
              role === 'admin' ? 
                <Navigate to="/admin/dashboard" replace /> : 
                <Navigate to="/cashier/billing" replace />
            } />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/cashier" element={<Navigate to="/cashier/billing" replace />} />
            <Route path="*" element={
              role === 'admin' ? 
                <Navigate to="/admin/dashboard" replace /> : 
                <Navigate to="/cashier/billing" replace />
            } />
          </Routes>
        </ContentArea>
      </MainContent>
    </AppContainer>
  );
};

function App() {
  return (
    <AuthProvider>
      <POSProvider>
        <Router>
          <AppContent />
        </Router>
      </POSProvider>
    </AuthProvider>
  );
}

export default App;
