import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import Login from '../pages/LoginPage';
import Register from '../pages/RegisterPage';
import Home from '../pages/HomePage';
import NotFound from '../pages/NotFoundPage';
import ProtectedRoute from '../shared/ProtectedRoute';
import DashboardPage from '../pages/DashboardPage';

export default function AppRoutes() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/*<Route element={<AuthLayout />} />*/}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
      <Route path='dashboard' element={<DashboardPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
