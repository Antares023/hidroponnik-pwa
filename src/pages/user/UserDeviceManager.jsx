import { useState, useEffect } from 'react';
import { ref, onValue, set, update, query, orderByChild, equalTo, get, child, remove } from 'firebase/database';
import { database } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import Swal from 'sweetalert2';
import { PlusCircle, Server, Settings as SettingsIcon, SlidersHorizontal, Trash2, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function UserDeviceManager() {
  const { currentUser } = useAuth();
  const [devices, setDevices] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMac, setNewMac] = useState('');
  const [newName, setNewName] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    // Menggunakan query spesifik agar Firebase Rules mengizinkan (query.equalTo == auth.uid)
    const devicesRef = query(ref(database, 'devices'), orderByChild('owner_uid'), equalTo(currentUser.uid));
    const unsubDevices = onValue(devicesRef, (snapshot) => {
      if (snapshot.exists()) {
        setDevices(snapshot.val());
      } else {
        setDevices({});
      }
    });

    return () => unsubDevices();
  }, [currentUser]);

  const handleAddDevice = async (e) => {
    e.preventDefault();
    const trimmedMac = newMac.trim();
    if (!trimmedMac || !newName) return;

    const swalConfig = {
      customClass: {
        popup: 'glass-swal',
        title: 'glass-swal-title',
        htmlContainer: 'glass-swal-content',
        confirmButton: 'glass-swal-confirm'
      }
    };

    try {
      // 1. Cek apakah ID sudah terpakai oleh user lain
      const snapshot = await get(child(ref(database), `devices/${trimmedMac}/owner_uid`));
      if (snapshot.exists() && snapshot.val() !== currentUser.uid) {
        Swal.fire({
          ...swalConfig,
          title: 'Gagal',
          text: 'Kode perangkat ini sudah terdaftar di sistem oleh pengguna lain. Harap gunakan kode unik lain.',
          icon: 'error'
        });
        return;
      }

      // 2. Jika belum, tambahkan/update tanpa menghapus data sensor yang sudah ada
      const updates = {};
      updates[`devices/${trimmedMac}/owner_uid`] = currentUser.uid;
      updates[`devices/${trimmedMac}/name`] = newName;
      
      // Hanya set nilai default jika belum ada (tidak menimpa kalau sudah ada)
      const settingsSnap = await get(child(ref(database), `devices/${trimmedMac}/settings`));
      if (!settingsSnap.exists()) {
        updates[`devices/${trimmedMac}/settings`] = {
          target_tds_min: 800,
          target_tds_max: 1200,
          target_ph_min: 5.5,
          target_ph_max: 6.5,
          nutrisi_dosing_duration: 3,
          nutrisi_mixing_duration: 120,
          ph_dosing_duration: 3,
          ph_mixing_duration: 120
        };
      }
      
      const controlsSnap = await get(child(ref(database), `devices/${trimmedMac}/controls`));
      if (!controlsSnap.exists()) {
        updates[`devices/${trimmedMac}/controls`] = {
          mode: 'auto',
          pump_pestisida: false,
          pump_nutrisi: false,
          pump_ph_up: false,
          pump_ph_down: false,
          reset_wifi: false
        };
      }

      await update(ref(database), updates);
      
      setShowAddForm(false);
      setNewMac('');
      setNewName('');
      Swal.fire({ ...swalConfig, title: 'Berhasil', text: 'Perangkat berhasil ditambahkan!', icon: 'success', timer: 1500, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ ...swalConfig, title: 'Gagal', text: error.message, icon: 'error' });
    }
  };

  const handleDeleteDevice = async (e, deviceId, deviceName) => {
    e.stopPropagation(); // Mencegah navigasi ke config saat klik hapus
    const swalConfig = {
      customClass: {
        popup: 'glass-swal',
        title: 'glass-swal-title',
        htmlContainer: 'glass-swal-content',
        confirmButton: 'glass-swal-confirm',
        cancelButton: 'glass-swal-cancel'
      }
    };

    const confirm = await Swal.fire({
      ...swalConfig,
      title: 'Hapus Perangkat?',
      text: `Apakah Anda yakin ingin menghapus perangkat "${deviceName}"? Data dan histori alat ini tidak dapat dikembalikan.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (confirm.isConfirmed) {
      try {
        await remove(ref(database, `devices/${deviceId}`));
        Swal.fire({ ...swalConfig, title: 'Terhapus!', text: 'Perangkat berhasil dihapus.', icon: 'success', timer: 1500, showConfirmButton: false });
      } catch (error) {
        Swal.fire({ ...swalConfig, title: 'Gagal', text: error.message, icon: 'error' });
      }
    }
  };

  const handleEditDeviceName = async (e, deviceId, currentName) => {
    e.stopPropagation();
    const { value: newName } = await Swal.fire({
      customClass: {
        popup: 'glass-swal',
        title: 'glass-swal-title',
        htmlContainer: 'glass-swal-content',
        confirmButton: 'glass-swal-confirm',
        cancelButton: 'glass-swal-cancel',
        input: 'glass-swal-input'
      },
      title: 'Ubah Nama Alat',
      input: 'text',
      inputLabel: 'Nama Baru',
      inputValue: currentName || '',
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      cancelButtonText: 'Batal',
      inputValidator: (value) => {
        if (!value) return 'Nama alat tidak boleh kosong!';
      }
    });

    if (newName && newName !== currentName) {
      try {
        await set(ref(database, `devices/${deviceId}/name`), newName);
        Swal.fire({
          customClass: { popup: 'glass-swal', title: 'glass-swal-title', confirmButton: 'glass-swal-confirm' },
          title: 'Berhasil!',
          text: 'Nama alat berhasil diubah.',
          icon: 'success'
        });
      } catch (error) {
        Swal.fire({
          customClass: { popup: 'glass-swal', title: 'glass-swal-title', confirmButton: 'glass-swal-confirm' },
          title: 'Gagal!',
          text: error.message,
          icon: 'error'
        });
      }
    }
  };

  return (
    <div className="device-manager">
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '2rem' }}>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-3d"
          style={{ padding: '0.6rem 1.2rem', borderRadius: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <PlusCircle size={18} /> Tambah
        </button>
      </div>

      {showAddForm && (
        <div className="glass-card" style={{ marginBottom: '2rem', border: '1px solid var(--primary)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Tambah Alat Baru</h3>
          <form onSubmit={handleAddDevice} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Kode Perangkat (Serial Number)</label>
              <input 
                type="text" required value={newMac} onChange={(e) => setNewMac(e.target.value)}
                placeholder="misal: HYDRO-A1B2"
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>*Lihat kode unik pada stiker di kotak panel alat Anda.</div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Nama Alat (Lokasi/Blok)</label>
              <input 
                type="text" required value={newName} onChange={(e) => setNewName(e.target.value)}
                placeholder="misal: Hidroponik Blok A"
              />
            </div>
            <button type="submit" className="btn-3d" style={{ marginTop: '0.5rem' }}>
              Simpan Alat Baru
            </button>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {Object.keys(devices).length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <Server size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
            <p>Belum ada alat yang ditambahkan.</p>
          </div>
        ) : (
          Object.entries(devices).map(([deviceId, devData]) => {
            const lastUpdated = devData.last_updated || 0;
            const lastUpdatedMs = lastUpdated < 10000000000 ? lastUpdated * 1000 : lastUpdated;
            const isOnline = (currentTime - lastUpdatedMs) <= 60000 && lastUpdated > 0;
            
            return (
              <div 
                key={deviceId} 
                className="glass-card" 
                style={{ padding: '1.2rem' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'var(--surface-hover)', padding: '0.8rem', borderRadius: '50%' }}>
                      <Server size={24} color="var(--primary)" />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)', lineHeight: 1.2 }}>{devData.name || 'Alat Tanpa Nama'}</h3>
                      <p style={{ margin: 0, marginTop: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>ID: {deviceId}</p>
                    </div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    {isOnline ? (
                      <span style={{ fontSize: '0.75rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '0.3rem 0.6rem', borderRadius: '1rem', fontWeight: 600 }}>Online</span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '0.3rem 0.6rem', borderRadius: '1rem', fontWeight: 600 }}>Offline</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem', marginTop: '1.2rem', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '1rem' }}>
                  <button 
                    onClick={(e) => handleEditDeviceName(e, deviceId, devData.name)}
                    className="btn-3d"
                    style={{ padding: '0.6rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Edit Nama"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={(e) => handleDeleteDevice(e, deviceId, devData.name)}
                    className="btn-3d btn-danger"
                    style={{ padding: '0.6rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Hapus Perangkat"
                  >
                    <Trash2 size={16} />
                  </button>
                  
                  <button 
                    onClick={() => navigate(`/device/${deviceId}/config`)}
                    className="btn-3d-secondary" 
                    style={{ padding: '0.6rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                    title="Konfigurasi"
                  >
                    <SettingsIcon size={16} color="var(--text-main)" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default UserDeviceManager;
