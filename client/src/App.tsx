import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState } from 'react';
import { getCurrentUser } from '@/services/authService';
import { fetchServerTime } from '@/utils/authoritativeTime';
import { syncStreakWithServer } from '@/utils/storage';

// Lazy load pages for better performance
const HomePage = lazy(() => import('@/pages/HomePage'));
const SavedWordsPage = lazy(() => import('@/pages/SavedWordsPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const ExplorePage = lazy(() => import('@/pages/ExplorePage'));
const AdminPage = lazy(() => import('@/pages/AdminPage'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    const handleAuthChange = () => setUser(getCurrentUser());
    window.addEventListener('visulingo_auth_changed', handleAuthChange);
    return () => window.removeEventListener('visulingo_auth_changed', handleAuthChange);
  }, []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function PublicAuthRoute({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    const handleAuthChange = () => setUser(getCurrentUser());
    window.addEventListener('visulingo_auth_changed', handleAuthChange);
    return () => window.removeEventListener('visulingo_auth_changed', handleAuthChange);
  }, []);

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;
  }
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    const handleAuthChange = () => setUser(getCurrentUser());
    window.addEventListener('visulingo_auth_changed', handleAuthChange);
    return () => window.removeEventListener('visulingo_auth_changed', handleAuthChange);
  }, []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function App() {
  useEffect(() => {
    // Initial NTP server time calibration & streak sync
    fetchServerTime().catch(() => {});
    syncStreakWithServer().catch(() => {});

    // Listen for anti-cheat tampering events
    const handleTamper = () => {
      console.warn('[Anti-Cheat Alert] Phát hiện thay đổi giờ bất thường trên thiết bị!');
    };
    window.addEventListener('visulingo_clock_tampered', handleTamper);
    return () => window.removeEventListener('visulingo_clock_tampered', handleTamper);
  }, []);

  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#0B0F17] text-white font-medium">Loading...</div>}>
      <Routes>
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/saved" element={<ProtectedRoute><SavedWordsPage /></ProtectedRoute>} />
        <Route path="/explore" element={<ProtectedRoute><ExplorePage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

        <Route path="/login" element={<PublicAuthRoute><LoginPage /></PublicAuthRoute>} />
        <Route path="/register" element={<PublicAuthRoute><RegisterPage /></PublicAuthRoute>} />

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
