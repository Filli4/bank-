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
app.use(cors({ origin: 'http://localhost:3000',credentials: true, }));
app.use(express.json()); 


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
// Example of user registration logic (assuming you have a signup route)
app.post('/users', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    // Check if user already exists
    const [existingUser] = await query('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken.' });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert user into DB with hashed password
    await query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);

    res.status(201).json({ message: 'User created successfully!' });
  } catch (error) {
    console.error('Error during user creation:', error);
    res.status(500).json({ error: 'An error occurred during registration.' });
  }
});


// User login and generate OTP
app.post('/sessions', async (req, res) => {
  const { username, password } = req.body;
  console.log('Request Body:', req.body);

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const [user] = await query('SELECT * FROM users WHERE username = ?', [username]);

    if (!user) {
      console.log('User not found in DB');
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    // Compare the provided password with the hashed password from DB
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.log('Password mismatch');
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    // If user is found and password matches, generate OTP
    const otp = generateOTP();
    console.log('Generated OTP:', otp);

    // Save OTP with expiration time
    await query('INSERT INTO sessions (userId, token, expiresAt) VALUES (?, ?, NOW() + INTERVAL 5 MINUTE)', [
      user.id,
      otp,
    ]);

    // Log user details and OTP
    console.log('User from DB:', user);

    // Send response with OTP
    res.status(200).json({ otp });

  } catch (error) {
    console.error('Error logging in:', error.message);
    res.status(500).json({ error: 'An error occurred during login.' });
  }
});



// Get account balance

app.get('/accounts/transactions', async (req, res) => {
  const otp = req.headers['Authorization']?.split(' ')[1]; // Get OTP from Authorization header

  if (!otp) {
    return res.status(400).json({ error: 'OTP is required.' });
  }

  try {
    // Query to check if the session is valid
    const [session] = await query('SELECT userId FROM sessions WHERE token = ? AND expiresAt > NOW()', [otp]);


    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired OTP.' });
    }

    // Query to get account balance
    const [account] = await pool.query('SELECT balance FROM accounts WHERE userId = ?', [
      session.userId,
    ]);

    if (!account) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    // Send back the balance from the account result
    res.json({ balance: account[0].balance }); // Corrected to account[0].balance
  } catch (error) {
    console.error('Error fetching account balance:', error.message);
    res.status(500).json({ error: 'An error occurred while fetching the account balance.' });
  }
});


// Deposit money
app.post('/me/accounts/transactions', async (req, res) => {
  const { otp, amount } = req.body;

  if (!otp || amount <= 0) {
    return res.status(400).send('Invalid OTP or amount');
  }

  try {
    // Query the sessions table to verify the OTP and get the userId
    const [session] = await pool.query('SELECT userId FROM sessions WHERE token = ? AND expiresAt > NOW()', [otp]);

    if (!session) {
      return res.status(401).send('Invalid or expired OTP');
    }

    // Fetch the current balance using userId (from the session)
    const [accountResult] = await pool.query('SELECT balance FROM accounts WHERE userId = ?', [session.userId]);

    if (accountResult.length === 0) {
      return res.status(404).send('Account not found');
    }

    // Calculate the new balance after deposit
    const newBalance = accountResult[0].balance + amount;
    await pool.query('START TRANSACTION');
    await pool.query('UPDATE accounts SET balance = ? WHERE userId = ?', [newBalance, session.userId]);
    await pool.query('COMMIT');

    res.send({ balance: newBalance });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error during deposit:', err.message);
    res.status(500).send('Error processing deposit');
  }
});




// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Bank Account API!');
});


// Start server
app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
