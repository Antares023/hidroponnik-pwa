import { BrowserRouter, Routes, Route, NavLink, Navigate, useParams, useLocation } from 'react-router-dom';
import { LayoutDashboard, SlidersHorizontal, Settings as SettingsIcon, Users, User, Clock, LifeBuoy } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserDashboard from './pages/user/UserDashboard';
import UserDeviceManager from './pages/user/UserDeviceManager';
import PendingState from './pages/auth/PendingState';
import Profile from './pages/common/Profile';
import DeviceConfig from './pages/device/DeviceConfig';
import UserTickets from './pages/user/UserTickets';
import AdminTickets from './pages/admin/AdminTickets';
import './index.css';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { currentUser, userRole, userStatus } = useAuth();
  
  if (!currentUser) return <Navigate to="/login" />;
  
  if (userRole !== 'master_admin') {
    if (!currentUser.emailVerified || userStatus === 'pending') {
      return <PendingState />;
    }
  }
  
  return children;
};

// Global Bottom Nav for Main Pages
const GlobalBottomNav = () => {
  const { userRole } = useAuth();

  if (userRole === 'master_admin') {
    return (
      <nav className="bottom-nav">
        <NavLink to="/" end className={({isActive}) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/users" className={({isActive}) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <Users size={20} />
          <span>Kelola User</span>
        </NavLink>
        <NavLink to="/tickets" className={({isActive}) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <LifeBuoy size={20} />
          <span>Pengaduan</span>
        </NavLink>
        <NavLink to="/profile" className={({isActive}) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <User size={20} />
          <span>Profile</span>
        </NavLink>
      </nav>
    );
  }

  return (
    <nav className="bottom-nav">
      <NavLink to="/" end className={({isActive}) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <LayoutDashboard size={20} />
        <span>Dashboard</span>
      </NavLink>
      <NavLink to="/devices" className={({isActive}) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <SlidersHorizontal size={20} />
        <span>Kelola Alat</span>
      </NavLink>
      <NavLink to="/tickets" className={({isActive}) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <LifeBuoy size={20} />
        <span>Pengaduan</span>
      </NavLink>
      <NavLink to="/profile" className={({isActive}) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <User size={20} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
};

// (DeviceBottomNavContent removed since configuration is a unified page without internal tabs on the router level)

// Main App Container
const AppLayout = () => {
  const { currentUser, userRole } = useAuth();
  const location = useLocation();
  
  if (!currentUser) return <Navigate to="/login" />;

  const isDevicePage = location.pathname.startsWith('/device/');

  return (
    <div className="app-container">
      {/* Top Header (Glassmorphism) */}
      <header className="glass-header" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', padding: '1.2rem 1.5rem', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <h1 className="title-gradient" style={{ fontSize: '1.6rem', margin: 0, letterSpacing: '-0.5px' }}>
            SMART HYDRO
          </h1>
        </div>
      </header>

      <main style={{ padding: '0 1rem 1rem 1rem', maxWidth: '800px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <Routes>
          <Route path="/" element={userRole === 'master_admin' ? <AdminDashboard view="dashboard" /> : <UserDashboard />} />
          <Route path="/users" element={userRole === 'master_admin' ? <AdminDashboard view="users" /> : <Navigate to="/" />} />
          <Route path="/devices" element={userRole !== 'master_admin' ? <UserDeviceManager /> : <Navigate to="/" />} />
          <Route path="/tickets" element={userRole === 'master_admin' ? <AdminTickets /> : <UserTickets />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/device/:deviceId/config" element={<DeviceConfig />} />
        </Routes>
      </main>

      {/* Bottom Nav Rendering */}
      <GlobalBottomNav />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
