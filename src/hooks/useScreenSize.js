import { useState, useEffect } from 'react';

const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLargeDesktop: false,
    isUltraWide: false
  });

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024 && width < 1440,
        isLargeDesktop: width >= 1440 && width < 2560,
        isUltraWide: width >= 2560
      });
    };

    // Mise à jour initiale
    updateScreenSize();

    // Écouter les changements de taille
    window.addEventListener('resize', updateScreenSize);
    
    // Nettoyage
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return screenSize;
};

export default useScreenSize;