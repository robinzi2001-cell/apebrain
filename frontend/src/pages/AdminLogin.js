import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Leaf, Lock } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API}/admin/login`, { password });
      if (response.data.success) {
        localStorage.setItem('adminAuth', 'true');
        navigate('/blogadmin/dashboard');
      }
    } catch (error) {
      setError('Invalid password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container" data-testid="admin-login-container">
      <div className="admin-box">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Leaf size={48} color="#7a9053" style={{ margin: '0 auto' }} />
          <h1 style={{ marginTop: '1rem' }} data-testid="admin-login-title">Admin Login</h1>
          <p style={{ color: '#7a9053', marginTop: '0.5rem' }} data-testid="admin-login-subtitle">ApeBrain.cloud</p>
        </div>

        {error && <div className="error" data-testid="error-message">{error}</div>}

        <form onSubmit={handleLogin} data-testid="admin-login-form">
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
              data-testid="password-input"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
            data-testid="login-button"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem', color: '#7a9053' }}>
          Default password: apebrain2024
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/" style={{ color: '#7a9053', textDecoration: 'none' }} data-testid="back-to-home-link">
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;