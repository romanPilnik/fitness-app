import { AuthProvider } from './features/auth/context/AuthContext';
//import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <AuthProvider>
      <RegisterPage />
    </AuthProvider>
  );
}

export default App;
