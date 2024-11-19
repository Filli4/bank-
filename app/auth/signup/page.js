//app/auth/signup/page.js
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function SignupPage({ params }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignup = async () => {
    setError('');
    setLoading(true);

    // Simple client-side validation
    if (!username || !password) {
      setError('Username and password are required.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        // Log the response data for debugging
        const data = await response.json();
        console.log('Signup successful:', data); // Debugging response

        localStorage.setItem('username', username);
        localStorage.setItem('password', password);
        // Redirect to login page upon successful signup
        router.push('/auth/Login'); // Ensure correct path for login
        // Optionally clear form fields
        setUsername('');
        setPassword('');
      } else {
        // Handle backend error response
        const data = await response.json();
        setError(data.error || 'Signup failed');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='m-6 p-6 gap-2 items-center flex flex-wrap bg-slate-700 w-fit rounded-lg'>
     <input
  type="text"
  placeholder="Username"
  value={username}
  className="p-2 rounded-lg text-xl bg-slate-200 w-44"
  onChange={(e) => setUsername(e.target.value)}
  disabled={loading}  // Disable input while loading
/>
<input
  type="password"
  placeholder="Password"
  value={password}
  className="p-2 rounded-lg text-xl bg-slate-200 w-44"
  onChange={(e) => setPassword(e.target.value)}
  disabled={loading}  // Disable input while loading
/>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        className='mx-4 p-3 text-wrap text-lg text-white hover:bg-slate-900 rounded-lg'
        onClick={handleSignup}
        disabled={loading} // Disable button while loading
      >
        {loading ? 'Signing Up...' : 'Signup'}
      </button>
    </div>
  );
}
