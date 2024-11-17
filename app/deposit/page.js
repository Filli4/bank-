'use client'
import React, { useState } from 'react';
import axios from 'axios';

const Deposit = () => {
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDeposit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    const otp = localStorage.getItem('otp');

    if (!otp) {
      setError('Session expired. Please log in again.');
      setLoading(false);
      return;
    }

    if (amount <= 0) {
      setError('Invalid deposit amount.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/me/accounts/transactions', {
        otp,
        amount: parseFloat(amount),
      });
      setBalance(response.data.balance);
      setSuccess('Deposit successful!');
    } catch (err) {
      setError('Deposit failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="deposit-container">
      <h2 className="text-xl font-bold">Deposit Money</h2>
      <div className="form">
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input"
        />
        <button onClick={handleDeposit} disabled={loading} className="btn">
          {loading ? 'Processing...' : 'Deposit'}
        </button>
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
      </div>
      {balance !== null && <p className="text-lg">Updated Balance: ${balance}</p>}
    </div>
  );
};

export default Deposit;
