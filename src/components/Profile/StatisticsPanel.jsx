import React from 'react';
import { motion } from 'framer-motion';
import {
  FiMessageSquare, FiPhone, FiUsers, FiHeart,
  FiEye, FiTrendingUp, FiDollarSign, FiClock,
  FiStar, FiShare2, FiActivity, FiCalendar
} from 'react-icons/fi';
import { USER_TYPES } from '../../models/UserProfile';

const StatisticsPanel = ({ stats, userType }) => {
  // Statistiques de base
  const basicStats = [
    {
      icon: FiMessageSquare,
      label: 'Messages envoyés',
      value: stats.totalMessages?.toLocaleString() || '0',
      color: 'blue'
    },
    {
      icon: FiPhone,
      label: 'Appels passés',
      value: stats.totalCalls?.toLocaleString() || '0',
      color: 'green'
    },
    {
      icon: FiUsers,
      label: 'Contacts',
      value: stats.totalContacts?.toLocaleString() || '0',
      color: 'purple'
    },
    {
      icon: FiClock,
      label: 'Temps d\'appel',
      value: formatDuration(stats.totalCallDuration || 0),
      color: 'orange'
    }
  ];

  // Statistiques pour créateurs/Elite
  const creatorStats = [
    {
      icon: FiHeart,
      label: 'Abonnés',
      value: stats.followers?.toLocaleString() || '0',
      color: 'red'
    },
    {
      icon: FiUsers,
      label: 'Abonnements',
      value: stats.following?.toLocaleString() || '0',
      color: 'blue'
    },
    {
      icon: FiEye,
      label: 'Vues totales',
      value: stats.totalViews?.toLocaleString() || '0',
      color: 'indigo'
    },
    {
      icon: FiStar,
      label: 'J\'aime reçus',
      value: stats.totalLikes?.toLocaleString() || '0',
      color: 'yellow'
    }
  ];

  // Statistiques de monétisation
  const monetizationStats = [
    {
      icon: FiDollarSign,
      label: 'Gains totaux',
      value: `${stats.totalEarnings?.toLocaleString() || '0'} €`,
      color: 'green'
    },
    {
      icon: FiTrendingUp,
      label: 'Gains mensuels',
      value: `${stats.monthlyEarnings?.toLocaleString() || '0'} €`,
      color: 'emerald'
    },
    {
      icon: FiShare2,
      label: 'Partages',
      value: stats.totalShares?.toLocaleString() || '0',
      color: 'cyan'
    }
  ];

  // Engagement récent
  const engagementStats = [
    {
      label: 'Messages cette semaine',
      value: stats.messagesThisWeek || 0,
      change: '+12%'
    },
    {
      label: 'Messages ce mois',
      value: stats.messagesThisMonth || 0,
      change: '+8%'
    },
    {
      label: 'Temps de réponse moyen',
      value: `${stats.averageResponseTime || 0} min`,
      change: '-5%'
    },
    {
      label: 'Jours consécutifs actifs',
      value: stats.dailyActiveStreaks || 0,
      change: '+2'
    }
  ];

  function formatDuration(seconds) {
    if (!seconds) return '0 min';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes} min`;
  }

  const getColorClasses = (color) => {
    const colors = {
      blue: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
      green: 'text-green-500 bg-green-50 dark:bg-green-900/20',
      purple: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
      orange: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
      red: 'text-red-500 bg-red-50 dark:bg-red-900/20',
      indigo: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
      yellow: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
      emerald: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
      cyan: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
    };
    return colors[color] || colors.blue;
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${getColorClasses(color)}`}>
          <Icon size={20} />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
    </motion.div>
  );

  const EngagementCard = ({ label, value, change }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
        <p className="font-semibold text-gray-900 dark:text-white">{value}</p>
      </div>
      <div className={`text-sm font-medium ${
        change.startsWith('+') ? 'text-green-500' : change.startsWith('-') ? 'text-red-500' : 'text-gray-500'
      }`}>
        {change}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Statistiques de base */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FiActivity className="text-blue-500" />
          Activité générale
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {basicStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </div>

      {/* Statistiques de créateur/Elite */}
      {[USER_TYPES.CREATOR, USER_TYPES.ELITE, USER_TYPES.BUSINESS].includes(userType) && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FiTrendingUp className="text-purple-500" />
            Performance et audience
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {creatorStats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>
        </div>
      )}

      {/* Monétisation pour les comptes éligibles */}
      {[USER_TYPES.CREATOR, USER_TYPES.ELITE, USER_TYPES.BUSINESS].includes(userType) && stats.totalEarnings > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FiDollarSign className="text-green-500" />
            Monétisation
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {monetizationStats.map((stat, index) => (
              <div key={index} className="col-span-1">
                <StatCard {...stat} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Engagement récent */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FiCalendar className="text-orange-500" />
          Engagement récent
        </h3>
        <div className="space-y-3">
          {engagementStats.map((stat, index) => (
            <EngagementCard key={index} {...stat} />
          ))}
        </div>
      </div>

      {/* Emojis favoris */}
      {stats.favoriteEmojis && stats.favoriteEmojis.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Emojis les plus utilisés</h3>
          <div className="flex flex-wrap gap-2">
            {stats.favoriteEmojis.slice(0, 10).map((emoji, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.1 }}
                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-full"
              >
                <span className="text-lg">{emoji.emoji}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{emoji.count}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Graphique d'activité mensuelle */}
      {stats.monthlyStats && stats.monthlyStats.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Activité des 6 derniers mois</h3>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-end justify-between h-32 gap-2">
              {stats.monthlyStats.slice(-6).map((month, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(month.messages / Math.max(...stats.monthlyStats.map(m => m.messages))) * 100}%` }}
                    transition={{ delay: index * 0.1 }}
                    className="w-full bg-blue-500 rounded-t-sm min-h-[4px]"
                  />
                  <div className="mt-2 text-xs text-center">
                    <p className="text-gray-600 dark:text-gray-400">{month.month}</p>
                    <p className="font-medium">{month.messages}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticsPanel;
