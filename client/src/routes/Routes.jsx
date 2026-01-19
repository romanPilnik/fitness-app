import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import Login from '../pages/LoginPage';
import Register from '../pages/RegisterPage';
import Home from '../pages/HomePage';
import NotFound from '../pages/NotFoundPage';
import ProtectedRoute from '../shared/ProtectedRoute';
import DashboardPage from '../pages/DashboardPage';
import TemplatesPage from '../features/templates/pages/TemplatesPage';
import TemplateDetailsPage from '../features/templates/pages/TemplateDetailsPage';

export default function AppRoutes() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AuthenticatedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/settings" element={<div>Settings</div>} />
          <Route path="/programs" element={<div>Programs</div>} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/templates/:id" element={<TemplateDetailsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
