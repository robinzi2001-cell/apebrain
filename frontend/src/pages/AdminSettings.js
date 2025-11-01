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
  
  // Gallery settings
  const [blogGalleryMode, setBlogGalleryMode] = useState('none');
  const [shopGalleryMode, setShopGalleryMode] = useState('none');
  const [minigamesGalleryMode, setMinigamesGalleryMode] = useState('none');
  const [blogGalleryImages, setBlogGalleryImages] = useState([]);
  const [shopGalleryImages, setShopGalleryImages] = useState([]);
  const [minigamesGalleryImages, setMinigamesGalleryImages] = useState([]);
  
  // Background color settings - RGB values
  const [startR, setStartR] = useState(167);
  const [startG, setStartG] = useState(139);
  const [startB, setStartB] = useState(250);
  const [startOpacity, setStartOpacity] = useState(0.15);
  
  const [middleR, setMiddleR] = useState(139);
  const [middleG, setMiddleG] = useState(92);
  const [middleB, setMiddleB] = useState(246);
  const [middleOpacity, setMiddleOpacity] = useState(0.12);
  
  const [endR, setEndR] = useState(124);
  const [endG, setEndG] = useState(58);
  const [endB, setEndB] = useState(237);
  const [endOpacity, setEndOpacity] = useState(0.15);
  
  // Color profiles
  const [colorProfiles, setColorProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState('');
  const [newProfileName, setNewProfileName] = useState('');
  
  const [enableVideo, setEnableVideo] = useState(true);
  const [enableAudio, setEnableAudio] = useState(true);
  const [enableTextToSpeech, setEnableTextToSpeech] = useState(true);
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
    fetchBlogFeatures();
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
      setBlogGalleryMode(response.data.blog_gallery_mode || 'none');
      setShopGalleryMode(response.data.shop_gallery_mode || 'none');
      setMinigamesGalleryMode(response.data.minigames_gallery_mode || 'none');
      setBlogGalleryImages(response.data.blog_gallery_images || []);
      setShopGalleryImages(response.data.shop_gallery_images || []);
      setMinigamesGalleryImages(response.data.minigames_gallery_images || []);
      
      // Parse RGB values from rgba strings
      const parseRgba = (rgbaStr) => {
        const match = rgbaStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/);
        if (match) {
          return {
            r: parseInt(match[1]),
            g: parseInt(match[2]),
            b: parseInt(match[3]),
            a: parseFloat(match[4] || 1)
          };
        }
        return { r: 167, g: 139, b: 250, a: 0.15 };
      };
      
      const startColor = parseRgba(response.data.card_bg_color_start || 'rgba(167, 139, 250, 0.15)');
      setStartR(startColor.r);
      setStartG(startColor.g);
      setStartB(startColor.b);
      setStartOpacity(startColor.a);
      
      const middleColor = parseRgba(response.data.card_bg_color_middle || 'rgba(139, 92, 246, 0.12)');
      setMiddleR(middleColor.r);
      setMiddleG(middleColor.g);
      setMiddleB(middleColor.b);
      setMiddleOpacity(middleColor.a);
      
      const endColor = parseRgba(response.data.card_bg_color_end || 'rgba(124, 58, 237, 0.15)');
      setEndR(endColor.r);
      setEndG(endColor.g);
      setEndB(endColor.b);
      setEndOpacity(endColor.a);
    } catch (error) {
      console.error('Error fetching landing settings:', error);
    }
  };

  const fetchBlogFeatures = async () => {
    try {
      const response = await axios.get(`${API}/blog-features`);
      setEnableVideo(response.data.enable_video);
      setEnableAudio(response.data.enable_audio);
      setEnableTextToSpeech(response.data.enable_text_to_speech);
    } catch (error) {
      console.error('Error fetching blog features:', error);
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

  const handleLandingSettingsSave = async () => {
    try {
      await axios.post(`${API}/landing-settings`, {
        show_blog: showBlog,
        show_shop: showShop,
        show_minigames: showMinigames,
        blog_gallery_mode: blogGalleryMode,
        shop_gallery_mode: shopGalleryMode,
        minigames_gallery_mode: minigamesGalleryMode,
        blog_gallery_images: blogGalleryImages,
        shop_gallery_images: shopGalleryImages,
        minigames_gallery_images: minigamesGalleryImages,
        card_bg_color_start: `rgba(${startR}, ${startG}, ${startB}, ${startOpacity})`,
        card_bg_color_middle: `rgba(${middleR}, ${middleG}, ${middleB}, ${middleOpacity})`,
        card_bg_color_end: `rgba(${endR}, ${endG}, ${endB}, ${endOpacity})`
      });
      setSuccess('Landing page settings updated successfully!');
    } catch (error) {
      console.error('Error updating landing settings:', error);
      setError('Failed to update landing page settings');
    }
  };

  const handleGalleryImageUpload = async (section, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API}/landing-settings/upload-gallery-image/${section}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Refresh landing settings to get updated images
      await fetchLandingSettings();
      setSuccess(`Gallery image uploaded for ${section}!`);
    } catch (error) {
      console.error('Error uploading gallery image:', error);
      setError(`Failed to upload gallery image for ${section}`);
    }
  };

  const handleBlogFeaturesSave = async () => {
    try {
      await axios.post(`${API}/blog-features`, {
        enable_video: enableVideo,
        enable_audio: enableAudio,
        enable_text_to_speech: enableTextToSpeech
      });
      setSuccess('Blog features updated successfully!');
    } catch (error) {
      console.error('Error updating blog features:', error);
      setError('Failed to update blog features');
    }
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

        {/* Landing Page Settings */}
        <div style={{ marginTop: '3rem' }}>
          <div className="form-divider"></div>
          <h2 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#3a4520' }}>Landing Page Settings</h2>
          <p style={{ color: '#7a9053', marginBottom: '1.5rem' }}>Control which buttons are visible on the landing page</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showBlog}
                onChange={(e) => setShowBlog(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                data-testid="show-blog-toggle"
              />
              <span style={{ fontSize: '1rem', color: '#3a4520' }}>Show Blog Button</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showShop}
                onChange={(e) => setShowShop(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                data-testid="show-shop-toggle"
              />
              <span style={{ fontSize: '1rem', color: '#3a4520' }}>Show Shop Button</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showMinigames}
                onChange={(e) => setShowMinigames(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                data-testid="show-minigames-toggle"
              />
              <span style={{ fontSize: '1rem', color: '#3a4520' }}>Show Minigames Button</span>
            </label>
          </div>

          {/* Gallery Settings for each button */}
          <div style={{ marginTop: '2rem', marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#3a4520', marginBottom: '1rem' }}>Button Gallery Settings</h3>
            
            {/* Blog Gallery */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ color: '#7a9053', marginBottom: '0.5rem' }}>Blog Button Gallery</h4>
              <select
                value={blogGalleryMode}
                onChange={(e) => setBlogGalleryMode(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', marginBottom: '0.5rem', width: '100%' }}
              >
                <option value="none">No Images</option>
                <option value="auto">Automatic (Latest Blog Images)</option>
                <option value="custom">Custom Upload</option>
              </select>
              
              {blogGalleryMode === 'custom' && (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      files.forEach(file => handleGalleryImageUpload('blog', file));
                    }}
                    style={{ marginTop: '0.5rem' }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    {blogGalleryImages.map((img, idx) => (
                      <img key={idx} src={img} alt={`Blog ${idx}`} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Shop Gallery */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ color: '#7a9053', marginBottom: '0.5rem' }}>Shop Button Gallery</h4>
              <select
                value={shopGalleryMode}
                onChange={(e) => setShopGalleryMode(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', marginBottom: '0.5rem', width: '100%' }}
              >
                <option value="none">No Images</option>
                <option value="auto">Automatic (Product Images)</option>
                <option value="custom">Custom Upload</option>
              </select>
              
              {shopGalleryMode === 'custom' && (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      files.forEach(file => handleGalleryImageUpload('shop', file));
                    }}
                    style={{ marginTop: '0.5rem' }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    {shopGalleryImages.map((img, idx) => (
                      <img key={idx} src={img} alt={`Shop ${idx}`} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Minigames Gallery */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ color: '#7a9053', marginBottom: '0.5rem' }}>Minigames Button Gallery</h4>
              <select
                value={minigamesGalleryMode}
                onChange={(e) => setMinigamesGalleryMode(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', marginBottom: '0.5rem', width: '100%' }}
              >
                <option value="none">No Images</option>
                <option value="auto">Automatic</option>
                <option value="custom">Custom Upload</option>
              </select>
              
              {minigamesGalleryMode === 'custom' && (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      files.forEach(file => handleGalleryImageUpload('minigames', file));
                    }}
                    style={{ marginTop: '0.5rem' }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    {minigamesGalleryImages.map((img, idx) => (
                      <img key={idx} src={img} alt={`Minigames ${idx}`} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card Background Color Settings */}
          <div style={{ marginTop: '2rem', marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#3a4520', marginBottom: '1rem' }}>🎨 Karten Hintergrundfarbe (ohne Bilder)</h3>
            
            {/* Start Color */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ color: '#7a9053', marginBottom: '0.75rem' }}>Startfarbe (Oben)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#6b7280' }}>🔴 Rot: {startR}</label>
                  <input type="range" min="0" max="255" value={startR} onChange={(e) => setStartR(parseInt(e.target.value))} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#6b7280' }}>🟢 Grün: {startG}</label>
                  <input type="range" min="0" max="255" value={startG} onChange={(e) => setStartG(parseInt(e.target.value))} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#6b7280' }}>🔵 Blau: {startB}</label>
                  <input type="range" min="0" max="255" value={startB} onChange={(e) => setStartB(parseInt(e.target.value))} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#6b7280' }}>💧 Opacity: {startOpacity.toFixed(2)}</label>
                  <input type="range" min="0" max="1" step="0.01" value={startOpacity} onChange={(e) => setStartOpacity(parseFloat(e.target.value))} style={{ width: '100%' }} />
                </div>
              </div>
            </div>

            {/* Middle Color */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ color: '#7a9053', marginBottom: '0.75rem' }}>Mittelfarbe</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#6b7280' }}>🔴 Rot: {middleR}</label>
                  <input type="range" min="0" max="255" value={middleR} onChange={(e) => setMiddleR(parseInt(e.target.value))} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#6b7280' }}>🟢 Grün: {middleG}</label>
                  <input type="range" min="0" max="255" value={middleG} onChange={(e) => setMiddleG(parseInt(e.target.value))} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#6b7280' }}>🔵 Blau: {middleB}</label>
                  <input type="range" min="0" max="255" value={middleB} onChange={(e) => setMiddleB(parseInt(e.target.value))} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#6b7280' }}>💧 Opacity: {middleOpacity.toFixed(2)}</label>
                  <input type="range" min="0" max="1" step="0.01" value={middleOpacity} onChange={(e) => setMiddleOpacity(parseFloat(e.target.value))} style={{ width: '100%' }} />
                </div>
              </div>
            </div>

            {/* End Color */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ color: '#7a9053', marginBottom: '0.75rem' }}>Endfarbe (Unten)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#6b7280' }}>🔴 Rot: {endR}</label>
                  <input type="range" min="0" max="255" value={endR} onChange={(e) => setEndR(parseInt(e.target.value))} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#6b7280' }}>🟢 Grün: {endG}</label>
                  <input type="range" min="0" max="255" value={endG} onChange={(e) => setEndG(parseInt(e.target.value))} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#6b7280' }}>🔵 Blau: {endB}</label>
                  <input type="range" min="0" max="255" value={endB} onChange={(e) => setEndB(parseInt(e.target.value))} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#6b7280' }}>💧 Opacity: {endOpacity.toFixed(2)}</label>
                  <input type="range" min="0" max="1" step="0.01" value={endOpacity} onChange={(e) => setEndOpacity(parseFloat(e.target.value))} style={{ width: '100%' }} />
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div style={{ 
              padding: '3rem',
              borderRadius: '12px',
              background: `linear-gradient(135deg, rgba(${startR}, ${startG}, ${startB}, ${startOpacity}) 0%, rgba(${middleR}, ${middleG}, ${middleB}, ${middleOpacity}) 50%, rgba(${endR}, ${endG}, ${endB}, ${endOpacity}) 100%)`,
              border: '2px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center',
              color: '#fff',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              marginBottom: '1rem'
            }}>
              <strong style={{ fontSize: '1.2rem' }}>Live Vorschau</strong>
            </div>

            {/* Quick Presets */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button onClick={() => { setStartR(167); setStartG(139); setStartB(250); setStartOpacity(0.15); setMiddleR(139); setMiddleG(92); setMiddleB(246); setMiddleOpacity(0.12); setEndR(124); setEndG(58); setEndB(237); setEndOpacity(0.15); }} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.5), rgba(124, 58, 237, 0.5))', color: '#fff', cursor: 'pointer' }}>Lila</button>
              <button onClick={() => { setStartR(96); setStartG(165); setStartB(250); setStartOpacity(0.15); setMiddleR(59); setMiddleG(130); setMiddleB(246); setMiddleOpacity(0.12); setEndR(37); setEndG(99); setEndB(235); setEndOpacity(0.15); }} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.5), rgba(37, 99, 235, 0.5))', color: '#fff', cursor: 'pointer' }}>Blau</button>
              <button onClick={() => { setStartR(253); setStartG(164); setStartB(175); setStartOpacity(0.15); setMiddleR(244); setMiddleG(114); setMiddleB(182); setMiddleOpacity(0.12); setEndR(236); setEndG(72); setEndB(153); setEndOpacity(0.15); }} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: 'linear-gradient(135deg, rgba(253, 164, 175, 0.5), rgba(236, 72, 153, 0.5))', color: '#fff', cursor: 'pointer' }}>Pink</button>
              <button onClick={() => { setStartR(134); setStartG(239); setStartB(172); setStartOpacity(0.15); setMiddleR(74); setMiddleG(222); setMiddleB(128); setMiddleOpacity(0.12); setEndR(34); setEndG(197); setEndB(94); setEndOpacity(0.15); }} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: 'linear-gradient(135deg, rgba(134, 239, 172, 0.5), rgba(34, 197, 94, 0.5))', color: '#fff', cursor: 'pointer' }}>Grün</button>
            </div>
          </div>

          <button
            onClick={handleLandingSettingsSave}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            data-testid="save-landing-settings-button"
          >
            <Save size={18} />
            Save Landing Page Settings
          </button>
        </div>

        {/* Blog Features Settings */}
        <div style={{ marginTop: '3rem' }}>
          <div className="form-divider"></div>
          <h2 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#3a4520' }}>Blog Features</h2>
          <p style={{ color: '#7a9053', marginBottom: '1.5rem' }}>Enable or disable multimedia features for blog posts</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={enableVideo}
                onChange={(e) => setEnableVideo(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                data-testid="enable-video-toggle"
              />
              <span style={{ fontSize: '1rem', color: '#3a4520' }}>Enable Video (YouTube) in Blogs</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={enableAudio}
                onChange={(e) => setEnableAudio(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                data-testid="enable-audio-toggle"
              />
              <span style={{ fontSize: '1rem', color: '#3a4520' }}>Enable Audio Upload in Blogs</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={enableTextToSpeech}
                onChange={(e) => setEnableTextToSpeech(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                data-testid="enable-tts-toggle"
              />
              <span style={{ fontSize: '1rem', color: '#3a4520' }}>Enable Text-to-Speech Reader</span>
            </label>
          </div>

          <button
            onClick={handleBlogFeaturesSave}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            data-testid="save-blog-features-button"
          >
            <Save size={18} />
            Save Blog Features
          </button>
        </div>

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