import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { MapPinOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const NotFound = () => {
  const location = useLocation();
  const { logout } = useAuth();

  useEffect(() => {
    // Basic Client-Side Threat Detection Rules
    const suspiciousPatterns = [
      /\.php$/i,
      /\.env$/i,
      /\.git/i,
      /wp-admin/i,
      /admin/i,
      /\.\.\//,  // Path traversal attempt
      /config/i,
      /sql/i
    ];

    const currentPath = location.pathname.toLowerCase();
    
    // Explicitly allow legitimate paths containing "admin" if needed
    // In our case, the root handles dashboard, and we use "master_admin" role, but the URL is /users, /tickets. 
    // We don't have an /admin route. So any /admin access is suspicious.
    
    const isThreat = suspiciousPatterns.some(pattern => pattern.test(currentPath));

    if (isThreat) {
      // Fire Security Alert (Auto close, no button)
      Swal.fire({
        customClass: {
          popup: 'glass-swal',
          title: 'glass-swal-title',
          htmlContainer: 'glass-swal-content',
        },
        icon: 'error',
        title: 'Akses Ditolak!',
        text: 'Anda ditolak dari akses halaman ini.',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
      });
    }
  }, [location.pathname]);

  // Standard 404 Design for all cases (normal typos & threats)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '2rem 0' }}>
      
      <div className="glass-card animate-fade-up" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{ background: 'rgba(22, 66, 60, 0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', border: '1px solid rgba(22, 66, 60, 0.2)' }}>
          <MapPinOff size={40} color="var(--primary)" />
        </div>
        
        <h1 className="title-gradient" style={{ fontSize: '4rem', margin: '0 0 1rem', lineHeight: '1' }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', margin: '0 0 1rem', fontWeight: 'bold' }}>Halaman Tidak Ditemukan</h2>
        
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
          Ups! Sepertinya halaman <strong>{location.pathname}</strong> yang Anda cari tidak ada atau mungkin sudah dipindahkan.
        </p>

        <Link to="/" className="btn-3d" style={{ background: 'var(--primary)', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={20} /> Kembali ke Beranda
        </Link>
      </div>

    </div>
  );
};

export default NotFound;
