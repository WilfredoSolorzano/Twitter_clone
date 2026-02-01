import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PrivateRoute from '../components/common/PrivateRoute';
import Layout from './Layout';

// Componentes públicos
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';

// Lazy loading para componentes privados (melhor performance)
const Home = lazy(() => import('./Home'));
const Explore = lazy(() => import('./Explore'));
const ProfilePage = lazy(() => import('./ProfilePage'));
const Notifications = lazy(() => import('./Notifications'));
const Messages = lazy(() => import('./Messages'));
const Bookmarks = lazy(() => import('./Bookmarks'));
const More = lazy(() => import('./More'));

// Componente de loading reutilizável
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-twitter-blue"></div>
  </div>
);

// Rotas públicas
const PublicRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="*" element={<Navigate to="/login" />} />
  </Routes>
);

// Rotas protegidas com lazy loading
const ProtectedRoutes = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/explore" element={<PrivateRoute><Explore /></PrivateRoute>} />
      <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
      <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
      <Route path="/bookmarks" element={<PrivateRoute><Bookmarks /></PrivateRoute>} />
      <Route path="/more" element={<PrivateRoute><More /></PrivateRoute>} />
      <Route path="/profile/:username" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  </Suspense>
);

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <PublicRoutes />;
  }

  return (
    <Layout>
      <ProtectedRoutes />
    </Layout>
  );
};

export default AppContent;