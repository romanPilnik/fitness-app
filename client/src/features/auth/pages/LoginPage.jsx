// imports
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// component function
function LoginPage() {
  // context/hooks
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  // state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  // event handlers
  function handleEmailChange(e) {
    setEmail(e.target.value);
  }
  function handlePasswordChange(e) {
    setPassword(e.target.value);
  }
  async function handleSubmit(e) {
    e.preventDefault();

    setError(null);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    }
  }

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
}

export default LoginPage;
