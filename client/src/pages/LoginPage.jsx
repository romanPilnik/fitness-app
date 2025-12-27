// imports
import { useAuth } from '../features/auth/context/AuthContext';
import { useState, useEffect } from 'react';

// component function
const LoginPage = () => {
  // context/hooks
  const { login, isAuthenticated } = useAuth();

  // state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  // event handlers
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);
    try {
      await login(email, password);
    } catch (error) {
      setError(error.message);
    }
  };

  // effects
  useEffect(() => {
    if (isAuthenticated) {
      console.log('user authenticated already');
    }
  }, [isAuthenticated]);

  // return/jsx
  return (
    <div>
      {/*Conditional error display*/}
      {error && <div> {error} </div>}

      <form onSubmit={handleSubmit}>
        <input type="email" value={email} onChange={handleEmailChange} placeholder="" />
        <input type="password" value={password} onChange={handlePasswordChange} placeholder="" />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
