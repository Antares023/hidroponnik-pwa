import { useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../../firebase';
import { useParams, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ArrowLeft, Save, SlidersHorizontal, Settings as SettingsIcon, Power, CalendarClock, Plus, Trash2, Clock, Edit2 } from 'lucide-react';

function DeviceConfig() {
  const { deviceId } = useParams();
  const [settings, setSettings] = useState({
    target_tds_min: 800,
    target_tds_max: 1200,
    target_ph_min: 5.5,
    target_ph_max: 6.5,
    nutrisi_dosing_duration: 3,
    nutrisi_mixing_duration: 120,
    ph_dosing_duration: 3,
    ph_mixing_duration: 120
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('kontrol');
  const [controls, setControls] = useState(null);

  // Schedules state
  const [schedules, setSchedules] = useState({});
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('06:00');
  const [scheduleFrequency, setScheduleFrequency] = useState('everyday');
  const [scheduleDuration, setScheduleDuration] = useState(15);
  const [editingScheduleId, setEditingScheduleId] = useState(null);

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

    const schedulesRef = ref(database, `devices/${deviceId}/schedules/pestisida`);
    const unsubSchedules = onValue(schedulesRef, (snapshot) => {
      if (snapshot.exists()) {
        setSchedules(snapshot.val());
      } else {
        setSchedules({});
      }
    });

    return () => {
      unsubSettings();
      unsubControls();
      unsubSchedules();
    };
  }, [deviceId]);

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleTime) return;

    const scheduleId = editingScheduleId ? editingScheduleId : ('sched_' + Date.now());
    try {
      await set(ref(database, `devices/${deviceId}/schedules/pestisida/${scheduleId}`), {
        time: scheduleTime,
        frequency: scheduleFrequency,
        duration_seconds: Number(scheduleDuration),
        is_active: true
      });
      setShowScheduleForm(false);
      setEditingScheduleId(null);
      Swal.fire({
        customClass: { popup: 'glass-swal', title: 'glass-swal-title', confirmButton: 'glass-swal-confirm' },
        title: 'Tersimpan!',
        text: 'Jadwal berhasil disimpan.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({
        customClass: { popup: 'glass-swal', title: 'glass-swal-title', confirmButton: 'glass-swal-confirm' },
        title: 'Gagal',
        text: err.message,
        icon: 'error'
      });
    }
  };

  const handleEditSchedule = (id, schedule) => {
    setEditingScheduleId(id);
    setScheduleTime(schedule.time);
    setScheduleFrequency(schedule.frequency);
    setScheduleDuration(schedule.duration_seconds);
    setShowScheduleForm(true);
  };

  const handleCancelForm = () => {
    setShowScheduleForm(!showScheduleForm);
    if (showScheduleForm) {
      setEditingScheduleId(null);
      setScheduleTime('06:00');
      setScheduleDuration(15);
    }
  };

  const handleToggleSchedule = async (scheduleId, currentStatus) => {
    try {
      await set(ref(database, `devices/${deviceId}/schedules/pestisida/${scheduleId}/is_active`), !currentStatus);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    const confirm = await Swal.fire({
      customClass: { popup: 'glass-swal', title: 'glass-swal-title', confirmButton: 'glass-swal-confirm', cancelButton: 'glass-swal-cancel' },
      title: 'Hapus Jadwal?',
      text: 'Jadwal penyemprotan ini akan dihapus permanen.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (confirm.isConfirmed) {
      try {
        await set(ref(database, `devices/${deviceId}/schedules/pestisida/${scheduleId}`), null);
      } catch (err) {
        console.error(err);
      }
    }
  };

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
        target_ph_max: Number(settings.target_ph_max),
        nutrisi_dosing_duration: Number(settings.nutrisi_dosing_duration),
        nutrisi_mixing_duration: Number(settings.nutrisi_mixing_duration),
        ph_dosing_duration: Number(settings.ph_dosing_duration),
        ph_mixing_duration: Number(settings.ph_mixing_duration)
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

  const handleResetWifi = async () => {
    const swalConfig = {
      customClass: { popup: 'glass-swal', title: 'glass-swal-title', htmlContainer: 'glass-swal-content', confirmButton: 'glass-swal-confirm', cancelButton: 'glass-swal-cancel' }
    };
    const confirm = await Swal.fire({
      ...swalConfig,
      title: 'Reset Jaringan WiFi?',
      text: 'Alat akan terputus dari internet dan memancarkan WiFi "SmartHydro-Config". Anda harus menyambungkannya kembali ke WiFi secara manual.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Reset',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (confirm.isConfirmed) {
      try {
        await set(ref(database, `devices/${deviceId}/controls/reset_wifi`), true);
        Swal.fire({
          ...swalConfig,
          title: 'Perintah Dikirim!',
          html: '<div style="text-align: left; font-size: 0.9rem;">1. Tunggu 10 detik agar alat restart.<br/><br/>2. Buka pengaturan WiFi HP Anda.<br/><br/>3. Hubungkan ke jaringan <b>SmartHydro-Config</b>.<br/><br/>4. Ikuti instruksi di layar atau buka <b>192.168.4.1</b> di browser.</div>',
          icon: 'info',
          confirmButtonText: 'Mengerti'
        });
      } catch (err) {
        Swal.fire({ ...swalConfig, title: 'Gagal', text: err.message, icon: 'error' });
      }
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

      <div className="glass-card-concave" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.5rem', padding: '0.4rem', borderRadius: '16px' }}>
        <button
          onClick={() => setActiveTab('kontrol')}
          className={activeTab === 'kontrol' ? 'btn-3d' : ''}
          style={{ padding: 'clamp(0.5rem, 2vw, 0.8rem)', fontSize: 'clamp(0.7rem, 2.5vw, 0.9rem)', fontWeight: 600, border: 'none', borderRadius: 'var(--radius-sm)', color: activeTab === 'kontrol' ? 'white' : 'var(--text-main)', background: activeTab === 'kontrol' ? 'var(--primary)' : '#ffffff', cursor: 'pointer', transition: 'all 0.2s', boxShadow: activeTab === 'kontrol' ? 'none' : '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', justifyContent: 'center' }}
        >
          <span>🎛️</span><span>Kontrol</span>
        </button>
        <button
          onClick={() => setActiveTab('konfigurasi')}
          className={activeTab === 'konfigurasi' ? 'btn-3d' : ''}
          style={{ padding: 'clamp(0.5rem, 2vw, 0.8rem)', fontSize: 'clamp(0.7rem, 2.5vw, 0.9rem)', fontWeight: 600, border: 'none', borderRadius: 'var(--radius-sm)', color: activeTab === 'konfigurasi' ? 'white' : 'var(--text-main)', background: activeTab === 'konfigurasi' ? 'var(--primary)' : '#ffffff', cursor: 'pointer', transition: 'all 0.2s', boxShadow: activeTab === 'konfigurasi' ? 'none' : '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', justifyContent: 'center' }}
        >
          <span>⚙️</span><span>Konfigurasi</span>
        </button>
        <button
          onClick={() => setActiveTab('jadwal')}
          className={activeTab === 'jadwal' ? 'btn-3d' : ''}
          style={{ padding: 'clamp(0.5rem, 2vw, 0.8rem)', fontSize: 'clamp(0.7rem, 2.5vw, 0.9rem)', fontWeight: 600, border: 'none', borderRadius: 'var(--radius-sm)', color: activeTab === 'jadwal' ? 'white' : 'var(--text-main)', background: activeTab === 'jadwal' ? 'var(--primary)' : '#ffffff', cursor: 'pointer', transition: 'all 0.2s', boxShadow: activeTab === 'jadwal' ? 'none' : '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', justifyContent: 'center' }}
        >
          <span>📅</span><span>Jadwal</span>
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
                    <div style={{ fontWeight: 600 }}>Pompa Pestisida</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Penyemprotan hama</div>
                  </div>
                  <button
                    onClick={() => togglePump('pump_pestisida')}
                    className={controls.pump_pestisida ? 'btn-3d-toggle-on' : 'btn-3d-toggle-off'}
                  >
                    <Power size={16} /> {controls.pump_pestisida ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>Mix Nutrisi (A+B)</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mencampur Pekatan A & B</div>
                  </div>
                  <button
                    onClick={() => togglePump('pump_nutrisi')}
                    className={controls.pump_nutrisi ? 'btn-3d-toggle-on' : 'btn-3d-toggle-off'}
                  >
                    <Power size={16} /> {controls.pump_nutrisi ? 'ON' : 'OFF'}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card">
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', borderLeft: '4px solid #3b82f6', padding: '1rem', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <strong>Info:</strong> Ambang batas ini digunakan untuk mengontrol pompa secara otomatis (Mode Auto).
            </div>

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
                    onChange={(e) => setSettings({ ...settings, target_tds_min: e.target.value })}
                    placeholder="misal: 800"
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Pompa Nutrisi hidup jika TDS &lt; Minimum</div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Batas Maks (PPM)</label>
                  <input
                    type="number"
                    value={settings.target_tds_max}
                    onChange={(e) => setSettings({ ...settings, target_tds_max: e.target.value })}
                    placeholder="misal: 1200"
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Pompa otomatis mati jika TDS &gt; Maksimum</div>
                </div>
              </div>
            </div>
          </div>

          {/* pH Settings */}
          <div className="glass-card">
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
                    onChange={(e) => setSettings({ ...settings, target_ph_min: e.target.value })}
                    placeholder="misal: 5.5"
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Pompa pH UP hidup jika pH &lt; Minimum</div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>pH Maks</label>
                  <input
                    type="number" step="0.1"
                    value={settings.target_ph_max}
                    onChange={(e) => setSettings({ ...settings, target_ph_max: e.target.value })}
                    placeholder="misal: 6.5"
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Pompa pH DOWN hidup jika pH &gt; Maksimum</div>
                </div>
              </div>
            </div>
          </div>

          {/* Siklus Pompa Nutrisi Settings */}
          <div className="glass-card">
            <div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Siklus Pompa Nutrisi
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Semprot Nutrisi (Detik)</label>
                  <input
                    type="number" min="1" max="60"
                    value={settings.nutrisi_dosing_duration || 3}
                    onChange={(e) => setSettings({ ...settings, nutrisi_dosing_duration: e.target.value })}
                    placeholder="misal: 3"
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Durasi semprot (Dosing)</div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Aduk Nutrisi (Detik)</label>
                  <input
                    type="number" min="10" max="600"
                    value={settings.nutrisi_mixing_duration || 120}
                    onChange={(e) => setSettings({ ...settings, nutrisi_mixing_duration: e.target.value })}
                    placeholder="misal: 120"
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Jeda aduk (Mixing)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Siklus Pompa pH Settings */}
          <div className="glass-card">
            <div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Siklus Pompa pH
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Semprot pH (Detik)</label>
                  <input
                    type="number" min="1" max="60"
                    value={settings.ph_dosing_duration || 3}
                    onChange={(e) => setSettings({ ...settings, ph_dosing_duration: e.target.value })}
                    placeholder="misal: 3"
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Durasi semprot (Dosing)</div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Aduk pH (Detik)</label>
                  <input
                    type="number" min="10" max="600"
                    value={settings.ph_mixing_duration || 120}
                    onChange={(e) => setSettings({ ...settings, ph_mixing_duration: e.target.value })}
                    placeholder="misal: 120"
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Jeda aduk (Mixing)</div>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-3d" style={{ padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            <Save size={18} /> {loading ? 'Menyimpan...' : 'Simpan Konfigurasi'}
          </button>
        </form>

        {/* Jaringan WiFi Settings */}
        <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Pengaturan Jaringan
            </h3>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Ubah atau putuskan koneksi internet alat untuk menyambungkannya ke WiFi lain.
            </p>
            <button 
              onClick={handleResetWifi} 
              type="button" 
              className="btn-3d btn-danger" 
              style={{ width: '100%', padding: '0.8rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
            >
              <Power size={16} /> Reset WiFi Alat
            </button>
          </div>
        </div>
      )}

      {activeTab === 'jadwal' && (
        <div className="glass-card-concave" style={{ padding: '1.2rem', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: '1 1 min-content' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--text-main)', lineHeight: 1.3 }}>
                <CalendarClock size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} /> 
                <span>Jadwal Pestisida</span>
              </h3>
              <p style={{ margin: 0, marginTop: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Otomatisasi penyemprotan</p>
            </div>
            <button 
              onClick={handleCancelForm}
              className={showScheduleForm ? 'btn-3d-secondary' : 'btn-3d'}
              style={{ padding: '0.5rem 1rem', borderRadius: '2rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
            >
              {showScheduleForm ? 'Batal' : <><Plus size={16} /> Tambah</>}
            </button>
          </div>

          {showScheduleForm && (
            <form onSubmit={handleSaveSchedule} style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid var(--surface-border)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Waktu Semprot</label>
                  <input type="time" required value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Durasi (detik)</label>
                  <input type="number" min="1" max="3600" required value={scheduleDuration} onChange={(e) => setScheduleDuration(e.target.value)} style={{ width: '100%' }} />
                </div>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Pengulangan</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setScheduleFrequency('everyday')}
                    className={scheduleFrequency === 'everyday' ? 'btn-3d' : 'btn-3d-secondary'}
                    style={{ padding: '0.6rem 1rem', borderRadius: '2rem', fontSize: '0.85rem', flex: 1 }}
                  >
                    Setiap Hari
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleFrequency('today_only')}
                    className={scheduleFrequency === 'today_only' ? 'btn-3d' : 'btn-3d-secondary'}
                    style={{ padding: '0.6rem 1rem', borderRadius: '2rem', fontSize: '0.85rem', flex: 1 }}
                  >
                    Hari Ini Saja
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-3d" style={{ width: '100%', padding: '0.8rem' }}>Simpan Jadwal</button>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {Object.keys(schedules).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>Belum ada jadwal yang dibuat.</div>
            ) : (
              Object.entries(schedules).map(([id, schedule]) => (
                <div key={id} className="glass-panel" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 min-content' }}>
                    <div style={{ background: schedule.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0,0,0,0.05)', color: schedule.is_active ? '#10b981' : 'var(--text-muted)', padding: '0.6rem', borderRadius: '50%', flexShrink: 0 }}>
                      <Clock size={20} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{schedule.time}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{schedule.frequency === 'everyday' ? 'Setiap Hari' : 'Hari Ini Saja'} • {schedule.duration_seconds} detik</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexShrink: 0 }}>
                    <button onClick={() => handleToggleSchedule(id, schedule.is_active)} className={schedule.is_active ? 'btn-3d-toggle-on' : 'btn-3d-toggle-off'} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 600 }}>
                      {schedule.is_active ? 'ON' : 'OFF'}
                    </button>
                    <button onClick={() => handleEditSchedule(id, schedule)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '0.4rem' }}>
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDeleteSchedule(id)} style={{ background: 'transparent', border: 'none', color: 'var(--status-critical)', cursor: 'pointer', padding: '0.4rem' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DeviceConfig;
