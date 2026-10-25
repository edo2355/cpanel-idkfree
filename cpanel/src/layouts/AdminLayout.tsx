import { Outlet, Link, useLocation } from 'react-router-dom';
import { FileCheck, KeyRound } from 'lucide-react';
import { LayoutDashboard, Users, MessageSquare, LogOut, Shield, AlertTriangle, Activity, Globe } from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();

  const menuItems = [
    { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/users', name: 'Usuarios', icon: <Users size={20} /> },
    { path: '/support', name: 'Soporte Humano', icon: <MessageSquare size={20} /> },
    { path: '/reports', name: 'Moderación', icon: <AlertTriangle size={20} /> },
    { path: '/audit', name: 'Auditoría', icon: <Activity size={20} /> },
    { path: '/telemetry', name: 'Telemetría Global', icon: <Globe size={20} /> },
    { path: '/kyc', name: 'Revisión KYC', icon: <FileCheck size={20} /> },
    { path: '/settings', name: 'Seguridad', icon: <KeyRound size={20} /> },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f1115', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* SIDEBAR */}
      <aside style={{ width: '260px', background: '#181b21', borderRight: '1px solid #2a2e39', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #2a2e39' }}>
          <Shield color="#00f2fe" size={28} />
          <h2 style={{ margin: 0, fontSize: '20px', letterSpacing: '1px' }}>IDK CPANEL</h2>
        </div>

        <nav style={{ flex: 1, padding: '20px 10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                borderRadius: '8px', textDecoration: 'none',
                color: location.pathname === item.path ? '#000' : '#a0a5b1',
                background: location.pathname === item.path ? '#00f2fe' : 'transparent',
                fontWeight: location.pathname === item.path ? '600' : 'normal',
                transition: 'all 0.2s'
              }}
            >
              {item.icon} {item.name}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '20px', borderTop: '1px solid #2a2e39' }}>
          <button 
            onClick={() => { localStorage.removeItem('@idk_cpanel_token'); window.location.href = '/login'; }}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'transparent', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontSize: '16px' }}
          >
            <LogOut size={20} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ padding: '20px 30px', borderBottom: '1px solid #2a2e39', background: '#181b21' }}>
          <h3 style={{ margin: 0, fontWeight: '500' }}>Panel de Administración</h3>
        </header>
        <div style={{ padding: '30px', overflowY: 'auto', flex: 1 }}>
          <Outlet /> {/* Aquí se renderizarán las páginas */}
        </div>
      </main>
    </div>
  );
}
