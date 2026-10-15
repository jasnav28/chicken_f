import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
  const [consumerAuth, setConsumerAuth] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('ckl_authenticated_shop_id'));
  });

  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isLoginPage = location.pathname === '/login' || (!consumerAuth && !isAdminRoute);

  return (
    <div className="min-h-screen flex flex-col bg-background text-textPrimary">
      {/* Top Demo Switcher: Hidden on login screen, visible when authenticated or in Admin */}
      {!isLoginPage && <RoleSwitcher />}

      <div className="flex-1 flex flex-col">
        <Routes>
          {/* Consumer Login Page (Starts here for unauthenticated visitors) */}
          <Route
            path="/login"
            element={
              <ConsumerLogin
                onLoginSuccess={() => {
                  setConsumerAuth(true);
                }}
              />
            }
          />

          {/* Admin Management (Direct access via /admin in URL) */}
          <Route path="/admin/*" element={<AdminRouteWrapper />} />
          <Route path="/admin" element={<AdminRouteWrapper />} />
          <Route path="/admin/login" element={<AdminLogin onLoginSuccess={() => {}} />} />

          {/* Consumer Shop Ordering App */}
          <Route
            path="/"
            element={
              consumerAuth ? (
                <ShopLayout
                  onLogout={() => {
                    localStorage.removeItem('ckl_authenticated_shop_id');
                    setConsumerAuth(false);
                  }}
                />
              ) : (
                <ConsumerLogin
                  onLoginSuccess={() => {
                    setConsumerAuth(true);
                  }}
                />
              )
            }
          />

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
