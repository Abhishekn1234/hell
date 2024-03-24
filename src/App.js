
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CustomNavbar from './components/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';

import Home from './components/Home';
import Orders from './components/Orders';
import Cart from './components/Cart';
import Login from './components/Login';
import Signup from './components/Signup';
import AdminLoginForm from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import UserActivity from "./components/admin/UserActivity";
import FoodList from './components/admin/FoodList';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminRegister from './components/admin/AdminRegister';
import { CartProvider } from './components/Contextreducer';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="App">
          <ToastContainer />
          <CustomNavbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin-login" element={<AdminLoginForm />} />
            <Route path="/admin-register" element={<AdminRegister />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/user-activity" element={<UserActivity />} />
            <Route path="/food-list" element={<FoodList />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
