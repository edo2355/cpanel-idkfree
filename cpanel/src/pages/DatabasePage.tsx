import { useState } from 'react';
import { Database, Play, AlertTriangle } from 'lucide-react';

export default function DatabasePage() {
  const [query, setQuery] = useState('SELECT * FROM users LIMIT 5;');
  const [result, setResult] = useState<any[] | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeMs, setTimeMs] = useState(0);
  const token = localStorage.getItem('@idk_cpanel_token');

  const execute = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/db/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error en query');
      setResult(data.rows || []);
      setTimeMs(data.timeMs);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Database color="#00f2fe" /> Consola SQL (Turso)
      </h2>
      <div style={{ background: '#ff4d4f22', color: '#ff4d4f', padding: '15px', borderRadius: '6px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <AlertTriangle size={20} />
        <div>
          <strong>CUIDADO:</strong> Los comandos DROP, TRUNCATE, ALTER y borrado masivo de usuarios están bloqueados.
          Solo ejecuta queries SELECT o UPDATE/INSERT muy específicos.
        </div>
      </div>

      <div style={{ background: '#181b21', padding: '20px', borderRadius: '8px', border: '1px solid #2a2e39', marginBottom: '20px' }}>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={5}
          style={{
            width: '100%',
            background: '#0a0a0a',
            color: '#00f2fe',
            border: '1px solid #2a2e39',
            borderRadius: '6px',
            padding: '15px',
            fontFamily: 'monospace',
            fontSize: '14px',
            resize: 'vertical',
          }}
        />
        <button
          onClick={execute}
          disabled={loading}
          style={{
            marginTop: '10px', background: '#00f2fe', color: '#000', border: 'none', padding: '10px 20px',
            borderRadius: '6px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}
        >
          <Play size={16} /> {loading ? 'Ejecutando...' : 'EJECUTAR QUERY'}
        </button>
        {timeMs > 0 && <span style={{ marginLeft: '10px', color: '#a0a5b1', fontSize: '12px' }}>⏱ {timeMs}ms</span>}
      </div>

      {error && <div style={{ background: '#ff4d4f22', color: '#ff4d4f', padding: '15px', borderRadius: '6px' }}>❌ {error}</div>}

      {result !== null && (
        <div style={{ background: '#181b21', borderRadius: '8px', border: '1px solid #2a2e39', overflow: 'auto', maxHeight: '500px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', fontFamily: 'monospace' }}>
            <thead style={{ background: '#0f1115', position: 'sticky', top: 0 }}>
              <tr>
                {result.length > 0 && Object.keys(result[0]).map((k) => (
                  <th key={k} style={{ padding: '10px', textAlign: 'left', color: '#00f2fe', borderBottom: '1px solid #2a2e39' }}>{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #2a2e39' }}>
                  {Object.values(row).map((v: any, j) => (
                    <td key={j} style={{ padding: '10px', color: '#fff' }}>
                      {v === null ? <span style={{ color: '#a0a5b1' }}>null</span> : String(v).substring(0, 80)}
                    </td>
                  ))}
                </tr>
              ))}
              {result.length === 0 && (
                <tr><td style={{ padding: '20px', color: '#a0a5b1' }}>Query ejecutado sin resultados (0 filas).</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
