import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Leaf, Tag, Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: 0,
    is_active: true
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('adminAuth')) {
      navigate('/shroomsadmin');
      return;
    }
    fetchCoupons();
  }, [navigate]);

  const fetchCoupons = async () => {
    try {
      const response = await axios.get(`${API}/coupons`);
      setCoupons(response.data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingCoupon) {
        await axios.put(`${API}/coupons/${editingCoupon.id}`, formData);
        setSuccess('Coupon updated successfully!');
      } else {
        await axios.post(`${API}/coupons`, formData);
        setSuccess('Coupon created successfully!');
      }
      
      setShowForm(false);
      setEditingCoupon(null);
      setFormData({ code: '', discount_type: 'percentage', discount_value: 0, is_active: true });
      fetchCoupons();
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to save coupon');
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      is_active: coupon.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;

    try {
      await axios.delete(`${API}/coupons/${id}`);
      fetchCoupons();
      setSuccess('Coupon deleted!');
    } catch (error) {
      setError('Failed to delete coupon');
    }
  };

  const toggleActive = async (coupon) => {
    try {
      await axios.put(`${API}/coupons/${coupon.id}`, { is_active: !coupon.is_active });
      fetchCoupons();
    } catch (error) {
      setError('Failed to update coupon');
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
          <a href="/" className="logo" data-testid="logo-link">
            <Leaf size={32} />
            ApeBrain.cloud - Coupons
          </a>
          <div className="nav-links">
            <a href="/shroomsadmin/dashboard" data-testid="dashboard-link">Dashboard</a>
            <button onClick={handleLogout} className="btn btn-secondary" data-testid="logout-button">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="admin-dashboard" data-testid="admin-coupons">
        <div className="dashboard-header">
          <h1><Tag size={32} style={{ display: 'inline', marginRight: '1rem' }} />Coupon Management</h1>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingCoupon(null);
              setFormData({ code: '', discount_type: 'percentage', discount_value: 0, is_active: true });
            }}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            data-testid="create-coupon-button"
          >
            <Plus size={20} />
            Create Coupon
          </button>
        </div>

        {error && <div className="error" data-testid="error-message">{error}</div>}
        {success && <div className="success" data-testid="success-message">{success}</div>}

        {showForm && (
          <div className="coupon-form-container" data-testid="coupon-form">
            <h2>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Coupon Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., SAVE20"
                  required
                  data-testid="code-input"
                />
              </div>

              <div className="form-group">
                <label>Discount Type</label>
                <select
                  value={formData.discount_type}
                  onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                  data-testid="discount-type-select"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Discount Value</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
                  required
                  data-testid="discount-value-input"
                />
                <small style={{ color: '#7a9053' }}>
                  {formData.discount_type === 'percentage' ? 'Enter percentage (e.g., 20 for 20%)' : 'Enter dollar amount (e.g., 10 for $10)'}
                </small>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label style={{ marginBottom: 0 }}>Active</label>
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  data-testid="is-active-checkbox"
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" data-testid="save-coupon-button">
                  {editingCoupon ? 'Update' : 'Create'} Coupon
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCoupon(null);
                  }}
                  className="btn btn-secondary"
                  data-testid="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading coupons...</div>
        ) : (
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginTop: '2rem' }}>
            {coupons.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem' }} data-testid="no-coupons">
                <p>No coupons yet. Create your first one!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} data-testid="coupon-list">
                {coupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1.5rem',
                      border: coupon.is_active ? '2px solid #7a9053' : '2px solid #e8ebe0',
                      borderRadius: '12px',
                      background: coupon.is_active ? 'rgba(122, 144, 83, 0.05)' : 'transparent'
                    }}
                    data-testid={`coupon-item-${coupon.id}`}
                  >
                    <div style={{ flex: 1 }}>
                      <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontFamily: 'monospace', background: '#ffc439', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                          {coupon.code}
                        </span>
                        {coupon.is_active ? (
                          <span style={{ color: '#4caf50', fontSize: '0.9rem' }}>● ACTIVE</span>
                        ) : (
                          <span style={{ color: '#999', fontSize: '0.9rem' }}>○ Inactive</span>
                        )}
                      </h3>
                      <div style={{ fontSize: '0.9rem', color: '#5a6c3a' }}>
                        Discount: {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `$${coupon.discount_value}`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => toggleActive(coupon)}
                        className="btn btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        data-testid={`toggle-active-${coupon.id}`}
                      >
                        {coupon.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        {coupon.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleEdit(coupon)}
                        className="btn btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        data-testid={`edit-button-${coupon.id}`}
                      >
                        <Edit size={18} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="btn btn-danger"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        data-testid={`delete-button-${coupon.id}`}
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

export default AdminCoupons;