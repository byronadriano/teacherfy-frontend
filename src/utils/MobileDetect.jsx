// src/components/utils/MobileDetect.jsx
import React, { useState, useEffect } from 'react';

/**
 * A component to detect mobile devices and apply appropriate classes
 * This helps with fixing mobile-specific issues, especially with the footer
 */
const MobileDetect = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Function to check if device is mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      
      // Also check for small screen size
      const isMobileSize = window.innerWidth < 768;
      
      setIsMobile(mobileRegex.test(userAgent) || isMobileSize);
    };
    
    // Check on initial render
    checkMobile();
    
    // Add listener for resize events
    window.addEventListener('resize', checkMobile);
    
    // Apply or remove the mobile class on the body
    if (isMobile) {
      document.body.classList.add('is-mobile-device');
    } else {
      document.body.classList.remove('is-mobile-device');
    }
    
    // Clean up listener on unmount
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [isMobile]);
  
  return children;
};

export default MobileDetect;