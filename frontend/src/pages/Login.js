import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { LogIn, Mail, Lock } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const response = await axios.post(`${API}/auth/login`, {
        email: formData.email,
        password: formData.password
      });

      // Save token
      localStorage.setItem('userToken', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Anmeldung fehlgeschlagen';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, rgba(122, 144, 83, 0.1) 0%, rgba(58, 69, 32, 0.1) 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '450px',
        width: '100%',
        background: 'white',
        borderRadius: '20px',
        padding: '3rem',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🍄</div>
          <h1 style={{ color: '#3a4520', marginBottom: '0.5rem' }}>Willkommen zurück</h1>
          <p style={{ color: '#7a9053' }}>Melde dich in deinem Konto an</p>
        </div>

        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#991b1b',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#3a4520', fontWeight: '500' }}>
              <Mail size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              E-Mail
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#3a4520', fontWeight: '500' }}>
              <Lock size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Passwort
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
            <Link to="/forgot-password" style={{ color: '#7a9053', fontSize: '0.9rem', textDecoration: 'none' }}>
              Passwort vergessen?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              background: '#7a9053',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <LogIn size={20} />
            {loading ? 'Anmeldung...' : 'Anmelden'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <span style={{ color: '#6b7280' }}>Noch kein Konto? </span>
          <Link to="/register" style={{ color: '#7a9053', fontWeight: '600', textDecoration: 'none' }}>
            Jetzt registrieren
          </Link>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem', marginBottom: '1rem' }}>
            <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Oder als Gast einkaufen</span>
          </div>
          <Link 
            to="/shop"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: 'white',
              color: '#7a9053',
              border: '2px solid #7a9053',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '0.95rem'
            }}
          >
            Weiter zum Shop
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/" style={{ color: '#9ca3af', fontSize: '0.9rem', textDecoration: 'none' }}>
            ← Zurück zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
