const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const login = async (username, password) => {
  try {
    const response = await fetch(`${apiUrl}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('token', data.accountInsertResult.token);
      setUser({ token: data.accountInsertResult.token });
      router.push('/accounts');
    } else {
      throw new Error(data.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error.message);
   
  }
};