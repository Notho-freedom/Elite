import React from 'react';
import { motion } from 'framer-motion';
import {
  FiShield, FiEye, FiEyeOff, FiLock, FiUnlock,
  FiUsers, FiGlobe, FiUserCheck, FiUserX,
  FiInfo, FiSettings, FiMail, FiPhone
} from 'react-icons/fi';
import { PRIVACY_LEVELS } from '../../models/UserProfile';

const PrivacySettings = ({ privacy, preferences, isOwn = false }) => {
  // Configuration des niveaux de confidentialité
  const privacyLevelConfig = {
    [PRIVACY_LEVELS.PUBLIC]: {
      icon: FiGlobe,
      label: 'Public',
      description: 'Visible par tout le monde',
      color: 'green'
    },
    [PRIVACY_LEVELS.FRIENDS]: {
      icon: FiUsers,
      label: 'Amis',
      description: 'Visible par vos amis uniquement',
      color: 'blue'
    },
    [PRIVACY_LEVELS.CONNECTIONS]: {
      icon: FiUserCheck,
      label: 'Connexions',
      description: 'Visible par vos connexions',
      color: 'purple'
    },
    [PRIVACY_LEVELS.PRIVATE]: {
      icon: FiLock,
      label: 'Privé',
      description: 'Visible par vous uniquement',
      color: 'red'
    }
  };

  // Paramètres de confidentialité visibles
  const privacySettings = [
    {
      key: 'profileVisibility',
      label: 'Visibilité du profil',
      description: 'Qui peut voir votre profil complet',
      value: privacy?.profileVisibility || PRIVACY_LEVELS.PUBLIC,
      icon: FiEye
    },
    {
      key: 'showEmail',
      label: 'Adresse email',
      description: 'Qui peut voir votre adresse email',
      value: privacy?.showEmail || PRIVACY_LEVELS.PRIVATE,
      icon: FiMail
    },
    {
      key: 'showPhoneNumber',
      label: 'Numéro de téléphone',
      description: 'Qui peut voir votre numéro',
      value: privacy?.showPhoneNumber || PRIVACY_LEVELS.PRIVATE,
      icon: FiPhone
    },
    {
      key: 'showLastSeen',
      label: 'Dernière connexion',
      description: 'Qui peut voir quand vous étiez en ligne',
      value: privacy?.showLastSeen || PRIVACY_LEVELS.FRIENDS,
      icon: FiEye
    },
    {
      key: 'showOnlineStatus',
      label: 'Statut en ligne',
      description: 'Qui peut voir si vous êtes en ligne',
      value: privacy?.showOnlineStatus || PRIVACY_LEVELS.FRIENDS,
      icon: FiEye
    },
    {
      key: 'allowMessagesFrom',
      label: 'Messages autorisés',
      description: 'Qui peut vous envoyer des messages',
      value: privacy?.allowMessagesFrom || PRIVACY_LEVELS.PUBLIC,
      icon: FiUsers
    },
    {
      key: 'allowCallsFrom',
      label: 'Appels autorisés',
      description: 'Qui peut vous appeler',
      value: privacy?.allowCallsFrom || PRIVACY_LEVELS.FRIENDS,
      icon: FiPhone
    }
  ];

  // Paramètres booléens
  const booleanSettings = [
    {
      key: 'showProfileInSearch',
      label: 'Apparaître dans les recherches',
      description: 'Votre profil peut être trouvé via la recherche',
      value: privacy?.showProfileInSearch !== false,
      icon: FiGlobe
    },
    {
      key: 'allowDataCollection',
      label: 'Collecte de données analytiques',
      description: 'Autoriser la collecte de données pour améliorer l\'expérience',
      value: privacy?.allowDataCollection !== false,
      icon: FiInfo
    },
    {
      key: 'allowPersonalizedAds',
      label: 'Publicités personnalisées',
      description: 'Recevoir des publicités basées sur vos préférences',
      value: privacy?.allowPersonalizedAds !== false,
      icon: FiSettings
    }
  ];

  const PrivacyLevelBadge = ({ level }) => {
    const config = privacyLevelConfig[level];
    if (!config) return null;

    const Icon = config.icon;
    const colorClasses = {
      green: 'bg-green-100 text-green-700 border-green-200',
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      red: 'bg-red-100 text-red-700 border-red-200'
    };

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${colorClasses[config.color]}`}>
        <Icon size={12} />
        {config.label}
      </div>
    );
  };

  const PrivacySettingRow = ({ setting }) => (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <setting.icon className="text-gray-600 dark:text-gray-400" size={16} />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 dark:text-white">
              {setting.label}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {setting.description}
            </p>
          </div>
        </div>
        <PrivacyLevelBadge level={setting.value} />
      </div>
    </div>
  );

  const BooleanSettingRow = ({ setting }) => (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <setting.icon className="text-gray-600 dark:text-gray-400" size={16} />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 dark:text-white">
              {setting.label}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {setting.description}
            </p>
          </div>
        </div>
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${
          setting.value
            ? 'bg-green-100 text-green-700 border-green-200'
            : 'bg-gray-100 text-gray-700 border-gray-200'
        }`}>
          {setting.value ? <FiEye size={12} /> : <FiEyeOff size={12} />}
          {setting.value ? 'Activé' : 'Désactivé'}
        </div>
      </div>
    </div>
  );

  if (!isOwn) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FiShield className="text-blue-500" />
          Confidentialité
        </h3>
        
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">🔒</div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Paramètres privés
          </h4>
          <p className="text-gray-600 dark:text-gray-400">
            Les paramètres de confidentialité ne sont visibles que par le propriétaire du profil.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FiShield className="text-blue-500" />
          Confidentialité et sécurité
        </h3>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Modifier
        </motion.button>
      </div>

      {/* Informations importantes */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
        <div className="flex items-start gap-3">
          <FiInfo className="text-blue-500 mt-0.5" size={16} />
          <div>
            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">
              Contrôlez votre confidentialité
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Ces paramètres vous permettent de contrôler qui peut voir vos informations et interagir avec vous.
            </p>
          </div>
        </div>
      </div>

      {/* Paramètres de visibilité */}
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
          Visibilité des informations
        </h4>
        <div className="space-y-3">
          {privacySettings.map((setting) => (
            <PrivacySettingRow key={setting.key} setting={setting} />
          ))}
        </div>
      </div>

      {/* Paramètres généraux */}
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
          Paramètres généraux
        </h4>
        <div className="space-y-3">
          {booleanSettings.map((setting) => (
            <BooleanSettingRow key={setting.key} setting={setting} />
          ))}
        </div>
      </div>

      {/* Utilisateurs bloqués */}
      {privacy?.blockedUsers && privacy.blockedUsers.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            Utilisateurs bloqués
          </h4>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <FiUserX size={16} />
              <span className="font-medium">
                {privacy.blockedUsers.length} utilisateur{privacy.blockedUsers.length > 1 ? 's' : ''} bloqué{privacy.blockedUsers.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Aide */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
          Besoin d'aide ?
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Consultez notre centre d'aide pour en savoir plus sur la confidentialité et la sécurité.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-sm text-blue-500 hover:text-blue-600 font-medium"
        >
          Centre d'aide →
        </motion.button>
      </div>
    </div>
  );
};

export default PrivacySettings;
