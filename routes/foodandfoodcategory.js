// routes/food.js
const express = require('express');
const router = express.Router();
const Food = require('../models/food');
const Category = require('../models/foodcategory');

// Get all categories
router.get('/category', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
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
// Get a specific category
router.get('/category/:id', getCategory, (req, res) => {
    res.json(res.category);
});

// Create a category
router.post('/category', async (req, res) => {
    const category = new Category({
        category: req.body.category,
        description: req.body.description
    });
    try {
        const newCategory = await category.save();
        res.status(201).json(newCategory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a category
router.patch('/category/:id', getCategory, async (req, res) => {
    if (req.body.category != null) {
        res.category.category = req.body.category;
    }
    if (req.body.description != null) {
        res.category.description = req.body.description;
    }
    try {
        const updatedCategory = await res.category.save();
        res.json(updatedCategory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a category
router.delete('/category/:id', getCategory, async (req, res) => {
    try {
        await res.category.remove();
        res.json({ message: 'Category deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

async function getCategory(req, res, next) {
    try {
        const category = await Category.findById(req.params.id);
        if (category == null) {
            return res.status(404).json({ message: 'Cannot find category' });
        }
        res.category = category;
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    next();
}

// Get all foods
// In your backend API route for fetching foods
router.get('/foods', async (req, res) => {
    try {
        const foods = await Food.find();
        res.json(foods.map(food => ({
            _id: food._id,
            name: food.name,
            description: food.description,
            price: food.price,
            options: food.options,
            category: food.category,
            image: food.image,
            inStock: food.inStock // Include the inStock field
        })));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a specific food
router.get('/foods/:id', getFood, (req, res) => {
    res.json(res.food);
});

// Create a food
router.post('/foods', async (req, res) => {
    const food = new Food({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        options: req.body.options,
        category: req.body.category,
        image: req.body.image
    });
    try {
        const newFood = await food.save();
        res.status(201).json(newFood);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a food
router.patch('/foods/:id', getFood, async (req, res) => {
    if (req.body.name != null) {
        res.food.name = req.body.name;
    }
    if (req.body.description != null) {
        res.food.description = req.body.description;
    }
    if (req.body.price != null) {
        res.food.price = req.body.price;
    }
    if (req.body.options != null) {
        res.food.options = req.body.options;
    }
    if (req.body.category != null) {
        res.food.category = req.body.category;
    }
    if (req.body.image != null) {
        res.food.image = req.body.image;
    }
    try {
        const updatedFood = await res.food.save();
        res.json(updatedFood);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a food
router.delete('/foods/:id', getFood, async (req, res) => {
    try {
        await res.food.remove();
        res.json({ message: 'Food deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

async function getFood(req, res, next) {
    try {
        food = await Food.findById(req.params.id);
        if (food == null) {
            return res.status(404).json({ message: 'Cannot find food' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    res.food = food;
    next();
}
// In your backend API route for updating the stock status of a food item
// Set a food item as in stock
router.patch('/foods/:id/set-instock',  async (req, res) => {
    try {
        const food = await Food.findById(req.params.id);
        if (!food) {
            return res.status(404).json({ message: 'Food not found' });
        }
        food.inStock = true;
        await food.save();
        res.json(food);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Set a food item as out of stock
router.patch('/foods/:id/set-outofstock',  async (req, res) => {
    try {
        const food = await Food.findById(req.params.id);
        if (!food) {
            return res.status(404).json({ message: 'Food not found' });
        }
        food.inStock = false;
        await food.save();
        res.json(food);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;
