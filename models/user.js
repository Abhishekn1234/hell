// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  MobileNumber:{type:String},
  name:{type:String},
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Food' }],
  orderCount: { type: Number, default: 0 },
  
});


const User = mongoose.model('User', userSchema);

module.exports = User;
