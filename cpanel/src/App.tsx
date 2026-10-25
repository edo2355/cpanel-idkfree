import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Reports from './pages/Reports';
import Audit from './pages/Audit';
import Telemetry from './pages/Telemetry';
import Support from './pages/Support';
import KYCPage from './pages/KYCPage';
import SettingsPage from './pages/SettingsPage';
import Login from './pages/Login';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('@idk_cpanel_token'));

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta de Login */}
        <Route path="/login" element={token ? <Navigate to="/" /> : <Login setToken={setToken} />} />

        {/* Rutas Protegidas */}
        <Route path="/" element={token ? <AdminLayout /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="reports" element={<Reports />} />
          <Route path="audit" element={<Audit />} />
          <Route path="telemetry" element={<Telemetry />} />
          <Route path="support" element={<Support />} />
                <Route path="kyc" element={<KYCPage />} />
                <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
