import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCoins, FaPlus, FaMinus, FaExchangeAlt, FaHistory, 
  FaCreditCard, FaPaypal, FaUniversity, FaApple, FaGoogle,
  FaTimes, FaCheck, FaClock, FaExclamationTriangle,
  FaCrown, FaStar, FaShield, FaGift, FaTrophy,
  FaArrowUp, FaArrowDown, FaArrowRight, FaRefresh
} from 'react-icons/fa';
import { SiBitcoin } from 'react-icons/si';
import { useEliteCoins, TRANSACTION_TYPES, TRANSACTION_STATUS, PAYMENT_METHODS } from '../../lib/eliteCoinStore';
import { useApp } from '../Context/AppContext';
import { BuyTab, WithdrawTab, TransferTab, HistoryTab } from './WalletTabs';

// Composant principal du portefeuille Elite
const EliteWallet = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, buy, withdraw, transfer, history
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { theme } = useApp();
  const {
    wallet,
    transactions,
    packages,
    withdrawalSettings,
    purchaseCoins,
    withdrawCoins,
    transferCoins,
    getStats,
    canAfford
  } = useEliteCoins();

  const stats = useMemo(() => getStats(), [getStats]);

  // Gestion des onglets
  const tabs = [
    { id: 'overview', label: 'Aperçu', icon: <FaCoins /> },
    { id: 'buy', label: 'Acheter', icon: <FaPlus /> },
    { id: 'withdraw', label: 'Retirer', icon: <FaMinus /> },
    { id: 'transfer', label: 'Transférer', icon: <FaExchangeAlt /> },
    { id: 'history', label: 'Historique', icon: <FaHistory /> }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className={`w-full max-w-4xl h-[90vh] ${theme.bgColor} rounded-2xl shadow-xl overflow-hidden flex flex-col`}
        >
          {/* Header */}
          <WalletHeader 
            wallet={wallet} 
            theme={theme} 
            onClose={onClose}
          />

          {/* Navigation */}
          <div className={`flex border-b ${theme.borderColor} ${theme.headerBg}`}>
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? `${theme.accentBg} ${theme.accentText}`
                    : `${theme.textColor} hover:${theme.hoverBg}`
                }`}
              >
                {tab.icon}
                {tab.label}
              </motion.button>
            ))}
          </div>

          {/* Contenu */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <OverviewTab
                  key="overview"
                  wallet={wallet}
                  stats={stats}
                  transactions={transactions.slice(0, 5)}
                  theme={theme}
                />
              )}
              
              {activeTab === 'buy' && (
                <BuyTab
                  key="buy"
                  packages={packages}
                  onPurchase={purchaseCoins}
                  theme={theme}
                  loading={loading}
                  setLoading={setLoading}
                />
              )}
              
              {activeTab === 'withdraw' && (
                <WithdrawTab
                  key="withdraw"
                  wallet={wallet}
                  settings={withdrawalSettings}
                  onWithdraw={withdrawCoins}
                  theme={theme}
                  canAfford={canAfford}
                  loading={loading}
                  setLoading={setLoading}
                />
              )}
              
              {activeTab === 'transfer' && (
                <TransferTab
                  key="transfer"
                  wallet={wallet}
                  onTransfer={transferCoins}
                  theme={theme}
                  canAfford={canAfford}
                  loading={loading}
                  setLoading={setLoading}
                />
              )}
              
              {activeTab === 'history' && (
                <HistoryTab
                  key="history"
                  transactions={transactions}
                  theme={theme}
                />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Header du portefeuille
const WalletHeader = ({ wallet, theme, onClose }) => {
  const getLevelColor = (level) => {
    const colors = {
      Bronze: 'text-orange-600',
      Silver: 'text-gray-500',
      Gold: 'text-yellow-500',
      Platinum: 'text-purple-500',
      Elite: 'text-gradient-to-r from-purple-500 to-pink-500'
    };
    return colors[level] || 'text-gray-500';
  };

  const getLevelIcon = (level) => {
    const icons = {
      Bronze: <FaShield className="w-4 h-4" />,
      Silver: <FaStar className="w-4 h-4" />,
      Gold: <FaCrown className="w-4 h-4" />,
      Platinum: <FaTrophy className="w-4 h-4" />,
      Elite: <FaGift className="w-4 h-4" />
    };
    return icons[level] || <FaShield className="w-4 h-4" />;
  };

  return (
    <div className={`p-6 ${theme.headerBg} border-b ${theme.borderColor}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
            <FaCoins className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme.textColor}`}>
              Elite Wallet
            </h1>
            <div className="flex items-center gap-2">
              <div className={getLevelColor(wallet.level)}>
                {getLevelIcon(wallet.level)}
              </div>
              <span className={`text-sm ${getLevelColor(wallet.level)} font-medium`}>
                {wallet.level}
              </span>
              {wallet.vipStatus && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                  VIP
                </span>
              )}
            </div>
          </div>
        </div>
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className={`p-2 rounded-full ${theme.hoverBg}`}
        >
          <FaTimes className={`w-5 h-5 ${theme.textColor}`} />
        </motion.button>
      </div>

      {/* Solde principal */}
      <div className="text-center py-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <FaCoins className="w-8 h-8 text-yellow-500" />
          <span className={`text-4xl font-bold ${theme.textColor}`}>
            {wallet.balance.toLocaleString()}
          </span>
        </div>
        <p className={`${theme.secondaryText} text-lg`}>
          Elite-Coins disponibles
        </p>
        {wallet.pendingBalance > 0 && (
          <p className={`${theme.secondaryText} text-sm mt-1`}>
            <FaClock className="inline w-3 h-3 mr-1" />
            {wallet.pendingBalance} coins en attente
          </p>
        )}
      </div>
    </div>
  );
};

// Onglet Aperçu
const OverviewTab = ({ wallet, stats, transactions, theme }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 overflow-y-auto h-full"
    >
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Total Gagné"
          value={stats.totalEarned}
          icon={<FaArrowUp className="w-5 h-5 text-green-500" />}
          theme={theme}
        />
        <StatCard
          title="Total Dépensé"
          value={stats.totalSpent}
          icon={<FaArrowDown className="w-5 h-5 text-red-500" />}
          theme={theme}
        />
        <StatCard
          title="Ce Mois"
          value={stats.monthlyEarned - stats.monthlySpent}
          icon={<FaExchangeAlt className="w-5 h-5 text-blue-500" />}
          theme={theme}
          prefix={stats.monthlyEarned - stats.monthlySpent >= 0 ? '+' : ''}
        />
      </div>

      {/* Transactions récentes */}
      <div>
        <h3 className={`text-lg font-semibold ${theme.textColor} mb-4`}>
          Transactions Récentes
        </h3>
        <div className="space-y-2">
          {transactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              theme={theme}
              compact
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Carte statistique
const StatCard = ({ title, value, icon, theme, prefix = '' }) => (
  <div className={`p-4 rounded-lg ${theme.headerBg} border ${theme.borderColor}`}>
    <div className="flex items-center justify-between mb-2">
      <span className={`text-sm ${theme.secondaryText}`}>{title}</span>
      {icon}
    </div>
    <p className={`text-2xl font-bold ${theme.textColor}`}>
      {prefix}{value.toLocaleString()}
    </p>
  </div>
);

// Item de transaction
const TransactionItem = ({ transaction, theme, compact = false }) => {
  const getTransactionIcon = (type) => {
    const icons = {
      [TRANSACTION_TYPES.PURCHASE]: <FaPlus className="w-4 h-4 text-green-500" />,
      [TRANSACTION_TYPES.SPEND]: <FaMinus className="w-4 h-4 text-red-500" />,
      [TRANSACTION_TYPES.EARN]: <FaGift className="w-4 h-4 text-yellow-500" />,
      [TRANSACTION_TYPES.TRANSFER]: <FaExchangeAlt className="w-4 h-4 text-blue-500" />,
      [TRANSACTION_TYPES.WITHDRAW]: <FaArrowDown className="w-4 h-4 text-purple-500" />,
    };
    return icons[type] || <FaCoins className="w-4 h-4" />;
  };

  const getStatusColor = (status) => {
    const colors = {
      [TRANSACTION_STATUS.COMPLETED]: 'text-green-500',
      [TRANSACTION_STATUS.PENDING]: 'text-yellow-500',
      [TRANSACTION_STATUS.FAILED]: 'text-red-500',
      [TRANSACTION_STATUS.CANCELLED]: 'text-gray-500'
    };
    return colors[status] || 'text-gray-500';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`p-3 rounded-lg ${theme.hoverBg} border ${theme.borderColor} flex items-center gap-3`}
    >
      <div className="flex-shrink-0">
        {getTransactionIcon(transaction.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={`font-medium ${theme.textColor} truncate`}>
          {transaction.description}
        </p>
        {!compact && (
          <p className={`text-sm ${theme.secondaryText}`}>
            {new Date(transaction.date).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        )}
      </div>
      
      <div className="text-right">
        <p className={`font-bold ${transaction.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {transaction.amount >= 0 ? '+' : ''}{transaction.amount}
        </p>
        <p className={`text-xs ${getStatusColor(transaction.status)}`}>
          {transaction.status}
        </p>
      </div>
    </motion.div>
  );
};

export default EliteWallet;
