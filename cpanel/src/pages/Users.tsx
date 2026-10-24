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
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchUsers() {
      try {
        const token = localStorage.getItem('@idk_cpanel_token');
        // Apuntamos al backend aislado
        const res = await fetch('http://localhost:3001/api/admin/users', {
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
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '28px', margin: 0 }}>Gestión de Usuarios</h1>
        <button style={{ background: '#00f2fe', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          + Añadir Usuario
        </button>
      </div>

      {error && <div style={{ background: '#ff4d4f22', color: '#ff4d4f', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

      <div style={{ background: '#181b21', borderRadius: '10px', border: '1px solid #2a2e39', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#a0a5b1' }}>Cargando usuarios de Turso...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#0f1115', borderBottom: '1px solid #2a2e39', color: '#a0a5b1', fontSize: '14px' }}>
                <th style={{ padding: '15px' }}>Alias</th>
                <th style={{ padding: '15px' }}>Email</th>
                <th style={{ padding: '15px' }}>Rol</th>
                <th style={{ padding: '15px' }}>Tipo</th>
                <th style={{ padding: '15px' }}>Posts</th>
                <th style={{ padding: '15px' }}>Registro</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #2a2e39', fontSize: '14px' }}>
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>@{user.alias}</td>
                  <td style={{ padding: '15px', color: '#a0a5b1' }}>{user.email}</td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ 
                      background: user.role === 'owner' ? '#00f2fe33' : user.role === 'admin' ? '#ff4d4f33' : user.role === 'support' ? '#f59e0b33' : '#a0a5b133',
                      color: user.role === 'owner' ? '#00f2fe' : user.role === 'admin' ? '#ff4d4f' : user.role === 'support' ? '#f59e0b' : '#a0a5b1',
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold'
                    }}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '15px', color: '#a0a5b1' }}>{user.account_type}</td>
                  <td style={{ padding: '15px' }}>{user.posts_count}</td>
                  <td style={{ padding: '15px', color: '#a0a5b1' }}>{new Date(user.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
