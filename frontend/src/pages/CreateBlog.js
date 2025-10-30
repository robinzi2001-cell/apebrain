import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Leaf, Save, Upload, Eye, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CreateBlog = () => {
  const [mode, setMode] = useState('ai'); // 'ai' or 'manual'
  const [keywords, setKeywords] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [generatedBlog, setGeneratedBlog] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [fetchImageFromWeb, setFetchImageFromWeb] = useState(false);
  const [fetchingImage, setFetchingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('adminAuth')) {
      navigate('/shroomsadmin');
    }
  }, [navigate]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateAI = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setGeneratedBlog(null);

    try {
      const response = await axios.post(`${API}/blogs/generate`, { keywords });
      setGeneratedBlog(response.data);
      setTitle(response.data.title);
      setContent(response.data.content);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating blog:', error);
      setError('Failed to generate blog. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (status = 'draft') => {
    if (!title || !content) {
      setError('Title and content are required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Create blog post
      const blogData = {
        title: title,
        content: content,
        keywords: keywords || title,
        video_url: videoUrl || null,
        status: status
      };

      const blogResponse = await axios.post(`${API}/blogs`, blogData);
      const blogId = blogResponse.data.id;

      // Upload image if selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        await axios.post(`${API}/blogs/${blogId}/upload-image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      // Upload audio if selected
      if (audioFile) {
        const audioFormData = new FormData();
        audioFormData.append('file', audioFile);
        await axios.post(`${API}/blogs/${blogId}/upload-audio`, audioFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      navigate('/shroomsadmin/dashboard');
    } catch (error) {
      console.error('Error saving blog:', error);
      setError('Failed to save blog. Please try again.');
    } finally {
      setSaving(false);
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
            ApeBrain.cloud - Create Blog
          </a>
          <div className="nav-links">
            <a href="/shroomsadmin/dashboard" data-testid="dashboard-link">Dashboard</a>
          </div>
        </div>
      </nav>

      <div className="create-blog-container" data-testid="create-blog-container">
        <h1 style={{ marginBottom: '2rem' }} data-testid="page-title">Create Blog Post</h1>

        {/* Mode Selector */}
        <div className="mode-selector" style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => setMode('ai')}
            className={`btn ${mode === 'ai' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ marginRight: '1rem' }}
            data-testid="ai-mode-button"
          >
            <Sparkles size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
            AI Generate
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`btn ${mode === 'manual' ? 'btn-primary' : 'btn-secondary'}`}
            data-testid="manual-mode-button"
          >
            ✍️ Write Manually
          </button>
        </div>

        {error && <div className="error" data-testid="error-message">{error}</div>}

        {/* AI Mode */}
        {mode === 'ai' && (
          <div>
            <form onSubmit={handleGenerateAI} data-testid="generate-form">
              <div className="form-group">
                <label htmlFor="keywords">Blog Topic / Keywords</label>
                <textarea
                  id="keywords"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g., Forest bathing benefits, Ocean therapy, Meditation techniques"
                  required
                  data-testid="keywords-input"
                  style={{ minHeight: '100px' }}
                />
                <small style={{ color: '#7a9053', marginTop: '0.5rem', display: 'block' }}>
                  Enter any health, nature, or consciousness topic. AI will generate content.
                </small>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !keywords.trim()}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                data-testid="generate-button"
              >
                <Sparkles size={20} />
                {loading ? 'Generating...' : 'Generate with AI'}
              </button>
            </form>

            {loading && (
              <div className="loading" style={{ marginTop: '2rem' }} data-testid="loading-indicator">
                Generating your blog post... This may take a moment.
              </div>
            )}
          </div>
        )}

        {/* Manual Mode */}
        {mode === 'manual' && (
          <div data-testid="manual-form">
            <div className="form-group">
              <label htmlFor="manual-title">Title</label>
              <input
                type="text"
                id="manual-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter blog title"
                required
                data-testid="title-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="manual-keywords">Keywords (optional)</label>
              <input
                type="text"
                id="manual-keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g., mushrooms, health, wellness"
                data-testid="manual-keywords-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="manual-content">Content (Markdown supported)</label>
              <textarea
                id="manual-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your blog content here. You can use Markdown formatting."
                required
                data-testid="content-input"
                style={{ minHeight: '400px' }}
              />
              <small style={{ color: '#7a9053', marginTop: '0.5rem', display: 'block' }}>
                Markdown supported: **bold**, *italic*, # Heading, - List
              </small>
            </div>
          </div>
        )}

        {/* Image Upload Section */}
        {(generatedBlog || (mode === 'manual' && title)) && (
          <div className="form-group" style={{ marginTop: '2rem' }}>
            <label>Blog Image</label>
            <div className="image-upload-section">
              {imagePreview && (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Preview" className="image-preview" data-testid="image-preview" />
                </div>
              )}
              <div style={{ marginTop: '1rem' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                  id="image-upload"
                  data-testid="image-upload-input"
                />
                <label htmlFor="image-upload" className="btn btn-secondary" style={{ cursor: 'pointer', display: 'inline-block' }}>
                  <Upload size={18} /> Choose Image
                </label>
              </div>

              {/* Video URL */}
              <div style={{ marginTop: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>YouTube Video URL (Optional)</label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e8ebe0' }}
                  data-testid="video-url-input"
                />
                <small style={{ color: '#7a9053', display: 'block', marginTop: '0.5rem' }}>
                  Paste a YouTube video URL to embed it in your blog post
                </small>
              </div>

              {/* Audio Upload */}
              <div style={{ marginTop: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Audio File (Optional)</label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setAudioFile(e.target.files[0])}
                  style={{ display: 'none' }}
                  id="audio-upload"
                  data-testid="audio-upload-input"
                />
                <label htmlFor="audio-upload" className="btn btn-secondary" style={{ cursor: 'pointer', display: 'inline-block' }}>
                  <Upload size={18} /> Choose Audio File
                </label>
                {audioFile && (
                  <span style={{ marginLeft: '1rem', color: '#7a9053' }}>
                    {audioFile.name}
                  </span>
                )}
                <small style={{ color: '#7a9053', display: 'block', marginTop: '0.5rem' }}>
                  Upload audio files (MP3, WAV, etc.) for podcasts or audiobooks
                </small>
              </div>
            </div>
          </div>
        )}

        {/* Preview & Save */}
        {((generatedBlog || (mode === 'manual' && content))) && (
          <div className="preview-container" style={{ marginTop: '2rem' }} data-testid="preview-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 data-testid="preview-title">Preview</h2>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                data-testid="toggle-preview-button"
              >
                <Eye size={18} />
                {showPreview ? 'Hide' : 'Show'} Preview
              </button>
            </div>

            {showPreview && (
              <div data-testid="preview-content">
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="preview-image" data-testid="preview-blog-image" />
                )}

                <h1 style={{ marginTop: '1rem' }} data-testid="preview-blog-title">{title}</h1>
                <div style={{ marginTop: '1rem' }} data-testid="preview-blog-content">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                onClick={() => handleSave('draft')}
                className="btn btn-secondary"
                disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                data-testid="save-draft-button"
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save as Draft'}
              </button>
              <button
                onClick={() => handleSave('published')}
                className="btn btn-primary"
                disabled={saving}
                data-testid="publish-button"
              >
                {saving ? 'Publishing...' : 'Publish Now'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateBlog;