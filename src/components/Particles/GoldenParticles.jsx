import { motion } from 'framer-motion';
import clsx from 'clsx';

const PARTICLE_COUNT = 24;
const COLORS = [
  "bg-amber-300", 
  "bg-yellow-400", 
  "bg-amber-200", 
  "bg-yellow-300"
];

const Particle = ({ id }) => {
  const duration = 10 + Math.random() * 15;
  const delay = Math.random() * 8;
  const size = 2 + Math.random() * 3;
  const startX = Math.random() * 100;
  const startY = Math.random() * 100;

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0,
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
        rotate: 0
      }}
      animate={{
        opacity: [0, 0.8, 0],
        scale: [0, 1.5, 0],
        x: [startX, startX + (Math.random() * 40 - 20), startX + (Math.random() * 60 - 30)],
        y: [startY, startY + (Math.random() * 40 - 20), startY + (Math.random() * 60 - 30)],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut",
        delay,
        times: [0, 0.5, 1]
      }}
      className={clsx(
        "absolute rounded-full",
        COLORS[id % 4],
        "blur-[1px]",
        "z-0"
      )}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        left: `${startX}%`,
        top: `${startY}%`,
        boxShadow: `0 0 ${size*2}px ${size/2}px rgba(245, 158, 11, 0.3)`
      }}
    />
  );
};

export const GoldenParticles = () => (
  <>
    {[...Array(PARTICLE_COUNT)].map((_, i) => (
      <Particle key={i} id={i} />
    ))}
  </>
);