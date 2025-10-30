import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Leaf, Plus, Trash2, Eye, Edit, Settings, Tag } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('adminAuth')) {
      navigate('/shroomsadmin');
      return;
    }
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await axios.get(`${API}/blogs?status=`);
      setBlogs(response.data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;

    try {
      await axios.delete(`${API}/blogs/${id}`);
      fetchBlogs();
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Failed to delete blog');
    }
  };

  const handlePublish = async (id) => {
    try {
      await axios.post(`${API}/blogs/${id}/publish`);
      fetchBlogs();
    } catch (error) {
      console.error('Error publishing blog:', error);
      alert('Failed to publish blog');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/shroomsadmin');
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
            ApeBrain.cloud - Admin
          </a>
          <div className="nav-links">
            <a href="/" data-testid="home-link">View Site</a>
            <button 
              onClick={() => navigate('/shroomsadmin/settings')} 
              className="btn btn-secondary" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              data-testid="settings-button"
            >
              <Settings size={18} />
              Settings
            </button>
            <button onClick={handleLogout} className="btn btn-secondary" data-testid="logout-button">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="admin-dashboard" data-testid="admin-dashboard">
        <div className="dashboard-header">
          <h1 data-testid="dashboard-title">Blog Management</h1>
          <button
            onClick={() => navigate('/shroomsadmin/create')}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            data-testid="create-blog-button"
          >
            <Plus size={20} />
            Create New Blog
          </button>
        </div>

        {loading ? (
          <div className="loading" data-testid="loading-indicator">Loading blogs...</div>
        ) : (
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            {blogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem' }} data-testid="no-blogs">
                <p>No blog posts yet. Create your first blog!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} data-testid="blog-list">
                {blogs.map((blog) => (
                  <div
                    key={blog.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1.5rem',
                      border: '2px solid #e8ebe0',
                      borderRadius: '12px',
                      transition: 'all 0.3s'
                    }}
                    data-testid={`blog-item-${blog.id}`}
                  >
                    <div style={{ flex: 1 }}>
                      <h3 style={{ marginBottom: '0.5rem' }} data-testid={`blog-item-title-${blog.id}`}>{blog.title}</h3>
                      <div style={{ fontSize: '0.9rem', color: '#7a9053' }} data-testid={`blog-item-meta-${blog.id}`}>
                        {formatDate(blog.created_at)} • Status: <strong>{blog.status}</strong>
                        {!blog.image_url && <span style={{ color: '#f59e0b', marginLeft: '0.5rem' }}>⚠ No image</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      {blog.status === 'draft' && (
                        <button
                          onClick={() => handlePublish(blog.id)}
                          className="btn btn-primary"
                          data-testid={`publish-button-${blog.id}`}
                        >
                          Publish
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/shroomsadmin/edit/${blog.id}`)}
                        className="btn btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        data-testid={`edit-button-${blog.id}`}
                      >
                        <Edit size={18} />
                        Edit
                      </button>
                      <button
                        onClick={() => navigate(`/blog/${blog.id}`)}
                        className="btn btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        data-testid={`view-button-${blog.id}`}
                      >
                        <Eye size={18} />
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        className="btn btn-danger"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        data-testid={`delete-button-${blog.id}`}
                      >
                        <Trash2 size={18} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;