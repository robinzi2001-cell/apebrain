import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Package, LogOut, Mail, Calendar } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchUserData();
    fetchOrders();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.get(`${API}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.get(`${API}/auth/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#fbbf24',
      'paid': '#10b981',
      'packed': '#3b82f6',
      'shipped': '#8b5cf6',
      'in_transit': '#ec4899',
      'delivered': '#059669',
      'cancelled': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusText = (status) => {
    const texts = {
      'pending': 'Ausstehend',
      'paid': 'Bezahlt',
      'packed': 'Verpackt',
      'shipped': 'Versandt',
      'in_transit': 'Unterwegs',
      'delivered': 'Zugestellt',
      'cancelled': 'Storniert'
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '2rem' }}>🍄</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/" style={{ fontSize: '2rem', textDecoration: 'none' }}>🍄</Link>
            <h1 style={{ color: '#3a4520', fontSize: '1.5rem', margin: 0 }}>Mein Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            <LogOut size={18} />
            Abmelden
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* User Info */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#3a4520', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={24} />
            Benutzerprofil
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div>
              <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                <Mail size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                E-Mail
              </div>
              <div style={{ color: '#3a4520', fontWeight: '600' }}>{user?.email}</div>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Name</div>
              <div style={{ color: '#3a4520', fontWeight: '600' }}>
                {user?.first_name || user?.last_name ? `${user?.first_name || ''} ${user?.last_name || ''}` : '-'}
              </div>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                <Calendar size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Mitglied seit
              </div>
              <div style={{ color: '#3a4520', fontWeight: '600' }}>
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('de-DE') : '-'}
              </div>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#3a4520', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={24} />
            Meine Bestellungen ({orders.length})
          </h2>

          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
              <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p>Noch keine Bestellungen</p>
              <Link to="/shop" style={{ color: '#7a9053', textDecoration: 'none', fontWeight: '600' }}>
                Jetzt einkaufen →
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {orders.map(order => (
                <div key={order.id} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ color: '#3a4520', fontWeight: '600', marginBottom: '0.25rem' }}>
                        Bestellung #{order.id.slice(0, 8)}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                        {new Date(order.created_at).toLocaleDateString('de-DE', { 
                          day: '2-digit', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </div>
                    </div>
                    <div style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      background: `${getStatusColor(order.status)}20`,
                      color: getStatusColor(order.status),
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}>
                      {getStatusText(order.status)}
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    {order.items.map((item, idx) => (
                      <div key={idx} style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        {item.quantity}x {item.name} - ${item.price.toFixed(2)}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
                    <div style={{ color: '#3a4520', fontWeight: '600' }}>
                      Gesamt: ${order.total?.toFixed(2) || '0.00'}
                    </div>
                    {order.tracking_number && (
                      <a 
                        href={order.tracking_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#7a9053',
                          textDecoration: 'none',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}
                      >
                        📦 Sendung verfolgen →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
