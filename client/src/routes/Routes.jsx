import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import Login from '../features/auth/pages/LoginPage';
import Register from '../features/auth/pages/RegisterPage';
import Home from '../pages/HomePage';
import NotFound from '../pages/NotFoundPage';
import ProtectedRoute from '../components/common/ProtectedRoute';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import TemplatesPage from '../features/templates/pages/TemplatesPage';
import TemplateDetailsPage from '../features/templates/pages/TemplateDetailsPage';
import ProgramsPage from '../features/programs/pages/ProgramsPage';
import ProgramDetailPage from '../features/programs/pages/ProgramDetailPage';

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
          <Route path="/programs" element={<ProgramsPage />} />
          <Route path="/programs/:id" element={<ProgramDetailPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/templates/:id" element={<TemplateDetailsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
