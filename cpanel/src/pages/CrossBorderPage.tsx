import { useEffect, useState } from 'react';
import { Store, UserPlus, Check, Globe } from 'lucide-react';

interface Supplier {
  id: string;
  company_name: string;
  country_code: string;
  categories: string | null;
  min_order_value: number | null;
  currency: string;
  contact_whatsapp: string | null;
  contact_email: string | null;
  verified_at: string | null;
}

interface Influencer {
  id: string;
  niche: string | null;
  platforms: string | null;
  followers_count: number;
  rate_per_post: number | null;
  currency: string;
  country_code: string | null;
  verified_at: string | null;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://10.152.105.73:3001';
const token = () => localStorage.getItem('@idk_cpanel_token');

const btnStyle = { padding: '6px 12px', background: '#00f2fe', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px' } as const;
const thStyle = { textAlign: 'left' as const, padding: '12px 10px', borderBottom: '1px solid #2a2e39', color: '#a0a5b1', fontSize: '12px', textTransform: 'uppercase' as const };
const tdStyle = { padding: '12px 10px', borderBottom: '1px solid #2a2e39', fontSize: '14px' };

export default function CrossBorderPage() {
  const [tab, setTab] = useState<'suppliers' | 'influencers'>('suppliers');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'verified'>('pending');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function loadAll() {
    setLoading(true); setError('');
    try {
      const [rs, ri] = await Promise.all([
        fetch(`${API_URL}/api/admin/cross-border/suppliers?status=${statusFilter}`, { headers: { Authorization: `Bearer ${token()}` } }),
        fetch(`${API_URL}/api/admin/cross-border/influencers?status=${statusFilter}`, { headers: { Authorization: `Bearer ${token()}` } }),
      ]);
      if (!rs.ok || !ri.ok) throw new Error('Error al cargar datos');
      const ds = await rs.json();
      const di = await ri.json();
      setSuppliers(ds.suppliers || []);
      setInfluencers(di.influencers || []);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadAll(); }, [statusFilter]);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function verifySupplier(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`${API_URL}/api/admin/cross-border/suppliers/${id}/verify`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error('Error al verificar');
      loadAll();
      flash('✅ Proveedor verificado');
    } catch (err: any) { flash('❌ ' + err.message); }
    finally { setBusyId(null); }
  }

  async function verifyInfluencer(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`${API_URL}/api/admin/cross-border/influencers/${id}/verify`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error('Error al verificar');
      loadAll();
      flash('✅ Influencer verificado');
    } catch (err: any) { flash('❌ ' + err.message); }
    finally { setBusyId(null); }
  }

  return (
    <div>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Globe size={24} color="#00f2fe" /> Transfronterizo
      </h2>
      <p style={{ color: '#a0a5b1', marginBottom: '24px', fontSize: '14px' }}>
        Verifica proveedores internacionales e influencers. Los contactos se hacen visibles en la web pública al verificar.
      </p>

      {/* Tabs principales */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <button onClick={() => setTab('suppliers')} style={{ padding: '10px 18px', background: tab === 'suppliers' ? '#00f2fe' : '#181b21', color: tab === 'suppliers' ? '#000' : '#fff', border: '1px solid #2a2e39', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Store size={18} /> Proveedores
        </button>
        <button onClick={() => setTab('influencers')} style={{ padding: '10px 18px', background: tab === 'influencers' ? '#00f2fe' : '#181b21', color: tab === 'influencers' ? '#000' : '#fff', border: '1px solid #2a2e39', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <UserPlus size={18} /> Influencers
        </button>
      </div>

      {/* Sub-filtro Pendientes / Verificados */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button onClick={() => setStatusFilter('pending')} style={{ padding: '6px 12px', background: statusFilter === 'pending' ? '#ffc800' : '#181b21', color: statusFilter === 'pending' ? '#000' : '#a0a5b1', border: '1px solid #2a2e39', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
          ⏳ Pendientes
        </button>
        <button onClick={() => setStatusFilter('verified')} style={{ padding: '6px 12px', background: statusFilter === 'verified' ? '#4ade80' : '#181b21', color: statusFilter === 'verified' ? '#000' : '#a0a5b1', border: '1px solid #2a2e39', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
          ✅ Verificados
        </button>
      </div>

      {error && <div style={{ padding: '12px', background: 'rgba(255,77,79,0.15)', border: '1px solid #ff4d4f', borderRadius: '8px', color: '#ff4d4f', marginBottom: '16px' }}>{error}</div>}
      {loading && <div style={{ padding: '40px', textAlign: 'center', color: '#a0a5b1' }}>Cargando…</div>}

      {!loading && tab === 'suppliers' && (
        suppliers.length === 0
          ? <div style={{ padding: '40px', textAlign: 'center', color: '#a0a5b1' }}>✓ No hay proveedores {statusFilter === 'pending' ? 'pendientes' : 'verificados'}</div>
          : (
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#181b21', borderRadius: '10px', overflow: 'hidden' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Empresa</th>
                  <th style={thStyle}>País</th>
                  <th style={thStyle}>Categorías</th>
                  <th style={thStyle}>MOQ</th>
                  <th style={thStyle}>Contacto</th>
                  <th style={thStyle}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map(s => (
                  <tr key={s.id}>
                    <td style={tdStyle}><b>{s.company_name}</b></td>
                    <td style={tdStyle}>{s.country_code}</td>
                    <td style={tdStyle}><span style={{ fontSize: '12px', color: '#a0a5b1' }}>{s.categories || '—'}</span></td>
                    <td style={tdStyle}>{s.min_order_value ? `${s.currency} ${s.min_order_value}` : '—'}</td>
                    <td style={tdStyle}><span style={{ fontSize: '12px', color: '#a0a5b1' }}>{s.contact_whatsapp || s.contact_email || '—'}</span></td>
                    <td style={tdStyle}>
                      {statusFilter === 'pending' ? (
                        <button onClick={() => verifySupplier(s.id)} disabled={busyId === s.id} style={{ ...btnStyle, opacity: busyId === s.id ? 0.5 : 1 }}>
                          <Check size={16} /> {busyId === s.id ? 'Verificando…' : 'Verificar'}
                        </button>
                      ) : (
                        <span style={{ color: '#4ade80', fontSize: '12px' }}>✓ Aprobado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
      )}

      {!loading && tab === 'influencers' && (
        influencers.length === 0
          ? <div style={{ padding: '40px', textAlign: 'center', color: '#a0a5b1' }}>✓ No hay influencers {statusFilter === 'pending' ? 'pendientes' : 'verificados'}</div>
          : (
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#181b21', borderRadius: '10px', overflow: 'hidden' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Nicho</th>
                  <th style={thStyle}>País</th>
                  <th style={thStyle}>Followers</th>
                  <th style={thStyle}>Tarifa</th>
                  <th style={thStyle}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {influencers.map(i => (
                  <tr key={i.id}>
                    <td style={tdStyle}><b>{i.niche || '—'}</b></td>
                    <td style={tdStyle}>{i.country_code || '—'}</td>
                    <td style={tdStyle}>{i.followers_count.toLocaleString()}</td>
                    <td style={tdStyle}>{i.rate_per_post ? `${i.currency} ${i.rate_per_post}` : '—'}</td>
                    <td style={tdStyle}>
                      {statusFilter === 'pending' ? (
                        <button onClick={() => verifyInfluencer(i.id)} disabled={busyId === i.id} style={{ ...btnStyle, opacity: busyId === i.id ? 0.5 : 1 }}>
                          <Check size={16} /> {busyId === i.id ? 'Verificando…' : 'Verificar'}
                        </button>
                      ) : (
                        <span style={{ color: '#4ade80', fontSize: '12px' }}>✓ Aprobado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)', padding: '12px 20px', background: '#00f2fe', color: '#000', borderRadius: '10px', fontWeight: 600, zIndex: 9999 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
