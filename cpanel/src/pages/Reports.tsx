import { useState, useEffect } from 'react';
export default function Reports() {
  const [reports, setReports] = useState<any[]>([]);
  const fetchReports = async () => {
    const token = localStorage.getItem('@idk_cpanel_token');
    const res = await fetch('http://localhost:3001/api/admin/reports', { headers: { 'Authorization': `Bearer ${token}` }});
    const data = await res.json(); setReports(data.reports || []);
  };
  useEffect(() => { fetchReports(); }, []);
  const resolveReport = async (id: string) => {
    const token = localStorage.getItem('@idk_cpanel_token');
    await fetch(`http://localhost:3001/api/admin/reports/${id}/resolve`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }});
    fetchReports();
  };
  return (
    <div>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>Moderación de Contenido</h1>
      <div style={{ background: '#181b21', borderRadius: '10px', border: '1px solid #2a2e39', padding: '20px' }}>
        {reports.length === 0 ? <p style={{color:'#a0a5b1'}}>No hay reportes pendientes.</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead><tr style={{ borderBottom: '1px solid #2a2e39', color: '#a0a5b1' }}>
              <th style={{ padding: '10px' }}>ID Post</th><th style={{ padding: '10px' }}>Razón</th><th style={{ padding: '10px' }}>Estado</th><th style={{ padding: '10px' }}>Acción</th>
            </tr></thead>
            <tbody>{reports.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid #2a2e39' }}>
                <td style={{ padding: '10px', fontSize: '12px' }}>{r.post_id}</td>
                <td style={{ padding: '10px', color: '#ff4d4f' }}>{r.reason}</td>
                <td style={{ padding: '10px' }}>{r.status}</td>
                <td style={{ padding: '10px' }}>{r.status === 'pending' && <button onClick={() => resolveReport(r.id)} style={{ background: '#00f2fe', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Resolver</button>}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}