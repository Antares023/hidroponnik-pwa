import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User, Lock, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { updatePassword } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { database } from '../../firebase';
import Swal from 'sweetalert2';

function Profile() {
  const { currentUser, logout, userRole } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    if (currentUser?.uid) {
      get(ref(database, `users/${currentUser.uid}`)).then((snapshot) => {
        if (snapshot.exists()) {
          setUserData(snapshot.val());
        }
      });
    }
  }, [currentUser]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    const swalConfig = {
      customClass: {
        popup: 'glass-swal',
        title: 'glass-swal-title',
        htmlContainer: 'glass-swal-content',
        confirmButton: 'glass-swal-confirm',
        cancelButton: 'glass-swal-cancel'
      }
    };

    if (newPassword !== confirmPassword) {
      Swal.fire({ ...swalConfig, title: 'Gagal', text: 'Password tidak cocok.', icon: 'error' });
      return;
    }

    const confirm = await Swal.fire({
      ...swalConfig,
      title: 'Ubah Password?',
      text: 'Anda yakin ingin mengubah password akun ini?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Ubah',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (!confirm.isConfirmed) return;

    try {
      setLoading(true);
      await updatePassword(currentUser, newPassword);
      Swal.fire({ ...swalConfig, title: 'Berhasil!', text: 'Password berhasil diperbarui!', icon: 'success' });
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/requires-recent-login') {
        Swal.fire({ ...swalConfig, title: 'Gagal', text: 'Silakan Logout dan Login kembali untuk mengubah password.', icon: 'error' });
      } else {
        Swal.fire({ ...swalConfig, title: 'Gagal', text: 'Gagal memperbarui password: ' + error.message, icon: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

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
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
      <h2 className="title-gradient" style={{ fontSize: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <User /> Profil Saya
      </h2>

      {/* Identitas Diri */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>Informasi Akun</h3>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nama Lengkap</label>
            <div style={{ fontWeight: 600 }}>{userData?.name || currentUser?.displayName || '-'}</div>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email</label>
            <div style={{ fontWeight: 600 }}>{currentUser?.email}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No. WhatsApp</label>
              <div style={{ fontWeight: 600 }}>{userData?.phone || '-'}</div>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Instansi</label>
              <div style={{ fontWeight: 600 }}>{userData?.institution || '-'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Ganti Password */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Lock size={18}/> Ubah Password
        </h3>

        {!showPasswordForm ? (
          <button 
            onClick={() => setShowPasswordForm(true)}
            style={{ background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', width: '100%', fontWeight: 600, transition: 'var(--transition)' }}
          >
            Ubah Password
          </button>
        ) : (
          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Password Baru</label>
              <input 
                type="password" 
                required 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                minLength="6"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Konfirmasi Password Baru</label>
              <input 
                type="password" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
                minLength="6"
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button 
                type="button" 
                onClick={() => setShowPasswordForm(false)}
                style={{ flex: 1, background: 'var(--surface-hover)', color: 'var(--text-main)', border: '1px solid var(--surface-border)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
              >
                Batal
              </button>
              <button 
                type="submit" 
                disabled={loading}
                style={{ flex: 2, background: 'var(--primary)', color: 'white', border: 'none', padding: '0.8rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Save size={18}/> {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Logout Area */}
      <div style={{ textAlign: 'center', marginTop: '3rem', marginBottom: '1rem' }}>
        <button 
          onClick={handleLogout}
          style={{ background: 'transparent', color: 'var(--status-critical)', border: '1px solid var(--status-critical)', padding: '0.8rem 2rem', borderRadius: 'var(--radius-lg)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <LogOut size={18} /> Keluar (Logout)
        </button>
      </div>

    </div>
  );
}

export default Profile;
