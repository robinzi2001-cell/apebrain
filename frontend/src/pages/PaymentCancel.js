import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, XCircle } from 'lucide-react';

const PaymentCancel = () => {
  const navigate = useNavigate();

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

      <div className="payment-result-container" data-testid="payment-cancel-container">
        <div className="payment-cancelled">
          <XCircle size={80} color="#f59e0b" />
          <h1>Payment Cancelled</h1>
          <p>Your payment was cancelled. No charges were made.</p>
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={() => navigate('/shop')} className="btn btn-primary">
              Return to Shop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;