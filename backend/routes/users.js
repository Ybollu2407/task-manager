const express = require('express');
const router = express.Router();

const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

// GET all users (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).send("Only admin allowed");
    }

    const users = await User.find().select("email role");
    res.json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;