import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEO Component for ApeBrain
 * Usage: <SEO title="..." description="..." />
 */
const SEO = ({
  title = 'ApeBrain - KI-gestützte Insights, Tools & Produkte | AI-Powered Platform',
  description = 'ApeBrain bietet innovative KI-gestützte Tools, Produkte und Insights. Entdecke unseren Shop für einzigartige Produkte und nutze fortschrittliche AI-Technologie.',
  keywords = 'ApeBrain, KI, Künstliche Intelligenz, AI Tools, Online Shop, Tech Produkte, AI Insights, Machine Learning',
  image = 'https://apebrain.cloud/og-image.jpg',
  url = 'https://apebrain.cloud',
  type = 'website',
  author = 'ApeBrain'
}) => {
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={url} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="ApeBrain" />
      <meta property="og:locale" content="de_DE" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="language" content="German" />
      <meta name="revisit-after" content="7 days" />
    </Helmet>
  );
};

export default SEO;