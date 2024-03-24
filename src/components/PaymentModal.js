import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import axios from 'axios';

const PaymentModal = ({ totalPrice }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    });

    if (error) {
      setPaymentError(error.message);
      setPaymentSuccess(null);
    } else {
      setPaymentError(null);
      setPaymentSuccess('Payment successful!');

      // Send payment information to your backend
      await handlePaymentSuccess(paymentMethod.id);
    }
  };

  const handlePaymentSuccess = async (paymentMethodId) => {
    try {
      const response = await axios.post('http://localhost:5000/payment', {
        amount: totalPrice * 100, // Convert to paise (100 paise = 1 rupee)
        payment_method: paymentMethodId,
      });
      console.log(response.data);
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      {paymentError && <div>{paymentError}</div>}
      {paymentSuccess && <div>{paymentSuccess}</div>}
      <button type="submit" disabled={!stripe}>
        Pay ₹{totalPrice}
      </button>
    </form>
  );
};

export default PaymentModal;
