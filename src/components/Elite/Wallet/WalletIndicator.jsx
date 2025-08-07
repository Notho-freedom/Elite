import React from 'react';
import { motion } from 'framer-motion';
import { FaCoins, FaPlus } from 'react-icons/fa';
import { useEliteCoins } from '../../lib/eliteCoinStore';
import { useApp } from '../Context/AppContext';

// Indicateur de solde Elite-Coins (pour sidebar)
const WalletIndicator = ({ onClick, compact = false }) => {
  const { wallet } = useEliteCoins();
  const { theme } = useApp();

  if (compact) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-medium shadow-sm"
      >
        <FaCoins className="w-4 h-4" />
        <span className="text-sm">{wallet.balance}</span>
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full p-3 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-white ${theme.shadow}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <FaCoins className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-xs font-medium opacity-90">Elite-Coins</p>
            <p className="text-lg font-bold">{wallet.balance.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <FaPlus className="w-3 h-3" />
          </div>
        </div>
      </div>
      
      {wallet.vipStatus && (
        <div className="mt-2 text-xs bg-white/20 rounded-full px-2 py-1 inline-block">
          ✨ VIP Member
        </div>
      )}
    </motion.button>
  );
};

export default WalletIndicator;
