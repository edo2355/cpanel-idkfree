import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [stats, setStats] = useState({ users: 0, posts: 0, messages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem('@idk_cpanel_token');
        const res = await fetch('https://idkfreegetid.dpdns.org/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats({ users: data.total_users || 0, posts: data.total_posts || 0, messages: data.total_messages || 0 });
        }
      } catch (error) { console.error(error); } finally { setLoading(false); }
    }
    fetchStats();
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '30px', letterSpacing: '1px' }}>
        SISTEMA_<span style={{ color: 'var(--accent-warm)' }}>STATS</span>
      </h1>
      
      <div style={{ display: 'flex', gap: '20px' }}>
        
        <div className="glass-panel glass-panel-interactive" style={{ flex: 1, padding: '25px' }}>
          <p className="text-tactical">Usuarios Totales</p>
          <h2 style={{ fontSize: '42px', fontWeight: '800', color: 'var(--text-main)', marginTop: '10px' }}>
            {loading ? '...' : stats.users}
          </h2>
        </div>

        <div className="glass-panel glass-panel-interactive" style={{ flex: 1, padding: '25px' }}>
          <p className="text-tactical">Posts Totales</p>
          <h2 style={{ fontSize: '42px', fontWeight: '800', color: 'var(--text-main)', marginTop: '10px' }}>
            {loading ? '...' : stats.posts}
          </h2>
        </div>

        <div className="glass-panel glass-panel-interactive" style={{ flex: 1, padding: '25px' }}>
          <p className="text-tactical">Mensajes</p>
          <h2 style={{ fontSize: '42px', fontWeight: '800', color: 'var(--text-main)', marginTop: '10px' }}>
            {loading ? '...' : stats.messages}
          </h2>
        </div>

      </div>
    </div>
  );
}
