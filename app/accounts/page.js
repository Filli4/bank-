'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const Accounts = () => {
  const [balance, setBalance] = useState(null);
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState('');
  const apiUrl = 'http://localhost:3001'; 
  const router = useRouter();

  useEffect(() => {
   
    const otp = localStorage.getItem('otp');
    if (!otp) {
      setMessage('Session expired. Redirecting to login...');
      setTimeout(() => {
        router.push('/auth'); 
      }, 1000);
    } else {
      fetchBalance(otp); 
    }
  }, [router]);

  const fetchBalance = async (otp) => {
    try {
      const { data } = await axios.get(`${apiUrl}/accounts/transactions`, {
        headers: { Authorization: `Bearer ${otp}` },
      });
      setBalance(data.balance); 
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to fetch balance.');
    }
  };

  const deposit = async () => {
    const otp = localStorage.getItem('otp');
    if (!otp) return setMessage('Session expired. Please log in.');

    if (amount <= 0) return setMessage('Please enter a valid deposit amount.');

    try {
      const { data } = await axios.post(`${apiUrl}/me/accounts/transactions`, { otp, amount });
      setBalance(data.balance);
      setMessage('Deposit successful!');
      setAmount(0); 
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to deposit funds.');
    }
  };

  const logout = () => {
    localStorage.removeItem('otp'); 
    setMessage('Logged out successfully. Redirecting to login...');
    setTimeout(() => {
      router.push('/auth'); 
    }, 1000);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Account</h1>

      <div className="bg-gray-200 p-4 rounded-lg mb-4">
        <p className="text-lg">Balance: {balance !== null ? `$${balance}` : 'Loading...'}</p>
      </div>

      <div className="mb-4">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          placeholder="Deposit Amount"
          className="border p-2 rounded w-full mb-2"
        />
        <button
          onClick={deposit}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Deposit
        </button>
      </div>

      {message && <p className="text-blue-500 mb-4">{message}</p>}

      <button
        onClick={logout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
};

export default Accounts;
