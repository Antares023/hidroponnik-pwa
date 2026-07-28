import { useState, useEffect } from 'react';
import { ref, onValue, set, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Thermometer, Droplets, FlaskConical, Beaker, CloudRain, Server, AlertTriangle, LayoutDashboard, Power, SettingsIcon, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';

const IndicatorCard = ({ title, value, unit, icon: Icon, statusClass }) => (
  <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
        <Icon size={18} />
        <span style={{ fontSize: 'clamp(0.75rem, 3vw, 0.9rem)', fontWeight: 600 }}>{title}</span>
      </div>
      <span className={`status-indicator ${statusClass}`}></span>
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginTop: 'auto' }}>
      <h2 style={{ fontSize: 'clamp(1.5rem, 8vw, 2.5rem)', margin: 0, color: 'var(--text-main)', lineHeight: 1 }}>{value !== undefined && value !== null ? value : '-'}</h2>
      <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: 'clamp(0.7rem, 3vw, 0.9rem)' }}>{unit}</span>
    </div>
  </div>
);

function UserDashboard() {
  const { currentUser } = useAuth();
  const [devices, setDevices] = useState({});
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [data, setData] = useState(null);
  const [settings, setSettings] = useState(null);
  const [controls, setControls] = useState(null);

  // Fetch User's Devices for Dropdown
  useEffect(() => {
    if (!currentUser) return;
    const devicesRef = query(ref(database, 'devices'), orderByChild('owner_uid'), equalTo(currentUser.uid));
    const unsubDevices = onValue(devicesRef, (snapshot) => {
      if (snapshot.exists()) {
        const own = snapshot.val();
        setDevices(own);
        
        // Auto-select first device if none selected
        if (!selectedDeviceId && Object.keys(own).length > 0) {
          setSelectedDeviceId(Object.keys(own)[0]);
        }
      } else {
        setDevices({});
      }
    });

    return () => unsubDevices();
  }, [currentUser, selectedDeviceId]);

  // Fetch Sensor Data & Settings for Selected Device
  useEffect(() => {
    if (!selectedDeviceId) return;

    const dataRef = ref(database, `devices/${selectedDeviceId}/sensor_data`);
    const unsubData = onValue(dataRef, (snapshot) => {
      if (snapshot.exists()) {
        setData(snapshot.val());
      } else {
        setData(null);
      }
    });

    const settingsRef = ref(database, `devices/${selectedDeviceId}/settings`);
    const unsubSettings = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.val());
      }
    });

    const controlsRef = ref(database, `devices/${selectedDeviceId}/controls`);
    const unsubControls = onValue(controlsRef, (snapshot) => {
      if (snapshot.exists()) {
        setControls(snapshot.val());
      }
    });

    return () => {
      unsubData();
      unsubSettings();
      unsubControls();
    };
  }, [selectedDeviceId]);

  // Helper logic for statuses & alerts
  const getPhStatus = (ph) => {
    if (!settings || ph === undefined) return 'status-normal';
    if (ph >= settings.target_ph_min && ph <= settings.target_ph_max) return 'status-normal';
    if (Math.abs(ph - settings.target_ph_min) < 0.5 || Math.abs(ph - settings.target_ph_max) < 0.5) return 'status-warning';
    return 'status-critical';
  };

  const getTdsStatus = (tds) => {
    if (!settings || tds === undefined) return 'status-normal';
    if (tds >= settings.target_tds_min && tds <= (settings.target_tds_max || 9999)) return 'status-normal';
    if (Math.abs(tds - settings.target_tds_min) < 100 || Math.abs(tds - (settings.target_tds_max || 9999)) < 100) return 'status-warning';
    return 'status-critical';
  };

  // Generate Smart Alerts
  const generateAlerts = () => {
    if (!data || !settings) return null;
    const alerts = [];
    const isAuto = !controls || controls.mode === 'auto';

    if (data.tds < settings.target_tds_min) {
      alerts.push(`Nutrisi (TDS) terlalu rendah (${data.tds} PPM). ${isAuto ? 'Pompa A/B otomatis menyala.' : 'Harap nyalakan pompa nutrisi secara manual.'}`);
    } else if (data.tds > (settings.target_tds_max || 9999)) {
      alerts.push(`Nutrisi (TDS) terlalu pekat (${data.tds} PPM). ${isAuto ? 'Pompa otomatis mati.' : 'Harap matikan pompa nutrisi.'}`);
    }

    if (data.ph < settings.target_ph_min) {
      alerts.push(`pH Air terlalu asam (${data.ph}). ${isAuto ? 'Pompa pH UP otomatis menyala.' : 'Harap nyalakan pompa pH UP secara manual.'}`);
    } else if (data.ph > settings.target_ph_max) {
      alerts.push(`pH Air terlalu basa (${data.ph}). ${isAuto ? 'Pompa pH DOWN otomatis menyala.' : 'Harap nyalakan pompa pH DOWN secara manual.'}`);
    }

    if (alerts.length === 0) return null;

    return (
      <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-critical)', fontWeight: 600, marginBottom: '0.5rem' }}>
          <AlertTriangle size={20} /> Peringatan Sistem
        </div>
        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-main)', fontSize: '0.9rem' }}>
          {alerts.map((msg, i) => (
            <li key={i} style={{ marginBottom: '0.3rem' }}>{msg}</li>
          ))}
        </ul>
      </div>
    );
  };

  const toggleMode = async (mode) => {
    if (!selectedDeviceId) return;
    try {
      await set(ref(database, `devices/${selectedDeviceId}/controls/mode`), mode);
    } catch (err) {
      alert("Gagal mengubah mode.");
    }
  };

  const togglePump = async (pumpName) => {
    if (!selectedDeviceId || !controls) return;
    const newValue = !controls[pumpName];
    try {
      await set(ref(database, `devices/${selectedDeviceId}/controls/${pumpName}`), newValue);
    } catch (err) {
      alert("Gagal merubah status pompa");
    }
  };

  return (
    <div className="user-dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="title-gradient" style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LayoutDashboard size={24} /> Dashboard Monitor
        </h2>
      </div>

      {Object.keys(devices).length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
          <Server size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
          <p>Anda belum memiliki alat terdaftar.</p>
          <Link to="/devices" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Ke Kelola Alat &rarr;</Link>
        </div>
      ) : (
        <>
          {/* Active Device Selector */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative' }}>
              <select 
                className="glass-panel"
                value={selectedDeviceId} 
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                style={{ width: '100%', padding: '0.8rem 1rem', paddingRight: '2.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--surface-border)', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600, appearance: 'none', cursor: 'pointer', outline: 'none' }}
              >
                {Object.entries(devices).map(([id]) => (
                  <option key={id} value={id}>
                    ID: {id}
                  </option>
                ))}
              </select>
              <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <Server size={18} color="var(--primary)" />
              </div>
            </div>
          </div>

          {/* Smart Alerts */}
          {generateAlerts()}

          {/* Telemetry Grid */}
          <div className="dashboard-grid">
            <IndicatorCard 
              title="TDS Air" 
              value={data?.tds?.toFixed(0)} 
              unit="ppm" 
              icon={Beaker} 
              statusClass={getTdsStatus(data?.tds)} 
            />
            <IndicatorCard 
              title="pH Air" 
              value={data?.ph?.toFixed(1)} 
              unit="pH" 
              icon={FlaskConical} 
              statusClass={getPhStatus(data?.ph)} 
            />
            <IndicatorCard 
              title="Suhu Air" 
              value={data?.suhu_air?.toFixed(1)} 
              unit="°C" 
              icon={Droplets} 
              statusClass={(data?.suhu_air >= 20 && data?.suhu_air <= 28) ? 'status-normal' : (data?.suhu_air ? 'status-warning' : 'status-normal')} 
            />
            <IndicatorCard 
              title="Suhu Udara" 
              value={data?.suhu_ruangan?.toFixed(1)} 
              unit="°C" 
              icon={Thermometer} 
              statusClass="status-normal" 
            />
            <div style={{ gridColumn: '1 / -1' }}>
              <IndicatorCard 
                title="Kelembapan Lingkungan" 
                value={data?.kelembapan?.toFixed(0)} 
                unit="%" 
                icon={CloudRain} 
                statusClass="status-normal" 
              />
            </div>
          </div>

          {/* Mode Control & Manual Control Panel */}
          {controls && (
            <div style={{ marginTop: '2rem' }}>
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
                    <strong>Mode Otomatis Aktif.</strong> Pompa akan dikendalikan otomatis oleh ESP32 berdasarkan ambang batas konfigurasi alat. Beralih ke Manual untuk mengontrol pompa sendiri.
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
        </>
      )}
    </div>
  );
}

export default UserDashboard;
