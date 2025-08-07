import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute, PublicRoute } from '@/components/auth/ProtectedRoute';
import { MainDashboard } from '@/components/MainDashboard';
import { MainDashboardSimple } from '@/components/MainDashboardSimple';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ToastProvider } from '@/components/ToastProvider';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ImprovedDashboard } from '@/pages/ImprovedDashboard';
import './App.css';

// Wrapper component to handle layout with header/footer for authenticated routes
const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

// AppRoutes component to handle routing logic
const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      
      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={
          <AuthenticatedLayout>
            <ImprovedDashboard />
          </AuthenticatedLayout>
        } />
        <Route path="/upload" element={
          <AuthenticatedLayout>
            <MainDashboard />
          </AuthenticatedLayout>
        } />
        <Route path="/results" element={
          <AuthenticatedLayout>
            <MainDashboard />
          </AuthenticatedLayout>
        } />
      </Route>
      
      {/* Redirect root to dashboard if authenticated, otherwise to login */}
      <Route path="/" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
      } />
      
      {/* 404 route */}
      <Route path="*" element={
        <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
      } />
    </Routes>
  );
};

function App() {
  return (
    <ToastProvider>
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ToastProvider>
  );
}

export default App;
