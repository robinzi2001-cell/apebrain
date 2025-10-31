import React, { useEffect, useState } from 'react';
import Footer from '@/components/Footer';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Leaf, ArrowLeft, Home, Instagram } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BlogPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [features, setFeatures] = useState({ enable_video: true, enable_audio: true });

  useEffect(() => {
    fetchBlog();
    fetchFeatures();
  }, [id]);

  const fetchFeatures = async () => {
    try {
      const response = await axios.get(`${API}/blog-features`);
      setFeatures(response.data);
    } catch (error) {
      console.error('Error fetching blog features:', error);
    }
  };

  const fetchBlog = async () => {
    try {
      const response = await axios.get(`${API}/blogs/${id}`);
      setBlog(response.data);
    } catch (error) {
      console.error('Error fetching blog:', error);
      setError('Blog not found');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getColorTheme = (keywords) => {
    const kw = keywords.toLowerCase();
    if (kw.includes('magic') || kw.includes('psychedelic') || kw.includes('psilocybin')) {
      return { bg: 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)', icon: '#a78bfa' };
    }
    if (kw.includes('forest') || kw.includes('nature') || kw.includes('wild')) {
      return { bg: 'linear-gradient(135deg, #6b7c59 0%, #4a5942 100%)', icon: '#6b7c59' };
    }
    if (kw.includes('ocean') || kw.includes('sea') || kw.includes('water')) {
      return { bg: 'linear-gradient(135deg, #7dd3c0 0%, #4a90a4 100%)', icon: '#7dd3c0' };
    }
    if (kw.includes('energy') || kw.includes('vitality') || kw.includes('boost')) {
      return { bg: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', icon: '#fbbf24' };
    }
    if (kw.includes('calm') || kw.includes('relax') || kw.includes('meditation')) {
      return { bg: 'linear-gradient(135deg, #c7d2fe 0%, #a5b4fc 100%)', icon: '#c7d2fe' };
    }
    return { bg: 'linear-gradient(135deg, #7a9053 0%, #5a6c3a 100%)', icon: '#7a9053' };
  };

  const extractYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const renderContentWithImages = () => {
    if (!blog.image_urls || blog.image_urls.length === 0) {
      return <ReactMarkdown>{blog.content}</ReactMarkdown>;
    }

    // Split content into paragraphs
    const paragraphs = blog.content.split('\n\n').filter(p => p.trim());
    
    // Calculate how to distribute images
    const totalParagraphs = paragraphs.length;
    const imageCount = blog.image_urls.length;
    const paragraphsPerImage = Math.floor(totalParagraphs / (imageCount + 1));
    
    const result = [];
    let imageIndex = 0;
    
    paragraphs.forEach((paragraph, index) => {
      // Add paragraph
      result.push(
        <div key={`p-${index}`} style={{ marginBottom: '1.5rem' }}>
          <ReactMarkdown>{paragraph}</ReactMarkdown>
        </div>
      );
      
      // Add image after certain paragraphs
      const shouldAddImage = 
        imageIndex < imageCount && 
        (index + 1) % paragraphsPerImage === 0 && 
        index < totalParagraphs - 1;
      
      if (shouldAddImage) {
        result.push(
          <div key={`img-${imageIndex}`} style={{ margin: '2rem 0' }}>
            <img 
              src={blog.image_urls[imageIndex]} 
              alt={`${blog.title} - Image ${imageIndex + 1}`}
              style={{
                width: '100%',
                maxHeight: '500px',
                objectFit: 'cover',
                borderRadius: '12px'
              }}
            />
          </div>
        );
        imageIndex++;
      }
    });
    
    // Add remaining images at the end if any
    while (imageIndex < imageCount) {
      result.push(
        <div key={`img-end-${imageIndex}`} style={{ margin: '2rem 0' }}>
          <img 
            src={blog.image_urls[imageIndex]} 
            alt={`${blog.title} - Image ${imageIndex + 1}`}
            style={{
              width: '100%',
              maxHeight: '500px',
              objectFit: 'cover',
              borderRadius: '12px'
            }}
          />
        </div>
      );
      imageIndex++;
    }
    
    return result;
  };

  if (loading) {
    return <div className="loading" data-testid="loading-indicator">Loading...</div>;
  }

  if (error || !blog) {
    return (
      <div className="error" style={{ margin: '2rem', textAlign: 'center' }} data-testid="error-message">
        <p>{error || 'Blog not found'}</p>
        <button onClick={() => navigate('/blog')} className="btn btn-primary" style={{ marginTop: '1rem' }} data-testid="back-home-button">
          Back to Blog
        </button>
      </div>
    );
  }

  const theme = getColorTheme(blog.keywords || '');

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

      <div className="blog-detail" data-testid="blog-detail">
        <button
          onClick={() => navigate('/blog')}
          className="btn btn-secondary"
          style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          data-testid="back-button"
        >
          <ArrowLeft size={20} />
          Back to Blogs
        </button>

        {blog.image_url ? (
          <img
            src={blog.image_url}
            alt={blog.title}
            className="blog-detail-image"
            data-testid="blog-detail-image"
          />
        ) : (
          <div 
            className="blog-detail-image"
            style={{ 
              background: theme.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '3rem'
            }}
            data-testid="blog-detail-placeholder"
          >
            <Leaf size={128} />
          </div>
        )}

        <h1 data-testid="blog-detail-title">{blog.title}</h1>
        <div className="blog-detail-meta" data-testid="blog-detail-meta">
          Published on {formatDate(blog.published_at || blog.created_at)}
        </div>

        {/* Video Embed */}
        {features.enable_video && blog.video_url && extractYouTubeId(blog.video_url) && (
          <div style={{ margin: '2rem 0' }}>
            <iframe
              width="100%"
              height="500"
              src={`https://www.youtube.com/embed/${extractYouTubeId(blog.video_url)}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ borderRadius: '12px' }}
            ></iframe>
          </div>
        )}

        {/* Audio Player */}
        {features.enable_audio && blog.audio_url && (
          <div style={{ margin: '2rem 0', padding: '1.5rem', background: 'rgba(122, 144, 83, 0.1)', borderRadius: '12px' }}>
            <h3 style={{ marginBottom: '1rem', color: '#3a4520' }}>Audio</h3>
            <audio
              controls
              style={{ width: '100%' }}
              src={blog.audio_url}
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {/* Content with distributed images */}
        <div className="blog-detail-content" data-testid="blog-detail-content">
          {renderContentWithImages()}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogPage;