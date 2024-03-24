// models/Order.js

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  Name: {
    type: String,
  },
  cartItems: [
    {
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      option: {
        name: String,
        price: Number,
      },
    },
  ],
  payment: {
    method: {
      type: String,
     
      enum: ['razorpay', 'stripe', 'paypal', 'other'], // Add more payment methods as needed
    },
    orderId: String,
    paymentId: String,
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed'],
      default: 'pending',
    },
  },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
