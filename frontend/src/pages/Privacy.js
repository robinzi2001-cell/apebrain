import React from 'react';
import { Leaf, Home } from 'lucide-react';
import Footer from '@/components/Footer';

const Privacy = () => {
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

      <div className="legal-page" data-testid="privacy-page">
        <h1>Privacy Policy</h1>
        <p className="legal-subtitle">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="legal-section">
          <h2>1. Data Protection at a Glance</h2>
          <h3>General Information</h3>
          <p>The following information provides a simple overview of what happens to your personal data when you visit our website. Personal data is any data that can personally identify you.</p>
        </section>

        <section className="legal-section">
          <h2>2. Data Collection on Our Website</h2>
          <h3>Who is responsible for data collection?</h3>
          <p>Data processing on this website is carried out by the website operator. You can find their contact details in the Impressum.</p>
          
          <h3>How do we collect your data?</h3>
          <p>Your data is collected when you provide it to us. This could be data you enter in a contact form or when making a purchase.</p>
          <p>Other data is collected automatically by our IT systems when you visit the website. This is primarily technical data (e.g., internet browser, operating system, or time of page access).</p>
        </section>

        <section className="legal-section">
          <h2>3. What We Use Your Data For</h2>
          <p>We collect and use your data for the following purposes:</p>
          <ul>
            <li>Processing your orders and payments</li>
            <li>Sending order confirmations and updates</li>
            <li>Improving our website and services</li>
            <li>Responding to your inquiries</li>
            <li>Complying with legal obligations</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>4. Your Rights</h2>
          <p>You have the following rights regarding your personal data:</p>
          <ul>
            <li><strong>Right of access:</strong> You can request information about your stored personal data</li>
            <li><strong>Right to rectification:</strong> You can request correction of inaccurate data</li>
            <li><strong>Right to erasure:</strong> You can request deletion of your data</li>
            <li><strong>Right to restriction:</strong> You can request restriction of processing</li>
            <li><strong>Right to data portability:</strong> You can receive your data in a structured format</li>
            <li><strong>Right to object:</strong> You can object to data processing</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>5. Cookies</h2>
          <p>Our website uses cookies. Cookies are small text files that are stored on your device. Some cookies are deleted when you close your browser (session cookies), while others remain on your device and allow us to recognize your browser on your next visit (persistent cookies).</p>
          <p>You can configure your browser to inform you about cookie placement and allow cookies only in individual cases. However, disabling cookies may limit the functionality of our website.</p>
        </section>

        <section className="legal-section">
          <h2>6. Payment Processing</h2>
          <p>We use PayPal for payment processing. When you make a purchase, your payment information is processed directly by PayPal. We do not store your complete payment details on our servers.</p>
          <p>PayPal's privacy policy: <a href="https://www.paypal.com/privacy" target="_blank" rel="noopener noreferrer">https://www.paypal.com/privacy</a></p>
        </section>

        <section className="legal-section">
          <h2>7. Data Security</h2>
          <p>We use SSL/TLS encryption for secure data transmission. All data transmitted between your browser and our server is encrypted.</p>
        </section>

        <section className="legal-section">
          <h2>8. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul>
            <li><strong>PayPal:</strong> Payment processing</li>
            <li><strong>MongoDB Atlas:</strong> Database hosting</li>
            <li><strong>Google Gemini:</strong> AI content generation</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>9. Contact</h2>
          <p>If you have questions about privacy, please contact us at:</p>
          <p><strong>Email:</strong> privacy@apebrain.cloud</p>
        </section>

        <div className="legal-note">
          <p><strong>Note:</strong> This is a template privacy policy. Please customize it according to your specific data processing activities and consult with a legal professional to ensure GDPR compliance.</p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Privacy;