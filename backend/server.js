//backend/server.js
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt'; // For password hashing
import pool from './config/db.js'; // Reuse the DB pool
import jwt from 'jsonwebtoken'; // For better session management

dotenv.config();
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Utility to execute queries
async function query(sql, params) {
  const [results] = await pool.execute(sql, params);
  return results;
}

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit numeric OTP
}

// User registration
app.post('/users', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into the database
    const result = await query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );

    const userId = result.insertId;

    // Create an account for the user
    await query('INSERT INTO accounts (userId, balance) VALUES (?, ?)', [userId, 0]);

    res.status(201).json({ message: 'User created successfully!' });
  } catch (error) {
    console.error('Error creating user:', error.message);
    res.status(500).json({ error: 'An error occurred while creating the user.' });
  }
});

// User login and generate OTP
app.post('/sessions', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const [user] = await query('SELECT * FROM users WHERE username = ?', [username]);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const otp = generateOTP();

    // Save OTP with expiration time
    await query('INSERT INTO sessions (userId, token, expiresAt) VALUES (?, ?, NOW() + INTERVAL 5 MINUTE)', [
      user.id,
      otp,
    ]);

    res.status(200).json({ otp });
  } catch (error) {
    console.error('Error logging in:', error.message);
    res.status(500).json({ error: 'An error occurred during login.' });
  }
});

// Get account balance
app.post('/me/accounts', async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({ error: 'OTP is required.' });
  }

  try {
    const [session] = await query(
      'SELECT userId FROM sessions WHERE token = ? AND expiresAt > NOW()',
      [otp]
    );

    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired OTP.' });
    }

    const [account] = await query('SELECT balance FROM accounts WHERE userId = ?', [
      session.userId,
    ]);

    if (!account) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    res.status(200).json({ balance: account.balance });
  } catch (error) {
    console.error('Error fetching account balance:', error.message);
    res.status(500).json({ error: 'An error occurred while fetching the account balance.' });
  }
});

// Deposit money
app.post('/me/accounts/transactions', async (req, res) => {
  const { otp, amount } = req.body;

  if (!otp || amount === undefined || amount <= 0) {
    return res.status(400).json({ error: 'OTP and valid amount are required.' });
  }

  try {
    const [session] = await query(
      'SELECT userId FROM sessions WHERE token = ? AND expiresAt > NOW()',
      [otp]
    );

    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired OTP.' });
    }

    const [account] = await query('SELECT balance FROM accounts WHERE userId = ?', [
      session.userId,
    ]);

    if (!account) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    const newBalance = account.balance + amount;

    await query('UPDATE accounts SET balance = ? WHERE userId = ?', [
      newBalance,
      session.userId,
    ]);

    res.status(200).json({ balance: newBalance });
  } catch (error) {
    console.error('Error processing transaction:', error.message);
    res.status(500).json({ error: 'An error occurred while processing the transaction.' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
