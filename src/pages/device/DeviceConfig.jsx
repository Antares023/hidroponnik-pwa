import { useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../../firebase';
import { useParams, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ArrowLeft, Save, SlidersHorizontal, Settings as SettingsIcon, Power } from 'lucide-react';

function DeviceConfig() {
  const { deviceId } = useParams();
  const [settings, setSettings] = useState({
    target_tds_min: 800,
    target_tds_max: 1200,
    target_ph_min: 5.5,
    target_ph_max: 6.5
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!deviceId) return;
    
    const settingsRef = ref(database, `devices/${deviceId}/settings`);
    const unsubSettings = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setSettings(prev => ({ ...prev, ...snapshot.val() }));
      }
    });

    return () => {
      unsubSettings();
    };
  }, [deviceId]);

  const handleSaveSettings = async (e) => {
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

    const confirm = await Swal.fire({
      ...swalConfig,
      title: 'Simpan Konfigurasi?',
      text: 'Apakah Anda yakin ingin mengubah pengaturan batas TDS dan pH untuk alat ini?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Simpan',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (!confirm.isConfirmed) return;

    setLoading(true);
    try {
      await set(ref(database, `devices/${deviceId}/settings`), {
        target_tds_min: Number(settings.target_tds_min),
        target_tds_max: Number(settings.target_tds_max),
        target_ph_min: Number(settings.target_ph_min),
        target_ph_max: Number(settings.target_ph_max)
      });
      Swal.fire({
        ...swalConfig,
        title: 'Tersimpan!',
        text: 'Konfigurasi alat berhasil diperbarui.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({
        ...swalConfig,
        title: 'Gagal',
        text: 'Gagal menyimpan konfigurasi: ' + err.message,
        icon: 'error'
      });
    }
    setLoading(false);
  };

  return (
    <div className="device-config">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/devices" style={{ color: 'var(--text-main)' }}><ArrowLeft size={24} /></Link>
        <h2 className="title-gradient" style={{ margin: 0, fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SettingsIcon size={24} /> Konfigurasi Alat
        </h2>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        Device ID: <span style={{ fontFamily: 'monospace', color: 'var(--text-main)' }}>{deviceId}</span>
      </p>

      <div className="glass-card">
        <div style={{ background: 'rgba(59, 130, 246, 0.1)', borderLeft: '4px solid #3b82f6', padding: '1rem', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <strong>Info:</strong> Ambang batas ini digunakan untuk mengontrol pompa secara otomatis (Mode Auto) di Dashboard.
        </div>

        <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* TDS Settings */}
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Pengaturan Nutrisi (TDS)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Batas Minimum (PPM)</label>
                <input 
                  type="number" 
                  value={settings.target_tds_min}
                  onChange={(e) => setSettings({...settings, target_tds_min: e.target.value})}
                  placeholder="misal: 800"
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Pompa Nutrisi hidup jika TDS &lt; Minimum</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Batas Maksimum (PPM)</label>
                <input 
                  type="number" 
                  value={settings.target_tds_max}
                  onChange={(e) => setSettings({...settings, target_tds_max: e.target.value})}
                  placeholder="misal: 1200"
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Pompa otomatis mati jika TDS &gt; Maksimum</div>
              </div>
            </div>
          </div>

          <hr style={{ border: 0, borderTop: '1px solid var(--surface-border)', margin: '0.5rem 0' }} />

          {/* pH Settings */}
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Pengaturan Keasaman (pH)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>pH Minimum</label>
                <input 
                  type="number" step="0.1"
                  value={settings.target_ph_min}
                  onChange={(e) => setSettings({...settings, target_ph_min: e.target.value})}
                  placeholder="misal: 5.5"
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Pompa pH UP hidup jika pH &lt; Minimum</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>pH Maksimum</label>
                <input 
                  type="number" step="0.1"
                  value={settings.target_ph_max}
                  onChange={(e) => setSettings({...settings, target_ph_max: e.target.value})}
                  placeholder="misal: 6.5"
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Pompa pH DOWN hidup jika pH &gt; Maksimum</div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-3d" style={{ padding: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            <Save size={18} /> {loading ? 'Menyimpan...' : 'Simpan Konfigurasi'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default DeviceConfig;
