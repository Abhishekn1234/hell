// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Order = require('../models/Order');
const multer = require('multer');

// Define storage for the images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
  }
});

// Filter files by type
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Set up multer with storage and file filter
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB max file size
  },
  fileFilter: fileFilter
});

// Signup route
router.post('/signup', async (req, res) => {
  const { email, password,name } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({ email, password,name });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const payload = { user: { id: user.id } };
    jwt.sign(payload, 'jwtSecret', { expiresIn: 3600 }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
router.get('/user-profile', async (req, res) => {
  try {
    const token = req.header('Authorization').split(' ')[1]; // Get token from headers
    const decoded = jwt.verify(token, 'jwtSecret'); // Verify token
    const userId = decoded.user.id; // Extract user ID from token
    
    // Fetch user profile data
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const ordersCount = await Order.countDocuments({ email: user.email }); // Count user's orders
    res.json({ user, ordersCount }); // Return user profile data with orders count
  } catch (error) {
    console.error('Error fetching user profile:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});
// Login route
router.post('/login', async (req, res) => {
  const { email, password,name } = req.body;

  try {
    let user = await User.findOne({ email,name});
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const payload = { user: { id: user.id } };
    jwt.sign(payload, 'jwtSecret',  (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add to favorites route
router.post('/add-to-favorites',  async (req, res) => {
  try {
    const userId = req.user._id;
    const foodId = req.body.foodId;

    // Check if the food item is already in favorites
    const user = await User.findById(userId);
    if (user.favorites.includes(foodId)) {
      return res.status(400).json({ message: 'Food item is already in favorites' });
    }

    // Add the food item to favorites
    user.favorites.push(foodId);
    await user.save();

    res.json({ message: 'Food item added to favorites successfully' });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Remove from favorites route
router.post('/remove-from-favorites',  async (req, res) => {
  try {
    const userId = req.user._id;
    const foodId = req.body.foodId;

    // Remove the food item from favorites
    const user = await User.findById(userId);
    user.favorites = user.favorites.filter(favorite => favorite.toString() !== foodId);
    await user.save();

    res.json({ message: 'Food item removed from favorites successfully' });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get favorites route
router.get('/favorites', async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Retrieve the user's favorites by their ID
    const user = await User.findById(userId).populate('favorites');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send the user's favorites as the response
    res.json(user.favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Remove from favorites by food ID route
router.delete('/remove-from-favorites/:foodId', async (req, res) => {
  try {
    const userId = req.user._id; // Change from req.user.id to req.user._id
    const foodId = req.params.foodId;

    // Remove the food item from favorites
    const user = await User.findById(userId);
    user.favorites = user.favorites.filter(favorite => favorite.toString() !== foodId);
    await user.save();

    res.json({ message: 'Food item removed from favorites successfully' });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;
