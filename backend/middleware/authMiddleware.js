const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) return res.status(401).send('Access denied');

  try {
    const decoded = jwt.verify(token.split(' ')[1], 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).send('Invalid token');
  }
};