import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Leaf, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BlogPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    try {
      const response = await axios.get(`${API}/blogs/${id}`);
      setBlog(response.data);
    } catch (error) {
      console.error('Error fetching blog:', error);
      setError('Blog not found');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="loading" data-testid="loading-indicator">Loading...</div>;
  }

  if (error || !blog) {
    return (
      <div className="error" style={{ margin: '2rem', textAlign: 'center' }} data-testid="error-message">
        <p>{error || 'Blog not found'}</p>
        <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: '1rem' }} data-testid="back-home-button">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div>
      <nav className="navbar" data-testid="navbar">
        <div className="navbar-content">
          <a href="/" className="logo" data-testid="logo-link">
            <Leaf size={32} />
            ApeBrain.cloud
          </a>
          <div className="nav-links">
            <a href="/" data-testid="home-link">Home</a>
            <a href="/admin" data-testid="admin-link">Admin</a>
          </div>
        </div>
      </nav>

      <div className="blog-detail" data-testid="blog-detail">
        <button
          onClick={() => navigate('/')}
          className="btn btn-secondary"
          style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          data-testid="back-button"
        >
          <ArrowLeft size={20} />
          Back to Blogs
        </button>

        {blog.image_base64 && (
          <img
            src={`data:image/png;base64,${blog.image_base64}`}
            alt={blog.title}
            className="blog-detail-image"
            data-testid="blog-detail-image"
          />
        )}

        <h1 data-testid="blog-detail-title">{blog.title}</h1>
        <div className="blog-detail-meta" data-testid="blog-detail-meta">
          Published on {formatDate(blog.published_at || blog.created_at)}
        </div>

        <div className="blog-detail-content" data-testid="blog-detail-content">
          <ReactMarkdown>{blog.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;