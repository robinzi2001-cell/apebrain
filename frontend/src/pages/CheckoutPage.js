import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Leaf, ShoppingCart, CreditCard, Mail } from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const PAYPAL_CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID || 'test';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [email, setEmail] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (location.state?.cart && location.state?.total) {
      setCart(location.state.cart);
      const subtotalAmount = parseFloat(location.state.total);
      setSubtotal(subtotalAmount);
      setTotal(subtotalAmount);
    } else {
      navigate('/shop');
    }
  }, [location, navigate]);

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setApplyingCoupon(true);
    setCouponError('');

    try {
      const response = await axios.post(`${API}/coupons/validate`, null, {
        params: {
          code: couponCode.toUpperCase(),
          subtotal: subtotal
        }
      });

      if (response.data.valid) {
        setAppliedCoupon(response.data);
        const newTotal = subtotal - response.data.discount_amount;
        setTotal(newTotal);
        setCouponError('');
      }
    } catch (error) {
      setCouponError(error.response?.data?.detail || 'Invalid coupon code');
      setAppliedCoupon(null);
      setTotal(subtotal);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setTotal(subtotal);
    setCouponError('');
  };

  const createOrder = async () => {
    if (!email) {
      setError('Please enter your email address');
      return null;
    }

    setProcessing(true);
    setError('');

    try {
      const orderData = {
        items: cart.map(item => ({
          product_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          product_type: item.type
        })),
        total: total,
        customer_email: email,
        coupon_code: appliedCoupon ? appliedCoupon.code : null
      };

      const response = await axios.post(`${API}/shop/create-order`, orderData);
      
      if (response.data.success && response.data.approval_url) {
        window.location.href = response.data.approval_url;
        return response.data.payment_id;
      } else {
        throw new Error('No approval URL returned');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      setError(error.response?.data?.detail || 'Failed to create order. Please check PayPal configuration.');
      setProcessing(false);
      return null;
    }
  };

  if (cart.length === 0) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <nav className="navbar" data-testid="navbar">
        <div className="navbar-content">
          <a href="/" className="logo" data-testid="logo-link">
            <Leaf size={32} />
            ApeBrain.cloud
          </a>
        </div>
      </nav>

      <div className="checkout-container" data-testid="checkout-container">
        <h1 className="checkout-title">
          <CreditCard size={32} />
          Checkout
        </h1>

        <div className="checkout-grid">
          <div className="checkout-section">
            <h2>Order Summary</h2>
            <div className="order-items">
              {cart.map(item => (
                <div key={item.id} className="order-item" data-testid={`order-item-${item.id}`}>
                  <div>
                    <h4>{item.name}</h4>
                    <p>Quantity: {item.quantity}</p>
                  </div>
                  <div className="order-item-price">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div className="order-total">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  color: '#4caf50',
                  marginBottom: '0.5rem',
                  fontSize: '0.95rem'
                }}>
                  <span>Coupon ({appliedCoupon.code}):</span>
                  <span>-${appliedCoupon.discount_amount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                paddingTop: '0.5rem',
                borderTop: '2px solid #e8ebe0',
                fontSize: '1.3rem'
              }}>
                <strong>Total:</strong>
                <strong>${total.toFixed(2)}</strong>
              </div>
            </div>
          </div>

          <div className="checkout-section">
            <h2>Customer Information</h2>
            {error && <div className="error" data-testid="error-message">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="email">
                <Mail size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                data-testid="email-input"
              />
              <small style={{ color: '#7a9053', marginTop: '0.5rem', display: 'block' }}>
                We'll send your order confirmation here
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="coupon">
                <ShoppingCart size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Coupon Code (Optional)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  id="coupon"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  disabled={applyingCoupon || appliedCoupon}
                  data-testid="coupon-input"
                  style={{ flex: 1 }}
                />
                {!appliedCoupon ? (
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={applyingCoupon || !couponCode.trim()}
                    className="coupon-apply-btn"
                    data-testid="apply-coupon-button"
                  >
                    {applyingCoupon ? 'Applying...' : 'Apply'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="coupon-remove-btn"
                    data-testid="remove-coupon-button"
                  >
                    Remove
                  </button>
                )}
              </div>
              {couponError && (
                <small style={{ color: '#dc3545', marginTop: '0.5rem', display: 'block' }}>
                  {couponError}
                </small>
              )}
              {appliedCoupon && (
                <small style={{ color: '#4caf50', marginTop: '0.5rem', display: 'block' }}>
                  ✓ Coupon "{appliedCoupon.code}" applied! You saved ${appliedCoupon.discount_amount.toFixed(2)}
                </small>
              )}
            </div>

            <div className="payment-section">
              <h3>Payment Method</h3>
              <button
                onClick={createOrder}
                disabled={processing || !email}
                className="paypal-checkout-btn"
                data-testid="paypal-checkout-button"
              >
                {processing ? 'Processing...' : 'Pay with PayPal'}
              </button>
              
              <div style={{ marginTop: '1rem', textAlign: 'center', color: '#7a9053' }}>
                <small>
                  🔒 Secure payment powered by PayPal<br/>
                  You'll be redirected to PayPal to complete your purchase
                </small>
              </div>
            </div>

            {PAYPAL_CLIENT_ID === 'test' && (
              <div style={{ 
                marginTop: '2rem', 
                padding: '1rem', 
                background: 'rgba(251, 191, 36, 0.1)', 
                borderRadius: '8px',
                border: '2px solid rgba(251, 191, 36, 0.3)'
              }}>
                <strong>⚠️ PayPal Not Configured</strong>
                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  To enable payments, add your PayPal credentials to the backend .env file:
                </p>
                <ul style={{ fontSize: '0.85rem', marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                  <li>PAYPAL_CLIENT_ID</li>
                  <li>PAYPAL_CLIENT_SECRET</li>
                </ul>
                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  See PAYMENT_INTEGRATION.md for setup instructions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;