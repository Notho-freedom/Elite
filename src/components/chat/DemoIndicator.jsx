import React from 'react';
import { motion } from 'framer-motion';
import { BsRobot, BsInfoCircle } from 'react-icons/bs';

const DemoIndicator = ({ theme, aiEnabled, onToggleAI }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 text-center text-sm relative overflow-hidden"
    >
      {/* Animation de fond */}
      <motion.div
        className="absolute inset-0 bg-white opacity-10"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: 'loop',
          ease: 'linear'
        }}
      />
      
      <div className="relative z-10 flex items-center justify-center gap-2">
        <BsRobot className="text-lg animate-pulse" />
        <span className="font-medium">
          MODE DÉMONSTRATION ELITE CHAT
        </span>
        <div className="flex items-center gap-1 ml-2 text-xs bg-white/20 px-2 py-1 rounded-full">
          <BsInfoCircle />
          <span>IA {aiEnabled ? 'ACTIVE' : 'INACTIVE'}</span>
        </div>
        
        {/* Toggle IA */}
        <button
          onClick={onToggleAI}
          className={`ml-2 relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            aiEnabled ? 'bg-green-400' : 'bg-gray-400'
          }`}
        >
          <span
            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
              aiEnabled ? 'translate-x-5' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      
      {/* Texte défilant */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 text-xs opacity-75"
        animate={{
          x: ['100%', '-100%'],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: 'loop',
          ease: 'linear'
        }}
      >
        ✨ Testez toutes les fonctionnalités : réactions, réponses, épinglage, IA conversationnelle et bien plus ! ✨
      </motion.div>
    </motion.div>
  );
};

export default DemoIndicator;
