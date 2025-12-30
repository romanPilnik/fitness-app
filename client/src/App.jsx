import { AuthProvider } from './features/auth/context/AuthContext';
import AppRoutes from './routes/Routes';

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
