import React from 'react';
import { motion } from 'framer-motion';
import {
  FiStar, FiShield, FiAward, FiCheck,
  FiCalendar, FiCreditCard, FiTrendingUp, FiZap
} from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';

import { USER_TYPES } from '../../models/UserProfile';

const SubscriptionInfo = ({ subscription, userType }) => {
  // Configuration des plans
  const planConfig = {
    [USER_TYPES.FREE]: {
      name: 'Gratuit',
      icon: FiStar,
      color: 'gray',
      features: ['Chat de base', 'Profil simple', 'Groupes limités']
    },
    [USER_TYPES.PREMIUM]: {
      name: 'Premium',
      icon: FiAward,
      color: 'green',
      gradient: 'from-green-500 to-emerald-600',
      features: [
        'Chat illimité',
        'Profil enrichi',
        'Groupes illimités',
        'Stockage étendu',
        'Support prioritaire'
      ]
    },
    [USER_TYPES.CREATOR]: {
      name: 'Creator',
      icon: FiZap,
      color: 'purple',
      gradient: 'from-purple-500 to-pink-600',
      features: [
        'Toutes les fonctionnalités Premium',
        'Outils de création',
        'Monétisation',
        'Analytics avancées',
        'Badge vérifié'
      ]
    },
    [USER_TYPES.ELITE]: {
      name: 'Elite',
      icon: FaCrown,
      color: 'yellow',
      gradient: 'from-yellow-500 to-orange-600',
      features: [
        'Accès exclusif Elite',
        'Fonctionnalités expérimentales',
        'Support VIP',
        'Revenus maximisés',
        'Statut prestigieux'
      ]
    },
    [USER_TYPES.BUSINESS]: {
      name: 'Business',
      icon: FiShield,
      color: 'blue',
      gradient: 'from-blue-500 to-indigo-600',
      features: [
        'Outils entreprise',
        'Gestion d\'équipe',
        'Intégrations avancées',
        'Sécurité renforcée',
        'Support dédié'
      ]
    }
  };

  const currentPlan = planConfig[userType] || planConfig[USER_TYPES.FREE];
  const PlanIcon = currentPlan.icon;

  // Simuler des données d'abonnement pour la démo
  const mockSubscription = {
    plan: userType,
    isActive: userType !== USER_TYPES.FREE,
    startDate: '2024-01-15',
    endDate: '2025-01-15',
    autoRenew: true,
    billingCycle: 'yearly',
    amount: userType === USER_TYPES.PREMIUM ? 9.99 : 
            userType === USER_TYPES.CREATOR ? 19.99 :
            userType === USER_TYPES.ELITE ? 39.99 :
            userType === USER_TYPES.BUSINESS ? 29.99 : 0,
    currency: 'EUR',
    ...subscription
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getDaysUntilRenewal = () => {
    if (!mockSubscription.endDate) return null;
    const endDate = new Date(mockSubscription.endDate);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = getDaysUntilRenewal();

  return (
    <div className="space-y-4">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <FiCreditCard className="text-blue-500" />
        Abonnement
      </h3>

      {/* Carte du plan actuel */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`relative p-4 rounded-lg border-2 ${
          currentPlan.color === 'yellow' ? 'border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50' :
          currentPlan.color === 'purple' ? 'border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50' :
          currentPlan.color === 'green' ? 'border-green-300 bg-gradient-to-r from-green-50 to-emerald-50' :
          currentPlan.color === 'blue' ? 'border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50' :
          'border-gray-300 bg-gray-50'
        } dark:border-gray-600 dark:bg-gray-800`}
      >
        {/* Badge du plan */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg bg-gradient-to-r ${currentPlan.gradient || 'from-gray-400 to-gray-600'}`}>
              <PlanIcon className="text-white" size={24} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                Plan {currentPlan.name}
              </h4>
              {mockSubscription.isActive && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Actif depuis {formatDate(mockSubscription.startDate)}
                </p>
              )}
            </div>
          </div>

          {mockSubscription.isActive && (
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockSubscription.amount}€
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                /{mockSubscription.billingCycle === 'yearly' ? 'an' : 'mois'}
              </p>
            </div>
          )}
        </div>

        {/* Statut et renouvellement */}
        {mockSubscription.isActive && (
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-2">
                <FiCalendar className="text-gray-500" size={16} />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Renouvellement
                </span>
              </div>
              <span className="font-medium">
                {formatDate(mockSubscription.endDate)}
              </span>
            </div>

            {daysLeft && daysLeft > 0 && (
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-700 dark:text-green-300">
                    {daysLeft} jours restants
                  </span>
                </div>
                {mockSubscription.autoRenew && (
                  <span className="text-xs text-green-600 dark:text-green-400">
                    Renouvellement automatique
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Fonctionnalités incluses */}
        <div>
          <h5 className="font-medium text-gray-900 dark:text-white mb-2">
            Fonctionnalités incluses
          </h5>
          <div className="grid grid-cols-1 gap-2">
            {currentPlan.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <FiCheck className="text-green-500" size={16} />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Effet de brillance pour Elite */}
        {userType === USER_TYPES.ELITE && (
          <motion.div
            className="absolute inset-0 rounded-lg"
            animate={{
              background: [
                'transparent',
                'radial-gradient(circle at center, rgba(255,215,0,0.1) 0%, transparent 70%)',
                'transparent'
              ]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: 'loop'
            }}
          />
        )}
      </motion.div>

      {/* Avantages spéciaux */}
      {[USER_TYPES.CREATOR, USER_TYPES.ELITE, USER_TYPES.BUSINESS].includes(userType) && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
            <FiTrendingUp size={16} />
            Avantages exclusifs
          </h5>
          <div className="text-sm text-blue-700 dark:text-blue-300">
            {userType === USER_TYPES.CREATOR && (
              <p>🎨 Accès aux outils de création avancés et monétisation de contenu</p>
            )}
            {userType === USER_TYPES.ELITE && (
              <p>👑 Statut prestigieux et accès aux fonctionnalités expérimentales</p>
            )}
            {userType === USER_TYPES.BUSINESS && (
              <p>🏢 Outils de gestion d'équipe et intégrations entreprise</p>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      {mockSubscription.isActive && (
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            Gérer l'abonnement
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
          >
            Factures
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionInfo;
