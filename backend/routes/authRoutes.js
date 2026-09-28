const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_dev';

// In-memory user store (replace with your MongoDB/PostgreSQL model if needed)
const users = [];

// Register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: Date.now().toString(), username, email, password: hashedPassword };
  users.push(newUser);

  const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '1d' });
  return res.status(201).json({ message: 'User registered successfully', token, user: { username, email } });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
  return res.json({ message: 'Login successful', token, user: { username: user.username, email: user.email } });
});

module.exports = router;