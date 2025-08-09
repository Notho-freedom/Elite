import React from 'react';
import { motion } from 'framer-motion';

// Animation de particules flottantes
export const FloatingParticles = ({ count = 50, userType }) => {
  const getParticleColor = () => {
    switch (userType) {
      case 'elite':
        return ['#FFD700', '#FFA500', '#FF6347'];
      case 'creator':
        return ['#9F7AEA', '#ED64A6', '#F56565'];
      case 'business':
        return ['#4299E1', '#667EEA', '#9F7AEA'];
      case 'premium':
        return ['#48BB78', '#38B2AC', '#4299E1'];
      default:
        return ['#E2E8F0', '#CBD5E0', '#A0AEC0'];
    }
  };

  const colors = getParticleColor();

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }, (_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 6 + 2,
            height: Math.random() * 6 + 2,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30 - Math.random() * 50],
            x: [0, Math.random() * 20 - 10],
            opacity: [0, 1, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

// Animation de gradient morphing
export const MorphingGradient = ({ userType, className = "" }) => {
  const getGradientKeyframes = () => {
    switch (userType) {
      case 'elite':
        return [
          'linear-gradient(45deg, #FFD700, #FFA500, #FF6347)',
          'linear-gradient(135deg, #FF6347, #FFD700, #FFA500)',
          'linear-gradient(225deg, #FFA500, #FF6347, #FFD700)',
          'linear-gradient(315deg, #FFD700, #FFA500, #FF6347)'
        ];
      case 'creator':
        return [
          'linear-gradient(45deg, #9F7AEA, #ED64A6, #F56565)',
          'linear-gradient(135deg, #ED64A6, #F56565, #9F7AEA)',
          'linear-gradient(225deg, #F56565, #9F7AEA, #ED64A6)',
          'linear-gradient(315deg, #9F7AEA, #ED64A6, #F56565)'
        ];
      case 'business':
        return [
          'linear-gradient(45deg, #4299E1, #667EEA, #9F7AEA)',
          'linear-gradient(135deg, #667EEA, #9F7AEA, #4299E1)',
          'linear-gradient(225deg, #9F7AEA, #4299E1, #667EEA)',
          'linear-gradient(315deg, #4299E1, #667EEA, #9F7AEA)'
        ];
      default:
        return [
          'linear-gradient(45deg, #48BB78, #38B2AC, #4299E1)',
          'linear-gradient(135deg, #38B2AC, #4299E1, #48BB78)',
          'linear-gradient(225deg, #4299E1, #48BB78, #38B2AC)',
          'linear-gradient(315deg, #48BB78, #38B2AC, #4299E1)'
        ];
    }
  };

  return (
    <motion.div
      className={`absolute inset-0 ${className}`}
      animate={{
        background: getGradientKeyframes()
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  );
};

// Animation de vague fluide
export const FluidWave = ({ userType, height = 100 }) => {
  const getWaveColor = () => {
    switch (userType) {
      case 'elite':
        return 'rgba(255, 215, 0, 0.3)';
      case 'creator':
        return 'rgba(159, 122, 234, 0.3)';
      case 'business':
        return 'rgba(66, 153, 225, 0.3)';
      default:
        return 'rgba(72, 187, 120, 0.3)';
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
      <motion.svg
        viewBox="0 0 1200 120"
        className="relative block w-full"
        style={{ height }}
        animate={{
          x: [0, -100, 0]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <motion.path
          d="M0,60 C300,120 600,0 900,60 C1050,90 1200,30 1200,60 L1200,120 L0,120 Z"
          fill={getWaveColor()}
          animate={{
            d: [
              "M0,60 C300,120 600,0 900,60 C1050,90 1200,30 1200,60 L1200,120 L0,120 Z",
              "M0,40 C300,80 600,40 900,80 C1050,60 1200,80 1200,60 L1200,120 L0,120 Z",
              "M0,60 C300,120 600,0 900,60 C1050,90 1200,30 1200,60 L1200,120 L0,120 Z"
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.svg>
    </div>
  );
};

// Animation de halo lumineux
export const GlowHalo = ({ userType, intensity = 0.5 }) => {
  const getGlowColor = () => {
    switch (userType) {
      case 'elite':
        return '#FFD700';
      case 'creator':
        return '#9F7AEA';
      case 'business':
        return '#4299E1';
      default:
        return '#48BB78';
    }
  };

  return (
    <motion.div
      className="absolute inset-0 rounded-full pointer-events-none"
      style={{
        background: `radial-gradient(circle, ${getGlowColor()}${Math.round(intensity * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
        filter: 'blur(20px)'
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.6, 0.3]
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
};

// Animation de scanning lines
export const ScanningLines = ({ userType }) => {
  const getLineColor = () => {
    switch (userType) {
      case 'elite':
        return 'rgba(255, 215, 0, 0.6)';
      case 'creator':
        return 'rgba(159, 122, 234, 0.6)';
      case 'business':
        return 'rgba(66, 153, 225, 0.6)';
      default:
        return 'rgba(72, 187, 120, 0.6)';
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 3 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute w-full h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${getLineColor()}, transparent)`,
            left: 0,
            top: `${20 + i * 30}%`
          }}
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 1,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

// Animation de constellation
export const Constellation = ({ userType, starCount = 15 }) => {
  const getStarColor = () => {
    switch (userType) {
      case 'elite':
        return '#FFD700';
      case 'creator':
        return '#9F7AEA';
      case 'business':
        return '#4299E1';
      default:
        return '#48BB78';
    }
  };

  const stars = Array.from({ length: starCount }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 5
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            backgroundColor: getStarColor(),
            boxShadow: `0 0 10px ${getStarColor()}`
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut"
          }}
        />
      ))}
      
      {/* Lignes de connexion entre étoiles */}
      <svg className="absolute inset-0 w-full h-full">
        {stars.slice(0, -1).map((star, i) => {
          const nextStar = stars[i + 1];
          return (
            <motion.line
              key={`line-${i}`}
              x1={`${star.x}%`}
              y1={`${star.y}%`}
              x2={`${nextStar.x}%`}
              y2={`${nextStar.y}%`}
              stroke={getStarColor()}
              strokeWidth="0.5"
              opacity="0.3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 2,
                delay: i * 0.2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          );
        })}
      </svg>
    </div>
  );
};

// Animation de prisme de lumière
export const PrismEffect = ({ userType }) => {
  const getPrismColors = () => {
    switch (userType) {
      case 'elite':
        return ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
      case 'creator':
        return ['#9F7AEA', '#ED64A6', '#F56565', '#ED8936', '#ECC94B'];
      case 'business':
        return ['#4299E1', '#667EEA', '#9F7AEA', '#ED64A6'];
      default:
        return ['#48BB78', '#38B2AC', '#4299E1', '#667EEA'];
    }
  };

  const colors = getPrismColors();

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {colors.map((color, i) => (
        <motion.div
          key={i}
          className="absolute h-full"
          style={{
            width: '2px',
            backgroundColor: color,
            left: `${10 + i * 12}%`,
            filter: 'blur(1px)',
            opacity: 0.6
          }}
          animate={{
            x: [0, 20, 0],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

export default {
  FloatingParticles,
  MorphingGradient,
  FluidWave,
  GlowHalo,
  ScanningLines,
  Constellation,
  PrismEffect
};
