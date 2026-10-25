import { useState, useEffect } from 'react';
import { Activity, AlertCircle } from 'lucide-react';

export default function Telemetry() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchLogs() {
      try {
        const token = localStorage.getItem('@idk_cpanel_token');
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/telemetry`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setLogs(data.logs || []);
      } catch (err: any) {
        setError(err.message || 'Error al cargar telemetría');
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  // Contar por tipo de evento (evita depender de country_code)
  const eventCounts = logs.reduce((acc, log) => {
    const type = log.event_type || 'UNKNOWN';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Activity color="#00f2fe" /> Telemetría del Sistema
      </h2>

      {loading && <p style={{ color: '#a0a5b1' }}>Cargando logs...</p>}
      {error && (
        <div style={{ background: '#ff4d4f22', color: '#ff4d4f', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
            {Object.entries(eventCounts).map(([type, count]) => (
              <div key={type} style={{ background: '#181b21', padding: '20px', borderRadius: '8px', border: '1px solid #2a2e39' }}>
                <p style={{ margin: 0, color: '#a0a5b1', fontSize: '12px', textTransform: 'uppercase' }}>{type}</p>
                <h3 style={{ margin: '10px 0 0 0', color: '#00f2fe', fontSize: '28px' }}>{count as number}</h3>
              </div>
            ))}
            {Object.keys(eventCounts).length === 0 && (
              <p style={{ color: '#a0a5b1' }}>No hay logs registrados todavía.</p>
            )}
          </div>

          <h3 style={{ marginBottom: '15px' }}>Últimos 50 eventos</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#181b21', borderRadius: '8px', overflow: 'hidden' }}>
            <thead>
              <tr style={{ background: '#0f1115', textAlign: 'left', borderBottom: '1px solid #2a2e39' }}>
                <th style={{ padding: '12px' }}>Fecha</th>
                <th style={{ padding: '12px' }}>Tipo</th>
                <th style={{ padding: '12px' }}>Mensaje</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 50).map((log, i) => (
                <tr key={log.id || i} style={{ borderBottom: '1px solid #2a2e39' }}>
                  <td style={{ padding: '12px', color: '#a0a5b1', fontSize: '12px' }}>{new Date(log.created_at).toLocaleString()}</td>
                  <td style={{ padding: '12px', color: '#00f2fe', fontWeight: 'bold' }}>{log.event_type}</td>
                  <td style={{ padding: '12px' }}>{log.message}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={3} style={{ padding: '20px', textAlign: 'center', color: '#a0a5b1' }}>Sin logs registrados.</td></tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
