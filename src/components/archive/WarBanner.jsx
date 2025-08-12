import { motion } from 'framer-motion';
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

export const WarBanner = () => {
  const bannerRef = useRef(null);
  const flagRef = useRef(null);

  useEffect(() => {
    // Animation GSAP pour le flottement réaliste
    gsap.to(flagRef.current, {
      duration: 5,
      rotation: -1,
      skewX: 3,
      transformOrigin: "top left",
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: -150 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1.5, type: "spring", damping: 10 }}
      ref={bannerRef}
      className="absolute left-0 top-1/4 h-[70vh] w-40 z-30 flex"
    >
      {/* Hampe en bois avec métal */}
      <div className="relative h-full w-4 ml-2">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900 via-amber-800 to-gray-900 rounded-full shadow-lg" />
        <div className="absolute top-0 left-0 w-full h-8 bg-gray-700 rounded-full" />
        <div className="absolute bottom-0 left-0 w-full h-12 bg-gray-800 rounded-b-full" />
        
        {/* Cerclages métalliques */}
        {[0.2, 0.5, 0.8].map((pos) => (
          <div 
            key={pos}
            className="absolute left-0 w-6 h-1 bg-gray-600 rounded-full"
            style={{ top: `${pos * 100}%`, transform: 'translateX(-0.5rem)' }}
          />
        ))}
      </div>

      {/* Drapeau en tissu */}
      <motion.div
        ref={flagRef}
        className="relative h-[80%] w-36 mt-8 origin-top-left"
        whileHover={{ rotate: -2 }}
      >
        {/* Base du drapeau */}
        <div className="absolute inset-0 rounded-r-lg overflow-hidden"
        style={{  background: 'linear-gradient(to bottom, #8B0000, #5D0000, #8B0000)'}}
        >
          {/* Texture de tissu */}
          <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/rough-cloth.png')]" />
          
          {/* Usures et déchirures */}
          <div className="absolute inset-0 border-r-8 border-amber-800 border-opacity-50 rounded-r-lg" />
          <div className="absolute bottom-0 right-0 w-16 h-16 bg-red-900 opacity-90 clip-triangle" />
          
          {/* Blason Elite */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Bouclier */}
              <img src='/logoo.png' />

              {/* Reflets */}
              <div className="absolute top-4 left-8 w-8 h-2 bg-amber-200 bg-opacity-30 transform rotate-45" />
              <div className="absolute bottom-6 right-6 w-6 h-1 bg-amber-200 bg-opacity-20 transform rotate-12" />
            </div>
          </div>

          {/* Franges */}
          <div className="absolute bottom-0 left-0 right-0 h-8 flex justify-center space-x-1">
            {[...Array(9)].map((_, i) => (
              <div 
                key={i}
                className="w-3 h-full bg-gradient-to-b from-amber-600 via-amber-700 to-transparent"
                style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}
              />
            ))}
          </div>
        </div>

        {/* Ombre portée */}
        <div className="absolute -inset-2 bg-black opacity-20 blur-md rounded-lg -z-10" />
      </motion.div>

      {/* Chaînes et accessoires */}
      <div className="absolute top-24 -left-2 w-10 h-20">
        <div className="absolute top-0 left-0 w-1 h-8 bg-amber-700 rounded-full" />
        <div className="absolute top-8 left-0 w-10 h-1 bg-amber-700 rounded-full" />
        {[...Array(3)].map((_, i) => (
          <div 
            key={i}
            className="absolute left-1 w-8 h-6 border-b-2 border-amber-600 rounded-full"
            style={{ top: `${9 + i * 6}px` }}
          />
        ))}
      </div>
    </motion.div>
  );
};