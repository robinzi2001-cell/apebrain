import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Leaf, Sparkles, Save, Eye } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CreateBlog = () => {
  const [keywords, setKeywords] = useState('');
  const [generatedBlog, setGeneratedBlog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('adminAuth')) {
      navigate('/admin');
    }
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setGeneratedBlog(null);

    try {
      const response = await axios.post(`${API}/blogs/generate`, { keywords });
      setGeneratedBlog(response.data);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating blog:', error);
      setError('Failed to generate blog. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (status = 'draft') => {
    if (!generatedBlog) return;

    setSaving(true);
    try {
      const blogData = {
        title: generatedBlog.title,
        content: generatedBlog.content,
        keywords: keywords,
        image_base64: generatedBlog.image_base64,
        status: status
      };

      await axios.post(`${API}/blogs`, blogData);
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error saving blog:', error);
      setError('Failed to save blog. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <nav className="navbar" data-testid="navbar">
        <div className="navbar-content">
          <a href="/admin/dashboard" className="logo" data-testid="logo-link">
            <Leaf size={32} />
            ApeBrain.cloud - Create Blog
          </a>
          <div className="nav-links">
            <a href="/admin/dashboard" data-testid="dashboard-link">Dashboard</a>
          </div>
        </div>
      </nav>

      <div className="create-blog-container" data-testid="create-blog-container">
        <h1 style={{ marginBottom: '2rem' }} data-testid="page-title">Create AI-Generated Blog Post</h1>

        {error && <div className="error" data-testid="error-message">{error}</div>}

        <form onSubmit={handleGenerate} data-testid="generate-form">
          <div className="form-group">
            <label htmlFor="keywords">Blog Topic / Keywords</label>
            <textarea
              id="keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g., Lion's Mane mushroom benefits for brain health"
              required
              data-testid="keywords-input"
              style={{ minHeight: '100px' }}
            />
            <small style={{ color: '#7a9053', marginTop: '0.5rem', display: 'block' }}>
              Enter a mushroom name, topic, or specific keywords. The AI will generate a comprehensive blog post.
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
            {loading ? 'Generating...' : 'Generate Blog with AI'}
          </button>
        </form>

        {loading && (
          <div className="loading" style={{ marginTop: '2rem' }} data-testid="loading-indicator">
            Generating your blog post... This may take a moment.
          </div>
        )}

        {generatedBlog && (
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
                {generatedBlog.image_base64 && (
                  <img
                    src={`data:image/png;base64,${generatedBlog.image_base64}`}
                    alt={generatedBlog.title}
                    className="preview-image"
                    data-testid="preview-image"
                  />
                )}

                <h1 style={{ marginTop: '1rem' }} data-testid="preview-blog-title">{generatedBlog.title}</h1>
                <div style={{ marginTop: '1rem' }} data-testid="preview-blog-content">
                  <ReactMarkdown>{generatedBlog.content}</ReactMarkdown>
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

import { useEffect } from 'react';

export default CreateBlog;