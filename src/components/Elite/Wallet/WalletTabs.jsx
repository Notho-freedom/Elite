import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaCoins, FaCreditCard, FaPaypal, FaUniversity, FaApple, FaGoogle,
  FaCheck, FaTimes, FaExclamationTriangle, FaGift, FaStar,
  FaArrowRight, FaShieldAlt, FaLock, FaUserFriends
} from 'react-icons/fa';
import { SiBitcoin } from 'react-icons/si';
import { PAYMENT_METHODS } from '../../lib/eliteCoinStore';

// Onglet d'achat de coins
export const BuyTab = ({ packages, onPurchase, theme, loading, setLoading }) => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS.CARD);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const paymentMethods = [
    { 
      id: PAYMENT_METHODS.CARD, 
      name: 'Carte Bancaire', 
      icon: <FaCreditCard />, 
      description: 'Visa, MasterCard, Amex' 
    },
    { 
      id: PAYMENT_METHODS.PAYPAL, 
      name: 'PayPal', 
      icon: <FaPaypal />, 
      description: 'Paiement sécurisé PayPal' 
    },
    { 
      id: PAYMENT_METHODS.APPLE_PAY, 
      name: 'Apple Pay', 
      icon: <FaApple />, 
      description: 'Touch ID ou Face ID' 
    },
    { 
      id: PAYMENT_METHODS.GOOGLE_PAY, 
      name: 'Google Pay', 
      icon: <FaGoogle />, 
      description: 'Paiement rapide Google' 
    },
    { 
      id: PAYMENT_METHODS.CRYPTO, 
      name: 'Crypto', 
      icon: <SiBitcoin />, 
      description: 'Bitcoin, Ethereum' 
    }
  ];

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    
    setLoading(true);
    try {
      await onPurchase(selectedPackage.id);
      setShowConfirmation(true);
      setTimeout(() => {
        setShowConfirmation(false);
        setSelectedPackage(null);
      }, 3000);
    } catch (error) {
      console.error('Erreur achat:', error);
    } finally {
      setLoading(false);
    }
  };

  if (showConfirmation) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center h-full"
      >
        <div className="text-center p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <FaCheck className="w-10 h-10 text-white" />
          </motion.div>
          <h3 className={`text-2xl font-bold ${theme.textColor} mb-2`}>
            Achat Réussi !
          </h3>
          <p className={`${theme.secondaryText} mb-4`}>
            {selectedPackage?.coins + selectedPackage?.bonus} Elite-Coins ont été ajoutés à votre portefeuille
          </p>
          <div className="flex items-center justify-center gap-2">
            <FaCoins className="w-5 h-5 text-yellow-500" />
            <span className={`text-lg font-semibold ${theme.textColor}`}>
              +{selectedPackage?.coins + selectedPackage?.bonus}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 overflow-y-auto h-full"
    >
      {!selectedPackage ? (
        // Sélection du package
        <div>
          <h3 className={`text-xl font-bold ${theme.textColor} mb-6`}>
            Choisissez votre Pack Elite-Coins
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((package_) => (
              <PackageCard
                key={package_.id}
                package={package_}
                onSelect={setSelectedPackage}
                theme={theme}
              />
            ))}
          </div>
          
          {/* Avantages */}
          <div className={`mt-8 p-4 rounded-lg ${theme.headerBg} border ${theme.borderColor}`}>
            <h4 className={`font-semibold ${theme.textColor} mb-3`}>
              Pourquoi choisir Elite-Coins ?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <FaShieldAlt className="w-4 h-4 text-green-500" />
                <span className={`text-sm ${theme.textColor}`}>
                  Paiements 100% sécurisés
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FaGift className="w-4 h-4 text-purple-500" />
                <span className={`text-sm ${theme.textColor}`}>
                  Bonus sur tous les packs
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FaUserFriends className="w-4 h-4 text-blue-500" />
                <span className={`text-sm ${theme.textColor}`}>
                  Accès exclusif aux salons VIP
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FaStar className="w-4 h-4 text-yellow-500" />
                <span className={`text-sm ${theme.textColor}`}>
                  Programme de fidélité
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Confirmation et paiement
        <div>
          <button
            onClick={() => setSelectedPackage(null)}
            className={`mb-4 text-blue-500 hover:text-blue-600 flex items-center gap-2`}
          >
            ← Changer de pack
          </button>
          
          <div className={`p-4 rounded-lg ${theme.headerBg} border ${theme.borderColor} mb-6`}>
            <h4 className={`font-semibold ${theme.textColor} mb-2`}>
              Récapitulatif de commande
            </h4>
            <div className="flex justify-between items-center">
              <span className={theme.textColor}>{selectedPackage.name}</span>
              <span className={`font-bold ${theme.textColor}`}>
                {selectedPackage.price}€
              </span>
            </div>
            <div className="flex justify-between items-center text-sm mt-1">
              <span className={theme.secondaryText}>
                {selectedPackage.coins} coins + {selectedPackage.bonus} bonus
              </span>
              <span className={`text-green-500 font-medium`}>
                = {selectedPackage.coins + selectedPackage.bonus} coins
              </span>
            </div>
          </div>

          {/* Méthodes de paiement */}
          <h4 className={`font-semibold ${theme.textColor} mb-4`}>
            Méthode de paiement
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {paymentMethods.map((method) => (
              <motion.button
                key={method.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedMethod(method.id)}
                className={`p-4 rounded-lg border ${
                  selectedMethod === method.id
                    ? 'border-blue-500 bg-blue-50'
                    : `${theme.borderColor} ${theme.hoverBg}`
                } flex items-center gap-3 text-left`}
              >
                <div className="text-xl">{method.icon}</div>
                <div>
                  <p className={`font-medium ${theme.textColor}`}>
                    {method.name}
                  </p>
                  <p className={`text-sm ${theme.secondaryText}`}>
                    {method.description}
                  </p>
                </div>
                {selectedMethod === method.id && (
                  <FaCheck className="w-4 h-4 text-blue-500 ml-auto" />
                )}
              </motion.button>
            ))}
          </div>

          {/* Bouton d'achat */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handlePurchase}
            disabled={loading}
            className={`w-full py-4 rounded-lg font-bold text-lg ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600'
            } transition-all duration-200`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                Traitement...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <FaLock className="w-4 h-4" />
                Payer {selectedPackage.price}€
              </div>
            )}
          </motion.button>
          
          <p className={`text-xs ${theme.secondaryText} text-center mt-3`}>
            Paiement sécurisé par cryptage SSL 256-bit
          </p>
        </div>
      )}
    </motion.div>
  );
};

// Carte de package
const PackageCard = ({ package_, onSelect, theme }) => {
  const totalCoins = package_.coins + package_.bonus;
  const savings = package_.bonus > 0 ? Math.round((package_.bonus / package_.coins) * 100) : 0;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(package_)}
      className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
        package_.popular
          ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50'
          : `${theme.borderColor} ${theme.hoverBg}`
      }`}
    >
      {package_.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold">
            ⭐ POPULAIRE
          </span>
        </div>
      )}
      
      <div className="text-center">
        <h4 className={`text-lg font-bold ${theme.textColor} mb-2`}>
          {package_.name}
        </h4>
        
        <div className="mb-4">
          <div className="flex items-center justify-center gap-1 mb-1">
            <FaCoins className="w-6 h-6 text-yellow-500" />
            <span className={`text-3xl font-bold ${theme.textColor}`}>
              {totalCoins}
            </span>
          </div>
          
          {package_.bonus > 0 && (
            <div className="flex items-center justify-center gap-1 text-green-500 text-sm">
              <FaGift className="w-3 h-3" />
              <span>+{package_.bonus} bonus ({savings}% gratuit)</span>
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <span className={`text-2xl font-bold ${theme.textColor}`}>
            {package_.price}€
          </span>
          <p className={`text-sm ${theme.secondaryText}`}>
            {package_.description}
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`w-full py-2 rounded-lg font-medium ${
            package_.popular
              ? 'bg-yellow-400 text-black hover:bg-yellow-500'
              : `${theme.accentBg} ${theme.accentText}`
          } transition-colors duration-200`}
        >
          Choisir ce pack
        </motion.button>
      </div>
    </motion.div>
  );
};

// Onglet de retrait
export const WithdrawTab = ({ wallet, settings, onWithdraw, theme, canAfford, loading, setLoading }) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState(PAYMENT_METHODS.PAYPAL);
  const [error, setError] = useState('');

  const withdrawalMethods = [
    { id: PAYMENT_METHODS.PAYPAL, name: 'PayPal', icon: <FaPaypal />, minTime: '2-3 jours' },
    { id: PAYMENT_METHODS.BANK, name: 'Virement bancaire', icon: <FaUniversity />, minTime: '3-5 jours' }
  ];

  const handleWithdraw = async () => {
    const numAmount = parseInt(amount);
    
    if (!numAmount || numAmount < settings.minAmount) {
      setError(`Montant minimum: ${settings.minAmount} coins`);
      return;
    }
    
    if (numAmount > settings.maxAmount) {
      setError(`Montant maximum: ${settings.maxAmount} coins`);
      return;
    }
    
    if (!canAfford(numAmount)) {
      setError('Solde insuffisant');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await onWithdraw(numAmount, method);
      setAmount('');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fee = amount ? Math.round(parseInt(amount || 0) * (settings.feePercentage / 100)) : 0;
  const netAmount = amount ? parseInt(amount) - fee : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 overflow-y-auto h-full"
    >
      <h3 className={`text-xl font-bold ${theme.textColor} mb-6`}>
        Retirer des Elite-Coins
      </h3>

      {/* Informations */}
      <div className={`p-4 rounded-lg ${theme.headerBg} border ${theme.borderColor} mb-6`}>
        <h4 className={`font-semibold ${theme.textColor} mb-2`}>
          Informations de retrait
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className={theme.secondaryText}>Montant minimum:</span>
            <span className={theme.textColor}>{settings.minAmount} coins</span>
          </div>
          <div className="flex justify-between">
            <span className={theme.secondaryText}>Montant maximum:</span>
            <span className={theme.textColor}>{settings.maxAmount} coins</span>
          </div>
          <div className="flex justify-between">
            <span className={theme.secondaryText}>Frais de traitement:</span>
            <span className={theme.textColor}>{settings.feePercentage}%</span>
          </div>
          <div className="flex justify-between">
            <span className={theme.secondaryText}>Délai de traitement:</span>
            <span className={theme.textColor}>{settings.processingTime}</span>
          </div>
        </div>
      </div>

      {/* Montant */}
      <div className="mb-6">
        <label className={`block text-sm font-medium ${theme.textColor} mb-2`}>
          Montant à retirer
        </label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={settings.minAmount}
            max={Math.min(settings.maxAmount, wallet.balance)}
            placeholder={`Min: ${settings.minAmount}`}
            className={`w-full px-4 py-3 rounded-lg border ${theme.borderColor} ${theme.inputBg} ${theme.textColor} focus:outline-none focus:ring-2 focus:ring-blue-500 pr-16`}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            <FaCoins className="w-4 h-4 text-yellow-500" />
            <span className={`text-sm ${theme.secondaryText}`}>coins</span>
          </div>
        </div>
        
        {amount && (
          <div className="mt-2 p-3 bg-blue-50 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Montant demandé:</span>
              <span className="font-medium">{amount} coins</span>
            </div>
            <div className="flex justify-between text-sm text-red-600">
              <span>Frais ({settings.feePercentage}%):</span>
              <span>-{fee} coins</span>
            </div>
            <div className="flex justify-between text-sm font-bold border-t pt-1 mt-1">
              <span>Montant net:</span>
              <span className="text-green-600">{netAmount} coins</span>
            </div>
          </div>
        )}
      </div>

      {/* Méthode de retrait */}
      <div className="mb-6">
        <label className={`block text-sm font-medium ${theme.textColor} mb-2`}>
          Méthode de retrait
        </label>
        <div className="space-y-2">
          {withdrawalMethods.map((withdrawMethod) => (
            <motion.button
              key={withdrawMethod.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMethod(withdrawMethod.id)}
              className={`w-full p-4 rounded-lg border ${
                method === withdrawMethod.id
                  ? 'border-blue-500 bg-blue-50'
                  : `${theme.borderColor} ${theme.hoverBg}`
              } flex items-center gap-3 text-left`}
            >
              <div className="text-xl">{withdrawMethod.icon}</div>
              <div className="flex-1">
                <p className={`font-medium ${theme.textColor}`}>
                  {withdrawMethod.name}
                </p>
                <p className={`text-sm ${theme.secondaryText}`}>
                  Délai: {withdrawMethod.minTime}
                </p>
              </div>
              {method === withdrawMethod.id && (
                <FaCheck className="w-4 h-4 text-blue-500" />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
          <FaExclamationTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Bouton de retrait */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleWithdraw}
        disabled={loading || !amount || parseInt(amount) < settings.minAmount}
        className={`w-full py-4 rounded-lg font-bold text-lg ${
          loading || !amount || parseInt(amount) < settings.minAmount
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-red-500 text-white hover:bg-red-600'
        } transition-all duration-200`}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            Traitement...
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <FaArrowRight className="w-4 h-4" />
            Retirer {amount || 0} coins
          </div>
        )}
      </motion.button>
    </motion.div>
  );
};

// Onglet de transfert
export const TransferTab = ({ wallet, onTransfer, theme, canAfford, loading, setLoading }) => {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Simuler la recherche d'utilisateurs
  const searchUsers = (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    // Mock users
    const mockUsers = [
      { id: '1', name: 'Alice Martin', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5e5?w=150&h=150&fit=crop&crop=face', isVerified: true },
      { id: '2', name: 'Bob Johnson', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', isVerified: false },
      { id: '3', name: 'Claire Wilson', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', isVerified: true }
    ];
    
    const filtered = mockUsers.filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(filtered);
  };

  const handleTransfer = async () => {
    const numAmount = parseInt(amount);
    
    if (!numAmount || numAmount < 1) {
      setError('Montant minimum: 1 coin');
      return;
    }
    
    if (!canAfford(numAmount)) {
      setError('Solde insuffisant');
      return;
    }
    
    if (!recipient) {
      setError('Veuillez sélectionner un destinataire');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await onTransfer(numAmount, recipient.id, recipient.name);
      setAmount('');
      setRecipient('');
      setSearchResults([]);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 overflow-y-auto h-full"
    >
      <h3 className={`text-xl font-bold ${theme.textColor} mb-6`}>
        Transférer des Elite-Coins
      </h3>

      {/* Destinataire */}
      <div className="mb-6">
        <label className={`block text-sm font-medium ${theme.textColor} mb-2`}>
          Destinataire
        </label>
        
        {!recipient ? (
          <div>
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              onChange={(e) => searchUsers(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${theme.borderColor} ${theme.inputBg} ${theme.textColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            
            {searchResults.length > 0 && (
              <div className={`mt-2 border ${theme.borderColor} rounded-lg overflow-hidden`}>
                {searchResults.map((user) => (
                  <motion.button
                    key={user.id}
                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                    onClick={() => {
                      setRecipient(user);
                      setSearchResults([]);
                    }}
                    className="w-full p-3 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${theme.textColor}`}>
                          {user.name}
                        </span>
                        {user.isVerified && (
                          <FaCheck className="w-3 h-3 text-blue-500" />
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className={`p-3 border ${theme.borderColor} rounded-lg flex items-center gap-3`}>
            <img
              src={recipient.avatar}
              alt={recipient.name}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`font-medium ${theme.textColor}`}>
                  {recipient.name}
                </span>
                {recipient.isVerified && (
                  <FaCheck className="w-3 h-3 text-blue-500" />
                )}
              </div>
            </div>
            <button
              onClick={() => setRecipient('')}
              className="text-red-500 hover:text-red-600"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Montant */}
      <div className="mb-6">
        <label className={`block text-sm font-medium ${theme.textColor} mb-2`}>
          Montant à transférer
        </label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            max={wallet.balance}
            placeholder="Montant minimum: 1 coin"
            className={`w-full px-4 py-3 rounded-lg border ${theme.borderColor} ${theme.inputBg} ${theme.textColor} focus:outline-none focus:ring-2 focus:ring-blue-500 pr-16`}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            <FaCoins className="w-4 h-4 text-yellow-500" />
            <span className={`text-sm ${theme.secondaryText}`}>coins</span>
          </div>
        </div>
        <p className={`text-sm ${theme.secondaryText} mt-1`}>
          Solde disponible: {wallet.balance} coins
        </p>
      </div>

      {/* Erreur */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
          <FaExclamationTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Bouton de transfert */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleTransfer}
        disabled={loading || !amount || !recipient || parseInt(amount) < 1}
        className={`w-full py-4 rounded-lg font-bold text-lg ${
          loading || !amount || !recipient || parseInt(amount) < 1
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        } transition-all duration-200`}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            Transfert...
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <FaArrowRight className="w-4 h-4" />
            Transférer {amount || 0} coins
          </div>
        )}
      </motion.button>
      
      <p className={`text-xs ${theme.secondaryText} text-center mt-3`}>
        Les transferts sont instantanés et sécurisés
      </p>
    </motion.div>
  );
};

// Onglet historique
export const HistoryTab = ({ transactions, theme }) => {
  const [filter, setFilter] = useState('all');
  
  const filters = [
    { id: 'all', label: 'Toutes' },
    { id: 'purchase', label: 'Achats' },
    { id: 'spend', label: 'Dépenses' },
    { id: 'earn', label: 'Gains' },
    { id: 'transfer', label: 'Transferts' },
    { id: 'withdraw', label: 'Retraits' }
  ];

  const filteredTransactions = transactions.filter(t => 
    filter === 'all' || t.type === filter
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 overflow-y-auto h-full"
    >
      <h3 className={`text-xl font-bold ${theme.textColor} mb-6`}>
        Historique des Transactions
      </h3>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((filterOption) => (
          <motion.button
            key={filterOption.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(filterOption.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === filterOption.id
                ? `${theme.accentBg} ${theme.accentText}`
                : `${theme.borderColor} ${theme.textColor} border hover:${theme.hoverBg}`
            }`}
          >
            {filterOption.label}
          </motion.button>
        ))}
      </div>

      {/* Liste des transactions */}
      <div className="space-y-3">
        {filteredTransactions.map((transaction) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            theme={theme}
          />
        ))}
      </div>
      
      {filteredTransactions.length === 0 && (
        <div className="text-center py-12">
          <FaCoins className={`w-16 h-16 ${theme.secondaryText} mx-auto mb-4`} />
          <p className={`${theme.secondaryText}`}>
            Aucune transaction trouvée
          </p>
        </div>
      )}
    </motion.div>
  );
};

// Item de transaction détaillé
const TransactionItem = ({ transaction, theme }) => {
  const getTransactionIcon = (type) => {
    const icons = {
      purchase: <FaPlus className="w-4 h-4 text-green-500" />,
      spend: <FaMinus className="w-4 h-4 text-red-500" />,
      earn: <FaGift className="w-4 h-4 text-yellow-500" />,
      transfer: <FaArrowRight className="w-4 h-4 text-blue-500" />,
      withdraw: <FaArrowRight className="w-4 h-4 text-purple-500" />,
    };
    return icons[type] || <FaCoins className="w-4 h-4" />;
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Terminé</span>,
      pending: <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">En cours</span>,
      failed: <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Échoué</span>,
      cancelled: <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Annulé</span>
    };
    return badges[status] || badges.pending;
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`p-4 rounded-lg ${theme.hoverBg} border ${theme.borderColor}`}
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          {getTransactionIcon(transaction.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className={`font-medium ${theme.textColor} truncate`}>
              {transaction.description}
            </p>
            <p className={`font-bold ${transaction.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {transaction.amount >= 0 ? '+' : ''}{transaction.amount}
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className={`text-sm ${theme.secondaryText}`}>
                {new Date(transaction.date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              {transaction.reference && (
                <span className={`text-xs ${theme.secondaryText} font-mono`}>
                  #{transaction.reference}
                </span>
              )}
            </div>
            {getStatusBadge(transaction.status)}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
