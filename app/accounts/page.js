//app/accounts/page.js
'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'

const Accounts = () => {
  const [otp, setOtp] = useState('') // OTP for session
  const [balance, setBalance] = useState(1) // Default balance
  const [amount, setAmount] = useState(0) // Amount to deposit
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  // Get balance function (using OTP from session)
  const handleGetBalance = async () => {
    try {
      setLoading(true)

      // Assuming OTP is stored in localStorage (as per your previous code)
      const storedOtp = localStorage.getItem('otp')
      if (!storedOtp) {
        setError('Session expired. Please log in again.')
        setLoading(false)
        return
      }

      // Send OTP in the Authorization header for balance retrieval
      const response = await axios.get(`${apiUrl}/accounts`, {
        method: 'GET', // Using GET to fetch balance
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedOtp}`, // Pass OTP in Authorization header
        },
      })

      if (response.data && response.data.balance !== undefined) {
        setBalance(response.data.balance) // Set the balance in state
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to fetch balance')
      }
    } catch (error) {
      setError('Error fetching balance: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Deposit function (sending OTP and deposit amount)
  const handleDeposit = async () => {
    setLoading(true);
    setError(''); // Reset error and success messages
    setSuccess('');
    
    const storedOtp = localStorage.getItem('otp');
    if (!storedOtp) {
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
      // Assuming your API URL is correct
      const response = await axios.post(`${apiUrl}/accounts`, {
        otp: storedOtp,
        amount: parseFloat(amount), // Make sure amount is a number
      });
   if (response && response.data && response.data.balance !== undefined) {
      setBalance(response.data.balance); // Update balance
      setSuccess('Deposit successful!');
    } else {
      setError('Unexpected response from the server.');
    }
    
    } catch (err) {
      console.error('Error during deposit:', err); // For debugging purposes
    const errorMessage = err.response ? err.response.data.message : err.message;
    setError(`Deposit failed: ${errorMessage}`)
    } finally {
      setLoading(false);
    }
  }

  
  useEffect(() => {
    if (otp) {
      handleGetBalance() // Fetch balance when OTP is available or updated
    }
  }, [otp]) // Dependency on OTP

  return (
    <div className='bg-slate-700 w-fit m-6 p-6 flex flex-col gap-2 justify-center items-center rounded-lg'>
      <div className='text-lg text-white text-wrap p-4 my-4 font-bold'>
        <p>Balance: {balance}</p>
      </div>
      <div>
        <input
          type='number'
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value))}
          className='p-2 rounded-lg text-xl bg-slate-200 w-44'
          placeholder="Deposit Amount"
        />
        <button
          className='mx-4 p-3 text-wrap text-lg text-white hover:bg-slate-900 rounded-lg'
          onClick={handleDeposit}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Deposit'}
        </button>
      </div>
      {error && <p className='text-red-500'>{error}</p>}
      {success && <p className='text-green-500'>{success}</p>}
    </div>
  )
}

export default Accounts
