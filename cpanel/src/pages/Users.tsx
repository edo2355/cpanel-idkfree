import { useState, useEffect } from 'react';

interface User {
  id: string;
  alias: string;
  name: string;
  email: string;
  account_type: string;
  role: string;
  created_at: string;
  posts_count: number;
  is_test: number;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState<'real' | 'test'>('real');

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('@idk_cpanel_token');
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/users?type=${filterType}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Error al cargar usuarios');
        const data = await res.json();
        setUsers(data.users || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [filterType]);

  return (
    <div>
      <h2>Usuarios</h2>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => setFilterType('real')}
          style={{ padding: '8px 16px', background: filterType === 'real' ? '#00f2fe' : '#181b21', color: filterType === 'real' ? '#000' : '#fff', border: '1px solid #2a2e39', borderRadius: '6px', cursor: 'pointer' }}
        >
          REALES
        </button>
        <button 
          onClick={() => setFilterType('test')}
          style={{ padding: '8px 16px', background: filterType === 'test' ? '#ff4d4f' : '#181b21', color: filterType === 'test' ? '#fff' : '#fff', border: '1px solid #2a2e39', borderRadius: '6px', cursor: 'pointer' }}
        >
          PRUEBA
        </button>
      </div>

      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#181b21', borderRadius: '8px', overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: '#0f1115', textAlign: 'left', borderBottom: '1px solid #2a2e39' }}>
              <th style={{ padding: '12px' }}>Alias</th>
              <th style={{ padding: '12px' }}>Nombre</th>
              <th style={{ padding: '12px' }}>Correo</th>
              <th style={{ padding: '12px' }}>Posts</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#a0a5b1' }}>No hay usuarios en esta categoría.</td></tr>
            )}
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #2a2e39' }}>
                <td style={{ padding: '12px' }}>@{u.alias}</td>
                <td style={{ padding: '12px' }}>{u.name}</td>
                <td style={{ padding: '12px' }}>{u.email}</td>
                <td style={{ padding: '12px' }}>{u.posts_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
