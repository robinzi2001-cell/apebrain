import React, { useState } from 'react';
import { Leaf, Home, Package, Download } from 'lucide-react';

const ShopPage = () => {
  const [activeTab, setActiveTab] = useState('physical');

  const physicalProducts = [
    {
      id: 1,
      name: 'Lion\'s Mane Extract',
      price: '$29.99',
      description: 'Premium quality Lion\'s Mane mushroom extract for cognitive support',
      category: 'Supplements'
    },
    {
      id: 2,
      name: 'Reishi Capsules',
      price: '$24.99',
      description: 'Pure Reishi mushroom capsules for immune system support',
      category: 'Supplements'
    },
    {
      id: 3,
      name: 'Mushroom Growing Kit',
      price: '$49.99',
      description: 'Complete kit to grow your own gourmet mushrooms at home',
      category: 'Kits'
    },
    {
      id: 4,
      name: 'Cordyceps Powder',
      price: '$34.99',
      description: 'Organic Cordyceps mushroom powder for energy and vitality',
      category: 'Supplements'
    }
  ];

  const digitalProducts = [
    {
      id: 1,
      name: 'Mushroom Identification Guide',
      price: '$19.99',
      description: 'Comprehensive digital guide to identifying edible mushrooms',
      category: 'eBooks'
    },
    {
      id: 2,
      name: 'Holistic Health Course',
      price: '$79.99',
      description: 'Complete online course on natural wellness and mushroom medicine',
      category: 'Courses'
    },
    {
      id: 3,
      name: 'Meditation & Consciousness Pack',
      price: '$29.99',
      description: 'Guided meditations and consciousness expansion exercises',
      category: 'Audio'
    }
  ];

  const products = activeTab === 'physical' ? physicalProducts : digitalProducts;

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
          {products.map(product => (
            <div key={product.id} className="product-card" data-testid={`product-${product.id}`}>
              <div className="product-image-placeholder">
                {activeTab === 'physical' ? <Package size={64} /> : <Download size={64} />}
              </div>
              <div className="product-info">
                <span className="product-category">{product.category}</span>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-footer">
                  <span className="product-price">{product.price}</span>
                  <button className="btn btn-primary" data-testid={`buy-button-${product.id}`}>
                    {activeTab === 'physical' ? 'Add to Cart' : 'Purchase'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="shop-notice">
          <p><strong>Note:</strong> Shop functionality coming soon! Products shown are examples.</p>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;