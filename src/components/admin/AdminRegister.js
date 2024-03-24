import React, { useState } from 'react';
import axios from 'axios';
import {useNavigate} from "react-router-dom"
const AdminRegister = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [MobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState('');
 const navigate=useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/admin/register', { email, password, name });
      console.log(response.data); 
      localStorage.setItem('Mobile',MobileNumber);
      alert(response.data);
      navigate('/admin-login')// You can handle success response here
    } catch (error) {
      console.error('Registration failed:', error.response.data.msg);
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div>
      <h2>Admin Registration</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
        </div>
        <div>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        </div>
        <div>
          <input
            type="text"
            value={MobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            placeholder="Mobile Number"
            required
          />
        </div>
        <button type="submit">Register</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};

export default AdminRegister;
