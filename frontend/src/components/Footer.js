import React from 'react';
import { Leaf } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>ApeBrain.cloud</h3>
          <p>Your trusted source for mushroom wellness and natural health products.</p>
          <p style={{ marginTop: '1rem', fontStyle: 'italic', opacity: 0.8 }}>god knows how</p>
        </div>
        
        <div className="footer-section">
          <h3>Quick Links</h3>
          <a href="/">Home</a>
          <a href="/blog">Blog</a>
          <a href="/shop">Shop</a>
        </div>
        
        <div className="footer-section">
          <h3>Legal</h3>
          <a href="/impressum">Impressum</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms & Conditions</a>
        </div>
        
        <div className="footer-section">
          <h3>Contact</h3>
          <p>Email: info@apebrain.cloud</p>
          <p>Support: support@apebrain.cloud</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} ApeBrain.cloud. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;