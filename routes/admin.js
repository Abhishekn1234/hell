const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Food = require('../models/food');
const multer = require("multer");

const { isAdmin } = require('../middleware/adminauth');
const Order=require("../models/Order");
// Admin Login Route
router.post('/admin/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      let user = await User.findOne({ email });
      console.log(user);
      if (!user) return res.status(401).json({ msg: 'Invalid Credentials' });
  
      const isMatch = await bcrypt.compare(password, user.password);
      console.log(isMatch);
      if (!isMatch) return res.status(401).json({ msg: 'Invalid Credentials' });
  
      // Check if the user is an admin and set isAdmin to true
      if (user.isAdmin) {
        const payload = { admin: { id: user.id } };
        console.log(payload);
        jwt.sign(payload, 'adminJwtSecret', (err, token) => {
          if (err) throw err;
          res.json({ token });
        });
      } else {
        // If the user is not an admin, proceed with regular user login
        const payload = { user: { id: user.id } };
        jwt.sign(payload, 'jwtSecret', { expiresIn: 3600 }, (err, token) => {
          if (err) throw err;
          res.json({ token });
        });
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
  
  
  router.post('/admin/register', async (req, res) => {
    const { email, password, name,MobileNumber } = req.body;
  
    try {
      let admin = await User.findOne({ email });
      if (admin) return res.status(400).json({ msg: 'Admin already exists' });
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      admin = new User({ email, password: hashedPassword, name,MobileNumber, isAdmin: true }); // Set isAdmin to true
      await admin.save();
  
      res.json({ msg: 'Admin registered successfully' });
      await sendSMSToAdmin(MobileNumber, `New admin registered: ${name}`);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
  router.post('/payment/successes', async (req, res) => {
    try {
      const { orderId, amount, currency, userEmail } = req.body;
  
      // Save payment details to your database
      const newPayment = new Order({
        orderId,
        amount,
        currency,
        status: 'success',
      });
      await newPayment.save();
  
      // Send SMS notification to admin
      const message = `Payment of ${amount} ${currency} received for order ${orderId}`;
      const adminPhoneNumber = '+916238519397'; // Replace with the admin's phone number
      await sendSMSToAdmin(adminPhoneNumber, message);
  
      // Update user's order count
      await User.findOneAndUpdate(
        { email: userEmail },
        { $inc: { orderCount: 1 } },
        { new: true }
      );
  
      res.status(200).json({ message: 'Payment successful' });
    } catch (error) {
      console.error('Error processing payment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  async function sendSMSToAdmin(phoneNumber, message) {
    try {
      await axios.post('http://localhost:5000/send-sms', { phoneNumber, message });
      console.log('SMS notification sent to admin successfully');
    } catch (error) {
      console.error('Error sending SMS notification to admin:', error);
    }
  }
// Middleware to verify admin JWT token
// Middleware to verify admin JWT token
const verifyAdminToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ msg: 'No token, authorization denied' });
  
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ msg: 'No token found in authorization header' });
  
    try {
      const decoded = jwt.verify(token, 'adminJwtSecret');
      req.admin = decoded.admin;
      next();
    } catch (err) {
      res.status(401).json({ msg: 'Token is not valid' });
    }
  };
  
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/"); // Save uploaded files to the "uploads" directory
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + "-" + file.originalname); // Use unique filenames
    },
  });
  
  const upload = multer({ storage: storage });
  
// Add Food Route
router.post('/foods/add', verifyAdminToken, async (req, res) => {
  try {
    const { name, price, image, options,category } = req.body;
    const food = new Food({ name, price, image, options,category });
    await food.save();
    res.json({ message: 'Food added successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete Food Route
// Delete Food Route
router.delete("/foods/:foodId/delete", verifyAdminToken, async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.foodId);
    if (!food) return res.status(404).json({ message: "Food not found" });
   
    res.json({ message: "Food deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


// Update Food Route
// Update Food Route
router.put('/foods/:foodId/update', verifyAdminToken, async (req, res) => {
  try {
    const { name, price, image, options,category } = req.body;
    let food = await Food.findById(req.params.foodId);
    if (!food) return res.status(404).json({ message: 'Food not found' });

    food.name = name;
    food.price = price;
    food.image = image;
    food.options = options; // Assuming options is an array of objects with properties like name and price
   food.category=category;
    await food.save();
    res.json({ message: 'Food updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// Get Orders Route
router.get('/orders', verifyAdminToken, async (req, res) => {
  try {
    const orders = await Order.find().populate('user', ['name', 'email']);
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
