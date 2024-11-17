//app/auth/Login/page.js
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Login({ params }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:3001/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })
      if (response.ok) {
        const data = await response.json()
        setOtp(data.otp)
        router.push('/accounts')
      } else {
        // Handle error
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className='m-6 p-6 gap-2 items-center flex flex-wrap bg-slate-700 w-fit rounded-lg'>
      
      <input
        type='text'
        placeholder='username'
        value={username}
        className='p-2 rounded-lg text-xl bg-slate-200 w-44'
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type='password'
        placeholder='password'
        value={password}
        className='p-2 rounded-lg text-xl bg-slate-200 w-44'
        onChange={(e) => setPassword(e.target.value)}
      />
      <button 
      className='mx-4 p-3 text-wrap text-lg text-white hover:bg-slate-900 rounded-lg'
      onClick={handleLogin}>Login</button>
    </div>
  )
}