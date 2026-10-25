import { useState } from 'react';
import { KeyRound, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      setStatus('error');
      setMessage('Las contraseñas nuevas no coinciden');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/password`, {
        method: `PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('@idk_cpanel_token')}`
        },
        body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cambiar contraseña');

      setStatus('success');
      setMessage('Contraseña actualizada correctamente.');
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <KeyRound color="#00f2fe" /> Seguridad de la Cuenta
      </h2>

      <div style={{ background: '#181b21', padding: '30px', borderRadius: '8px', border: '1px solid #2a2e39' }}>
        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div>
            <label style={{ display: 'block', color: '#a0a5b1', fontSize: '13px', marginBottom: '5px' }}>Contraseña Actual</label>
            <input 
              type="password" 
              value={currentPass} 
              onChange={e => setCurrentPass(e.target.value)} 
              required
              style={{ width: '100%', background: '#0f1115', border: '1px solid #2a2e39', padding: '12px', borderRadius: '6px', color: '#fff', outline: 'none' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#a0a5b1', fontSize: '13px', marginBottom: '5px' }}>Nueva Contraseña</label>
            <input 
              type="password" 
              value={newPass} 
              onChange={e => setNewPass(e.target.value)} 
              required
              minLength={6}
              style={{ width: '100%', background: '#0f1115', border: '1px solid #2a2e39', padding: '12px', borderRadius: '6px', color: '#fff', outline: 'none' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#a0a5b1', fontSize: '13px', marginBottom: '5px' }}>Confirmar Nueva Contraseña</label>
            <input 
              type="password" 
              value={confirmPass} 
              onChange={e => setConfirmPass(e.target.value)} 
              required
              style={{ width: '100%', background: '#0f1115', border: '1px solid #2a2e39', padding: '12px', borderRadius: '6px', color: '#fff', outline: 'none' }} 
            />
          </div>

          {status === 'error' && <div style={{ color: '#ff4d4f', fontSize: '14px' }}>⚠️ {message}</div>}
          {status === 'success' && (
            <div style={{ color: '#00f2fe', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <CheckCircle size={16} /> {message}
            </div>
          )}

          <button 
            type="submit" 
            disabled={status === 'loading'}
            style={{ background: '#00f2fe', color: '#000', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: status === 'loading' ? 'not-allowed' : 'pointer', marginTop: '10px' }}
          >
            {status === 'loading' ? 'ACTUALIZANDO...' : 'CAMBIAR CONTRASEÑA'}
          </button>
        </form>
      </div>
    </div>
  );
}
