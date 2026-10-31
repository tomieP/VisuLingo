import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Lazy load pages for better performance
const HomePage = lazy(() => import('@/pages/HomePage'));
const SavedWordsPage = lazy(() => import('@/pages/SavedWordsPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const AdminPage = lazy(() => import('@/pages/AdminPage'));

function App() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#0B0F17] text-white">Loading...</div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/saved" element={<SavedWordsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<SettingsPage />} />
        <Route path="/admin" element={<AdminPage />} />
        {/* 404 fallback */}
        <Route path="*" element={<div className="min-h-screen bg-[#0B0F17] text-white p-8 flex items-center justify-center">Page not found</div>} />
      </Routes>
    </Suspense>
  );
}

export default App;
