import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Leaf, ShoppingBag, LogOut, LayoutDashboard, Package, Tag, Settings, CheckCircle, Clock, X, Trash2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, completed, pending, cancelled
  const [expandedOrder, setExpandedOrder] = useState(null); // For tracking input
  const [trackingInput, setTrackingInput] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('adminAuth')) {
      navigate('/shroomsadmin');
      return;
    }
    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders`);
      setOrders(response.data);
      
      // Mark all as viewed
      response.data.forEach(order => {
        if (!order.viewed && order.status === 'completed') {
          axios.post(`${API}/orders/${order.id}/mark-viewed`).catch(err => console.error(err));
        }
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/shroomsadmin');
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Bestellung wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return;
    }

    try {
      await axios.delete(`${API}/orders/${orderId}`);
      setOrders(orders.filter(order => order.id !== orderId));
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Fehler beim Löschen der Bestellung');
    }
  };

  const handleChangeStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API}/orders/${orderId}/status?status=${newStatus}`);
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Fehler beim Ändern des Status');
    }
  };

  const handleAddTracking = async (orderId, trackingNumber, carrier) => {
    try {
      const response = await axios.put(
        `${API}/orders/${orderId}/tracking?tracking_number=${trackingNumber}&shipping_carrier=${carrier}`
      );
      
      // Update order in state
      setOrders(orders.map(order => 
        order.id === orderId ? { 
          ...order, 
          tracking_number: trackingNumber,
          shipping_carrier: carrier,
          tracking_url: response.data.tracking_url,
          status: 'shipped'
        } : order
      ));
      
      alert('Tracking-Info hinzugefügt und Kunde benachrichtigt!');
    } catch (error) {
      console.error('Error adding tracking:', error);
      alert('Fehler beim Hinzufügen der Tracking-Info');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle size={20} color="#22c55e" />;
      case 'pending': return <Clock size={20} color="#f59e0b" />;
      case 'cancelled': return <X size={20} color="#ef4444" />;
      default: return null;
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  // Prevent rendering if not authenticated
  if (!localStorage.getItem('adminAuth')) {
    return null;
  }

  return (
    <div>
      <nav className="navbar" data-testid="navbar">
        <div className="navbar-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Leaf size={32} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>apebrain</h1>
          </div>
          <div className="nav-links">
            <a href="/shroomsadmin/dashboard" data-testid="dashboard-link">
              <LayoutDashboard size={18} /> Dashboard
            </a>
            <a href="/shroomsadmin/products" data-testid="products-link">
              <Package size={18} /> Products
            </a>
            <a href="/shroomsadmin/coupons" data-testid="coupons-link">
              <Tag size={18} /> Coupons
            </a>
            <a href="/shroomsadmin/orders" data-testid="orders-link" style={{ color: '#7a9053', fontWeight: 'bold' }}>
              <ShoppingBag size={18} /> Orders
            </a>
            <a href="/shroomsadmin/settings" data-testid="settings-link">
              <Settings size={18} /> Settings
            </a>
            <button onClick={handleLogout} className="btn btn-secondary" data-testid="logout-button">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="admin-container" data-testid="admin-container">
        <h1 style={{ marginTop: '1rem' }} data-testid="page-title">Bestellungen</h1>

        {/* Filter */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', marginBottom: '2rem' }}>
          <button
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'btn btn-primary' : 'btn btn-secondary'}
          >
            Alle ({orders.length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={filter === 'completed' ? 'btn btn-primary' : 'btn btn-secondary'}
          >
            Abgeschlossen ({orders.filter(o => o.status === 'completed' || o.status === 'paid').length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={filter === 'pending' ? 'btn btn-primary' : 'btn btn-secondary'}
          >
            Ausstehend ({orders.filter(o => o.status === 'pending').length})
          </button>
        </div>

        {loading ? (
          <div>Lade Bestellungen...</div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#7a9053' }}>
            <ShoppingBag size={64} style={{ margin: '0 auto 1rem' }} />
            <p>Keine Bestellungen gefunden</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                style={{
                  padding: '1.5rem',
                  border: '2px solid #e8ebe0',
                  borderRadius: '12px',
                  background: order.viewed ? 'white' : 'rgba(122, 144, 83, 0.05)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      {getStatusIcon(order.status)}
                      <strong>Bestellung #{order.id.substring(0, 8)}</strong>
                      {!order.viewed && order.status === 'completed' && (
                        <span style={{ 
                          background: '#ef4444', 
                          color: 'white', 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '4px', 
                          fontSize: '0.75rem' 
                        }}>
                          NEU
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#7a9053' }}>
                      {formatDate(order.created_at)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3a4520' }}>
                      €{order.total.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#7a9053' }}>
                      {order.customer_email}
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #e8ebe0', paddingTop: '1rem' }}>
                  <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Produkte:</strong>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      padding: '0.5rem 0',
                      fontSize: '0.9rem'
                    }}>
                      <span>{item.name} x {item.quantity}</span>
                      <span>€{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {order.payment_id && (
                  <div style={{ 
                    marginTop: '1rem', 
                    paddingTop: '1rem', 
                    borderTop: '1px solid #e8ebe0', 
                    fontSize: '0.85rem', 
                    color: '#7a9053' 
                  }}>
                    <strong>PayPal ID:</strong> {order.payment_id}
                  </div>
                )}

                {/* Tracking Info Display */}
                {order.tracking_number && (
                  <div style={{ 
                    marginTop: '1rem', 
                    paddingTop: '1rem', 
                    borderTop: '1px solid #e8ebe0',
                    background: 'rgba(122, 144, 83, 0.05)',
                    padding: '1rem',
                    borderRadius: '8px'
                  }}>
                    <strong style={{ color: '#3a4520', display: 'block', marginBottom: '0.5rem' }}>📦 Versandinformationen:</strong>
                    <div style={{ fontSize: '0.9rem', color: '#7a9053' }}>
                      <div><strong>Tracking-Nr:</strong> {order.tracking_number}</div>
                      <div><strong>Carrier:</strong> {order.shipping_carrier || 'DHL'}</div>
                      {order.tracking_url && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" style={{ color: '#7a9053', textDecoration: 'underline' }}>
                            Sendung verfolgen →
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Admin Actions */}
                <div style={{ 
                  marginTop: '1rem', 
                  paddingTop: '1rem', 
                  borderTop: '1px solid #e8ebe0'
                }}>
                  <strong style={{ display: 'block', marginBottom: '0.75rem', color: '#3a4520' }}>Aktionen:</strong>
                  
                  {/* Status Dropdown */}
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.85rem', color: '#7a9053', display: 'block', marginBottom: '0.25rem' }}>
                      Status ändern:
                    </label>
                    <select
                      value={order.status}
                      onChange={(e) => handleChangeStatus(order.id, e.target.value)}
                      style={{ 
                        padding: '0.5rem', 
                        borderRadius: '8px', 
                        border: '2px solid #e8ebe0',
                        minWidth: '200px',
                        fontSize: '0.9rem'
                      }}
                    >
                      <option value="paid">💰 Bezahlt</option>
                      <option value="packed">📦 Verpackt</option>
                      <option value="shipped">🚚 Versendet</option>
                      <option value="in_transit">✈️ Unterwegs</option>
                      <option value="delivered">🏠 Zugestellt</option>
                      <option value="cancelled">❌ Storniert</option>
                    </select>
                  </div>

                  {/* Tracking Input - only show for paid/packed status */}
                  {(order.status === 'paid' || order.status === 'packed') && !order.tracking_number && (
                    <div style={{ 
                      background: 'rgba(122, 144, 83, 0.05)', 
                      padding: '1rem', 
                      borderRadius: '8px',
                      marginBottom: '1rem'
                    }}>
                      <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#3a4520' }}>
                        Versandinformationen hinzufügen:
                      </strong>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <input
                          type="text"
                          placeholder="Tracking-Nummer"
                          value={trackingInput[order.id]?.trackingNumber || ''}
                          onChange={(e) => setTrackingInput({
                            ...trackingInput,
                            [order.id]: { 
                              ...trackingInput[order.id], 
                              trackingNumber: e.target.value 
                            }
                          })}
                          style={{ 
                            padding: '0.5rem', 
                            borderRadius: '8px', 
                            border: '2px solid #e8ebe0',
                            flex: '1',
                            minWidth: '150px'
                          }}
                        />
                        <select
                          value={trackingInput[order.id]?.carrier || 'DHL'}
                          onChange={(e) => setTrackingInput({
                            ...trackingInput,
                            [order.id]: { 
                              ...trackingInput[order.id], 
                              carrier: e.target.value 
                            }
                          })}
                          style={{ 
                            padding: '0.5rem', 
                            borderRadius: '8px', 
                            border: '2px solid #e8ebe0'
                          }}
                        >
                          <option value="DHL">DHL</option>
                          <option value="DPD">DPD</option>
                          <option value="Hermes">Hermes</option>
                          <option value="UPS">UPS</option>
                          <option value="GLS">GLS</option>
                        </select>
                        <button
                          onClick={() => handleAddTracking(
                            order.id, 
                            trackingInput[order.id]?.trackingNumber || '',
                            trackingInput[order.id]?.carrier || 'DHL'
                          )}
                          className="btn btn-primary"
                          style={{ fontSize: '0.85rem' }}
                          disabled={!trackingInput[order.id]?.trackingNumber}
                        >
                          Versenden & Benachrichtigen
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteOrder(order.id)}
                    className="btn btn-danger"
                    style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                  >
                    <Trash2 size={16} /> Bestellung löschen
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
