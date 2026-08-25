import { useState, useEffect } from 'react';
import { ref, onValue, set, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Thermometer, Droplets, FlaskConical, Beaker, CloudRain, Server, AlertTriangle, LayoutDashboard, Power, SettingsIcon, SlidersHorizontal, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';

const PdfIcon = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <text x="5" y="17" fontSize="7" fontWeight="bold" stroke="none" fill={color} fontFamily="sans-serif">PDF</text>
  </svg>
);

const IndicatorCard = ({ title, value, unit, icon: Icon, statusClass }) => (
  <div className="glass-card-concave" style={{ display: 'flex', flexDirection: 'column' }}>
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
  const { currentUser, userData } = useAuth();
  const [devices, setDevices] = useState({});
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [data, setData] = useState(null);
  const [settings, setSettings] = useState(null);
  const [controls, setControls] = useState(null);
  const [historyData, setHistoryData] = useState([]);

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

    const historyRef = ref(database, `devices/${selectedDeviceId}/history`);
    const unsubHistory = onValue(historyRef, (snapshot) => {
      if (snapshot.exists()) {
        const histObj = snapshot.val();
        // Convert object to array, filter out nulls, sort by timestamp
        const histArray = Object.values(histObj)
          .filter(item => item !== null && item.timestamp)
          .sort((a, b) => a.timestamp - b.timestamp)
          .map(item => {
            const date = new Date(item.timestamp);
            return {
              ...item,
              time: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
              fullDate: date.toLocaleString('id-ID')
            };
          });
        setHistoryData(histArray);
      } else {
        setHistoryData([]);
      }
    });

    return () => {
      unsubData();
      unsubSettings();
      unsubControls();
      unsubHistory();
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



  const handleDownloadPDF = async () => {
    if (!historyData || historyData.length === 0) {
      Swal.fire({
        title: 'Data Kosong',
        text: 'Belum ada data history untuk diunduh.',
        icon: 'warning',
        confirmButtonColor: '#16423c'
      });
      return;
    }

    const doc = new jsPDF();
    const deviceName = devices[selectedDeviceId]?.name || selectedDeviceId;
    
    // --- MODERN HEADER START ---
    // Top colored band
    doc.setFillColor(22, 101, 52); // Dark Green
    doc.rect(0, 0, 210, 36, 'F');
    
    try {
      const imgObj = new Image();
      imgObj.src = '/pwa-192x192.png';
      await new Promise((resolve, reject) => { 
        imgObj.onload = resolve; 
        imgObj.onerror = reject;
      });
      // Draw logo over green band
      doc.addImage(imgObj, 'PNG', 14, 7, 22, 22);
    } catch(e) {
      // Abaikan jika logo gagal dimuat
    }

    // Title in white
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text('SMART HYDRO', 42, 20);
    
    // Subtitle in light green
    doc.setFontSize(10);
    doc.setTextColor(190, 230, 190);
    doc.setFont("helvetica", "normal");
    doc.text('Laporan Riwayat Sensor & Kualitas Air', 42, 27);
    
    // Meta Data Box (Grey Background)
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 45, 182, 30, 'F');
    
    // Meta Data Content
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.text('INFORMASI PERANGKAT', 20, 54);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(`ID Perangkat : ${selectedDeviceId}`, 20, 62);
    doc.text(`Nama Alat    : ${deviceName}`, 20, 68);
    
    doc.text(`Waktu Cetak : ${new Date().toLocaleString('id-ID')}`, 115, 62);
    
    // Gunakan nama dari database user (userData.name)
    let printedBy = userData?.name || currentUser?.displayName;
    if (!printedBy || printedBy.trim() === '') {
        printedBy = 'Administrator';
    }
    doc.text(`Dicetak Oleh : ${printedBy}`, 115, 68);
    // --- HEADER END ---

    // Table Data
    const tableColumn = ["Waktu Pengukuran", "pH Air", "TDS (ppm)", "Suhu Air (°C)"];
    const tableRows = [];

    historyData.forEach(item => {
      const rowData = [
        item.fullDate,
        item.ph?.toFixed(2) || '-',
        item.tds?.toFixed(0) || '-',
        item.suhu_air?.toFixed(1) || '-'
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 85,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 5, halign: 'center', textColor: [71, 85, 105], lineColor: [226, 232, 240] },
      headStyles: { fillColor: [22, 101, 52], textColor: [255, 255, 255], fontStyle: 'bold' }, // Dark green
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { top: 10, left: 14, right: 14 }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Laporan dihasilkan otomatis oleh Sistem Smart Hydroponik - Halaman ${i} dari ${pageCount}`, 14, doc.internal.pageSize.height - 10);
    }

    doc.save(`Laporan_Hidroponik_${selectedDeviceId}.pdf`);
  };

  return (
    <div className="user-dashboard">

      {Object.keys(devices).length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
          <Server size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
          <p>Anda belum memiliki alat terdaftar.</p>
          <Link to="/devices" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Ke Kelola Alat &rarr;</Link>
        </div>
      ) : (
        <>
          {/* Active Device Selector & PDF Download */}
          <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <select 
                className="glass-panel"
                value={selectedDeviceId} 
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                style={{ width: '100%', padding: '0.8rem 1rem', paddingRight: '2.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--surface-border)', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600, appearance: 'none', cursor: 'pointer', outline: 'none' }}
              >
                {Object.entries(devices).map(([id, device]) => (
                  <option key={id} value={id}>
                    {device.name || id}
                  </option>
                ))}
              </select>
              <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <Server size={18} color="var(--primary)" />
              </div>
            </div>
            <button 
              onClick={handleDownloadPDF} 
              className="btn-3d" 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', padding: '0 1rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              <PdfIcon size={18} />
              <span className="hide-on-mobile">Unduh PDF</span>
            </button>
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

          {/* History Chart Header */}
          <div style={{ marginTop: '2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LayoutDashboard size={20} color="var(--primary)" />
            <h3 className="title-gradient" style={{ fontSize: '1.2rem', margin: 0 }}>
               Grafik Riwayat Sensor
            </h3>
          </div>
            
          {historyData && historyData.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                
              {/* TDS Chart */}
              <div className="glass-card-concave" style={{ padding: '1.25rem', width: '100%', display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Tingkat Nutrisi (TDS)</h4>
                <div style={{ width: '100%', height: 220, marginTop: 'auto' }}>
                  <ResponsiveContainer>
                    <LineChart data={historyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(22, 66, 60, 0.1)" />
                      <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                      <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-outer)', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)' }} />
                      <Line type="monotone" dataKey="tds" stroke="var(--primary)" name="TDS (ppm)" strokeWidth={3} dot={{ r: 2 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* pH Chart */}
              <div className="glass-card-concave" style={{ padding: '1.25rem', width: '100%', display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Kadar Keasaman (pH)</h4>
                <div style={{ width: '100%', height: 220, marginTop: 'auto' }}>
                  <ResponsiveContainer>
                    <LineChart data={historyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(22, 66, 60, 0.1)" />
                      <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                      <YAxis domain={['auto', 'auto']} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-outer)', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)' }} />
                      <Line type="monotone" dataKey="ph" stroke="var(--status-critical)" name="pH Air" strokeWidth={3} dot={{ r: 2 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Suhu Air (DS18B20) Chart */}
              <div className="glass-card-concave" style={{ padding: '1.25rem', width: '100%', display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Suhu Air Tandon (°C)</h4>
                <div style={{ width: '100%', height: 220, marginTop: 'auto' }}>
                  <ResponsiveContainer>
                    <LineChart data={historyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(22, 66, 60, 0.1)" />
                      <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                      <YAxis domain={['auto', 'auto']} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-outer)', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)' }} />
                      <Line type="monotone" dataKey="suhu_air" stroke="#f59e0b" name="Suhu Air" strokeWidth={3} dot={{ r: 2 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Lingkungan Udara (DHT22) Chart */}
              <div className="glass-card-concave" style={{ padding: '1.25rem', width: '100%', display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Lingkungan Udara</h4>
                <div style={{ width: '100%', height: 220, marginTop: 'auto' }}>
                  <ResponsiveContainer>
                    <LineChart data={historyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(22, 66, 60, 0.1)" />
                      <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                      <YAxis yAxisId="left" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-outer)', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)' }} />
                      <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                      <Line yAxisId="left" type="monotone" dataKey="suhu_ruangan" stroke="#10b981" name="Suhu Udara (°C)" strokeWidth={2} dot={{ r: 1 }} />
                      <Line yAxisId="right" type="monotone" dataKey="kelembapan" stroke="#3b82f6" name="Kelembapan (%)" strokeWidth={2} dot={{ r: 1 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          ) : (
            <div className="glass-card-concave" style={{ width: '100%', height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <em>Menunggu pengiriman data history pertama dari alat...</em>
            </div>
          )}

        </>
      )}
    </div>
  );
}

export default UserDashboard;
