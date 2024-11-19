//app/auth/Login/page.js
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function Login({ params }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Retrieve stored credentials if they exist in localStorage
    const savedUsername = localStorage.getItem('username');
    const savedPassword = localStorage.getItem('password');
    if (savedUsername && savedPassword) {
      setUsername(savedUsername);
      setPassword(savedPassword);
    }
  }, []); // Empty dependency array means this effect runs only once when the component mounts

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password) {
      setError('Username and password are required.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: trimmedUsername, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('otp', data.otp);
        router.push('/accounts');
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='m-6 p-6 gap-2 items-center flex flex-wrap bg-slate-700 w-fit rounded-lg'>
      <input
        type='text'
        placeholder='Username'
        value={username}
        className='p-2 rounded-lg text-xl bg-slate-200 w-44'
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type='password'
        placeholder='Password'
        value={password}
        className='p-2 rounded-lg text-xl bg-slate-200 w-44'
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        className='mx-4 p-3 text-wrap text-lg text-white hover:bg-slate-900 rounded-lg'
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>

      {error && (
        <div className='text-red-500 mt-2'>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}

