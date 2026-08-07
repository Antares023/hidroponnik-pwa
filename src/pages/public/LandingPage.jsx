import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Droplets, Clock, Activity, ShieldCheck, ChevronRight, ChevronLeft, Check } from 'lucide-react';

const sliderData = [
  {
    id: 'monitoring',
    badge: 'Monitoring Real-time',
    badgeIcon: <Activity size={16} />,
    title: <>Pantau Kualitas Air <br/><span className="title-gradient">Kapan Saja & Di Mana Saja</span></>,
    desc: 'Sistem cerdas kami membaca data sensor secara aktual (*real-time*). Anda tidak perlu lagi datang ke kebun hanya untuk mengecek kondisi tanaman. Semua data krusial tersaji dengan antarmuka yang memanjakan mata, langsung dari genggaman Anda.',
    image: '/monitoring-mockup.png', 
    points: [
      {
        title: 'Indikator Visual & Peringatan Otomatis',
        desc: 'Sistem akan langsung mendeteksi dan memberi tanda bahaya (merah/kuning) disertai instruksi perbaikan jika nutrisi (TDS) menipis atau tingkat keasaman (pH) air melenceng dari batas aman.'
      },
      {
        title: 'Pemantauan Cuaca Lingkungan',
        desc: 'Tidak hanya kondisi air, sistem juga secara proaktif membaca suhu udara dan kelembapan di lingkungan sekitar, memberikan Anda analisis iklim mikro kebun yang sangat komprehensif.'
      }
    ]
  },
  {
    id: 'kendali',
    badge: 'Kendali Pintar',
    badgeIcon: <Droplets size={16} />,
    title: <>Otomatisasi Penuh <br/><span className="title-gradient">Kebun Cerdas Anda</span></>,
    desc: 'Ambil alih kendali penuh atas pompa sirkulasi air, pompa nutrisi, dan pompa pengatur keasaman (pH) langsung dari layar smartphone Anda. Jadikan perawatan hidroponik lebih efisien dan modern.',
    image: ['/kontrol-manual-mockup.png', '/kontrol-otomatis-mockup.png'],
    points: [
      {
        title: 'Mode Eksekusi Otomatis Cerdas',
        desc: 'Sistem AI dapat mengambil keputusan sendiri berdasarkan data sensor untuk menyalakan pompa nutrisi atau mengatur pH air secara mandiri tanpa harus menunggu perintah Anda.'
      },
      {
        title: 'Akses Manual Jarak Jauh',
        desc: 'Ingin mengendalikan secara spesifik? Matikan mode otomatis dan tekan tombol saklar virtual mana pun secara manual kapan saja dan dari belahan bumi mana pun.'
      }
    ]
  },
  {
    id: 'jadwal',
    badge: 'Penjadwalan Pestisida',
    badgeIcon: <Clock size={16} />,
    title: <>Penyemprotan Hama <br/><span className="title-gradient">Presisi, Anti Telat</span></>,
    desc: 'Bebaskan diri Anda dari rutinitas mengingat waktu menyemprot pestisida. Sistem penjadwalan pintar kami memastikan kebun Anda selalu terlindungi dari hama pada waktu yang telah Anda tentukan dengan akurasi tinggi.',
    image: '/monitoring-mockup.png',
    points: [
      {
        title: 'Sinkronisasi Waktu Global (NTP & RTC)',
        desc: 'Perangkat sinkron dengan jam satelit dunia dan memiliki baterai cadangan. Jadwal tidak akan pernah meleset satu detik pun meskipun kebun sempat mati listrik.'
      },
      {
        title: 'Otomatisasi Anti Repot',
        desc: 'Cukup tentukan hari, jam, menit, dan durasi semprot. Perangkat akan secara otomatis mendistribusikan pestisida tanpa Anda harus hadir secara fisik.'
      }
    ]
  },
  {
    id: 'pengaduan',
    badge: 'Layanan Pengaduan',
    badgeIcon: <ShieldCheck size={16} />,
    title: <>Dukungan Teknis <br/><span className="title-gradient">Selalu Hadir Untuk Anda</span></>,
    desc: 'Kami memahami bahwa perangkat fisik mungkin sesekali butuh penanganan ekstra. Jangan panik, kami menyediakan sistem tiket pengaduan terintegrasi khusus untuk pengguna kami.',
    image: '/monitoring-mockup.png',
    points: [
      {
        title: 'Pelacakan Status Tiket Transparan',
        desc: 'Setiap keluhan kerusakan atau malfungsi yang Anda kirimkan dapat Anda pantau progres pengerjaannya: mulai dari "Menunggu", "Diproses", hingga "Selesai".'
      },
      {
        title: 'Respon Cepat Tim Ahli',
        desc: 'Teknisi profesional kami akan menganalisis tiket Anda dan mengambil langkah perbaikan fisik dengan efisien agar kebun Anda kembali beroperasi optimal.'
      }
    ]
  }
];

const LandingPage = () => {
  const { currentUser } = useAuth();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isSwapped, setIsSwapped] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [scrollDotIndex, setScrollDotIndex] = useState(0);
  const featureGridRef = React.useRef(null);

  // Auto-swap animation for dual mockups
  React.useEffect(() => {
    const interval = setInterval(() => {
      setIsSwapped(prev => !prev);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Sync scroll position with activeSlide
  React.useEffect(() => {
    if (featureGridRef.current && window.innerWidth <= 768) {
      const el = featureGridRef.current;
      const clientWidth = el.clientWidth;
      const targetScroll = activeSlide * (clientWidth * 0.8);
      
      // Ensure we don't trigger unnecessary smooth scrolls if we're already close
      if (Math.abs(el.scrollLeft - targetScroll) > 10) {
        el.scrollTo({ left: targetScroll, behavior: 'smooth' });
      }
    }
  }, [activeSlide]);

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  const handleCardClick = (index) => {
    setActiveSlide(index);
    const element = document.getElementById('feature-slider-section');
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100; // offset for sticky navbar
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const nextSlide = () => {
    setActiveSlide((prev) => (prev === sliderData.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? sliderData.length - 1 : prev - 1));
  };

  // Touch handlers for mobile swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();
  };

  const handleFeatureScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const clientWidth = e.target.clientWidth;
    // Each item takes 80% of client width on mobile
    const index = Math.min(3, Math.max(0, Math.round(scrollLeft / (clientWidth * 0.8))));
    if (index !== scrollDotIndex) {
      setScrollDotIndex(index);
    }
  };

  const currentFeature = sliderData[activeSlide];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Background Decor */}
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

      {/* Hero Section Container */}
      <div style={{ 
        position: 'relative', 
        zIndex: 10, 
        backgroundImage: 'url("https://images.pexels.com/photos/2886937/pexels-photo-2886937.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderBottomLeftRadius: '3rem',
        borderBottomRightRadius: '3rem',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.1)'
      }}>
        {/* Dark Overlay for better text readability */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, rgba(22, 66, 60, 0.7) 0%, rgba(106, 156, 137, 0.9) 100%)', zIndex: 1 }}></div>

        <main style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '9rem 5% 4rem', textAlign: 'center', color: 'white' }}>
          <div className="animate-fade-up" style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', padding: '0.4rem 1.25rem', borderRadius: '50px', marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backdropFilter: 'blur(10px)', fontSize: '0.85rem', fontWeight: 'bold', boxShadow: 'var(--shadow-outer)' }}>
            <span style={{ width: '8px', height: '8px', background: '#4ADE80', borderRadius: '50%', boxShadow: '0 0 10px #4ADE80' }}></span>
            Sistem Hidroponik Masa Depan
          </div>

          <h2 className="animate-fade-up delay-100" style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: '900', maxWidth: '800px', margin: '0 0 1.5rem', lineHeight: '1.2', textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            Rawat Tanaman Anda dengan Kecerdasan
          </h2>
          <p className="animate-fade-up delay-200" style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', color: 'rgba(255,255,255,0.9)', maxWidth: '600px', margin: '0 0 3rem', lineHeight: '1.6', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
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
      <div 
        id="features" 
        className="features-grid" 
        ref={featureGridRef}
        onScroll={handleFeatureScroll}
        style={{ position: 'relative', zIndex: 10, textAlign: 'left', paddingTop: '2rem' }}
      >
        <FeatureCard 
          icon={<Activity size={24} />} 
          title="Monitoring Real-time" 
          desc="Pantau suhu air, pH, dan kepekatan nutrisi (TDS) secara akurat setiap detiknya."
          isActive={activeSlide === 0}
          onClick={() => handleCardClick(0)}
        />
        <FeatureCard 
          icon={<Droplets size={24} />} 
          title="Kendali Pintar" 
          desc="Atur pompa air dan nutrisi dari jarak jauh. Mode manual maupun serba otomatis."
          isActive={activeSlide === 1}
          onClick={() => handleCardClick(1)}
        />
        <FeatureCard 
          icon={<Clock size={24} />} 
          title="Penjadwalan Pestisida" 
          desc="Sinkronisasi jadwal dengan RTC & NTP untuk penyemprotan pestisida otomatis secara presisi dan anti telat."
          isActive={activeSlide === 2}
          onClick={() => handleCardClick(2)}
        />
        <FeatureCard 
          icon={<ShieldCheck size={24} />} 
          title="Layanan Pengaduan" 
          desc="Ada kendala alat? Laporkan langsung ke teknisi lewat tiket pengaduan terpadu."
          isActive={activeSlide === 3}
          onClick={() => handleCardClick(3)}
        />
      </div>

      {/* Scroll Dots for Mobile Cards */}
      <div className="mobile-scroll-dots" style={{ justifyContent: 'center', gap: '0.5rem', marginBottom: '3rem', marginTop: '-1rem' }}>
        {[0, 1, 2, 3].map((i) => (
          <div 
            key={i} 
            style={{ 
              width: scrollDotIndex === i ? '24px' : '8px', 
              height: '8px', 
              borderRadius: '10px', 
              background: scrollDotIndex === i ? 'var(--primary)' : 'rgba(22,66,60,0.2)',
              transition: 'all 0.3s ease'
            }} 
          />
        ))}
      </div>

      {/* Detailed Feature Carousel Section */}
      <section 
        id="feature-slider-section" 
        className="feature-slider-section" 
        style={{ padding: '6rem 5%', background: '#ffffff', position: 'relative', borderTop: '1px solid rgba(22,66,60,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        
        {/* Dynamic Content Container */}
        <div className="feature-slider-grid" style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
          
          {/* 3D Image Container */}
          <div className="phone-mockup-wrapper" style={{ position: 'relative', perspective: '1200px', padding: '2rem', display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', top: '10%', left: '10%', width: '80%', height: '80%', background: 'linear-gradient(135deg, rgba(74,222,128,0.3) 0%, rgba(22,66,60,0.1) 100%)', filter: 'blur(50px)', borderRadius: '50%', zIndex: 0 }}></div>
            {Array.isArray(currentFeature.image) ? (
              /* 3D Ferris Wheel Orbital Dual Phones */
              <div style={{ position: 'relative', width: '100%', maxWidth: '380px', height: '480px', margin: '0 auto', perspective: '1200px' }}>
                {/* Rotating Parent */}
                <div style={{ 
                  position: 'relative', width: '100%', height: '100%',
                  transformStyle: 'preserve-3d', 
                  transition: 'transform 2.5s cubic-bezier(0.25, 1, 0.5, 1)',
                  transform: isSwapped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}>
                  
                  {/* Phone 1 (Manual - Front initially) */}
                  <div style={{ 
                    position: 'absolute', top: '5%', left: '0', right: '0', margin: '0 auto', width: '240px', 
                    transformStyle: 'preserve-3d',
                    /* Local offset (Right, Front). Counter-rotate Y to always face front, then apply the signature tilt. */
                    transition: 'transform 2.5s cubic-bezier(0.25, 1, 0.5, 1)',
                    transform: `translateX(80px) translateZ(50px) ${isSwapped ? 'rotateY(-180deg)' : 'rotateY(0deg)'} rotateY(-15deg) rotateX(10deg)`,
                    borderRadius: '2.5rem', padding: '12px', 
                    background: 'linear-gradient(145deg, #2a2a2a, #111111)',
                    boxShadow: '30px 30px 60px rgba(22,66,60,0.2), -10px -10px 30px rgba(255,255,255,0.2), inset 0 0 15px rgba(255,255,255,0.1)'
                  }}>
                    <div style={{ borderRadius: '2rem', overflow: 'hidden', background: '#000', aspectRatio: '9/19', width: '100%' }}>
                      <img src={currentFeature.image[0]} alt="Manual Control" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </div>
                  </div>

                  {/* Phone 2 (Auto - Back initially) */}
                  <div style={{ 
                    position: 'absolute', top: '5%', left: '0', right: '0', margin: '0 auto', width: '240px', 
                    transformStyle: 'preserve-3d',
                    /* Local offset (Left, Back). Counter-rotate Y to always face front, then apply the signature tilt. */
                    transition: 'transform 2.5s cubic-bezier(0.25, 1, 0.5, 1)',
                    transform: `translateX(-80px) translateZ(-50px) ${isSwapped ? 'rotateY(-180deg)' : 'rotateY(0deg)'} rotateY(-15deg) rotateX(10deg)`,
                    borderRadius: '2.5rem', padding: '12px', 
                    background: 'linear-gradient(145deg, #2a2a2a, #111111)',
                    boxShadow: '30px 30px 60px rgba(22,66,60,0.2), -10px -10px 30px rgba(255,255,255,0.2), inset 0 0 15px rgba(255,255,255,0.1)'
                  }}>
                    <div style={{ borderRadius: '2rem', overflow: 'hidden', background: '#000', aspectRatio: '9/19', width: '100%' }}>
                      <img src={currentFeature.image[1]} alt="Auto Control" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </div>
                  </div>
                  
                </div>
              </div>
            ) : (
              /* Single Phone Mockup */
              <div style={{ 
                position: 'relative', 
                zIndex: 1, 
                transform: 'rotateY(-15deg) rotateX(10deg)', 
                transformStyle: 'preserve-3d',
                transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                borderRadius: '2.5rem',
                padding: '12px',
                background: 'linear-gradient(145deg, #2a2a2a, #111111)',
                boxShadow: '30px 30px 60px rgba(22,66,60,0.2), -10px -10px 30px rgba(255,255,255,0.2), inset 0 0 15px rgba(255,255,255,0.1)',
                margin: '0 auto',
                width: '240px'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'rotateY(-15deg) rotateX(10deg) scale(1)'}
              >
                <div style={{ borderRadius: '2rem', overflow: 'hidden', background: '#000000', aspectRatio: '9/19', position: 'relative' }}>
                  <img src={currentFeature.image} alt={currentFeature.badge} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              </div>
            )}
          </div>

          {/* Scroll Dots for 3D Mockup (Mobile Only) */}
          <div className="mobile-scroll-dots" style={{ justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', marginBottom: '1rem' }}>
            {sliderData.map((_, i) => (
              <div 
                key={i} 
                onClick={() => setActiveSlide(i)}
                style={{ 
                  width: activeSlide === i ? '24px' : '8px', 
                  height: '8px', 
                  borderRadius: '10px', 
                  background: activeSlide === i ? 'var(--primary)' : 'rgba(22,66,60,0.2)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }} 
              />
            ))}
          </div>

          {/* Dynamic Text Content */}
          <div key={currentFeature.id} className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(22,66,60,0.1)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 'bold', width: 'fit-content' }}>
              {currentFeature.badgeIcon} {currentFeature.badge}
            </div>
            
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', margin: 0, lineHeight: '1.2', color: 'var(--text-main)', fontWeight: '800' }}>
              {currentFeature.title}
            </h2>
            
            <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: '1.7', margin: 0 }}>
              {currentFeature.desc}
            </p>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
              {currentFeature.points.map((pt, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                  <div style={{ background: 'linear-gradient(135deg, rgba(74,222,128,0.2) 0%, rgba(22,66,60,0.1) 100%)', borderRadius: '12px', padding: '8px', color: 'var(--primary)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px', border: '1px solid rgba(74,222,128,0.3)' }}>
                     <Check size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.35rem', color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 'bold' }}>{pt.title}</h4>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>{pt.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
        </div>

        {/* Carousel Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginTop: '4rem' }}>
          <button 
            onClick={prevSlide}
            className="btn-3d"
            style={{ 
              background: 'white', border: '1px solid rgba(22,66,60,0.2)', padding: '1rem', borderRadius: '50%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--primary)',
              boxShadow: 'var(--shadow-outer)'
            }}>
            <ChevronLeft size={24} />
          </button>

          {/* Dots */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {sliderData.map((_, i) => (
              <div 
                key={i} 
                onClick={() => setActiveSlide(i)}
                style={{ 
                  width: activeSlide === i ? '24px' : '8px', 
                  height: '8px', 
                  borderRadius: '10px', 
                  background: activeSlide === i ? 'var(--primary)' : 'rgba(22,66,60,0.2)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }} 
              />
            ))}
          </div>

          <button 
            onClick={nextSlide}
            className="btn-3d"
            style={{ 
              background: 'var(--primary)', border: 'none', padding: '1rem', borderRadius: '50%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white',
              boxShadow: '0 8px 20px rgba(22,66,60,0.3)'
            }}>
            <ChevronRight size={24} />
          </button>
        </div>

      </section>

      {/* Professional Footer */}
      <footer style={{ position: 'relative', zIndex: 10, background: '#F4E8DB', borderTop: '1px solid rgba(22,66,60,0.1)', padding: '4rem 5% 1rem', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '1.5rem' }}>
          
          {/* Brand Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src="/pwa-192x192.png" alt="Logo" style={{ height: '36px', width: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(22,66,60,0.1)' }} />
              <h2 className="title-gradient" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>Smart Hydro</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
              Solusi cerdas bertani modern. Kami mengintegrasikan teknologi IoT untuk meningkatkan efisiensi dan kualitas panen hidroponik Anda.
            </p>
          </div>

          {/* Links Column */}
          <div>
            <h4 style={{ color: 'var(--text-main)', margin: '0 0 1rem', fontSize: '1.1rem' }}>Layanan Kami</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><a href="#features" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Pemantauan Sensor</a></li>
              <li><a href="#features" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Kendali Otomatis</a></li>
              <li><a href="#features" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Penjadwalan Sistem</a></li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 style={{ color: 'var(--text-main)', margin: '0 0 1rem', fontSize: '1.1rem' }}>Pusat Bantuan</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Panduan Penggunaan</a></li>
              <li><a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Tiket Pengaduan</a></li>
              <li><a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Tanya Jawab (FAQ)</a></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 style={{ color: 'var(--text-main)', margin: '0 0 1rem', fontSize: '1.1rem' }}>Kontak</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Email: support@smarthydro.id</li>
              <li style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Telepon: +62 812 3456 7890</li>
              <li style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Alamat: Jl. Pertanian Hijau No. 99, Jakarta</li>
            </ul>
          </div>

        </div>

        {/* Copyright */}
        <div style={{ borderTop: '1px solid rgba(22,66,60,0.1)', paddingTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            &copy; {new Date().getFullYear()} Smart Hydroponic System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, onClick, isActive }) => (
  <div className="glass-card feature-card-item" onClick={onClick} style={{ 
    padding: '1.5rem',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    cursor: 'pointer',
    border: isActive ? '2px solid var(--primary)' : '2px solid rgba(255,255,255,0.4)',
    boxShadow: isActive ? '0 15px 35px rgba(22, 66, 60, 0.15)' : 'var(--shadow-outer)',
    transform: isActive ? 'translateY(-6px)' : 'translateY(0)'
  }}
  onMouseOver={(e) => {
    if (!isActive) {
      e.currentTarget.style.transform = 'translateY(-5px)';
      e.currentTarget.style.boxShadow = '0 10px 25px rgba(22, 66, 60, 0.1)';
    }
  }}
  onMouseOut={(e) => {
    if (!isActive) {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'var(--shadow-outer)';
    }
  }}
  >
    <div className="feature-card-icon" style={{ background: isActive ? 'var(--primary)' : 'rgba(22,66,60,0.1)', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', border: '1px solid rgba(22,66,60,0.2)', transition: 'all 0.3s ease' }}>
      {React.cloneElement(icon, { color: isActive ? 'white' : 'var(--primary)' })}
    </div>
    <h3 className="feature-card-title" style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', color: 'var(--text-main)' }}>{title}</h3>
    <p className="feature-card-desc" style={{ margin: 0, color: 'var(--text-muted)', lineHeight: '1.5', fontSize: '0.9rem', flexGrow: 1 }}>{desc}</p>
    
    <div style={{ marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--primary)', transition: 'gap 0.3s ease' }}
       onMouseOver={(e) => e.currentTarget.style.gap = '0.8rem'}
       onMouseOut={(e) => e.currentTarget.style.gap = '0.5rem'}
    >
      Baca Selengkapnya <ChevronRight size={16} />
    </div>
  </div>
);

export default LandingPage;
