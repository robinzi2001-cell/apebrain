import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Leaf, Package, Plus, Edit, Trash2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    price: 0,
    description: '',
    category: '',
    type: 'physical',
    image_url: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('adminAuth')) {
      navigate('/shroomsadmin');
      return;
    }
    fetchProducts();
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      let productId = formData.id;
      
      if (editingProduct) {
        await axios.put(`${API}/products/${editingProduct.id}`, formData);
        setSuccess('Product updated successfully!');
      } else {
        const response = await axios.post(`${API}/products`, formData);
        productId = response.data.id || formData.id;
        setSuccess('Product created successfully!');
      }

      // Upload image if provided
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('file', imageFile);
        
        try {
          await axios.post(`${API}/products/${productId}/upload-image`, imageFormData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          setSuccess(prev => prev + ' Image uploaded!');
        } catch (imgError) {
          console.error('Image upload error:', imgError);
          setError('Product saved but image upload failed');
        }
      }
      
      setShowForm(false);
      setEditingProduct(null);
      setFormData({ id: '', name: '', price: 0, description: '', category: '', type: 'physical', image_url: '' });
      setImageFile(null);
      setImagePreview('');
      fetchProducts();
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData(product);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;

    try {
      await axios.delete(`${API}/products/${id}`);
      fetchProducts();
      setSuccess('Product deleted!');
    } catch (error) {
      setError('Failed to delete product');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/shroomsadmin');
  };

  return (
    <div>
      <nav className="navbar" data-testid="navbar">
        <div className="navbar-content">
          <a href="/" className="logo" data-testid="logo-link">
            <Leaf size={32} />
            ApeBrain.cloud - Products
          </a>
          <div className="nav-links">
            <a href="/shroomsadmin/dashboard" data-testid="dashboard-link">Dashboard</a>
            <button onClick={handleLogout} className="btn btn-secondary" data-testid="logout-button">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="admin-dashboard" data-testid="admin-products">
        <div className="dashboard-header">
          <h1><Package size={32} style={{ display: 'inline', marginRight: '1rem' }} />Product Management</h1>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingProduct(null);
              setFormData({ id: '', name: '', price: 0, description: '', category: '', type: 'physical' });
            }}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            data-testid="create-product-button"
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>

        {error && <div className="error" data-testid="error-message">{error}</div>}
        {success && <div className="success" data-testid="success-message">{success}</div>}

        {showForm && (
          <div className="coupon-form-container" data-testid="product-form">
            <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product ID</label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  placeholder="e.g., phys-1"
                  required
                  disabled={!!editingProduct}
                  data-testid="id-input"
                />
              </div>

              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Lion's Mane Extract"
                  required
                  data-testid="name-input"
                />
              </div>

              <div className="form-group">
                <label>Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  required
                  data-testid="price-input"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description"
                  required
                  data-testid="description-input"
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Supplements"
                  required
                  data-testid="category-input"
                />
              </div>

              <div className="form-group">
                <label>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  data-testid="type-select"
                >
                  <option value="physical">Physical Product</option>
                  <option value="digital">Digital Product</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" data-testid="save-product-button">
                  {editingProduct ? 'Update' : 'Create'} Product
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduct(null);
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
          <div className="loading">Loading products...</div>
        ) : (
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginTop: '2rem' }}>
            {products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem' }} data-testid="no-products">
                <p>No products yet. Add your first one!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} data-testid="product-list">
                {products.map((product) => (
                  <div
                    key={product.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1.5rem',
                      border: '2px solid #e8ebe0',
                      borderRadius: '12px'
                    }}
                    data-testid={`product-item-${product.id}`}
                  >
                    <div style={{ flex: 1 }}>
                      <h3 style={{ marginBottom: '0.5rem' }}>{product.name}</h3>
                      <div style={{ fontSize: '0.9rem', color: '#5a6c3a' }}>
                        ${product.price.toFixed(2)} • {product.category} • {product.type}
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#7a9053', marginTop: '0.5rem' }}>
                        {product.description}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleEdit(product)}
                        className="btn btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        data-testid={`edit-button-${product.id}`}
                      >
                        <Edit size={18} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="btn btn-danger"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        data-testid={`delete-button-${product.id}`}
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

export default AdminProducts;