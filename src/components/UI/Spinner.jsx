import { motion } from 'framer-motion';

export const Spinner = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ 
      repeat: Infinity, 
      duration: 0.8, 
      ease: "linear" 
    }}
    className="h-5 w-5 border-2 border-t-transparent border-amber-400 rounded-full"
  />
);