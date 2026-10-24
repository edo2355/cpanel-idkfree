import { useEffect, useState } from 'react';
import { FileCheck, Check, X, AlertCircle } from 'lucide-react';

interface KYCVerification {
  user_id: string;
  document_type: string;
  document_number: string;
  document_photo: string;
  selfie_photo: string;
  alias: string;
  name: string;
  submitted_at: string;
}

export default function KYCPage() {
  const [verifications, setVerifications] = useState<KYCVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para el modal de fotos y notas
  const [selectedUser, setSelectedUser] = useState<KYCVerification | null>(null);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const token = localStorage.getItem('@idk_cpanel_token');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  async function loadPending() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/kyc/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar las solicitudes');
      const data = await res.json();
      setVerifications(data.verifications);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPending();
  }, []);

  async function handleReview(action: 'approve' | 'reject') {
    if (!selectedUser) return;
    setProcessing(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/kyc/${selectedUser.user_id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action, notes })
      });
      if (!res.ok) throw new Error('Error al procesar la solicitud');
      
      // Limpiar y recargar
      setSelectedUser(null);
      setNotes('');
      await loadPending();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  }

  if (loading) return <div style={{ color: '#a0a5b1' }}>Cargando solicitudes...</div>;

  return (
    <div>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <FileCheck color="#00f2fe" /> Revisión de Identidad (KYC)
      </h2>

      {error && <div style={{ color: '#ff4d4f', marginBottom: '20px' }}>{error}</div>}

      {verifications.length === 0 ? (
        <div style={{ background: '#181b21', padding: '30px', borderRadius: '8px', border: '1px solid #2a2e39', textAlign: 'center', color: '#a0a5b1' }}>
          No hay solicitudes pendientes por revisar.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {verifications.map((v) => (
            <div key={v.user_id} style={{ background: '#181b21', padding: '20px', borderRadius: '8px', border: '1px solid #2a2e39' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#00f2fe' }}>@{v.alias}</h3>
              <p style={{ margin: '0 0 5px 0', color: '#a0a5b1', fontSize: '14px' }}>Nombre: {v.name}</p>
              <p style={{ margin: '0 0 5px 0', color: '#a0a5b1', fontSize: '14px' }}>Doc: {v.document_type} - {v.document_number}</p>
              <p style={{ margin: '0 0 15px 0', color: '#a0a5b1', fontSize: '12px' }}>Enviado: {new Date(v.submitted_at).toLocaleString()}</p>
              
              <button 
                onClick={() => { setSelectedUser(v); setNotes(''); }}
                style={{ width: '100%', background: 'transparent', border: '1px solid #00f2fe', color: '#00f2fe', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}
              >
                REVISAR FOTOS Y DECIDIR
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE REVISIÓN */}
      {selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#181b21', width: '100%', maxWidth: '800px', borderRadius: '12px', border: '1px solid #2a2e39', padding: '30px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Revisión de @{selectedUser.alias}</h3>
              <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <p style={{ color: '#a0a5b1', fontSize: '12px', marginBottom: '5px' }}>DOCUMENTO FRONTAL</p>
                <img src={selectedUser.document_photo} alt="Doc" style={{ width: '100%', borderRadius: '8px', border: '1px solid #2a2e39' }} />
              </div>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <p style={{ color: '#a0a5b1', fontSize: '12px', marginBottom: '5px' }}>SELFIE</p>
                <img src={selectedUser.selfie_photo} alt="Selfie" style={{ width: '100%', borderRadius: '8px', border: '1px solid #2a2e39' }} />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ color: '#a0a5b1', fontSize: '12px', marginBottom: '5px' }}>NOTAS (OPCIONAL - OBLIGATORIO SI RECHAZA)</p>
              <textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Motivo del rechazo o notas internas..."
                style={{ width: '100%', background: '#0f1115', border: '1px solid #2a2e39', padding: '12px', borderRadius: '6px', color: '#fff', outline: 'none', minHeight: '80px', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
              <button 
                disabled={processing}
                onClick={() => handleReview('reject')}
                style={{ background: '#ff4d4f', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <X size={18} /> RECHAZAR
              </button>
              <button 
                disabled={processing}
                onClick={() => handleReview('approve')}
                style={{ background: '#00f2fe', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Check size={18} /> APROBAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
