import { BrowserRouter, Routes, Route, NavLink, Navigate, useParams, useLocation } from 'react-router-dom';
import { LayoutDashboard, SlidersHorizontal, Settings as SettingsIcon, Users, User, Clock, LifeBuoy, LogOut } from 'lucide-react';
import Swal from 'sweetalert2';
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
  const { currentUser, userRole, logout } = useAuth();
  const location = useLocation();
  
  if (!currentUser) return <Navigate to="/login" />;

  const getPageTitleInfo = () => {
    if (location.pathname === '/') return { title: 'Dashboard', icon: <LayoutDashboard size={24} /> };
    if (location.pathname === '/users') return { title: 'Kelola User', icon: <Users size={24} /> };
    if (location.pathname === '/devices') return { title: 'Kelola Alat', icon: <SlidersHorizontal size={24} /> };
    if (location.pathname === '/tickets') return { title: 'Pengaduan', icon: <LifeBuoy size={24} /> };
    if (location.pathname === '/profile') return { title: 'Profil Saya', icon: <User size={24} /> };
    if (location.pathname.startsWith('/device/')) return { title: 'Konfigurasi', icon: <SettingsIcon size={24} /> };
    return { title: 'Smart Hydro', icon: <LayoutDashboard size={24} /> };
  };

  const pageInfo = getPageTitleInfo();

  const handleLogout = async () => {
    const confirm = await Swal.fire({
      customClass: {
        popup: 'glass-swal',
        title: 'glass-swal-title',
        htmlContainer: 'glass-swal-content',
        confirmButton: 'glass-swal-confirm',
        cancelButton: 'glass-swal-cancel'
      },
      title: 'Keluar?',
      text: 'Apakah Anda yakin ingin keluar dari aplikasi?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (confirm.isConfirmed) {
      logout();
    }
  };

  return (
    <div className="app-container">
      {/* Top Header (Glassmorphism) */}
      <header className="glass-header" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
          <img src="/pwa-192x192.png" alt="Logo" style={{ height: '42px', width: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.8)', boxShadow: 'var(--shadow-outer)' }} />
        </div>
        
        <div style={{ flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <h1 className="title-gradient" style={{ fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', margin: 0, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '0.4rem', textAlign: 'center' }}>
            {pageInfo.icon}
            {pageInfo.title}
          </h1>
        </div>
        
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={handleLogout} className="btn-3d btn-danger" style={{ height: '42px', width: '42px', padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Logout">
            <LogOut size={20} color="#fff" />
          </button>
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
