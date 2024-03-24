// Login.js
import React, { useState } from 'react';
import axios from 'axios';
import {useNavigate} from "react-router-dom";
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const[name,setName]=useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', { email, password,name });
      const { token } = response.data;
      const loggedInEmail = email; // Capture the logged-in email
      const Name=name;
      // Save token and email to local storage upon successful login
      localStorage.setItem('token', token);
      localStorage.setItem('userEmail', loggedInEmail);
      localStorage.setItem('Name',Name);
      alert('Login successful!');
      navigate('/');
    } catch (error) {
      console.error('Login error:', error.message);
      alert('Login failed. Please try again later.');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <input type="name" placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
