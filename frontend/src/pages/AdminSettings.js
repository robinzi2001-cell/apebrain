import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Leaf, Settings, Save, Lock } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminSettings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [showBlog, setShowBlog] = useState(true);
  const [showShop, setShowShop] = useState(true);
  const [showMinigames, setShowMinigames] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('adminAuth')) {
      navigate('/shroomsadmin');
      return;
    }
    fetchSettings();
    fetchLandingSettings();
  }, [navigate]);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/admin/settings`);
      setAdminUsername(response.data.admin_username || '');
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchLandingSettings = async () => {
    try {
      const response = await axios.get(`${API}/landing-settings`);
      setShowBlog(response.data.show_blog);
      setShowShop(response.data.show_shop);
      setShowMinigames(response.data.show_minigames);
    } catch (error) {
      console.error('Error fetching landing settings:', error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword && newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setSaving(true);

    try {
      const data = {
        current_password: currentPassword,
        admin_username: adminUsername
      };

      if (newPassword) {
        data.new_password = newPassword;
      }

      await axios.post(`${API}/admin/settings`, data);

      setSuccess('Settings updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // If password changed, log out and redirect
      if (newPassword) {
        setTimeout(() => {
          localStorage.removeItem('adminAuth');
          navigate('/shroomsadmin');
        }, 2000);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setError(error.response?.data?.detail || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/shroomsadmin');
  };

  // Prevent rendering if not authenticated
  if (!localStorage.getItem('adminAuth')) {
    return null;
  }

  return (
    <div>
      <nav className="navbar" data-testid="navbar">
        <div className="navbar-content">
          <a href="/shroomsadmin/dashboard" className="logo" data-testid="logo-link">
            <Leaf size={32} />
            ApeBrain.cloud - Settings
          </a>
          <div className="nav-links">
            <a href="/shroomsadmin/dashboard" data-testid="dashboard-link">Dashboard</a>
            <button onClick={handleLogout} className="btn btn-secondary" data-testid="logout-button">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="admin-settings-container" data-testid="admin-settings-container">
        <div className="settings-header">
          <Settings size={48} color="#7a9053" />
          <h1 style={{ marginTop: '1rem' }} data-testid="page-title">Admin Settings</h1>
          <p style={{ color: '#7a9053', marginTop: '0.5rem' }}>Manage your admin credentials</p>
        </div>

        {error && <div className="error" data-testid="error-message">{error}</div>}
        {success && <div className="success" data-testid="success-message">{success}</div>}

        <form onSubmit={handleSave} className="settings-form" data-testid="settings-form">
          <div className="form-group">
            <label htmlFor="adminUsername">
              <Lock size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Admin Username
            </label>
            <input
              type="text"
              id="adminUsername"
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
              placeholder="Enter admin username"
              required
              data-testid="username-input"
            />
            <small style={{ color: '#7a9053', marginTop: '0.5rem', display: 'block' }}>
              This username will be required for login
            </small>
          </div>

          <div className="form-divider"></div>

          <h3 style={{ marginBottom: '1rem', color: '#3a4520' }}>Change Password</h3>

          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              required
              data-testid="current-password-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password (optional)</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 8 characters)"
              data-testid="new-password-input"
            />
          </div>

          {newPassword && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                data-testid="confirm-password-input"
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2rem' }}
            data-testid="save-button"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>

        <div className="settings-info" style={{ marginTop: '3rem', padding: '1.5rem', background: 'rgba(122, 144, 83, 0.1)', borderRadius: '12px' }}>
          <h4 style={{ marginBottom: '0.5rem', color: '#3a4520' }}>Security Notes:</h4>
          <ul style={{ marginLeft: '1.5rem', color: '#5a6c3a' }}>
            <li>You will be logged out after changing your password</li>
            <li>Username is case-sensitive</li>
            <li>Keep your credentials secure</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;