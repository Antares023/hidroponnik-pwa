import { LogOut, MailQuestion, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Swal from 'sweetalert2';

function PendingState() {
  const { currentUser, logout, userStatus } = useAuth();

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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-gradient)', padding: '1rem' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '450px', textAlign: 'center', padding: '2.5rem 2rem' }}>
        
        {!currentUser?.emailVerified ? (
          <>
            <MailQuestion size={56} color="var(--status-warning)" style={{ marginBottom: '1.5rem' }} />
            <h2 style={{ marginBottom: '1rem' }}>Verifikasi Email Dibutuhkan</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Kami telah mengirimkan link verifikasi ke email <strong>{currentUser?.email}</strong>. 
              Silakan periksa kotak masuk (atau folder spam) dan klik link tersebut untuk melanjutkan.
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
              *Setelah verifikasi email, muat ulang (refresh) halaman ini.
            </p>
          </>
        ) : userStatus === 'pending' ? (
          <>
            <ShieldAlert size={56} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
            <h2 style={{ marginBottom: '1rem' }}>Menunggu Persetujuan</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Akun Anda telah berhasil diverifikasi, namun masih menunggu persetujuan dari <strong>Master Admin</strong>. 
              Anda belum dapat mengakses kontrol hidroponik.
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Silakan hubungi administrator untuk menyetujui akun Anda.
            </p>
          </>
        ) : null}

        <button 
          onClick={handleLogout}
          style={{ background: 'var(--surface)', color: 'var(--status-critical)', border: '1px solid var(--status-critical)', padding: '0.8rem 1.5rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', margin: '0 auto', transition: 'var(--transition)' }}
        >
          <LogOut size={18} /> Keluar (Logout)
        </button>
      </div>
    </div>
  );
}

export default PendingState;
