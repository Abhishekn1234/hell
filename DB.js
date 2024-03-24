const mongoose = require("mongoose");
const foods = require("./food.json");
const categories = require("./foodcategory.json");
const Food = require("../models/food");
const Category = require("../models/foodcategory");

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/foodsrage', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');

    // Insert food data
    Food.insertMany(foods)
      .then(() => console.log('Food data inserted successfully'))
      .catch(err => console.error('Error inserting food data:', err));

    // Insert category data
    Category.insertMany(categories)
      .then(() => console.log('Category data inserted successfully'))
      .catch(err => console.error('Error inserting category data:', err));
  })
  .catch(err => console.error('Error connecting to MongoDB:', err));
