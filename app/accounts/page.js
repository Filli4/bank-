//app/accounts/page.js
'use client'
import { useState } from 'react'
function Accounts({ params }) {
  const [otp, setOtp] = useState('')
  const [balance, setBalance] = useState(1000)
  const [amount, setAmount] = useState(0)
  const handleGetBalance = async () => {
    try {
      const response = await fetch('http://localhost:3001/me/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: 'abc', otp }),
      })
      if (response.ok) {
        // Hantera saldo data
        const data = await response.json() // Parse response body as JSON
        setBalance(data.balance) // Update balance state with received balance
      }
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDeposit = async () => {
    try {
      const response = await fetch(
        'http://localhost:3001/me/accounts/transactions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: 'abc', otp, amount }),
        }
      )
      if (response.ok) {
        // Reload balance or update UI
        const data = await response.json() // Parse response body as JSON
        setBalance(data.balance) // Update balance state with received balance
      }
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className='bg-slate-700 w-fit m-6 p-6 flex flex-col gap-2 justify-center items-center rounded-lg'>
      <div className='text-lg text-white text-wrap p-4 my-4 font-bold'>
        <p>Balance: {balance}</p>
      </div>
      <div>
        <label>
          <input
            type='number'
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            className='p-2 rounded-lg text-xl bg-slate-200 w-44'
          />
        </label>
        <button 
        className='mx-4 p-3 text-wrap text-lg text-white hover:bg-slate-900 rounded-lg'
        onClick={handleDeposit}>Deposit</button>
      </div>
    </div>
  )
}

export default Accounts