

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/user');
const Razorpay = require('razorpay');
const twilio = require('twilio');



const razorpay = new Razorpay({
  key_id: 'rzp_live_dDHVgHh9Ks59E7', 
  key_secret: '68UVusLaUan57LPSrAoGNHCH', 
});
const client = new twilio('AC10ed20dae4ea30f63276d2da75666f02', '063844d7db64fb8db1248087e4156353');
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().populate('payment');
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

async function sendSMS(phoneNumber, message) {
  try {
    await client.messages.create({
      body: message,
      to: '+916238519397',
      from: '+13132283991'
    });
    console.log('SMS notification sent successfully');
  } catch (error) {
    console.error('Error sending SMS notification:', error);
  }
}
router.get('/success', async (req, res) => {
  try {
    const { orderId, paymentId } = req.query;

   
    await Order.updateOne(
      { _id: orderId },
      { $set: { paymentStatus: 'paid', paymentId } }
    );

   
    const user = await User.findOne({ _id: userId });
    const message = `Your order with ID ${orderId} has been paid successfully.`;
    sendNotification(user.email, message);

    res.send('Payment successful');
  } catch (error) {
    console.error('Error handling successful payment:', error);
    res.status(500).send('Internal server error');
  }
});
router.get('/cancel', (req, res) => {
  res.send('Payment cancelled');
});

router.get('/razorpay/key', async (req, res) => {
  try {
   
    const razorpayKey = "rzp_live_dDHVgHh9Ks59E7";

    
    res.status(200).json({ key: razorpayKey });
  } catch (error) {
    console.error('Error fetching Razorpay key:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



router.post('/send-sms', (req, res) => {
  const { phoneNumber, message } = req.body;

  client.messages.create({
    body: message,
    to: phoneNumber,  // Phone number to send SMS to
    from: '+13132283991'  // Your Twilio phone number
  })
  .then(() => {
    console.log('SMS notification sent successfully');
    res.status(200).json({ success: true, message: 'SMS notification sent successfully' });
  })
  .catch((error) => {
    console.error('Error sending SMS notification:', error);
    res.status(500).json({ success: false, message: 'Failed to send SMS notification' });
  });
});


router.post('/track-amount', (req, res) => {
  const { amount } = req.body;

 
  console.log('Debited amount tracked:', amount);
  res.status(200).json({ success: true, message: 'Debited amount tracked successfully' });
});
router.post('/payment/success', async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, userEmail, userName } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !userEmail || !userName) {
      return res.status(400).json({ error: 'Missing required fields in request body' });
    }

    // Verify the payment using Razorpay API
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (payment && payment.status === 'captured') {
      // Payment is successful, save payment details to your database
      const newOrder = new Order({
        email: userEmail,
        Name: userName,
        cartItems: [], // Add your cart items here if necessary
        payment: {
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          status: 'succeeded', // Assuming payment is successful
          method: 'razorpay', // Payment method used
          // Add any other payment details you want to save
        },
        // Add any other fields of the order
      });
      await newOrder.save();

      // Update user's order count
      await User.findOneAndUpdate(
        { email: userEmail },
        { $inc: { orderCount: 1 } },
        { new: true }
      );

      res.status(200).json({ message: 'Payment successful' });
    } else {
      // Payment failed or not captured, handle accordingly
      res.status(400).json({ error: 'Payment failed or not captured' });
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.post('/payment/razorpay', async (req, res) => {
  const { amount, currency, userEmail, userName, cartItems } = req.body;

  try {
    
    const options = {
      amount: amount, 
      currency: currency,
      receipt: 'receipt_' + Math.random().toString(36).substring(7), 
      payment_capture: 1, 
    };

    const response = await razorpay.orders.create(options);
    const orderId = response.id;

   
    const newOrder = new Order({
      email: userEmail,
      Name: userName,
      cartItems: cartItems, // Add cartItems received from the request
      payment: {
        razorpayOrderId: orderId,
        status: 'succeeded',
        method: 'razorpay', 
      },
     
    });
    await newOrder.save();

   
    const message = `Payment of ${amount} ${currency} is successfully for ${userName} (${userEmail}).`;
    await sendSMS("+916238519397", message); // Replace with recipient phone number
   
    res.status(200).json({ message: 'Payment successfull', orderId, razorpayDetails: response });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Payment failed' });
  }
});




// For PayPal
router.post('/paypal/payment', async (req, res) => {
  const { amount } = req.body;

  try {
    // Create a PayPal order
    const paypalOrder = await paypal.orders.create({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'INR',
          value: amount,
        },
      }],
    });

    // Extract approval URL from the PayPal order
    const approvalUrl = paypalOrder.links.find(link => link.rel === 'approve').href;

    res.status(200).json({ paymentLink: approvalUrl });
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    res.status(500).json({ error: 'Failed to create PayPal order' });
  }
});

// POST route for processing payments
router.post('/payment', async (req, res) => {
  const { amount, payment_method } = req.body;

  try {
    if (payment_method === 'razorpay') {
      // Create Razorpay order
      const options = {
        amount: amount , // Razorpay amount is in paisa
        currency: 'INR',
      };
      const response = await razorpay.orders.create(options);
      const orderId = response.id;
      
      // Return the order ID for Razorpay payment
      res.status(200).json({ message: 'Payment successful', orderId });
    } else {
      // Handle other payment methods
      // Add your logic here for other payment methods
      res.status(400).json({ error: 'Unsupported payment method' });
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Payment failed' });
  }
});

router.get('/orderss', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/orders/:orderId', async (req, res) => {
  try {
    const orderId = req.params.orderId;
    await Order.findByIdAndDelete(orderId);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/orders', async (req, res) => {
  try {
    const { email, cartItems, Name } = req.body;
    const order = new Order({
      email,
      cartItems,
      Name,
    });
    await order.save();
    await User.findOneAndUpdate(
      { email },
      { $inc: { orderCount: 1 } },
      { new: true }
    );
    res.status(200).json({ message: 'Checkout successful' });
  } catch (error) {
    console.error('Checkout error:', error.message);
    res.status(500).json({ message: 'Checkout failed. Please try again later.' });
  }
});
router.get('/checkout/:orderId', async (req, res) => {
  const orderId = req.params.orderId;
  // Here you can implement logic to retrieve order details based on the orderId
  // Then render a checkout page or perform any other actions related to checkout
  
  // For example, you can send a response with the order ID
  res.send(`Checkout page for order ID: ${orderId}`);
});

module.exports = router;
