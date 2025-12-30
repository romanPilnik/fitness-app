import { Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const { name } = user;
  return (
    <div>
      <h1>Welcome {name}</h1>
      <Outlet />
    </div>
  );
}
