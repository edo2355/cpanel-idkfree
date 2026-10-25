import { useState, useEffect } from 'react';
import { Settings, Save } from 'lucide-react';

export default function ConfigPage() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('@idk_cpanel_token');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/settings`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(d => { setSettings(d.settings || {}); setLoading(false); });
  }, []);

  const handleSave = async (key: string, value: string) => {
    await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ key, value })
    });
    alert(`✅ ${key} guardado. Reinicia el backend para aplicar cambios en producción.`);
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Settings color="#00f2fe"/> Tokens y API Keys</h2>
      <p style={{ color: '#a0a5b1', fontSize: '14px', marginBottom: '20px' }}>Aquí puedes guardar los tokens para no tener que buscarlos en el código.</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {['MAILTRAP_TOKEN', 'LIVEKIT_API_KEY', 'LIVEKIT_SECRET', 'QVAPAY_APP_ID', 'QVAPAY_APP_SECRET'].map(key => (
          <div key={key} style={{ background: '#181b21', padding: '15px', borderRadius: '8px', border: '1px solid #2a2e39' }}>
            <label style={{ display: 'block', color: '#00f2fe', marginBottom: '8px', fontWeight: 'bold' }}>{key}</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                defaultValue={settings[key] || ''} 
                onBlur={(e) => handleSave(key, e.target.value)}
                style={{ flex: 1, padding: '10px', background: '#0f1115', border: '1px solid #2a2e39', color: '#fff', borderRadius: '4px' }}
              />
              <button onClick={() => alert('Los cambios se guardan al salir del campo (onBlur)')} style={{ background: '#00f2fe', color: '#000', border: 'none', padding: '0 15px', borderRadius: '4px', cursor: 'pointer' }}><Save size={16}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
