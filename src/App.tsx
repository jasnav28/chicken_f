import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { RoleSwitcher } from './components/common/RoleSwitcher';
import { ShopLayout } from './components/shop/ShopLayout';
import { ConsumerLogin } from './components/shop/ConsumerLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLogin } from './components/admin/AdminLogin';

const AdminRouteWrapper: React.FC = () => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(true);

  if (!isAdminAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setIsAdminAuthenticated(true)} />;
  }

  return <AdminLayout />;
};

const MainRoutes: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-textPrimary">
      {/* Top Demo & URL Helper Switcher */}
      <RoleSwitcher />

      <div className="flex-1">
        <Routes>
          {/* Consumer Login Page (Matches the user's uploaded RestoPilot screenshot) */}
          <Route path="/login" element={<ConsumerLogin />} />

          {/* Admin Management (Direct access via /admin in URL) */}
          <Route path="/admin/*" element={<AdminRouteWrapper />} />
          <Route path="/admin" element={<AdminRouteWrapper />} />
          <Route path="/admin/login" element={<AdminLogin onLoginSuccess={() => {}} />} />

          {/* Consumer Shop Ordering App */}
          <Route path="/" element={<ShopLayout />} />

          {/* Fallback to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <MainRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
