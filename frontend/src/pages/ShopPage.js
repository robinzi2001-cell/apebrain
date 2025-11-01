import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Footer from '@/components/Footer';
import { Leaf, Home, Package, Download, ShoppingCart, Plus, Minus, Trash2, Instagram } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FloatingCoupon from '@/components/FloatingCoupon';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ShopPage = () => {
  const [activeTab, setActiveTab] = useState('physical');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setAllProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const physicalProducts = allProducts.filter(p => p.type === 'physical');
  const digitalProducts = allProducts.filter(p => p.type === 'digital');

  const products = activeTab === 'physical' ? physicalProducts : digitalProducts;

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    setShowCart(true);
  };

  const updateQuantity = (productId, change) => {
    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
  };

  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleCheckout = async () => {
    try {
      // Prepare order data
      const orderData = {
        items: cart.map(item => ({
          product_id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          product_type: item.type || 'physical'
        })),
        total: parseFloat(getCartTotal()),
        customer_email: "customer@example.com"  // You can add email input field later
      };

      // Create PayPal order
      const response = await axios.post(`${API}/shop/create-order`, orderData);
      
      if (response.data.approval_url) {
        // Redirect to PayPal
        window.location.href = response.data.approval_url;
      } else {
        alert('Failed to create PayPal order. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error.response?.data?.detail || 'Checkout failed. Please try again.');
    }
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
            <a href="/" data-testid="home-link"><Home size={20} /> Home</a>
            <a href="/blog" data-testid="blog-link">Blog</a>
            <a href="/shop" data-testid="shop-link">Shop</a>
            <a 
              href="https://www.instagram.com/apebrain.cloud" 
              target="_blank" 
              rel="noopener noreferrer"
              data-testid="instagram-link"
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <Instagram size={20} />
            </a>
            <button 
              onClick={() => setShowCart(!showCart)}
              className="btn btn-secondary cart-button"
              data-testid="cart-button"
            >
              <ShoppingCart size={20} />
              {getCartCount() > 0 && (
                <span className="cart-badge">{getCartCount()}</span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <div className="hero" data-testid="shop-hero">
        <h1>Natural Wellness Shop</h1>
        <p>Premium mushroom products & digital resources for your health journey</p>
      </div>

      <div className="shop-container" data-testid="shop-container">
        <div className="shop-tabs">
          <button
            className={`shop-tab ${activeTab === 'physical' ? 'active' : ''}`}
            onClick={() => setActiveTab('physical')}
            data-testid="physical-tab"
          >
            <Package size={20} />
            Physical Products
          </button>
          <button
            className={`shop-tab ${activeTab === 'digital' ? 'active' : ''}`}
            onClick={() => setActiveTab('digital')}
            data-testid="digital-tab"
          >
            <Download size={20} />
            Digital Products
          </button>
        </div>

        <div className="products-grid" data-testid="products-grid">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>Loading products...</div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>No products available</div>
          ) : (
            products.map(product => (
              <div key={product.id} className="product-card" data-testid={`product-${product.id}`}>
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '12px 12px 0 0'
                    }}
                  />
                ) : (
                  <div className="product-image-placeholder">
                    {activeTab === 'physical' ? <Package size={64} /> : <Download size={64} />}
                  </div>
                )}
                <div className="product-info">
                  <span className="product-category">{product.category}</span>
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-footer">
                    <span className="product-price">${product.price.toFixed(2)}</span>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => addToCart(product)}
                      data-testid={`add-to-cart-${product.id}`}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Shopping Cart Sidebar */}
      {showCart && (
        <div className="cart-sidebar" data-testid="cart-sidebar">
          <div className="cart-header">
            <h2><ShoppingCart size={24} /> Your Cart</h2>
            <button onClick={() => setShowCart(false)} className="close-cart">×</button>
          </div>
          
          {cart.length === 0 ? (
            <div className="empty-cart" data-testid="empty-cart">
              <p>Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.id} className="cart-item" data-testid={`cart-item-${item.id}`}>
                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      <p>${item.price.toFixed(2)}</p>
                    </div>
                    <div className="cart-item-controls">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="qty-btn"
                        data-testid={`decrease-qty-${item.id}`}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="qty-btn"
                        data-testid={`increase-qty-${item.id}`}
                      >
                        <Plus size={16} />
                      </button>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="remove-btn"
                        data-testid={`remove-item-${item.id}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="cart-footer">
                <div className="cart-total">
                  <strong>Total:</strong>
                  <strong>${getCartTotal()}</strong>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="btn btn-primary checkout-btn"
                  data-testid="checkout-button"
                >
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {showCart && <div className="cart-overlay" onClick={() => setShowCart(false)}></div>}
      
      <FloatingCoupon />
    </div>
  );
};

export default ShopPage;