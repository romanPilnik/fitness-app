import { useState } from "react";
import {useAuth} from '../features/auth/context/AuthContext';

const RegisterPage = () => {
  const {register} = useAuth();

  const [email,setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword,setConfirmPassword] = useState('');
  const [username,setUsername] = useState('');
  const [error,setError] = useState(null);

  const handleEmailChange = (e) =>{
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) =>{
    setPassword(e.target.value);
    if(error) setError('');
  };

  const handleConfirmPasswordChange = (e) =>{
    setConfirmPassword(e.target.value);
    if(error) setError('');
  };

  const handleUsernameChange = (e) =>{
    setUsername(e.target.value);
  };

  const handleSubmit = async (e) =>{
    e.preventDefault();
    setError(null);

    if(password!==confirmPassword){
      setError('Passwords do not match');
    } else{
      try{
        await register(email,password,username);
      }catch(error){
        setError(error.message);
      }
    }
  };
  return (
    <div>
      {error && <div>{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
        type="email"
        onChange={handleEmailChange}
        value={email}
        placeholder="Email"
        required
        />

        <input
        type="text"
        onChange={handleUsernameChange}
        value={username}
        placeholder="Username"
        required
        />

        <input
        type="password"
        onChange={handlePasswordChange}
        value={password}
        placeholder="Password"
        required
        />

        <input
        type="password"
        onChange={handleConfirmPasswordChange}
        value={confirmPassword}
        placeholder="Confirm Password"
        required
        />

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegisterPage;