import { useState, useEffect } from 'react';
import { ref, onValue, set, remove } from 'firebase/database';
import { database } from '../../firebase';
import Swal from 'sweetalert2';
import { Users, Server, CheckCircle, XCircle, Activity, Clock, ChevronDown, ChevronUp, Droplets, Thermometer, FlaskConical, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard({ view = 'dashboard' }) {
  const [users, setUsers] = useState({});
  const [devices, setDevices] = useState({});
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'pending'
  const [expandedUsers, setExpandedUsers] = useState({});
  const [editingUserId, setEditingUserId] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', phone: '', institution: '' });
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
  const navigate = useNavigate();

  useEffect(() => {
    // Clock for Online/Offline check (update every 5 seconds)
    const timer = setInterval(() => setCurrentTime(Math.floor(Date.now() / 1000)), 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Fetch users
    const usersRef = ref(database, 'users');
    const unsubUsers = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        setUsers(snapshot.val());
      } else {
        setUsers({});
      }
    });

    // Fetch devices
    const devicesRef = ref(database, 'devices');
    const unsubDevices = onValue(devicesRef, (snapshot) => {
      if (snapshot.exists()) {
        setDevices(snapshot.val());
      } else {
        setDevices({});
      }
    });

    return () => {
      unsubUsers();
      unsubDevices();
    };
  }, []);

  const getDevicesByUser = (uid) => {
    return Object.entries(devices).filter(([_, data]) => data.owner_uid === uid);
  };

  const toggleExpandUser = (uid) => {
    setExpandedUsers(prev => ({ ...prev, [uid]: !prev[uid] }));
  };

  const swalConfig = {
    customClass: {
      popup: 'glass-swal',
      title: 'glass-swal-title',
      htmlContainer: 'glass-swal-content',
      confirmButton: 'glass-swal-confirm',
      cancelButton: 'glass-swal-cancel'
    }
  };

  const handleApprove = async (uid, userName) => {
    const confirm = await Swal.fire({
      ...swalConfig,
      title: 'Setujui Pengguna?',
      text: `Apakah Anda yakin ingin menyetujui akun ${userName}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Setujui',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (!confirm.isConfirmed) return;

    try {
      await set(ref(database, `users/${uid}/status`), 'approved');
      Swal.fire({
        ...swalConfig,
        title: 'Disetujui!',
        text: 'Akun pengguna telah disetujui.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        ...swalConfig,
        title: 'Gagal',
        text: "Gagal meng-approve: " + error.message,
        icon: 'error'
      });
    }
  };

  const handleReject = async (uid, userName) => {
    const confirm = await Swal.fire({
      ...swalConfig,
      title: 'Tolak & Hapus?',
      text: `Apakah Anda yakin ingin menolak dan menghapus akun ${userName} permanen?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Tolak & Hapus',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (!confirm.isConfirmed) return;

    try {
      // Hapus perangkat milik user ini (Cascade Delete)
      const userDevices = getDevicesByUser(uid);
      for (const [deviceId] of userDevices) {
        await remove(ref(database, `devices/${deviceId}`));
      }
      // Hapus user
      await remove(ref(database, `users/${uid}`));
      Swal.fire({
        ...swalConfig,
        title: 'Terhapus!',
        text: 'Akun pendaftar beserta perangkatnya telah ditolak dan dihapus.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        ...swalConfig,
        title: 'Gagal',
        text: "Gagal menolak: " + error.message,
        icon: 'error'
      });
    }
  };

  const startEditUser = (uid, user) => {
    setEditingUserId(uid);
    setEditFormData({ name: user.name || '', phone: user.phone || '', institution: user.institution || '' });
  };

  const cancelEditUser = () => {
    setEditingUserId(null);
  };

  const handleUpdateUser = async (e, uid) => {
    e.preventDefault();
    try {
      await set(ref(database, `users/${uid}/name`), editFormData.name);
      await set(ref(database, `users/${uid}/phone`), editFormData.phone);
      await set(ref(database, `users/${uid}/institution`), editFormData.institution);
      
      Swal.fire({
        ...swalConfig,
        title: 'Berhasil',
        text: 'Data pengguna berhasil diperbarui.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      setEditingUserId(null);
    } catch (error) {
      Swal.fire({ ...swalConfig, title: 'Gagal', text: error.message, icon: 'error' });
    }
  };

  const handleDeleteUser = async (uid, userName) => {
    const confirm = await Swal.fire({
      ...swalConfig,
      title: 'Hapus Permanen?',
      text: `Apakah Anda yakin ingin menghapus akun ${userName} beserta semua perangkat miliknya? Aksi ini tidak dapat dibatalkan.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });
    if (confirm.isConfirmed) {
      try {
        // Hapus perangkat milik user ini (Cascade Delete)
        const userDevices = getDevicesByUser(uid);
        for (const [deviceId] of userDevices) {
          await remove(ref(database, `devices/${deviceId}`));
        }
        // Hapus user
        await remove(ref(database, `users/${uid}`));
        Swal.fire({ ...swalConfig, title: 'Terhapus!', text: 'Akun beserta perangkatnya berhasil dihapus.', icon: 'success', timer: 1500, showConfirmButton: false });
      } catch (error) {
        Swal.fire({ ...swalConfig, title: 'Gagal', text: error.message, icon: 'error' });
      }
    }
  };

  const handleDeleteDeviceAdmin = async (deviceId, deviceName) => {
    const confirm = await Swal.fire({
      ...swalConfig,
      title: 'Hapus Paksa Perangkat?',
      text: `Yakin ingin mencabut perangkat "${deviceName}" secara paksa? Data tidak dapat dikembalikan.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });
    if (confirm.isConfirmed) {
      try {
        await remove(ref(database, `devices/${deviceId}`));
        Swal.fire({ ...swalConfig, title: 'Terhapus!', text: 'Perangkat berhasil dihapus dari sistem.', icon: 'success', timer: 1500, showConfirmButton: false });
      } catch (error) {
        Swal.fire({ ...swalConfig, title: 'Gagal', text: error.message, icon: 'error' });
      }
    }
  };

  // Derived State (Calculations)
  const pendingUsersList = Object.entries(users).filter(([_, user]) => user.status === 'pending' && user.role !== 'master_admin');
  const activeUsersList = Object.entries(users).filter(([_, user]) => user.status === 'approved' && user.role !== 'master_admin');
  
  const totalPending = pendingUsersList.length;
  const totalActiveUsers = activeUsersList.length;
  const totalDevices = Object.keys(devices).length;

  return (
    <div className="admin-dashboard" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {view === 'dashboard' && <h2 className="title-gradient" style={{ fontSize: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><LayoutDashboard size={24} /> Dashboard Statistik</h2>}
      {view === 'users' && <h2 className="title-gradient" style={{ fontSize: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={24} /> Manajemen User</h2>}

      {/* === DASHBOARD VIEW === */}
      {view === 'dashboard' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 1rem' }}>
            <Users size={28} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>{totalActiveUsers}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>User Aktif</div>
          </div>
          
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 1rem' }}>
            <Clock size={28} color="var(--status-warning)" style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--status-warning)' }}>{totalPending}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>Antrean User</div>
          </div>

          <div className="glass-card" style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'rgba(22, 66, 60, 0.1)', padding: '0.8rem', borderRadius: '50%' }}>
                <Server size={32} color="var(--primary)" />
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Alat Beroperasi</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{totalDevices} <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>Unit ESP32</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === KELOLA USER VIEW === */}
      {view === 'users' && (
        <>
          {/* Tab Navigation dalam Kelola User */}
          <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(22, 66, 60, 0.1)', marginBottom: '1.5rem', overflowX: 'auto' }}>
            <button 
              onClick={() => setActiveTab('overview')}
              style={{ background: 'none', border: 'none', padding: '0.8rem 0', color: activeTab === 'overview' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: activeTab === 'overview' ? 700 : 500, borderBottom: activeTab === 'overview' ? '3px solid var(--primary)' : '3px solid transparent', borderRadius: 0, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Active Users
            </button>
            <button 
              onClick={() => setActiveTab('pending')}
              style={{ background: 'none', border: 'none', padding: '0.8rem 0', color: activeTab === 'pending' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: activeTab === 'pending' ? 700 : 500, borderBottom: activeTab === 'pending' ? '3px solid var(--primary)' : '3px solid transparent', borderRadius: 0, cursor: 'pointer', position: 'relative', whiteSpace: 'nowrap' }}
            >
              Pending
              {totalPending > 0 && (
                <span style={{ position: 'absolute', top: '0.5rem', right: '-1rem', background: 'var(--status-critical)', color: 'white', borderRadius: '50%', width: '1.2rem', height: '1.2rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {totalPending}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('devices')}
              style={{ background: 'none', border: 'none', padding: '0.8rem 0', color: activeTab === 'devices' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: activeTab === 'devices' ? 700 : 500, borderBottom: activeTab === 'devices' ? '3px solid var(--primary)' : '3px solid transparent', borderRadius: 0, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Semua Perangkat
            </button>
          </div>

          {/* Tab Content: Pending */}
          {activeTab === 'pending' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingUsersList.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0' }}>Tidak ada antrean pendaftaran.</div>
              ) : (
                pendingUsersList.map(([uid, user]) => (
                  <div key={uid} className="glass-card" style={{ padding: '1.5rem', border: '1px solid var(--status-warning)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{user.name}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, marginTop: '0.2rem' }}>{user.email}</p>
                      </div>
                      <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--status-warning)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', height: 'fit-content' }}>
                        Menunggu Persetujuan
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button onClick={() => handleApprove(uid, user.name)} className="btn-3d" style={{ flex: 1 }}>Setujui</button>
                      <button onClick={() => handleReject(uid, user.name)} className="btn-3d btn-danger" style={{ flex: 1 }}>Tolak</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab Content: Semua Perangkat */}
          {activeTab === 'devices' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Object.keys(devices).length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0' }}>Belum ada perangkat yang terdaftar di sistem.</div>
              ) : (
                Object.entries(devices).map(([deviceId, devData]) => {
                  const ownerName = users[devData.owner_uid]?.name || 'User Tidak Dikenal';
                  const lastUpdated = devData.last_updated || 0;
                  const isOnline = (currentTime - lastUpdated) <= 60 && lastUpdated > 0;
                  
                  return (
                    <div key={deviceId} className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: 'rgba(22, 66, 60, 0.05)', padding: '0.8rem', borderRadius: '50%' }}>
                          <Server size={24} color="var(--primary)" />
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>{devData.name || 'Alat Tanpa Nama'}</h3>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {deviceId} | Pemilik: {ownerName}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {isOnline ? (
                          <span style={{ fontSize: '0.8rem', color: 'var(--primary)', background: 'rgba(22, 66, 60, 0.1)', padding: '0.3rem 0.6rem', borderRadius: '1rem', fontWeight: 600 }}>Online</span>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--status-critical)', background: 'rgba(239, 68, 68, 0.1)', padding: '0.3rem 0.6rem', borderRadius: '1rem', fontWeight: 600 }}>Offline</span>
                        )}
                        <button 
                          onClick={() => handleDeleteDeviceAdmin(deviceId, devData.name)}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--status-critical)', border: '1px solid var(--status-critical)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                        >
                          Hapus Paksa
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Tab Content: Active Users */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activeUsersList.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0' }}>Belum ada user yang disetujui.</div>
              ) : (
                activeUsersList.map(([uid, user]) => {
                  const userDevices = getDevicesByUser(uid);
                  const isExpanded = !!expandedUsers[uid];
                  
                  return (
                    <div key={uid} className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                      <div onClick={() => toggleExpandUser(uid)} style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{user.name}</h3>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>{user.institution || '-'}</p>
                        </div>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>

                      {isExpanded && (
                        <div style={{ background: 'rgba(22, 66, 60, 0.02)', padding: '1.5rem', borderTop: '1px solid rgba(22, 66, 60, 0.1)' }}>
                          
                          {/* ADMIN CONTROLS FOR USER */}
                          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(22, 66, 60, 0.05)', paddingBottom: '1rem' }}>
                            <button onClick={() => startEditUser(uid, user)} className="btn-3d-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Edit Pengguna</button>
                            <button onClick={() => handleDeleteUser(uid, user.name)} className="btn-3d btn-danger" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Hapus Pengguna</button>
                          </div>

                          {editingUserId === uid && (
                            <form onSubmit={(e) => handleUpdateUser(e, uid)} className="glass-panel" style={{ marginBottom: '1.5rem', border: '1px solid var(--primary)' }}>
                              <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)', fontSize: '0.9rem' }}>Edit Data Pengguna</h4>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Nama Lengkap</label>
                                  <input type="text" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} required style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>No WhatsApp</label>
                                  <input type="text" value={editFormData.phone} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} required style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Instansi / Lokasi</label>
                                  <input type="text" value={editFormData.institution} onChange={e => setEditFormData({...editFormData, institution: e.target.value})} required style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                  <button type="submit" className="btn-3d" style={{ flex: 1, padding: '0.6rem' }}>Simpan</button>
                                  <button type="button" onClick={cancelEditUser} className="btn-3d-secondary" style={{ flex: 1, padding: '0.6rem' }}>Batal</button>
                                </div>
                              </div>
                            </form>
                          )}

                          {userDevices.length === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada alat.</p>
                          ) : (
                            userDevices.map(([deviceId, devData]) => {
                              const lastUpdated = devData.last_updated || 0;
                              const isOnline = (currentTime - lastUpdated) <= 60 && lastUpdated > 0;
                              const sensors = devData.sensor_data || {};
                              const temp = sensors.suhu_air || 0;
                              const tds = sensors.tds || 0;
                              const ph = sensors.ph || 0;

                              return (
                                <div key={deviceId} 
                                     onClick={() => navigate(`/device/${deviceId}`)}
                                     style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', padding: '1rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'var(--transition)', marginBottom: '0.5rem' }}
                                     className="device-card-hover"
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                      <Server size={18} color="var(--primary)" />
                                      <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{devData.name || 'Alat Tanpa Nama'}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>ID: {deviceId}</div>
                                      </div>
                                    </div>
                                    {isOnline ? (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div> Online
                                      </div>
                                    ) : (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></div> Offline
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <div style={{ flex: 1, background: 'rgba(0,0,0,0.03)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                                        <Thermometer size={14} color="var(--status-warning)" />
                                        <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Suhu Air</span>
                                      </div>
                                      <div style={{ fontSize: '1rem', fontWeight: 700 }}>{temp.toFixed(1)}<span style={{ fontSize: '0.7rem', fontWeight: 'normal', marginLeft: '2px' }}>°C</span></div>
                                    </div>
                                    <div style={{ flex: 1, background: 'rgba(0,0,0,0.03)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                                        <Droplets size={14} color="var(--primary)" />
                                        <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>TDS</span>
                                      </div>
                                      <div style={{ fontSize: '1rem', fontWeight: 700 }}>{tds.toFixed(0)}<span style={{ fontSize: '0.7rem', fontWeight: 'normal', marginLeft: '2px' }}>PPM</span></div>
                                    </div>
                                    <div style={{ flex: 1, background: 'rgba(0,0,0,0.03)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                                        <FlaskConical size={14} color="var(--status-critical)" />
                                        <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>pH</span>
                                      </div>
                                      <div style={{ fontSize: '1rem', fontWeight: 700 }}>{ph.toFixed(1)}</div>
                                    </div>
                                  </div>

                                  {/* Action Button for Admin */}
                                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); navigate(`/device/${deviceId}/config`); }}
                                      className="btn-3d-secondary"
                                      style={{ flex: 1, padding: '0.6rem', fontSize: '0.8rem', textAlign: 'center' }}
                                    >
                                      Konfigurasi
                                    </button>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleDeleteDeviceAdmin(deviceId, devData.name); }}
                                      className="btn-3d btn-danger"
                                      style={{ padding: '0.6rem 1rem', fontSize: '0.8rem' }}
                                    >
                                      Hapus
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
