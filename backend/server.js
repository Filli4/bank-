//backend/server.js
import express from 'express';

import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt'; 
import pool from './config/db.js';
import jwt from 'jsonwebtoken'; 

dotenv.config();
const app = express();
const port = process.env.PORT || 3001;


app.use(cors({ origin: 'http://localhost:3000',credentials: true, }));
app.use(express.json()); 



async function query(sql, params) {
  const [results] = await pool.execute(sql, params);
  return results;
}

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); 
}


// User registration
app.post('/users', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    
    const [existingUser] = await query('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken.' });
    }

    
    const hashedPassword = await bcrypt.hash(password, 12);

   
    const result = await query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);

    
    const userId = result.insertId;

   
    await query('INSERT INTO accounts (userId, balance, name) VALUES (?, ?, ?)', [
      userId,
      0, 
      `Account-${userId}`, 
    ]);

    res.status(201).json({ message: 'User created successfully!' });
  } catch (error) {
    console.error('Error during user creation:', error);
    res.status(500).json({ error: 'An error occurred during registration.' });
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

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

   
    const otp = generateOTP();

    
    await query('INSERT INTO sessions (userId, token, expiresAt) VALUES (?, ?, NOW() + INTERVAL 5 MINUTE)', [
      user.id,
      otp,
    ]);

    
    const [account] = await query('SELECT * FROM accounts WHERE userId = ?', [user.id]);

   
    if (account.length === 0) {
      await query('INSERT INTO accounts (userId, balance, name) VALUES (?, ?, ?)', [
        user.id,
        0, 
        `Account-${user.id}`,
      ]);
    }

    res.status(200).json({ otp });

  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ error: 'An error occurred during login.' });
  }
});



// Get account balance
app.get('/accounts/transactions', async (req, res) => {
  const otp = req.headers['authorization']?.split(' ')[1];
  if (!otp) return res.status(400).json({ error: 'OTP is required.' });

  try {
    const [session] = await pool.query(
      'SELECT userId FROM sessions WHERE token = ? AND expiresAt > NOW()',
      [otp]
    );
    if (!session.length) return res.status(401).json({ error: 'Invalid or expired OTP.' });

    const [account] = await pool.query(
      'SELECT balance FROM accounts WHERE userId = ?',
      [session[0].userId]
    );
    if (!account.length) return res.status(404).json({ error: 'Account not found.' });

    res.json({ balance: account[0].balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Deposit funds
app.post('/me/accounts/transactions', async (req, res) => {
  try {
    const { otp, amount } = req.body;
    if (!otp || amount <= 0) throw new Error('Invalid OTP or amount.');

   
    const [session] = await pool.query(
      'SELECT userId FROM sessions WHERE token = ? AND expiresAt > NOW()',
      [otp]
    );
    if (!session.length) throw new Error('Invalid or expired OTP.');

    const userId = session[0].userId;

    
    const [account] = await pool.query(
      'SELECT balance FROM accounts WHERE userId = ?',
      [userId]
    );
    if (!account.length) throw new Error('Account not found.');

    
    let newBalance = account[0].balance + amount;

   
    newBalance = Math.round(newBalance * 100) / 100;  


    await pool.query('UPDATE accounts SET balance = ? WHERE userId = ?', [newBalance, userId]);

  
    res.json({ balance: newBalance });
  } catch (err) {
    console.error('Deposit Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});








app.get('/', (req, res) => {
  res.send('Welcome to the Bank Account API!');
});


// Start server
app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
