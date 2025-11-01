import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Leaf, CheckCircle } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState('');
  const hasExecuted = useRef(false);

  useEffect(() => {
    const paymentId = searchParams.get('paymentId');
    const payerId = searchParams.get('PayerID');

    if (paymentId && payerId && !hasExecuted.current) {
      hasExecuted.current = true;
      executePayment(paymentId, payerId);
    } else if (!paymentId || !payerId) {
      setError('Payment information missing');
      setProcessing(false);
    }
  }, [searchParams]);

  const executePayment = async (paymentId, payerId) => {
    try {
      await axios.post(`${API}/shop/execute-payment`, null, {
        params: { payment_id: paymentId, payer_id: payerId }
      });
      setProcessing(false);
    } catch (error) {
      console.error('Payment execution error:', error);
      setError('Failed to complete payment');
      setProcessing(false);
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
        </div>
      </nav>

      <div className="payment-result-container" data-testid="payment-success-container">
        {processing ? (
          <div className="processing">
            <div className="spinner"></div>
            <h2>Processing your payment...</h2>
            <p>Please wait while we confirm your order</p>
          </div>
        ) : error ? (
          <div className="payment-error">
            <h2>Payment Error</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/shop')} className="btn btn-primary">
              Return to Shop
            </button>
          </div>
        ) : (
          <div className="payment-success" data-testid="success-message">
            <CheckCircle size={80} color="#4caf50" />
            <h1>Payment Successful!</h1>
            <p>Thank you for your purchase. You'll receive a confirmation email shortly.</p>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={() => navigate('/')} className="btn btn-secondary">
                Go to Home
              </button>
              <button onClick={() => navigate('/shop')} className="btn btn-primary">
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;