import { BrowserRouter, Routes, Route, NavLink, Navigate, useParams, useLocation } from 'react-router-dom';
import { Home, SlidersHorizontal, Settings as SettingsIcon, Users, User, Clock, Ticket, LogOut, Power } from 'lucide-react';
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
import LandingPage from './pages/public/LandingPage';
import NotFound from './pages/public/NotFound';
import './index.css';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { currentUser, userRole, userStatus } = useAuth();
  
  if (!currentUser) return <Navigate to="/landing" />;
  
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
  const location = useLocation();

  const navItems = userRole === 'master_admin' ? [
    { path: '/', icon: Home },
    { path: '/users', icon: Users },
    { path: '/tickets', icon: Ticket },
    { path: '/profile', icon: User }
  ] : [
    { path: '/', icon: Home },
    { path: '/devices', icon: SlidersHorizontal },
    { path: '/tickets', icon: Ticket },
    { path: '/profile', icon: User }
  ];

  let activeIndex = navItems.findIndex(item => {
    if (item.path === '/') return location.pathname === '/';
    // Match both /devices and /device/...
    if (item.path === '/devices' && location.pathname.startsWith('/device/')) return true;
    return location.pathname.startsWith(item.path);
  });
  
  if (activeIndex === -1) activeIndex = 0;

  return (
    <nav className="smooth-bottom-nav" style={{ '--active-index': activeIndex }}>
      <div className="nav-bg-clipper">
        <div className="nav-bg-slider">
          <svg width="100" height="70" viewBox="0 0 100 70" preserveAspectRatio="none">
            <path d="M 0 0 C 25 0, 25 45, 50 45 C 75 45, 75 0, 100 0 L 100 70 L 0 70 Z" fill="white" />
          </svg>
        </div>
      </div>
      
      <div className="nav-items">
        {navItems.map((item, idx) => (
           <NavLink 
             key={item.path} 
             to={item.path} 
             end={item.path === '/'} 
             className={({isActive}) => `nav-item ${isActive || activeIndex === idx ? 'active' : ''}`}
           >
             <div className="nav-icon-frame">
               <item.icon size={24} strokeWidth={activeIndex === idx ? 2.5 : 2} />
             </div>
           </NavLink>
        ))}
      </div>
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
    if (location.pathname === '/') return { title: 'Dashboard', icon: <Home size={24} /> };
    if (location.pathname === '/users') return { title: 'Kelola User', icon: <Users size={24} /> };
    if (location.pathname === '/devices') return { title: 'Kelola Alat', icon: <SlidersHorizontal size={24} /> };
    if (location.pathname === '/tickets') return { title: 'Pengaduan', icon: <Ticket size={24} /> };
    if (location.pathname === '/profile') return { title: 'Profil Saya', icon: <User size={24} /> };
    if (location.pathname.startsWith('/device/')) return { title: 'Konfigurasi', icon: <SettingsIcon size={24} /> };
    return { title: 'Smart Hydro', icon: <Home size={24} /> };
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
      <header className="glass-header" style={{ marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem clamp(1rem, 3vw, 1.25rem)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
          <img src="/pwa-192x192.png" alt="Logo" style={{ height: 'clamp(36px, 10vw, 42px)', width: 'clamp(36px, 10vw, 42px)', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.8)', boxShadow: 'var(--shadow-outer)' }} />
        </div>
        
        <div style={{ flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <h1 className="title-gradient" style={{ fontSize: 'clamp(1rem, 4.5vw, 1.5rem)', margin: 0, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '0.4rem', textAlign: 'center' }}>
            {pageInfo.icon}
            <span style={{ fontSize: 'clamp(1rem, 4.5vw, 1.5rem)' }}>{pageInfo.title}</span>
          </h1>
        </div>
        
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={handleLogout} className="btn-3d btn-danger" style={{ height: 'clamp(36px, 10vw, 42px)', width: 'clamp(36px, 10vw, 42px)', padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Logout">
            <Power size={18} color="#fff" />
          </button>
        </div>
      </header>

      <main style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem) 1rem 90px 1rem', maxWidth: '800px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <Routes>
          <Route path="/" element={userRole === 'master_admin' ? <AdminDashboard view="dashboard" /> : <UserDashboard />} />
          <Route path="/users" element={userRole === 'master_admin' ? <AdminDashboard view="users" /> : <Navigate to="/" />} />
          <Route path="/devices" element={userRole !== 'master_admin' ? <UserDeviceManager /> : <Navigate to="/" />} />
          <Route path="/tickets" element={userRole === 'master_admin' ? <AdminTickets /> : <UserTickets />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/device/:deviceId/config" element={<DeviceConfig />} />
          <Route path="*" element={<NotFound />} />
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
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
