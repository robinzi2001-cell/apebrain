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
      setCardBgColorStart(response.data.card_bg_color_start || 'rgba(167, 139, 250, 0.15)');
      setCardBgColorMiddle(response.data.card_bg_color_middle || 'rgba(139, 92, 246, 0.12)');
      setCardBgColorEnd(response.data.card_bg_color_end || 'rgba(124, 58, 237, 0.15)');
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
        card_bg_color_start: cardBgColorStart,
        card_bg_color_middle: cardBgColorMiddle,
        card_bg_color_end: cardBgColorEnd
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
            <h3 style={{ color: '#3a4520', marginBottom: '1rem' }}>Karten Hintergrundfarbe (ohne Bilder)</h3>
            <p style={{ color: '#7a9053', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Passe die Hintergrundfarbe der Karten an, wenn keine Bilder hochgeladen sind
            </p>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#3a4520', fontWeight: '500' }}>
                  Startfarbe (Oben):
                </label>
                <input
                  type="text"
                  value={cardBgColorStart}
                  onChange={(e) => setCardBgColorStart(e.target.value)}
                  placeholder="z.B. rgba(167, 139, 250, 0.15)"
                  style={{ 
                    width: '100%', 
                    padding: '0.5rem', 
                    borderRadius: '6px', 
                    border: '1px solid #d1d5db',
                    fontFamily: 'monospace'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#3a4520', fontWeight: '500' }}>
                  Mittelfarbe:
                </label>
                <input
                  type="text"
                  value={cardBgColorMiddle}
                  onChange={(e) => setCardBgColorMiddle(e.target.value)}
                  placeholder="z.B. rgba(139, 92, 246, 0.12)"
                  style={{ 
                    width: '100%', 
                    padding: '0.5rem', 
                    borderRadius: '6px', 
                    border: '1px solid #d1d5db',
                    fontFamily: 'monospace'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#3a4520', fontWeight: '500' }}>
                  Endfarbe (Unten):
                </label>
                <input
                  type="text"
                  value={cardBgColorEnd}
                  onChange={(e) => setCardBgColorEnd(e.target.value)}
                  placeholder="z.B. rgba(124, 58, 237, 0.15)"
                  style={{ 
                    width: '100%', 
                    padding: '0.5rem', 
                    borderRadius: '6px', 
                    border: '1px solid #d1d5db',
                    fontFamily: 'monospace'
                  }}
                />
              </div>

              {/* Color Preview */}
              <div style={{ 
                marginTop: '1rem',
                padding: '2rem',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${cardBgColorStart} 0%, ${cardBgColorMiddle} 50%, ${cardBgColorEnd} 100%)`,
                border: '2px solid #d1d5db',
                textAlign: 'center',
                color: '#fff',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
              }}>
                <strong>Vorschau</strong>
              </div>

              {/* Preset Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    setCardBgColorStart('rgba(167, 139, 250, 0.15)');
                    setCardBgColorMiddle('rgba(139, 92, 246, 0.12)');
                    setCardBgColorEnd('rgba(124, 58, 237, 0.15)');
                  }}
                  style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #7a9053', background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.3), rgba(124, 58, 237, 0.3))', cursor: 'pointer' }}
                >
                  Lila (Standard)
                </button>
                <button
                  onClick={() => {
                    setCardBgColorStart('rgba(96, 165, 250, 0.15)');
                    setCardBgColorMiddle('rgba(59, 130, 246, 0.12)');
                    setCardBgColorEnd('rgba(37, 99, 235, 0.15)');
                  }}
                  style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #7a9053', background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.3), rgba(37, 99, 235, 0.3))', cursor: 'pointer' }}
                >
                  Blau
                </button>
                <button
                  onClick={() => {
                    setCardBgColorStart('rgba(253, 164, 175, 0.15)');
                    setCardBgColorMiddle('rgba(244, 114, 182, 0.12)');
                    setCardBgColorEnd('rgba(236, 72, 153, 0.15)');
                  }}
                  style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #7a9053', background: 'linear-gradient(135deg, rgba(253, 164, 175, 0.3), rgba(236, 72, 153, 0.3))', cursor: 'pointer' }}
                >
                  Pink
                </button>
                <button
                  onClick={() => {
                    setCardBgColorStart('rgba(134, 239, 172, 0.15)');
                    setCardBgColorMiddle('rgba(74, 222, 128, 0.12)');
                    setCardBgColorEnd('rgba(34, 197, 94, 0.15)');
                  }}
                  style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #7a9053', background: 'linear-gradient(135deg, rgba(134, 239, 172, 0.3), rgba(34, 197, 94, 0.3))', cursor: 'pointer' }}
                >
                  Grün
                </button>
              </div>
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