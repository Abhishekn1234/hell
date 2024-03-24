// AdminLoginForm.js

import React, { useState } from 'react';
import axios from 'axios';
import {useNavigate} from "react-router-dom";
const AdminLoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate=useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/admin/login', { email, password });
      if (response.data && response.data.token) {
        const token = response.data.token;
        localStorage.setItem('adminToken', token);
        
        navigate('/admin-dashboard');
         // Trigger callback to update login state in parent component
      } else {
        throw new Error('Invalid response format from the server');
      }
    } catch (error) {
      console.error('Login failed:', error.response?.data?.msg || error.message);
      setError('Invalid email or password');
    }
  };
  return (
    <div>
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        </div>
        <div>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        </div>
        <button type="submit">Login</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};

export default AdminLoginForm;
