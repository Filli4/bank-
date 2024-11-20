// app/auth/page.js
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const Auth = () => {
  const [isSignup, setIsSignup] = useState(false); 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    
    const savedUsername = localStorage.getItem('username');
    const savedPassword = localStorage.getItem('password');
    if (savedUsername && savedPassword) {
      setUsername(savedUsername);
      setPassword(savedPassword);
    }
  }, []);

  const handleAuth = async () => {
    setError('');
    setLoading(true);

    
    if (!username.trim() || !password) {
      setError('Username and password are required.');
      setLoading(false);
      return;
    }

    const endpoint = isSignup ? '/users' : '/sessions';
    const payload = { username: username.trim(), password };

    try {
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        if (isSignup) {
          
          localStorage.setItem('username', username);
          localStorage.setItem('password', password);
          setError('Signup successful! Please login.');
          setIsSignup(false); 
        } else {
       
          localStorage.setItem('otp', data.otp);
          router.push('/accounts');
        }
      } else {
        setError(data.message || (isSignup ? 'Signup failed.' : 'Login failed.'));
      }
    } catch (error) {
      setError('An error occurred. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="m-6 p-6 gap-4 flex flex-col items-center bg-slate-700 w-fit rounded-lg">
      <h1 className="text-2xl text-white">{isSignup ? 'Signup' : 'Login'}</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        className="p-2 rounded-lg text-xl bg-slate-200 w-64"
        onChange={(e) => setUsername(e.target.value)}
        disabled={loading}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        className="p-2 rounded-lg text-xl bg-slate-200 w-64"
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading} 
      />
      {error && <p className="text-red-500">{error}</p>}
      <button
        className="mx-4 p-3 text-lg text-white bg-blue-500 hover:bg-blue-700 rounded-lg"
        onClick={handleAuth}
        disabled={loading} 
      >
        {loading ? (isSignup ? 'Signing Up...' : 'Logging In...') : isSignup ? 'Signup' : 'Login'}
      </button>
      <button
        className="mt-2 text-sm text-blue-300 underline"
        onClick={() => {
          setIsSignup(!isSignup);
          setError(''); 
        }}
      >
        {isSignup ? 'Already have an account? Login' : "Don't have an account? Signup"}
      </button>
    </div>
  );
};

export default Auth;
