import { useState, useEffect } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import './App.css';

/**
 * Main App Component
 * 
 * Manages JWT authentication state and user session.
 * JWT is stored in localStorage for persistence.
 */
function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for existing token in localStorage
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = async (selectedUser) => {
    try {
      // Call login API to get real JWT token
      const response = await axios.post('/api/auth/login', {
        userId: selectedUser.userId,
        orgId: selectedUser.orgId
      });

      const { token, user } = response.data;

      // Store token and user info
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setToken(token);
      setUser(user);
    } catch (error) {
      console.error('Login error:', error);
      alert('Failed to login. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <div className="App">
      {token ? (
        <Dashboard token={token} user={user} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
