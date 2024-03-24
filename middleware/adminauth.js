// Middleware to verify if user is an admin
const User=require("../models/user");
const isAdmin = async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user.isAdmin) {
        return res.status(403).json({ msg: 'Not authorized as an admin' });
      }
      next();
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  };
  
  module.exports = { isAdmin };
  