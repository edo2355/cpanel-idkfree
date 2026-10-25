import { useState, useEffect } from 'react';
export default function Audit() {
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(() => {
    const fetchLogs = async () => {
      const token = localStorage.getItem('@idk_cpanel_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/logs`, { headers: { 'Authorization': `Bearer ${token}` }});
      const data = await res.json(); setLogs(data.logs || []);
    };
    fetchLogs();
  }, []);
  return (
    <div>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>Auditoría de Dispositivos</h1>
      <div style={{ background: '#181b21', borderRadius: '10px', border: '1px solid #2a2e39', padding: '20px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead><tr style={{ borderBottom: '1px solid #2a2e39', color: '#a0a5b1' }}>
            <th style={{ padding: '10px' }}>Fecha</th><th style={{ padding: '10px' }}>Dispositivo</th><th style={{ padding: '10px' }}>OS</th><th style={{ padding: '10px' }}>Error</th>
          </tr></thead>
          <tbody>{logs.map(l => (
            <tr key={l.id} style={{ borderBottom: '1px solid #2a2e39' }}>
              <td style={{ padding: '10px', fontSize: '12px' }}>{new Date(l.created_at).toLocaleString()}</td>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>{l.device_model}</td>
              <td style={{ padding: '10px' }}>{l.os_version}</td>
              <td style={{ padding: '10px', color: '#ff4d4f', fontSize: '12px' }}>{l.error_message}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}