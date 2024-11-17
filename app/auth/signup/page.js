//app/auth/signup/page.js
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
export default function SignupPage({ params }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleSignup = async () => {
    try {
      // Send a POST request to the backend
      const response = await fetch('http://localhost:3001/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        // Redirect the user to another page upon successful signup
        router.push('/auth/login') // Example: redirect to login page
      } else {
        // Handle the error response
        throw new Error('Signup failed')
      }
    } catch (error) {
      console.error('Signup failed:', error)
      // Handle error, such as displaying an error message to the user
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
      onClick={handleSignup}>Signup</button>
    </div>
  )
}