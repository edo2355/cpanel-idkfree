import { useState, useEffect } from 'react';

export default function Telemetry() {
  const [logs, setLogs] = useState<any[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      const token = localStorage.getItem('@idk_cpanel_token');
      // Asumimos que crearemos esta ruta en el cpanel-backend
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/telemetry', { headers: { 'Authorization': `Bearer ${token}` }});
      const data = await res.json();
      setLogs(data.logs || []);
      setLoading(false);
    }
    fetchLogs();
  }, []);

  // Calcular errores por país
  const errorsByCountry = logs.reduce((acc, log) => {
    acc[log.country_code] = (acc[log.country_code] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>Telemetría Global</h1>
      
      {/* Gráfico de barras por País */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
        {Object.entries(errorsByCountry).map(([country, count]: any) => (
          <div key={country} style={{ background: '#181b21', padding: '15px', borderRadius: '8px', border: '1px solid #2a2e39', minWidth: '100px' }}>
            <p style={{ margin: 0, color: '#a0a5b1', fontSize: '12px' }}>País: {country}</p>
            <h2 style={{ margin: '5px 0 0 0', color: '#ff4d4f' }}>{count} <span style={{fontSize: '12px', color: '#fff'}}>errores</span></h2>
          </div>
        ))}
      </div>

      <div style={{ background: '#181b21', borderRadius: '10px', border: '1px solid #2a2e39', padding: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #2a2e39', color: '#a0a5b1' }}>
              <th style={{ padding: '10px' }}>Fecha</th>
              <th style={{ padding: '10px' }}>Plataforma</th>
              <th style={{ padding: '10px' }}>País</th>
              <th style={{ padding: '10px' }}>Dispositivo</th>
              <th style={{ padding: '10px' }}>Error</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(l => (
              <tr key={l.id} style={{ borderBottom: '1px solid #2a2e39' }}>
                <td style={{ padding: '10px', fontSize: '12px' }}>{new Date(l.created_at).toLocaleString()}</td>
                <td style={{ padding: '10px' }}>
                  <span style={{ background: l.platform === 'mobile' ? '#00f2fe22' : '#f59e0b22', color: l.platform === 'mobile' ? '#00f2fe' : '#f59e0b', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                    {l.platform.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>{l.country_code}</td>
                <td style={{ padding: '10px', fontSize: '12px' }}>{l.device_info || 'N/A'}</td>
                <td style={{ padding: '10px', color: '#ff4d4f', fontSize: '12px' }}>{l.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
