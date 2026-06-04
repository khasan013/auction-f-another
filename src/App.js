import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import LoadingScreen from './components/common/LoadingScreen';
import './styles/globals.css';
import VerifyEmailPending from './pages/VerifyEmailPending';
import VerifyEmailPage from './pages/VerifyEmailPage';
import OtpVerificationPage from './pages/OtpVerificationPage';
import VerifyResetOtpPage from './pages/VerifyResetOtpPage';
import SetNewPassword from './pages/SetNewPassword';

const Home = lazy(() => import('./pages/Home'));
const AuctionsPage = lazy(() => import('./pages/AuctionsPage'));
const AuctionDetail = lazy(() => import('./pages/AuctionDetail'));
const CreateAuction = lazy(() => import('./pages/CreateAuction'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminAuctions = lazy(() => import('./pages/admin/AdminAuctions'));
const AdminTransactions = lazy(() => import('./pages/admin/AdminTransactions'));
const NotFound = lazy(() => import('./pages/NotFound'));

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? <Navigate to="/" replace /> : children;
};

const AppLayout = ({ children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Navbar />
    <main style={{ flex: 1 }}>
      <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
    </main>
    <Footer />
  </div>
);

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<AppLayout><Home /></AppLayout>} />
      <Route path="/auctions" element={<AppLayout><AuctionsPage /></AppLayout>} />
      {/* Create must stay before :id so create is not treated as an auction id. */}
      <Route path="/auctions/create" element={<PrivateRoute><AppLayout><CreateAuction /></AppLayout></PrivateRoute>} />
      <Route path="/auctions/:id" element={<AppLayout><AuctionDetail /></AppLayout>} />

      {/* Auth */}
      <Route path="/login" element={<GuestRoute><AppLayout><LoginPage /></AppLayout></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><AppLayout><RegisterPage /></AppLayout></GuestRoute>} />
      <Route path="/forgot-password" element={<GuestRoute><AppLayout><ForgotPassword /></AppLayout></GuestRoute>} />
      <Route path="/reset-password/:token" element={<GuestRoute><AppLayout><ResetPassword /></AppLayout></GuestRoute>} />

      {/* OTP flows */}
      <Route path="/verify-otp" element={<AppLayout><OtpVerificationPage /></AppLayout>} />
      <Route path="/verify-reset-otp" element={<AppLayout><VerifyResetOtpPage /></AppLayout>} />
      <Route path="/set-new-password" element={<AppLayout><SetNewPassword /></AppLayout>} />

      {/* Email Verify */}
      <Route path="/verify-email/pending" element={<AppLayout><VerifyEmailPending /></AppLayout>} />
      <Route path="/verify-email/:token" element={<AppLayout><VerifyEmailPage /></AppLayout>} />

      {/* Protected */}
      <Route path="/dashboard" element={<PrivateRoute><AppLayout><Dashboard /></AppLayout></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><AppLayout><ProfilePage /></AppLayout></PrivateRoute>} />
      <Route path="/checkout/:auctionId" element={<PrivateRoute><AppLayout><CheckoutPage /></AppLayout></PrivateRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<AdminRoute><AppLayout><AdminDashboard /></AppLayout></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AppLayout><AdminUsers /></AppLayout></AdminRoute>} />
      <Route path="/admin/auctions" element={<AdminRoute><AppLayout><AdminAuctions /></AppLayout></AdminRoute>} />
      <Route path="/admin/transactions" element={<AdminRoute><AppLayout><AdminTransactions /></AppLayout></AdminRoute>} />

      {/* Fallback */}
      <Route path="*" element={<AppLayout><NotFound /></AppLayout>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1a1a',
              color: '#f5f5f5',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </Router>
    </AuthProvider>
  );
}
