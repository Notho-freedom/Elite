import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BsGear, 
  BsVolumeUp, 
  BsVolumeOff, 
  BsRobot, 
  BsClock, 
  BsPalette,
  BsShield,
  BsTrash,
  BsDownload,
  BsUpload,
  BsQuestionCircle,
  BsX
} from 'react-icons/bs';
import { FiSettings, FiHelpCircle } from 'react-icons/fi';

const ChatSettings = ({ 
  isOpen, 
  onClose, 
  theme,
  soundEnabled,
  toggleSounds,
  aiEnabled,
  toggleAI,
  autoReplyDelay,
  setAutoReplyDelay,
  onExportChat,
  onImportChat,
  onClearHistory,
  aiStats
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const tabs = [
    { id: 'general', label: 'Général', icon: BsGear },
    { id: 'ai', label: 'IA', icon: BsRobot },
    { id: 'appearance', label: 'Apparence', icon: BsPalette },
    { id: 'privacy', label: 'Confidentialité', icon: BsShield },
    { id: 'about', label: 'À propos', icon: FiHelpCircle }
  ];

  const delayOptions = [
    { value: 1000, label: '1 seconde' },
    { value: 2000, label: '2 secondes' },
    { value: 3000, label: '3 secondes' },
    { value: 5000, label: '5 secondes' },
    { value: 10000, label: '10 secondes' }
  ];

  const handleClearHistory = () => {
    if (showConfirmClear) {
      onClearHistory?.();
      setShowConfirmClear(false);
    } else {
      setShowConfirmClear(true);
    }
  };

  const GeneralTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Sons de notification</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Active les sons pour les messages et notifications
          </p>
        </div>
        <button
          onClick={toggleSounds}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            soundEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              soundEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="border-t pt-6">
        <h3 className="font-medium mb-4">Gestion des données</h3>
        <div className="space-y-3">
          <button
            onClick={onExportChat}
            className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-center gap-3">
              <BsDownload className="text-blue-500" />
              <span>Exporter les conversations</span>
            </div>
          </button>

          <button
            onClick={onImportChat}
            className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-center gap-3">
              <BsUpload className="text-green-500" />
              <span>Importer des conversations</span>
            </div>
          </button>

          <button
            onClick={handleClearHistory}
            className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
              showConfirmClear 
                ? 'bg-red-100 dark:bg-red-900/20 border-2 border-red-500' 
                : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <BsTrash className="text-red-500" />
              <span className={showConfirmClear ? 'text-red-600 font-medium' : ''}>
                {showConfirmClear ? 'Confirmer la suppression' : 'Effacer l\'historique'}
              </span>
            </div>
          </button>
          
          {showConfirmClear && (
            <p className="text-sm text-red-600 dark:text-red-400">
              Cette action est irréversible. Tous vos messages seront supprimés.
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const AITab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Assistant IA</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Active les réponses automatiques intelligentes en mode démo
          </p>
        </div>
        <button
          onClick={toggleAI}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            aiEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              aiEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {aiEnabled && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 border-t pt-6"
          >
            <div>
              <h4 className="font-medium mb-2">Délai de réponse</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Temps d'attente avant que l'IA ne réponde automatiquement
              </p>
              <select
                value={autoReplyDelay}
                onChange={(e) => setAutoReplyDelay(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                {delayOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {aiStats && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Statistiques IA
                </h4>
                <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                  <div>Conversations actives: {aiStats.activeChats}</div>
                  <div>Réponses en cache: {aiStats.cachedResponses}</div>
                  <div>Utilisation mémoire: {aiStats.memoryUsage}</div>
                </div>
              </div>
            )}

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <BsQuestionCircle className="text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">
                    Mode Démonstration
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    L'IA répond automatiquement pour simuler une conversation réelle. 
                    Parfait pour tester les fonctionnalités d'Elite Chat !
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );

  const AppearanceTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-4">Thème</h3>
        <div className="grid grid-cols-2 gap-3">
          <button className="p-3 bg-white border-2 border-gray-300 rounded-lg flex items-center gap-2">
            <div className="w-4 h-4 bg-white border border-gray-400 rounded"></div>
            <span>Clair</span>
          </button>
          <button className="p-3 bg-gray-800 text-white border-2 border-gray-600 rounded-lg flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-800 border border-gray-600 rounded"></div>
            <span>Sombre</span>
          </button>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="font-medium mb-4">Couleurs d'accent</h3>
        <div className="grid grid-cols-4 gap-3">
          {['blue', 'green', 'purple', 'pink'].map(color => (
            <button
              key={color}
              className={`w-full h-10 rounded-lg bg-${color}-500 hover:scale-105 transition-transform`}
            />
          ))}
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="font-medium mb-4">Taille des bulles</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Compact</span>
            <span>Large</span>
          </div>
          <input
            type="range"
            min="0.8"
            max="1.2"
            step="0.1"
            defaultValue="1"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );

  const PrivacyTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Lectures confirmées</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Afficher quand vos messages sont lus
          </p>
        </div>
        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
          <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Statut en ligne</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Montrer votre statut de connexion
          </p>
        </div>
        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
          <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Sauvegarde locale</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sauvegarder les messages localement
          </p>
        </div>
        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
          <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
        </button>
      </div>

      <div className="border-t pt-6">
        <h3 className="font-medium mb-4">Chiffrement</h3>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <BsShield />
            <span className="font-medium">Chiffrement activé</span>
          </div>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
            Vos conversations sont protégées par un chiffrement de bout en bout.
          </p>
        </div>
      </div>
    </div>
  );

  const AboutTab = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <span className="text-white font-bold text-xl">E</span>
        </div>
        <h3 className="font-bold text-xl">Elite Chat</h3>
        <p className="text-gray-600 dark:text-gray-400">Version 2.0.0</p>
      </div>

      <div className="border-t pt-6 space-y-4">
        <div>
          <h4 className="font-medium mb-2">Fonctionnalités</h4>
          <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
            <li>• Messagerie instantanée avancée</li>
            <li>• Intelligence artificielle intégrée</li>
            <li>• Réactions et réponses</li>
            <li>• Partage de médias</li>
            <li>• Appels audio/vidéo</li>
            <li>• Synchronisation multi-appareils</li>
          </ul>
        </div>

        <div>
          <h4 className="font-medium mb-2">Développé par</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Équipe Elite Technologies
          </p>
        </div>

        <div>
          <h4 className="font-medium mb-2">Ressources</h4>
          <div className="space-y-2">
            <button className="w-full p-2 text-left text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded">
              Centre d'aide
            </button>
            <button className="w-full p-2 text-left text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded">
              Signaler un problème
            </button>
            <button className="w-full p-2 text-left text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded">
              Conditions d'utilisation
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general': return <GeneralTab />;
      case 'ai': return <AITab />;
      case 'appearance': return <AppearanceTab />;
      case 'privacy': return <PrivacyTab />;
      case 'about': return <AboutTab />;
      default: return <GeneralTab />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl h-[600px] flex overflow-hidden"
          >
            {/* Sidebar */}
            <div className="w-1/3 bg-gray-50 dark:bg-gray-900 p-4 border-r border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Paramètres</h2>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <BsX size={20} />
                </button>
              </div>

              <nav className="space-y-1">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                {renderTabContent()}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatSettings;
