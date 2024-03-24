// Import necessary modules and models
const express = require("express");
const mongoose = require('mongoose');
const foods = require("./food.json");
const categories = require("./foodcategory.json");
const Food = require("./models/food");
const Category = require("./models/foodcategory");
const foodCategoryRoute=require('./routes/foodandfoodcategory');


const app = express();

app.use(express.json());
const cors = require("cors");
const userRoute=require("./routes/user");
const orderRoute=require("./routes/Order")
const adminroute=require("./routes/admin");
app.use(cors());
app.use("",userRoute);
app.use("",foodCategoryRoute);
app.use("",orderRoute);
app.use("",adminroute);
mongoose.connect("mongodb://localhost:27017/foodsrage", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');

    // Check if food data exists
    const existingFood = await Food.find();
    if (existingFood.length === 0) {
      // Insert food data
      await Food.insertMany(foods);
      console.log('Food data inserted successfully');
    } else {
      // Check if there are any variations in the JSON data
      const isVariation = foods.some(newFood => {
        return !existingFood.some(existing => existing.name === newFood.name);
      });

      if (isVariation) {
        // Clear existing data and insert new food data
        await Food.deleteMany();
        await Food.insertMany(foods);
        console.log('Food data updated successfully');
      } else {
        console.log('Food data already exists and is up to date');
      }
    }

    // Check if category data exists
    const existingCategories = await Category.findOne();
    if (!existingCategories) {
      // Insert category data
      await Category.insertMany(categories);
      console.log('Category data inserted successfully');
    } else {
      console.log('Category data already exists');
    }
  })
  .catch(err => console.error('Error connecting to MongoDB:', err));

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
