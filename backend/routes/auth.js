const express = require('express');
const pool = require('../db');
const router = express.Router();

// // Signup
// router.post('/signup', async (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
//   try {
//     const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
//     if (rows.length) return res.status(409).json({ message: 'Email already exists' });
//     await pool.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, password]);
//     res.status(201).json({ message: 'User created' });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  try {
    const [rows] = await pool.query('SELECT id, password FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ message: 'Invalid credentials' });
    const user = rows[0];
    if (password !== user.password) return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ message: 'Login successful', userId: user.id });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;