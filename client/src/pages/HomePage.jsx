import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';

function HomePage() {
  const { isLoading } = useAuth();

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      <nav>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>
    </div>
  );
}

export default HomePage;
