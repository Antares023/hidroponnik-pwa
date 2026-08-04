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
  const [activeTab, setActiveTab] = useState('kontrol');
  const [controls, setControls] = useState(null);

  useEffect(() => {
    if (!deviceId) return;
    
    const settingsRef = ref(database, `devices/${deviceId}/settings`);
    const unsubSettings = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setSettings(prev => ({ ...prev, ...snapshot.val() }));
      }
    });

    const controlsRef = ref(database, `devices/${deviceId}/controls`);
    const unsubControls = onValue(controlsRef, (snapshot) => {
      if (snapshot.exists()) {
        setControls(snapshot.val());
      }
    });

    return () => {
      unsubSettings();
      unsubControls();
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

  const toggleMode = async (mode) => {
    try {
      await set(ref(database, `devices/${deviceId}/controls/mode`), mode);
    } catch (err) {
      alert("Gagal mengubah mode.");
    }
  };

  const togglePump = async (pumpName) => {
    if (!controls) return;
    const newValue = !controls[pumpName];
    try {
      await set(ref(database, `devices/${deviceId}/controls/${pumpName}`), newValue);
    } catch (err) {
      alert("Gagal merubah status pompa");
    }
  };

  return (
    <div className="device-config">
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.4rem, 2vw, 0.8rem)' }}>
          <Link to="/devices" className="btn-3d" style={{ width: 'clamp(36px, 10vw, 42px)', height: 'clamp(36px, 10vw, 42px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, textDecoration: 'none', padding: 0 }} title="Kembali">
            <ArrowLeft size={18} color="#ffffff" />
          </Link>
          <div className="glass-card-concave" style={{ display: 'flex', alignItems: 'center', padding: '0 clamp(0.6rem, 3vw, 1rem)', height: 'clamp(36px, 10vw, 42px)', borderRadius: '2rem', flex: 1, overflow: 'hidden' }}>
            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.5px', fontSize: 'clamp(0.75rem, 3.5vw, 0.95rem)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{deviceId}</span>
          </div>
        </div>
      </div>

      <div className="glass-card-concave" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', padding: '0.4rem' }}>
        <button 
          onClick={() => setActiveTab('kontrol')} 
          className={activeTab === 'kontrol' ? 'btn-3d' : ''}
          style={{ flex: 1, padding: 'clamp(0.6rem, 2vw, 0.8rem)', fontSize: 'clamp(0.8rem, 3vw, 0.9rem)', fontWeight: 600, border: 'none', borderRadius: 'var(--radius-sm)', color: activeTab === 'kontrol' ? 'white' : 'var(--text-main)', background: activeTab === 'kontrol' ? 'var(--primary)' : '#ffffff', cursor: 'pointer', transition: 'all 0.2s', boxShadow: activeTab === 'kontrol' ? 'none' : '0 1px 3px rgba(0,0,0,0.05)' }}
        >
          🎛️ Kontrol Pompa
        </button>
        <button 
          onClick={() => setActiveTab('konfigurasi')} 
          className={activeTab === 'konfigurasi' ? 'btn-3d' : ''}
          style={{ flex: 1, padding: 'clamp(0.6rem, 2vw, 0.8rem)', fontSize: 'clamp(0.8rem, 3vw, 0.9rem)', fontWeight: 600, border: 'none', borderRadius: 'var(--radius-sm)', color: activeTab === 'konfigurasi' ? 'white' : 'var(--text-main)', background: activeTab === 'konfigurasi' ? 'var(--primary)' : '#ffffff', cursor: 'pointer', transition: 'all 0.2s', boxShadow: activeTab === 'konfigurasi' ? 'none' : '0 1px 3px rgba(0,0,0,0.05)' }}
        >
          ⚙️ Konfigurasi
        </button>
      </div>

      {activeTab === 'kontrol' && controls && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="title-gradient" style={{ fontSize: '1.2rem', margin: 0 }}>Sistem Kontrol</h3>
            
            {/* Auto/Manual Toggle Switch */}
            <div style={{ display: 'flex', gap: '0.5rem', background: 'transparent', padding: '0.2rem' }}>
              <button 
                onClick={() => toggleMode('auto')}
                className={controls.mode === 'auto' ? 'btn-3d' : 'btn-3d-secondary'}
                style={{ padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.8rem', flex: 1 }}
              >
                Otomatis
              </button>
              <button 
                onClick={() => toggleMode('manual')}
                className={controls.mode === 'manual' ? 'btn-3d btn-danger' : 'btn-3d-secondary'}
                style={{ padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.8rem', flex: 1 }}
              >
                Manual
              </button>
            </div>
          </div>

          {controls.mode === 'auto' ? (
            <div className="glass-card" style={{ padding: '1rem', borderLeft: '4px solid var(--primary)', background: 'rgba(16, 185, 129, 0.05)' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <strong>Mode Otomatis Aktif.</strong> Pompa akan dikendalikan otomatis oleh ESP32 berdasarkan ambang batas pada tab Konfigurasi Otomatis. Beralih ke Manual untuk mengontrol pompa sendiri.
              </p>
            </div>
          ) : (
            <div className="glass-card">
              <div style={{ background: 'rgba(234, 179, 8, 0.1)', borderLeft: '4px solid #eab308', padding: '1rem', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <strong>Peringatan Manual:</strong> Pompa tidak akan mempedulikan sensor. Pastikan Anda mengawasinya agar tanaman tidak kelebihan/kekurangan nutrisi.
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>Pompa Air Utama</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sirkulasi keseluruhan</div>
                  </div>
                  <button 
                    onClick={() => togglePump('pump_main')}
                    className={controls.pump_main ? 'btn-3d-toggle-on' : 'btn-3d-toggle-off'}
                  >
                    <Power size={16} /> {controls.pump_main ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>Pompa Nutrisi A</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pekatan A</div>
                  </div>
                  <button 
                    onClick={() => togglePump('pump_nutrisi_a')}
                    className={controls.pump_nutrisi_a ? 'btn-3d-toggle-on' : 'btn-3d-toggle-off'}
                  >
                    <Power size={16} /> {controls.pump_nutrisi_a ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>Pompa Nutrisi B</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pekatan B</div>
                  </div>
                  <button 
                    onClick={() => togglePump('pump_nutrisi_b')}
                    className={controls.pump_nutrisi_b ? 'btn-3d-toggle-on' : 'btn-3d-toggle-off'}
                  >
                    <Power size={16} /> {controls.pump_nutrisi_b ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                  <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 600 }}>pH UP</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Menaikkan pH</div>
                    </div>
                    <button 
                      onClick={() => togglePump('pump_ph_up')}
                      className={controls.pump_ph_up ? 'btn-3d-toggle-on' : 'btn-3d-toggle-off'}
                    >
                      <Power size={16} /> {controls.pump_ph_up ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 600 }}>pH DOWN</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Menurunkan pH</div>
                    </div>
                    <button 
                      onClick={() => togglePump('pump_ph_down')}
                      className={controls.pump_ph_down ? 'btn-3d-toggle-on' : 'btn-3d-toggle-off'}
                    >
                      <Power size={16} /> {controls.pump_ph_down ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'konfigurasi' && (
        <div className="glass-card">
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', borderLeft: '4px solid #3b82f6', padding: '1rem', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <strong>Info:</strong> Ambang batas ini digunakan untuk mengontrol pompa secara otomatis (Mode Auto).
          </div>

          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* TDS Settings */}
            <div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Pengaturan Nutrisi (TDS)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Batas Min (PPM)</label>
                  <input 
                    type="number" 
                    value={settings.target_tds_min}
                    onChange={(e) => setSettings({...settings, target_tds_min: e.target.value})}
                    placeholder="misal: 800"
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Pompa Nutrisi hidup jika TDS &lt; Minimum</div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Batas Maks (PPM)</label>
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
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>pH Min</label>
                  <input 
                    type="number" step="0.1"
                    value={settings.target_ph_min}
                    onChange={(e) => setSettings({...settings, target_ph_min: e.target.value})}
                    placeholder="misal: 5.5"
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Pompa pH UP hidup jika pH &lt; Minimum</div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>pH Maks</label>
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
      )}
    </div>
  );
}

export default DeviceConfig;
