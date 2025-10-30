import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Leaf, Save, Upload, Eye, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const EditBlog = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [keywords, setKeywords] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('adminAuth')) {
      navigate('/blogadmin');
      return;
    }
    fetchBlog();
  }, [id, navigate]);

  const fetchBlog = async () => {
    try {
      const response = await axios.get(`${API}/blogs/${id}`);
      setBlog(response.data);
      setTitle(response.data.title);
      setContent(response.data.content);
      setKeywords(response.data.keywords);
      setImagePreview(response.data.image_url || '');
    } catch (error) {
      console.error('Error fetching blog:', error);
      setError('Failed to load blog');
    } finally {
      setLoading(false);
    }
  };

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

  const handleImageUpload = async () => {
    if (!imageFile) return;

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const response = await axios.post(`${API}/blogs/${id}/upload-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setImagePreview(response.data.image_url);
      setSuccess('Image uploaded successfully!');
      setImageFile(null);
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await axios.put(`${API}/blogs/${id}`, {
        title,
        content,
        keywords
      });

      setSuccess('Blog updated successfully!');
      setTimeout(() => {
        navigate('/blogadmin/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error updating blog:', error);
      setError('Failed to update blog');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <nav className="navbar" data-testid="navbar">
        <div className="navbar-content">
          <a href="/blogadmin/dashboard" className="logo" data-testid="logo-link">
            <Leaf size={32} />
            ApeBrain.cloud - Edit Blog
          </a>
          <div className="nav-links">
            <a href="/blogadmin/dashboard" data-testid="dashboard-link">Dashboard</a>
          </div>
        </div>
      </nav>

      <div className="create-blog-container" data-testid="edit-blog-container">
        <h1 style={{ marginBottom: '2rem' }} data-testid="page-title">Edit Blog Post</h1>

        {error && <div className="error" data-testid="error-message">{error}</div>}
        {success && <div className="success" data-testid="success-message">{success}</div>}

        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            data-testid="title-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="keywords">Keywords</label>
          <input
            type="text"
            id="keywords"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            data-testid="keywords-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Content (Markdown)</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ minHeight: '300px' }}
            data-testid="content-input"
          />
        </div>

        <div className="form-group">
          <label>Blog Image</label>
          <div className="image-upload-section">
            {imagePreview && (
              <div className="image-preview-container">
                <img src={imagePreview} alt="Preview" className="image-preview" data-testid="image-preview" />
                <button
                  onClick={() => {
                    setImagePreview('');
                    setImageFile(null);
                  }}
                  className="btn btn-secondary"
                  style={{ marginTop: '0.5rem' }}
                  data-testid="remove-image-button"
                >
                  <X size={18} /> Remove Image
                </button>
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
              {imageFile && (
                <button
                  onClick={handleImageUpload}
                  className="btn btn-primary"
                  disabled={uploading}
                  style={{ marginLeft: '1rem' }}
                  data-testid="upload-image-button"
                >
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button
            onClick={handleSave}
            className="btn btn-primary"
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            data-testid="save-button"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
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
          <div className="preview-container" style={{ marginTop: '2rem' }} data-testid="preview-container">
            <h2>Preview</h2>
            {imagePreview && <img src={imagePreview} alt="Preview" className="preview-image" />}
            <h1 style={{ marginTop: '1rem' }}>{title}</h1>
            <div style={{ marginTop: '1rem' }}>
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditBlog;