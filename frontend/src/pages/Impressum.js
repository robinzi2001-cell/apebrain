import React from 'react';
import { Leaf, Home, Instagram } from 'lucide-react';
import Footer from '@/components/Footer';

const Impressum = () => {
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
            <a 
              href="https://www.instagram.com/apebrain.cloud" 
              target="_blank" 
              rel="noopener noreferrer"
              data-testid="instagram-link"
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <Instagram size={20} />
            </a>
          </div>
        </div>
      </nav>

      <div className="legal-page" data-testid="impressum-page">
        <h1>Impressum</h1>
        <p className="legal-subtitle">Information pursuant to § 5 TMG (German Telemedia Act)</p>

        <section className="legal-section">
          <h2>Company Information</h2>
          <p><strong>ApeBrain.cloud</strong></p>
          <p>[Your Company Name]</p>
          <p>[Street Address]</p>
          <p>[Postal Code, City]</p>
          <p>[Country]</p>
        </section>

        <section className="legal-section">
          <h2>Contact</h2>
          <p><strong>Email:</strong> info@apebrain.cloud</p>
          <p><strong>Phone:</strong> [Your Phone Number]</p>
          <p><strong>Website:</strong> https://apebrain.cloud</p>
        </section>

        <section className="legal-section">
          <h2>Represented by</h2>
          <p>[Owner/CEO Name]</p>
        </section>

        <section className="legal-section">
          <h2>VAT ID</h2>
          <p>VAT identification number according to §27a VAT Tax Act:</p>
          <p>[Your VAT Number]</p>
        </section>

        <section className="legal-section">
          <h2>Responsible for Content</h2>
          <p>According to § 55 Abs. 2 RStV:</p>
          <p>[Name]</p>
          <p>[Address]</p>
        </section>

        <section className="legal-section">
          <h2>Dispute Resolution</h2>
          <p>The European Commission provides a platform for online dispute resolution (OS): <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a></p>
          <p>We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board.</p>
        </section>

        <section className="legal-section">
          <h2>Liability for Content</h2>
          <p>As a service provider, we are responsible for our own content on these pages in accordance with general legislation pursuant to § 7 (1) TMG. However, according to §§ 8 to 10 TMG, we are not obliged to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity.</p>
          <p>Obligations to remove or block the use of information in accordance with general legislation remain unaffected by this. However, liability in this regard is only possible from the time of knowledge of a specific legal violation. Upon becoming aware of corresponding legal violations, we will remove this content immediately.</p>
        </section>

        <section className="legal-section">
          <h2>Liability for Links</h2>
          <p>Our website contains links to external third-party websites over whose content we have no influence. Therefore, we cannot assume any liability for this third-party content. The respective provider or operator of the pages is always responsible for the content of the linked pages.</p>
        </section>

        <section className="legal-section">
          <h2>Copyright</h2>
          <p>The content and works on these pages created by the site operator are subject to German copyright law. Duplication, processing, distribution, and any kind of exploitation outside the limits of copyright require the written consent of the respective author or creator.</p>
        </section>

        <div className="legal-note">
          <p><strong>Note:</strong> This is a template. Please replace the bracketed information with your actual company details. Consult with a legal professional to ensure compliance with all applicable laws.</p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Impressum;