import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function WaitlistWidget() {
  const [stats, setStats] = useState<any>(null);
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const headers = { 'Authorization': `Bearer ${token}` };

    fetch(`${API_URL}/api/admin/waitlist/stats`, { headers })
      .then(res => res.json())
      .then(setStats)
      .catch(console.error);

    fetch(`${API_URL}/api/admin/waitlist/recent`, { headers })
      .then(res => res.json())
      .then(setRecent)
      .catch(console.error);
  }, []);

  if (!stats) return <div style={{ color: 'gray', padding: '20px' }}>Cargando waitlist...</div>;

  return (
    <div style={{ marginTop: '30px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
      <h2 style={{ color: '#00e5ff', marginBottom: '15px' }}>📊 Métricas de la Waitlist</h2>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ background: 'rgba(0,229,255,0.1)', padding: '15px', borderRadius: '8px', flex: 1, minWidth: '150px' }}>
          <div style={{ fontSize: '12px', color: '#aaa' }}>TOTAL REGISTRADOS</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.total_waitlist}</div>
        </div>
        <div style={{ background: 'rgba(74,222,128,0.1)', padding: '15px', borderRadius: '8px', flex: 1, minWidth: '150px' }}>
          <div style={{ fontSize: '12px', color: '#aaa' }}>ACCESO ANTICIPADO</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4ade80' }}>{stats.early_access} / 25</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', flex: 1, minWidth: '150px' }}>
          <div style={{ fontSize: '12px', color: '#aaa' }}>REFERIDOS</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.referrals}</div>
        </div>
      </div>

      <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '10px' }}>Últimos Registros</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #333', color: '#00e5ff' }}>
              <th style={{ padding: '8px' }}>Alias</th>
              <th style={{ padding: '8px' }}>Posición</th>
              <th style={{ padding: '8px' }}>Código</th>
              <th style={{ padding: '8px' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((u, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '8px' }}>@{u.alias}</td>
                <td style={{ padding: '8px' }}>#{u.position}</td>
                <td style={{ padding: '8px', fontFamily: 'monospace', color: '#aaa' }}>{u.referral_code}</td>
                <td style={{ padding: '8px', color: u.is_early_access ? '#4ade80' : '#aaa' }}>
                  {u.is_early_access ? '✓ Early' : 'Waitlist'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
