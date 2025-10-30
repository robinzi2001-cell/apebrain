import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Tag } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const FloatingCoupon = () => {
  const [coupon, setCoupon] = useState(null);

  useEffect(() => {
    fetchActiveCoupon();
    // Refresh every 60 seconds
    const interval = setInterval(fetchActiveCoupon, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveCoupon = async () => {
    try {
      const response = await axios.get(`${API}/coupons/active`);
      if (response.data) {
        setCoupon(response.data);
      } else {
        setCoupon(null);
      }
    } catch (error) {
      console.error('Error fetching coupon:', error);
      setCoupon(null);
    }
  };

  if (!coupon) return null;

  return (
    <div className="floating-coupon" data-testid="floating-coupon">
      <Tag size={20} />
      <div className="coupon-content">
        <span className="coupon-code">{coupon.code}</span>
        <span className="coupon-discount">
          {coupon.discount_type === 'percentage' 
            ? `${coupon.discount_value}% OFF` 
            : `$${coupon.discount_value} OFF`}
        </span>
      </div>
    </div>
  );
};

export default FloatingCoupon;