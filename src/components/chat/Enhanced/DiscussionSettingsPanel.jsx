import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineCog,
  HiOutlineBell,
  HiOutlineSwatch,
  HiOutlineCheck,
  HiOutlinePaintBrush
} from 'react-icons/hi2';

import { FaWhatsapp } from 'react-icons/fa';

const DiscussionSettingsPanel = ({ 
  isVisible, 
  onClose, 
  discussion, 
  theme, 
  onThemeChange,
  onBackgroundChange 
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const [selectedBackground, setSelectedBackground] = useState('default');

  // Fond vitré avec effet glassmorphism
  const glassmorphismStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
  };

  // Arrière-plans ELITE avec designs sophistiqués
  const backgroundOptions = [
    { 
      id: 'default', 
      name: 'Défaut', 
      color: 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100',
      pattern: 'bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1)_0%,transparent_50%),radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.1)_0%,transparent_50%)]'
    },
    { 
      id: 'midnight', 
      name: 'Minuit', 
      color: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
      pattern: 'bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.3)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.3)_0%,transparent_50%)]'
    },
    { 
      id: 'aurora', 
      name: 'Aurore', 
      color: 'bg-gradient-to-br from-emerald-50 via-teal-100 to-cyan-100',
      pattern: 'bg-[radial-gradient(circle_at_25%_25%,rgba(16,185,129,0.15)_0%,transparent_50%),radial-gradient(circle_at_75%_75%,rgba(6,182,212,0.15)_0%,transparent_50%)]'
    },
    { 
      id: 'sunset', 
      name: 'Coucher de soleil', 
      color: 'bg-gradient-to-br from-orange-50 via-amber-100 to-pink-100',
      pattern: 'bg-[radial-gradient(circle_at_30%_70%,rgba(251,146,60,0.2)_0%,transparent_50%),radial-gradient(circle_at_70%_30%,rgba(236,72,153,0.2)_0%,transparent_50%)]'
    },
    { 
      id: 'cosmic', 
      name: 'Cosmique', 
      color: 'bg-gradient-to-br from-indigo-50 via-purple-100 to-pink-100',
      pattern: 'bg-[radial-gradient(circle_at_40%_40%,rgba(99,102,241,0.15)_0%,transparent_50%),radial-gradient(circle_at_60%_60%,rgba(168,85,247,0.15)_0%,transparent_50%)]'
    },
    { 
      id: 'forest', 
      name: 'Forêt', 
      color: 'bg-gradient-to-br from-green-50 via-emerald-100 to-teal-100',
      pattern: 'bg-[radial-gradient(circle_at_25%_75%,rgba(34,197,94,0.15)_0%,transparent_50%),radial-gradient(circle_at_75%_25%,rgba(20,184,166,0.15)_0%,transparent_50%)]'
    },
    { 
      id: 'ocean', 
      name: 'Océan', 
      color: 'bg-gradient-to-br from-cyan-50 via-blue-100 to-indigo-100',
      pattern: 'bg-[radial-gradient(circle_at_20%_80%,rgba(6,182,212,0.2)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.2)_0%,transparent_50%)]'
    },
    { 
      id: 'lavender', 
      name: 'Lavande', 
      color: 'bg-gradient-to-br from-violet-50 via-purple-100 to-fuchsia-100',
      pattern: 'bg-[radial-gradient(circle_at_30%_30%,rgba(139,92,246,0.15)_0%,transparent_50%),radial-gradient(circle_at_70%_70%,rgba(217,70,239,0.15)_0%,transparent_50%)]'
    },
    { 
      id: 'desert', 
      name: 'Désert', 
      color: 'bg-gradient-to-br from-amber-50 via-orange-100 to-red-100',
      pattern: 'bg-[radial-gradient(circle_at_40%_60%,rgba(245,158,11,0.2)_0%,transparent_50%),radial-gradient(circle_at_60%_40%,rgba(239,68,68,0.2)_0%,transparent_50%)]'
    }
  ];

  // Thèmes de couleurs
  const themeOptions = [
    { id: 'system', name: 'Système', icon: '🖥️' },
    { id: 'light', name: 'Clair', icon: '☀️' },
    { id: 'dark', name: 'Sombre', icon: '🌙' },
    { id: 'auto', name: 'Auto', icon: '🔄' }
  ];

  const handleBackgroundSelect = (bgId) => {
    setSelectedBackground(bgId);
    if (onBackgroundChange) {
      onBackgroundChange(bgId);
    }
  };

  const handleThemeSelect = (themeId) => {
    if (onThemeChange) {
      onThemeChange(themeId);
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Overlay avec fond vitré */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        />

        {/* Panel principal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md max-h-[80vh] overflow-hidden"
          style={glassmorphismStyle}
          onClick={(e) => e.stopPropagation()}
        >
          {/* En-tête */}
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-500/20">
                <FaWhatsapp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Paramètres de discussion</h3>
                <p className="text-sm text-white/70">{discussion?.name || 'Discussion privée'}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <HiOutlineSwatch className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Navigation par onglets */}
          <div className="flex border-b border-white/20">
            {[
              { id: 'general', name: 'Général', icon: HiOutlineCog },
              { id: 'appearance', name: 'Apparence', icon: HiOutlinePaintBrush },
              { id: 'notifications', name: 'Notifications', icon: HiOutlineBell }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'text-white border-b-2 border-green-400 bg-white/10'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Contenu des onglets */}
          <div className="p-4 max-h-96 overflow-y-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'general' && (
                <motion.div
                  key="general"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-3">
                    <h4 className="font-medium text-white">Informations</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/10">
                        <span className="text-white/80">Nom de la discussion</span>
                        <span className="text-white font-medium">{discussion?.name || 'Discussion privée'}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/10">
                        <span className="text-white/80">Type</span>
                        <span className="text-white font-medium capitalize">{discussion?.type || 'private'}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/10">
                        <span className="text-white/80">Participants</span>
                        <span className="text-white font-medium">{discussion?.participantCount || 2}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'appearance' && (
                <motion.div
                  key="appearance"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {/* Thème */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-white">Thème</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {themeOptions.map((themeOption) => (
                        <button
                          key={themeOption.id}
                          onClick={() => handleThemeSelect(themeOption.id)}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                            theme?.mode === themeOption.id
                              ? 'border-green-400 bg-green-400/20'
                              : 'border-white/20 bg-white/10 hover:bg-white/20'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-1">{themeOption.icon}</div>
                            <div className="text-sm text-white font-medium">{themeOption.name}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                                     {/* Arrière-plan de discussion */}
                   <div className="space-y-3">
                     <h4 className="font-medium text-white">Arrière-plan de discussion</h4>
                     <div className="grid grid-cols-3 gap-3">
                       {backgroundOptions.map((bg) => (
                         <button
                           key={bg.id}
                           onClick={() => handleBackgroundSelect(bg.id)}
                           className={`relative p-3 rounded-xl border-2 transition-all duration-300 group overflow-hidden ${
                             selectedBackground === bg.id
                               ? 'border-green-400 ring-2 ring-green-400/50 scale-105'
                               : 'border-white/20 hover:border-white/40 hover:scale-105'
                           }`}
                         >
                           {/* Fond principal avec pattern */}
                           <div className={`w-full h-20 rounded-lg ${bg.color} ${bg.pattern} relative`}>
                             {/* Effet de brillance */}
                             <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                             
                             {/* Particules flottantes */}
                             <div className="absolute top-2 left-2 w-1 h-1 bg-white/30 rounded-full animate-pulse" />
                             <div className="absolute top-4 right-3 w-0.5 h-0.5 bg-white/40 rounded-full animate-pulse delay-100" />
                             <div className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse delay-200" />
                           </div>
                           
                           {/* Indicateur de sélection */}
                           {selectedBackground === bg.id && (
                             <motion.div 
                               initial={{ scale: 0 }}
                               animate={{ scale: 1 }}
                               className="absolute top-2 right-2 p-1.5 rounded-full bg-green-500 shadow-lg"
                             >
                               <HiOutlineCheck className="w-3 h-3 text-white" />
                             </motion.div>
                           )}
                           
                           {/* Nom de l'arrière-plan */}
                           <div className="mt-2 text-center">
                             <div className="text-xs text-white font-medium drop-shadow-sm">{bg.name}</div>
                           </div>
                           
                           {/* Effet de survol */}
                           <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/5 to-transparent" />
                         </button>
                       ))}
                     </div>
                   </div>
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-3">
                    <h4 className="font-medium text-white">Préférences de notification</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/10">
                        <span className="text-white/80">Notifications push</span>
                        <div className="w-12 h-6 rounded-full bg-green-500 relative">
                          <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/10">
                        <span className="text-white/80">Son</span>
                        <div className="w-12 h-6 rounded-full bg-gray-400 relative">
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/10">
                        <span className="text-white/80">Vibration</span>
                        <div className="w-12 h-6 rounded-full bg-green-500 relative">
                          <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DiscussionSettingsPanel;
