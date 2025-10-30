import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, BookOpen, Sparkles } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LandingPage = () => {
  const navigate = useNavigate();
  const [showBlog, setShowBlog] = useState(true);
  const [showShop, setShowShop] = useState(true);
  const [showMinigames, setShowMinigames] = useState(true);

  useEffect(() => {
    fetchLandingSettings();
  }, []);

  const fetchLandingSettings = async () => {
    try {
      const response = await axios.get(`${API}/landing-settings`);
      setShowBlog(response.data.show_blog);
      setShowShop(response.data.show_shop);
      setShowMinigames(response.data.show_minigames);
    } catch (error) {
      console.error('Error fetching landing settings:', error);
      // Keep defaults on error
    }
  };

  return (
    <div className="landing-page" data-testid="landing-page">
      <div className="landing-overlay"></div>
      
      <div className="landing-content">
        <div className="landing-header">
          <div className="landing-logo" style={{ fontSize: '4rem' }}>🍄</div>
          <h1 className="landing-title" data-testid="landing-title">ApeBrain.cloud</h1>
          <p className="landing-tagline" data-testid="landing-tagline">god knows how</p>
        </div>

        <div className="landing-cards" data-testid="landing-cards">
          {showBlog && (
            <div 
              className="landing-card blog-card-landing"
              onClick={() => navigate('/blog')}
              data-testid="blog-card"
            >
              <div className="card-icon">
                <BookOpen size={48} />
              </div>
              <h2>Blog</h2>
              <p>Explore health, nature, consciousness and the mysteries of life</p>
            </div>
          )}

          {showShop && (
            <div 
              className="landing-card shop-card-landing"
              onClick={() => navigate('/shop')}
              data-testid="shop-card"
            >
              <div className="card-icon">
                <ShoppingBag size={48} />
              </div>
              <h2>Shop</h2>
              <p>Discover natural products for your wellness journey</p>
            </div>
          )}

          {showMinigames && (
            <div 
              className="landing-card coming-soon-card"
              data-testid="coming-soon-card"
            >
              <div className="card-icon">
                <Sparkles size={48} />
              </div>
              <h2>Minigames</h2>
              <p>Coming Soon</p>
            </div>
          )}
        </div>

        <div className="landing-footer">
          <p>Embracing the unknown, one discovery at a time</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;