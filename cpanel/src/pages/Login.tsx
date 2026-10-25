import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ setToken }: { setToken: (t: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code2FA, setCode2FA] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Credenciales inválidas');

      if (data.require2FA) {
        setStep(2); // El backend pide código
      } else {
        // Si el backend no tiene 2FA aún, entra directo
        localStorage.setItem('@idk_cpanel_token', data.accessToken);
        localStorage.setItem('@idk_cpanel_admin', JSON.stringify(data.admin));
        setToken(data.accessToken);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify2FA(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: code2FA }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Código inválido');

      localStorage.setItem('@idk_cpanel_token', data.accessToken);
      localStorage.setItem('@idk_cpanel_admin', JSON.stringify(data.admin));
      setToken(data.accessToken);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1115', color: '#fff' }}>
      <form onSubmit={step === 1 ? handleLogin : handleVerify2FA} style={{ background: '#181b21', padding: '40px', borderRadius: '12px', border: '1px solid #2a2e39', width: '350px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h1 style={{ textAlign: 'center', margin: '0 0 20px 0', color: '#00f2fe' }}>IDK CPANEL</h1>
        
        {error && <div style={{ background: '#ff4d4f22', color: '#ff4d4f', padding: '10px', borderRadius: '6px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

        {step === 1 ? (
          <>
            <input type="email" placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} style={{ background: '#0f1115', border: '1px solid #2a2e39', padding: '12px', borderRadius: '6px', color: '#fff', outline: 'none' }} />
            <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} style={{ background: '#0f1115', border: '1px solid #2a2e39', padding: '12px', borderRadius: '6px', color: '#fff', outline: 'none' }} />
            <button type="submit" disabled={loading} style={{ background: '#00f2fe', color: '#000', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
              {loading ? 'Verificando...' : 'Continuar'}
            </button>
          </>
        ) : (
          <>
            <p style={{ textAlign: 'center', fontSize: '14px', color: '#a0a5b1' }}>Hemos enviado un código de 6 dígitos a <b>{email}</b></p>
            <input type="text" placeholder="Código de 6 dígitos" value={code2FA} onChange={e => setCode2FA(e.target.value)} maxLength={6} style={{ background: '#0f1115', border: '1px solid #2a2e39', padding: '12px', borderRadius: '6px', color: '#fff', outline: 'none', textAlign: 'center', letterSpacing: '5px', fontSize: '20px' }} />
            <button type="submit" disabled={loading} style={{ background: '#00f2fe', color: '#000', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
              {loading ? 'Validando...' : 'Acceder al Panel'}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
