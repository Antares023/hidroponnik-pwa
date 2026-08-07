import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Droplets, Clock, Activity, ShieldCheck, ChevronRight } from 'lucide-react';

const LandingPage = () => {
  const { currentUser } = useAuth();

  // If already logged in, redirect to dashboard
  if (currentUser) {
    return <Navigate to="/" />;
  }

  return (
    <div className="landing-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)', color: 'var(--text-main)', overflowX: 'hidden', position: 'relative' }}>
      
      {/* Decorative Blobs */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(22,66,60,0.1) 0%, transparent 70%)', borderRadius: '50%', zIndex: 0 }}></div>
      <div style={{ position: 'absolute', top: '20%', right: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(74,222,128,0.08) 0%, transparent 70%)', borderRadius: '50%', zIndex: 0 }}></div>

      {/* Floating Modern Navbar */}
      <div style={{ position: 'absolute', top: 'clamp(0.75rem, 3vw, 1.5rem)', left: '0', width: '100%', display: 'flex', justifyContent: 'center', zIndex: 50, padding: '0 clamp(1rem, 5%, 5%)' }}>
        <nav style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          width: '100%', 
          maxWidth: '1200px',
          padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 4vw, 1.5rem)', 
          borderRadius: '50px',
          backdropFilter: 'blur(20px)', 
          background: 'rgba(255, 255, 255, 0.85)', 
          border: '1px solid rgba(255, 255, 255, 0.6)', 
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255,255,255,1)' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.4rem, 2vw, 0.75rem)' }}>
            <img src="/pwa-192x192.png" alt="Logo" style={{ height: 'clamp(28px, 8vw, 36px)', width: 'clamp(28px, 8vw, 36px)', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.8)', boxShadow: 'var(--shadow-outer)' }} />
            <h1 className="title-gradient" style={{ margin: 0, fontSize: 'clamp(1rem, 5vw, 1.25rem)', fontWeight: 'bold', letterSpacing: '-0.5px', whiteSpace: 'nowrap' }}>Smart Hydro</h1>
          </div>
          <div>
            <Link to="/login" className="btn-3d" style={{ background: 'var(--primary)', color: 'white', padding: 'clamp(0.4rem, 2vw, 0.5rem) clamp(1rem, 4vw, 1.5rem)', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold', fontSize: 'clamp(0.8rem, 3vw, 0.9rem)', boxShadow: '0 4px 15px rgba(22, 66, 60, 0.2)', whiteSpace: 'nowrap' }}>
              Masuk
            </Link>
          </div>
        </nav>
      </div>

      {/* Hero Section Container (Glassmorphism block for Tagline up to buttons) */}
      <div style={{ 
        position: 'relative', 
        zIndex: 10, 
        background: 'url("https://images.unsplash.com/photo-1558449028-b53a39d100fc?q=80&w=1920&auto=format&fit=crop") center/cover no-repeat',
        borderRadius: '0 0 40px 40px', 
        borderBottom: '1px solid rgba(255,255,255,0.5)', 
        paddingBottom: '3rem', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
        overflow: 'hidden'
      }}>
        {/* Dark Overlay for better text readability */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, rgba(22, 66, 60, 0.7) 0%, rgba(106, 156, 137, 0.9) 100%)', zIndex: 1 }}></div>

        <main style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '9rem 5% 4rem', textAlign: 'center', color: 'white' }}>
          <div className="animate-fade-up" style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', padding: '0.4rem 1.25rem', borderRadius: '50px', marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backdropFilter: 'blur(10px)', fontSize: '0.85rem', fontWeight: 'bold', boxShadow: 'var(--shadow-outer)' }}>
            <span style={{ width: '8px', height: '8px', background: '#4ADE80', borderRadius: '50%', boxShadow: '0 0 10px #4ADE80' }}></span>
            Sistem Hidroponik Masa Depan
          </div>
          
          <h2 className="animate-fade-up delay-100" style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', margin: '0 0 1.5rem', lineHeight: '1.1', fontWeight: '800', maxWidth: '800px', textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            Rawat Tanaman Anda dengan Kecerdasan
          </h2>
          
          <p className="animate-fade-up delay-200" style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', color: 'rgba(255,255,255,0.9)', maxWidth: '600px', margin: '0 auto 3rem', lineHeight: '1.6', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
            Otomatisasi sirkulasi nutrisi, pemantauan kualitas air real-time, dan kendali cerdas langsung dari genggaman Anda.
          </p>

          <div className="animate-fade-up delay-300" style={{ display: 'flex', gap: 'clamp(0.5rem, 2vw, 1rem)', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/login" className="btn-3d" style={{ background: 'white', color: 'var(--primary)', padding: 'clamp(0.6rem, 2vw, 0.8rem) clamp(1.2rem, 4vw, 1.8rem)', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold', fontSize: 'clamp(0.85rem, 3vw, 1rem)', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 8px 25px rgba(0,0,0,0.2)' }}>
              Mulai Sekarang <ChevronRight size={20} />
            </Link>
            <a href="#features" className="btn-3d" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', padding: 'clamp(0.6rem, 2vw, 0.8rem) clamp(1.2rem, 4vw, 1.8rem)', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold', fontSize: 'clamp(0.85rem, 3vw, 1rem)', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(5px)', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
              Pelajari Fitur
            </a>
          </div>
        </main>
      </div>

      {/* Feature Cards Grid */}
      <div id="features" className="features-grid" style={{ position: 'relative', zIndex: 10, textAlign: 'left' }}>
        <FeatureCard 
          icon={<Activity size={24} color="var(--primary)" />} 
          title="Monitoring Real-time" 
          desc="Pantau suhu air, pH, dan kepekatan nutrisi (TDS) secara akurat setiap detiknya."
        />
        <FeatureCard 
          icon={<Droplets size={24} color="var(--primary)" />} 
          title="Kendali Pintar" 
          desc="Atur pompa air dan nutrisi dari jarak jauh. Mode manual maupun serba otomatis."
        />
        <FeatureCard 
          icon={<Clock size={24} color="var(--primary)" />} 
          title="Penjadwalan Pestisida" 
          desc="Sinkronisasi jadwal dengan RTC & NTP untuk penyemprotan pestisida otomatis secara presisi dan anti telat."
        />
        <FeatureCard 
          icon={<ShieldCheck size={24} color="var(--primary)" />} 
          title="Layanan Pengaduan" 
          desc="Ada kendala alat? Laporkan langsung ke teknisi lewat tiket pengaduan terpadu."
        />
      </div>

      {/* Professional Footer */}
      <footer style={{ position: 'relative', zIndex: 10, background: '#ffffff', borderTop: '1px solid rgba(22,66,60,0.1)', padding: '4rem 5% 1rem', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '1.5rem' }}>
          
          {/* Brand Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img src="/pwa-192x192.png" alt="Logo" style={{ height: '40px', width: '40px', borderRadius: '50%', objectFit: 'cover' }} />
              <h1 className="title-gradient" style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '-0.5px' }}>Smart Hydro</h1>
            </div>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>
              Solusi cerdas untuk memajukan pertanian hidroponik modern dengan teknologi IoT terdepan.
            </p>
          </div>

          {/* Links Column 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>Layanan</h4>
            <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }}>Pemantauan IoT</Link>
            <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }}>Kontrol Otomatis</Link>
            <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }}>Penjadwalan Cerdas</Link>
          </div>

          {/* Links Column 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>Dukungan</h4>
            <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }}>Pusat Bantuan</Link>
            <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }}>Tiket Pengaduan</Link>
            <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }}>Panduan Pengguna</Link>
          </div>

          {/* Contact Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>Kontak</h4>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>support@smarthydro.id</p>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>+62 812-3456-7890</p>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>Cirebon, Indonesia</p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(22,66,60,0.1)', paddingTop: '1.5rem', paddingBottom: '0.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          &copy; {new Date().getFullYear()} Smart Hydroponic System. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="glass-card" style={{ 
    padding: '1.5rem',
    transition: 'transform 0.3s ease',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start'
  }}
  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
  >
    <div style={{ background: 'rgba(22,66,60,0.1)', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', border: '1px solid rgba(22,66,60,0.2)' }}>
      {icon}
    </div>
    <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', color: 'var(--text-main)' }}>{title}</h3>
    <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: '1.5', fontSize: '0.9rem' }}>{desc}</p>
  </div>
);

export default LandingPage;
