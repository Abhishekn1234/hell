import React, { useState, useEffect } from 'react';
import { Navbar, Container, Nav, NavLink, NavbarToggle, NavbarCollapse } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';

const CustomNavbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserLoggedInStatus = () => {
      const userToken = localStorage.getItem('token');
      setIsLoggedIn(!!userToken);
    };

    const checkAdminLoggedInStatus = () => {
      const adminToken = localStorage.getItem('adminToken');
      setIsAdminLoggedIn(!!adminToken);
    };

    checkUserLoggedInStatus();
    checkAdminLoggedInStatus();
    setLoading(false); // Set loading to false once authentication status is checked
  }, []);

  const handleUserLogout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('Name');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    toast.success('User logout successful!');
    navigate('/login');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdminLoggedIn(false);
    toast.success('Admin logout successful!');
    navigate('/admin-login');
  };

  if (loading) return null; // Return null while loading

  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">Food Rage</Navbar.Brand>
        <NavbarToggle aria-controls="basic-navbar-nav" />
        <NavbarCollapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {isLoggedIn && !isAdminLoggedIn && (
              <>
                <NavLink as={Link} to="/orders">My Orders</NavLink>
                <NavLink as={Link} to="/cart">Cart</NavLink>
                <NavLink onClick={handleUserLogout}>Logout</NavLink>
              </>
            )}
            {isAdminLoggedIn && (
              <>
                <NavLink as={Link} to="/admin-dashboard">Admin Dashboard</NavLink>
                <NavLink as={Link} to="/food-list">Food List</NavLink>
                <NavLink as={Link} to="/user-activity">User Activity</NavLink>
                <NavLink onClick={handleAdminLogout}>Logout</NavLink>
              </>
            )}
            {!isLoggedIn && !isAdminLoggedIn && (
              <>
                <NavLink as={Link} to="/login">User Login</NavLink>
                <NavLink as={Link} to="/admin-login">Admin Login</NavLink>
              </>
            )}
          </Nav>
        </NavbarCollapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;
