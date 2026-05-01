const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ✅ REAL SIGNUP
router.post('/signup', async (req, res) => {
  const user = await User.create(req.body);
  res.json(user);
});

// ✅ REAL LOGIN
router.post('/login', async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
    password: req.body.password
  });

  if (!user) return res.status(400).send("Invalid credentials");

  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    'secret'
  );

  res.json({ token });
});

module.exports = router;