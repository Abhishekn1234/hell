// Cart.js
import React, { useEffect, useState } from 'react';
import { Table, Button } from 'react-bootstrap';
import axios from 'axios';
import { useCart, useDispatchCart } from './Contextreducer';
import { useNavigate,Link } from 'react-router-dom';

export default function Cart() {
  const cart = useCart();
  const dispatch = useDispatchCart();
  const [totalPrice, setTotalPrice] = useState(0);
  const userEmail = localStorage.getItem('userEmail');
  const Name = localStorage.getItem('Name');
  const navigate = useNavigate();

  // Load cart data from localStorage on component mount
  // Load cart data from localStorage on component mount
useEffect(() => {
  const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
  dispatch({ type: 'SET_CART', payload: storedCart });
}, [dispatch]);

// Update localStorage whenever cart changes
useEffect(() => {
  localStorage.setItem('cart', JSON.stringify(cart));
}, [cart]);

  

  // Update total price when cart changes
  useEffect(() => {
    let totalPrice = 0;
    if (cart) {
      totalPrice = cart.reduce((acc, item) => {
        const itemPrice = item.option ? item.option.price : item.price; // Consider option price if it exists
        return acc + itemPrice * item.quantity;
      }, 0);
    }
    setTotalPrice(totalPrice);
  }, [cart]);

  
  const handleRemoveItem = (index) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: index });
  };

  const handleCheckout = async () => {
    try {
      if (!userEmail || !Name) {
        console.error('User email or name not found in localStorage');
        return;
      }
      const response = await axios.post('http://localhost:5000/orders', { email: userEmail, cartItems: cart, Name: Name });
      console.log('Checkout response:', response.data);
      dispatch({ type: 'CLEAR_CART' });
      alert('Checkout successful!');
      // Redirect to myorders page after successful checkout
      navigate('/orders');
    } catch (error) {
      console.error('Checkout error:', error.message);
      alert('Checkout failed. Please try again later.');
    }
  };

  return (
    <div className="cart-container">
      <h1>Cart</h1>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {cart && cart.map((item, index) => (
            <tr key={index}>
              <td>{item.name} {item.option && `(${item.option.name})`}</td>
              <td>${item.option ? item.option.price : item.price}</td>
              <td>{item.quantity}</td>
              <td>
                <Button variant="danger" onClick={() => handleRemoveItem(index)}>Remove</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {cart.length > 0 ? (
        <div className="checkout-container">
          <h2>Total Price: ${totalPrice}</h2>
          <Button variant="primary" onClick={handleCheckout}>Checkout</Button>
        </div>
      ) : (
        <div className="empty-cart-container">
          <h2>Your cart is empty</h2>
          <Button variant="info" onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      )}
      

    </div>
     
  );
}