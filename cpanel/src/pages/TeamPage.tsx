import { useState, useEffect } from 'react';
import { UserPlus, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

export default function TeamPage() {
  const [team, setTeam] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'moderator' });
  const [msg, setMsg] = useState('');
  const token = localStorage.getItem('@idk_cpanel_token');

  const loadTeam = () => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/team`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(d => setTeam(d.team || []));
  };

  useEffect(loadTeam, []);

  const handleAdd = async (e: any) => {
    e.preventDefault();
    setMsg('');
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/team`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (res.ok) { setMsg('✅ Admin añadido'); setForm({ name: '', email: '', password: '', role: 'moderator' }); loadTeam(); }
    else setMsg(`❌ ${data.error}`);
  };

  const toggleStatus = async (id: string) => {
    await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/team/${id}/toggle`, {
      method: 'PUT', headers: { Authorization: `Bearer ${token}` }
    });
    loadTeam();
  };

  return (
    <div>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><ShieldAlert color="#00f2fe"/> Gestión de Equipo</h2>
      
      {msg && <p style={{ color: msg.includes('✅') ? '#00f2fe' : '#ff4d4f' }}>{msg}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', marginTop: '20px' }}>
        <div style={{ background: '#181b21', padding: '20px', borderRadius: '8px', border: '1px solid #2a2e39' }}>
          <h3>Miembros Activos</h3>
          <table style={{ width: '100%', textAlign: 'left', marginTop: '15px', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid #2a2e39' }}><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th>Acción</th></tr></thead>
            <tbody>
              {team.map((t: any) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #2a2e39', opacity: t.is_active ? 1 : 0.5 }}>
                  <td style={{ padding: '10px 0' }}>{t.name}</td>
                  <td>{t.email}</td>
                  <td style={{ color: '#00f2fe' }}>{t.role}</td>
                  <td>{t.is_active ? <CheckCircle color="#00f2fe" size={16}/> : <XCircle color="#ff4d4f" size={16}/>}</td>
                  <td>
                    {t.role !== 'owner' && (
                      <button onClick={() => toggleStatus(t.id)} style={{ background: 'transparent', border: '1px solid #a0a5b1', color: '#fff', borderRadius: '4px', cursor: 'pointer', padding: '4px 8px' }}>
                        {t.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ background: '#181b21', padding: '20px', borderRadius: '8px', border: '1px solid #2a2e39' }}>
          <h3><UserPlus size={16}/> Añadir Miembro</h3>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
            <input placeholder="Nombre" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{ padding: '10px', background: '#0f1115', border: '1px solid #2a2e39', color: '#fff', borderRadius: '4px' }} />
            <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={{ padding: '10px', background: '#0f1115', border: '1px solid #2a2e39', color: '#fff', borderRadius: '4px' }} />
            <input placeholder="Contraseña temporal" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} style={{ padding: '10px', background: '#0f1115', border: '1px solid #2a2e39', color: '#fff', borderRadius: '4px' }} />
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} style={{ padding: '10px', background: '#0f1115', border: '1px solid #2a2e39', color: '#fff', borderRadius: '4px' }}>
              <option value="moderator">Moderador (KYC/Reportes)</option>
              <option value="admin">Admin (Todo menos Equipo)</option>
            </select>
            <button type="submit" style={{ background: '#00f2fe', color: '#000', padding: '10px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>CREAR CUENTA</button>
          </form>
        </div>
      </div>
    </div>
  );
}
