import React, { useEffect, useState } from 'react';
import Footer from '@/components/Footer';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Leaf, ArrowLeft, Home } from 'lucide-react';
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

  const getColorTheme = (keywords) => {
    const kw = keywords.toLowerCase();
    if (kw.includes('magic') || kw.includes('psychedelic') || kw.includes('psilocybin')) {
      return { bg: 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)', icon: '#a78bfa' };
    }
    if (kw.includes('forest') || kw.includes('nature') || kw.includes('wild')) {
      return { bg: 'linear-gradient(135deg, #6b7c59 0%, #4a5942 100%)', icon: '#6b7c59' };
    }
    if (kw.includes('ocean') || kw.includes('sea') || kw.includes('water')) {
      return { bg: 'linear-gradient(135deg, #7dd3c0 0%, #4a90a4 100%)', icon: '#7dd3c0' };
    }
    if (kw.includes('energy') || kw.includes('vitality') || kw.includes('boost')) {
      return { bg: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', icon: '#fbbf24' };
    }
    if (kw.includes('calm') || kw.includes('relax') || kw.includes('meditation')) {
      return { bg: 'linear-gradient(135deg, #c7d2fe 0%, #a5b4fc 100%)', icon: '#c7d2fe' };
    }
    return { bg: 'linear-gradient(135deg, #7a9053 0%, #5a6c3a 100%)', icon: '#7a9053' };
  };

  if (loading) {
    return <div className="loading" data-testid="loading-indicator">Loading...</div>;
  }

  if (error || !blog) {
    return (
      <div className="error" style={{ margin: '2rem', textAlign: 'center' }} data-testid="error-message">
        <p>{error || 'Blog not found'}</p>
        <button onClick={() => navigate('/blog')} className="btn btn-primary" style={{ marginTop: '1rem' }} data-testid="back-home-button">
          Back to Blog
        </button>
      </div>
    );
  }

  const theme = getColorTheme(blog.keywords || '');

  return (
    <div>
      <nav className="navbar" data-testid="navbar">
        <div className="navbar-content">
          <a href="/" className="logo" data-testid="logo-link">
            <Leaf size={32} />
            ApeBrain.cloud
          </a>
          <div className="nav-links">
            <a href="/" data-testid="home-link"><Home size={20} /> Home</a>
            <a href="/blog" data-testid="blog-link">Blog</a>
            <a href="/shop" data-testid="shop-link">Shop</a>
          </div>
        </div>
      </nav>

      <div className="blog-detail" data-testid="blog-detail">
        <button
          onClick={() => navigate('/blog')}
          className="btn btn-secondary"
          style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          data-testid="back-button"
        >
          <ArrowLeft size={20} />
          Back to Blogs
        </button>

        {blog.image_url ? (
          <img
            src={blog.image_url}
            alt={blog.title}
            className="blog-detail-image"
            data-testid="blog-detail-image"
          />
        ) : (
          <div 
            className="blog-detail-image"
            style={{ 
              background: theme.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '3rem'
            }}
            data-testid="blog-detail-placeholder"
          >
            <Leaf size={128} />
          </div>
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