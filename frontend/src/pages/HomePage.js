import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await axios.get(`${API}/blogs?status=published`);
      setBlogs(response.data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
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

      <div className="hero" data-testid="hero-section">
        <h1 data-testid="hero-title">Discover the Magic of Mushrooms</h1>
        <p data-testid="hero-subtitle">
          Explore the fascinating world of mycology and unlock the health benefits of nature's most powerful fungi
        </p>
      </div>

      {loading ? (
        <div className="loading" data-testid="loading-indicator">Loading blogs...</div>
      ) : (
        <div className="blog-grid" data-testid="blog-grid">
          {blogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', gridColumn: '1 / -1' }} data-testid="no-blogs">
              <p>No blog posts yet. Check back soon!</p>
            </div>
          ) : (
            blogs.map((blog) => (
              <div
                key={blog.id}
                className="blog-card"
                onClick={() => navigate(`/blog/${blog.id}`)}
                data-testid={`blog-card-${blog.id}`}
              >
                {blog.image_base64 ? (
                  <img
                    src={`data:image/png;base64,${blog.image_base64}`}
                    alt={blog.title}
                    className="blog-card-image"
                    data-testid={`blog-image-${blog.id}`}
                  />
                ) : (
                  <div 
                    className="blog-card-image"
                    style={{ 
                      background: 'linear-gradient(135deg, #7a9053 0%, #5a6c3a 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1.2rem'
                    }}
                    data-testid={`blog-placeholder-${blog.id}`}
                  >
                    <Leaf size={64} />
                  </div>
                )}
                <div className="blog-card-content">
                  <h3 data-testid={`blog-title-${blog.id}`}>{blog.title}</h3>
                  <div className="blog-card-meta" data-testid={`blog-date-${blog.id}`}>
                    {formatDate(blog.published_at || blog.created_at)}
                  </div>
                  <p data-testid={`blog-excerpt-${blog.id}`}>
                    {blog.content.substring(0, 150)}...
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;