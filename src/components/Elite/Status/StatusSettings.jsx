import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaEye, FaEyeSlash, FaClock, FaBell, FaCoins, FaCrown, FaShieldAlt, FaGlobe, FaUsers, FaUserFriends, FaCog, FaSave, FaUndo } from 'react-icons/fa';
import { useStatusStore } from '../../../lib/statusStore';
import { useApp } from '../../Context/AppContext';

const StatusSettings = ({ onClose }) => {
  const { theme } = useApp();
  const { settings, updateSettings, creationSettings, updateCreationSettings } = useStatusStore();
  
  const [localSettings, setLocalSettings] = useState({ ...settings });
  const [localCreationSettings, setLocalCreationSettings] = useState({ ...creationSettings });
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);

  const tabs = [
    { id: 'general', label: 'Général', icon: <FaCog /> },
    { id: 'privacy', label: 'Confidentialité', icon: <FaShieldAlt /> },
    { id: 'monetization', label: 'Monétisation', icon: <FaCoins /> },
    { id: 'notifications', label: 'Notifications', icon: <FaBell /> }
  ];

  const handleSettingChange = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleCreationSettingChange = (key, value) => {
    setLocalCreationSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleMonetizationChange = (key, value) => {
    setLocalCreationSettings(prev => ({
      ...prev,
      monetization: { ...prev.monetization, [key]: value }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateSettings(localSettings);
    updateCreationSettings(localCreationSettings);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalSettings({ ...settings });
    setLocalCreationSettings({ ...creationSettings });
    setHasChanges(false);
  };

  const renderGeneralTab = () => (
    <div className="space-y-6">
      {/* Archivage automatique */}
      <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className="text-lg font-semibold mb-4">Archivage automatique</h3>
        
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={localSettings.autoArchive}
              onChange={(e) => handleSettingChange('autoArchive', e.target.checked)}
              className="text-blue-500"
            />
            <span>Archiver automatiquement les statuts expirés</span>
          </label>
          
          <div>
            <label className="block text-sm font-medium mb-2">Archiver après</label>
            <select
              value={localSettings.archiveAfterDays}
              onChange={(e) => handleSettingChange('archiveAfterDays', parseInt(e.target.value))}
              className={`w-full p-3 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value={1}>1 jour</option>
              <option value={3}>3 jours</option>
              <option value={7}>7 jours</option>
              <option value={14}>14 jours</option>
              <option value={30}>30 jours</option>
            </select>
          </div>
        </div>
      </div>

      {/* Paramètres par défaut */}
      <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className="text-lg font-semibold mb-4">Paramètres par défaut</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Durée d'affichage par défaut</label>
            <select
              value={localCreationSettings.duration}
              onChange={(e) => handleCreationSettingChange('duration', parseInt(e.target.value))}
              className={`w-full p-3 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value={1}>1 heure</option>
              <option value={6}>6 heures</option>
              <option value={12}>12 heures</option>
              <option value={24}>24 heures</option>
              <option value={48}>48 heures</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Confidentialité par défaut</label>
            <select
              value={localCreationSettings.privacy}
              onChange={(e) => handleCreationSettingChange('privacy', e.target.value)}
              className={`w-full p-3 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="contacts">Mes contacts</option>
              <option value="public">Public</option>
              <option value="custom">Personnalisé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Options d'interaction */}
      <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className="text-lg font-semibold mb-4">Options d'interaction</h3>
        
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={localCreationSettings.allowReplies}
              onChange={(e) => handleCreationSettingChange('allowReplies', e.target.checked)}
              className="text-blue-500"
            />
            <span>Autoriser les réponses par défaut</span>
          </label>
          
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={localCreationSettings.allowReactions}
              onChange={(e) => handleCreationSettingChange('allowReactions', e.target.checked)}
              className="text-blue-500"
            />
            <span>Autoriser les réactions par défaut</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      {/* Confidentialité générale */}
      <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className="text-lg font-semibold mb-4">Confidentialité générale</h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-lg border">
            <FaGlobe className="w-5 h-5 text-blue-500" />
            <div className="flex-1">
              <p className="font-medium">Public</p>
              <p className="text-sm text-gray-500">Tout le monde peut voir vos statuts</p>
            </div>
            <input
              type="radio"
              name="defaultPrivacy"
              value="public"
              checked={localCreationSettings.privacy === 'public'}
              onChange={(e) => handleCreationSettingChange('privacy', e.target.value)}
              className="text-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-3 p-4 rounded-lg border">
            <FaUserFriends className="w-5 h-5 text-green-500" />
            <div className="flex-1">
              <p className="font-medium">Mes contacts</p>
              <p className="text-sm text-gray-500">Seuls vos contacts peuvent voir vos statuts</p>
            </div>
            <input
              type="radio"
              name="defaultPrivacy"
              value="contacts"
              checked={localCreationSettings.privacy === 'contacts'}
              onChange={(e) => handleCreationSettingChange('privacy', e.target.value)}
              className="text-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-3 p-4 rounded-lg border">
            <FaCog className="w-5 h-5 text-purple-500" />
            <div className="flex-1">
              <p className="font-medium">Personnalisé</p>
              <p className="text-sm text-gray-500">Choisir qui peut voir chaque statut</p>
            </div>
            <input
              type="radio"
              name="defaultPrivacy"
              value="custom"
              checked={localCreationSettings.privacy === 'custom'}
              onChange={(e) => handleCreationSettingChange('privacy', e.target.value)}
              className="text-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Exceptions */}
      <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className="text-lg font-semibold mb-4">Exceptions</h3>
        
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={localSettings.privacy === 'excludeBlocked'}
              onChange={(e) => handleSettingChange('privacy', { ...localSettings.privacy, excludeBlocked: e.target.checked })}
              className="text-blue-500"
            />
            <span>Exclure les utilisateurs bloqués</span>
          </label>
          
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={localSettings.privacy === 'excludeStrangers'}
              onChange={(e) => handleSettingChange('privacy', { ...localSettings.privacy, excludeStrangers: e.target.checked })}
              className="text-blue-500"
            />
            <span>Exclure les utilisateurs non contacts</span>
          </label>
        </div>
      </div>

      {/* Liste des spectateurs personnalisés */}
      {localCreationSettings.privacy === 'custom' && (
        <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h3 className="text-lg font-semibold mb-4">Spectateurs personnalisés</h3>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Rechercher un contact..."
                className={`flex-1 p-3 rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
                Ajouter
              </button>
            </div>
            
            <div className="space-y-2">
              {localCreationSettings.customViewers.map((viewer, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <span>{viewer}</span>
                  <button className="text-red-500 hover:text-red-700">
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderMonetizationTab = () => (
    <div className="space-y-6">
      {/* Activation de la monétisation */}
      <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className="text-lg font-semibold mb-4">Activation de la monétisation</h3>
        
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={localSettings.monetization.enabled}
              onChange={(e) => handleSettingChange('monetization', { ...localSettings.monetization, enabled: e.target.checked })}
              className="text-blue-500"
            />
            <span>Activer la monétisation pour mes statuts</span>
          </label>
          
          <p className="text-sm text-gray-500">
            Activez cette option pour pouvoir créer des statuts Elite monétisés
          </p>
        </div>
      </div>

      {/* Paramètres de monétisation */}
      {localSettings.monetization.enabled && (
        <>
          <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h3 className="text-lg font-semibold mb-4">Paramètres par défaut</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Prix par défaut (Elite-Coins)</label>
                <input
                  type="number"
                  min="0"
                  value={localSettings.monetization.defaultPrice}
                  onChange={(e) => handleSettingChange('monetization', { ...localSettings.monetization, defaultPrice: parseInt(e.target.value) || 0 })}
                  className={`w-full p-3 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Type de monétisation par défaut</label>
                <select
                  value={localCreationSettings.monetization.type}
                  onChange={(e) => handleMonetizationChange('type', e.target.value)}
                  className={`w-full p-3 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="view_payment">Paiement par vue</option>
                  <option value="tip">Pourboire</option>
                  <option value="premium_content">Contenu premium</option>
                </select>
              </div>
            </div>
          </div>

          {/* Seuils de paiement */}
          <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h3 className="text-lg font-semibold mb-4">Seuils de paiement</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Prix minimum (Elite-Coins)</label>
                <input
                  type="number"
                  min="0"
                  value={localSettings.monetization.minPrice || 0}
                  onChange={(e) => handleSettingChange('monetization', { ...localSettings.monetization, minPrice: parseInt(e.target.value) || 0 })}
                  className={`w-full p-3 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Prix maximum (Elite-Coins)</label>
                <input
                  type="number"
                  min="0"
                  value={localSettings.monetization.maxPrice || 1000}
                  onChange={(e) => handleSettingChange('monetization', { ...localSettings.monetization, maxPrice: parseInt(e.target.value) || 1000 })}
                  className={`w-full p-3 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      {/* Notifications générales */}
      <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className="text-lg font-semibold mb-4">Notifications générales</h3>
        
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={localSettings.notifications}
              onChange={(e) => handleSettingChange('notifications', e.target.checked)}
              className="text-blue-500"
            />
            <span>Activer les notifications pour les statuts</span>
          </label>
          
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={localSettings.notifications === 'reactions'}
              onChange={(e) => handleSettingChange('notifications', { ...localSettings.notifications, reactions: e.target.checked })}
              className="text-blue-500"
            />
            <span>Notifications de réactions</span>
          </label>
          
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={localSettings.notifications === 'replies'}
              onChange={(e) => handleSettingChange('notifications', { ...localSettings.notifications, replies: e.target.checked })}
              className="text-blue-500"
            />
            <span>Notifications de réponses</span>
          </label>
          
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={localSettings.notifications === 'views'}
              onChange={(e) => handleSettingChange('notifications', { ...localSettings.notifications, views: e.target.checked })}
              className="text-blue-500"
            />
            <span>Notifications de nouvelles vues</span>
          </label>
          
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={localSettings.notifications === 'earnings'}
              onChange={(e) => handleSettingChange('notifications', { ...localSettings.notifications, earnings: e.target.checked })}
              className="text-blue-500"
            />
            <span>Notifications de gains</span>
          </label>
        </div>
      </div>

      {/* Fréquence des notifications */}
      <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className="text-lg font-semibold mb-4">Fréquence des notifications</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Résumé quotidien</label>
            <select
              value={localSettings.notifications === 'dailySummary' ? 'enabled' : 'disabled'}
              onChange={(e) => handleSettingChange('notifications', { ...localSettings.notifications, dailySummary: e.target.value === 'enabled' })}
              className={`w-full p-3 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="enabled">Activé</option>
              <option value="disabled">Désactivé</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Résumé hebdomadaire</label>
            <select
              value={localSettings.notifications === 'weeklySummary' ? 'enabled' : 'disabled'}
              onChange={(e) => handleSettingChange('notifications', { ...localSettings.notifications, weeklySummary: e.target.value === 'enabled' })}
              className={`w-full p-3 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="enabled">Activé</option>
              <option value="disabled">Désactivé</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg ${
          theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className="text-xl font-bold">Paramètres des statuts</h2>
          
          <div className="flex items-center gap-2">
            {hasChanges && (
              <>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700"
                >
                  <FaUndo className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                >
                  <FaSave className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium ${
                activeTab === tab.id
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'general' && renderGeneralTab()}
          {activeTab === 'privacy' && renderPrivacyTab()}
          {activeTab === 'monetization' && renderMonetizationTab()}
          {activeTab === 'notifications' && renderNotificationsTab()}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StatusSettings;
