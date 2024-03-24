const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    category: String,
    description: String
  });
  
  const Category = mongoose.model('Category', categorySchema);

  module.exports=Category