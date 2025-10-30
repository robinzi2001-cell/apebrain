import React from 'react';
import { Leaf, Home } from 'lucide-react';
import Footer from '@/components/Footer';

const Terms = () => {
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

      <div className="legal-page" data-testid="terms-page">
        <h1>Terms & Conditions</h1>
        <p className="legal-subtitle">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="legal-section">
          <h2>1. Scope of Application</h2>
          <p>These Terms and Conditions govern all contracts concluded between you ("Customer") and ApeBrain.cloud ("We", "Us", "Seller") for the sale and delivery of products offered in our online shop.</p>
        </section>

        <section className="legal-section">
          <h2>2. Conclusion of Contract</h2>
          <p>The presentation of products in our online shop does not constitute a legally binding offer, but an invitation to place an order.</p>
          <p>By clicking the "Pay with PayPal" button, you submit a binding order for the products in your shopping cart. The contract is concluded when we send you an order confirmation by email.</p>
        </section>

        <section className="legal-section">
          <h2>3. Prices and Payment</h2>
          <ul>
            <li>All prices are in USD and include applicable VAT</li>
            <li>Shipping costs are displayed during checkout</li>
            <li>Payment is processed via PayPal</li>
            <li>We reserve the right to modify prices at any time</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>4. Delivery</h2>
          <p><strong>Physical Products:</strong></p>
          <ul>
            <li>Delivery time: 5-7 business days (may vary by location)</li>
            <li>Shipping costs calculated at checkout</li>
            <li>We ship worldwide (some restrictions may apply)</li>
          </ul>
          <p><strong>Digital Products:</strong></p>
          <ul>
            <li>Delivered immediately via email after payment confirmation</li>
            <li>No shipping costs</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>5. Right of Withdrawal (EU Customers)</h2>
          <p>Consumers (EU) have the right to withdraw from this contract within 14 days without giving any reason.</p>
          <p>The withdrawal period expires 14 days from the day on which you or a third party indicated by you (other than the carrier) takes physical possession of the goods.</p>
          <p><strong>Note:</strong> The right of withdrawal does not apply to digital products if performance has begun with your prior express consent and acknowledgment that you lose your right of withdrawal.</p>
          
          <h3>To exercise your right of withdrawal:</h3>
          <p>Contact us at: returns@apebrain.cloud</p>
          <p>Return shipping costs are borne by the customer.</p>
        </section>

        <section className="legal-section">
          <h2>6. Warranty and Liability</h2>
          <p>We provide a statutory warranty for our products. For physical products, the warranty period is 2 years from delivery.</p>
          <p>In case of defects, we will repair or replace the product at our discretion.</p>
        </section>

        <section className="legal-section">
          <h2>7. Product Information</h2>
          <p><strong>Disclaimer:</strong> The information provided about mushroom products and their health benefits is for educational purposes only and does not constitute medical advice.</p>
          <ul>
            <li>Not intended to diagnose, treat, cure, or prevent any disease</li>
            <li>Consult your healthcare provider before using any supplements</li>
            <li>Keep out of reach of children</li>
            <li>Do not exceed recommended dosage</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>8. Coupon Codes</h2>
          <ul>
            <li>Coupon codes are valid while active in our system</li>
            <li>Only one coupon per order</li>
            <li>Cannot be combined with other offers</li>
            <li>Non-transferable and no cash value</li>
            <li>We reserve the right to cancel coupons at any time</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>9. Intellectual Property</h2>
          <p>All content on this website, including text, images, logos, and designs, is protected by copyright and trademark laws. Unauthorized use is prohibited.</p>
        </section>

        <section className="legal-section">
          <h2>10. Data Protection</h2>
          <p>We process your personal data in accordance with our Privacy Policy and applicable data protection laws (GDPR). Please refer to our Privacy Policy for detailed information.</p>
        </section>

        <section className="legal-section">
          <h2>11. Dispute Resolution</h2>
          <p>Any disputes arising from these Terms and Conditions shall be governed by the laws of [Your Country/State].</p>
          <p>EU customers may use the European Commission's online dispute resolution platform: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a></p>
        </section>

        <section className="legal-section">
          <h2>12. Contact</h2>
          <p>For questions about these Terms and Conditions, please contact:</p>
          <p><strong>Email:</strong> legal@apebrain.cloud</p>
          <p><strong>Address:</strong> See Impressum</p>
        </section>

        <div className="legal-note">
          <p><strong>Note:</strong> These Terms and Conditions are a template. Please customize them according to your business model and consult with a legal professional to ensure compliance with all applicable laws in your jurisdiction.</p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Terms;