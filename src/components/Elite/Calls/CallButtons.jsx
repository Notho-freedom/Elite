import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPhone, FaVideo,
  FaEllipsis, FaUsers, FaClock, FaStar
} from 'react-icons/fa6';
import { useCallStore, CALL_TYPES } from '../../../lib/callStore';

const CallButtons = ({ discussion, isHovered = false, showLabels = false }) => {
  const { startCall, isInCall } = useCallStore();
  const [showMenu, setShowMenu] = useState(false);
  const [isCalling, setIsCalling] = useState(false);

  const isGroupDiscussion = discussion.type === 'group' || discussion.type === 'broadcast';
  const participants = discussion.participants || [discussion];

  const handleStartCall = async (callType) => {
    if (isInCall()) {
      alert('Vous êtes déjà en appel. Terminez l\'appel actuel avant d\'en commencer un nouveau.');
      return;
    }

    setIsCalling(true);
    
    try {
      // Simuler un délai de connexion
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const callParticipants = participants.map(p => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        isMe: false
      }));

      const callTypeEnum = callType === 'video' 
        ? (isGroupDiscussion ? CALL_TYPES.GROUP_VIDEO : CALL_TYPES.VIDEO)
        : (isGroupDiscussion ? CALL_TYPES.GROUP_VOICE : CALL_TYPES.VOICE);

      startCall(callParticipants, callTypeEnum);
      
      // Simuler la réponse automatique pour la démo
      setTimeout(() => {
        useCallStore.getState().answerCall(useCallStore.getState().getCurrentCall()?.id);
      }, 2000);
      
    } catch (error) {
      console.error('Erreur lors du démarrage de l\'appel:', error);
      alert('Impossible de démarrer l\'appel. Veuillez réessayer.');
    } finally {
      setIsCalling(false);
    }
  };

  const handleVoiceCall = () => {
    handleStartCall('voice');
  };

  const handleVideoCall = () => {
    handleStartCall('video');
  };

  const getCallButtonStyle = (variant = 'primary') => {
    const baseStyle = "flex items-center justify-center transition-all duration-200 transform hover:scale-110 active:scale-95";
    
    switch (variant) {
      case 'voice':
        return `${baseStyle} w-8 h-8 rounded-full bg-green-600 hover:bg-green-700 text-white`;
      case 'video':
        return `${baseStyle} w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white`;
      case 'secondary':
        return `${baseStyle} w-8 h-8 rounded-full bg-gray-600 hover:bg-gray-700 text-white`;
      default:
        return `${baseStyle} w-8 h-8 rounded-full bg-gray-600 hover:bg-gray-700 text-white`;
    }
  };

  const getCallLabel = (type) => {
    if (isGroupDiscussion) {
      return type === 'video' ? 'Appel vidéo groupe' : 'Appel vocal groupe';
    }
    return type === 'video' ? 'Appel vidéo' : 'Appel vocal';
  };

  return (
    <div className="relative">
      {/* Call Buttons */}
      <AnimatePresence>
        {(isHovered || showLabels) && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-center space-x-2"
          >
            {/* Voice Call Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleVoiceCall}
              disabled={isCalling}
              className={getCallButtonStyle('voice')}
              title={getCallLabel('voice')}
            >
              {isCalling ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <FaClock className="text-sm" />
                </motion.div>
              ) : (
                <FaPhone className="text-sm" />
              )}
            </motion.button>

            {/* Video Call Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleVideoCall}
              disabled={isCalling}
              className={getCallButtonStyle('video')}
              title={getCallLabel('video')}
            >
              {isCalling ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <FaClock className="text-sm" />
                </motion.div>
              ) : (
                <FaVideo className="text-sm" />
              )}
            </motion.button>

            {/* More Options Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMenu(!showMenu)}
              className={getCallButtonStyle('secondary')}
              title="Plus d'options"
            >
              <FaEllipsis className="text-sm" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className="absolute right-0 top-full mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50"
          >
            <div className="py-2">
              {/* Call Options */}
              <div className="px-4 py-2 border-b border-gray-700">
                <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                  Options d'appel
                </h3>
                
                <button
                  onClick={() => {
                    handleVoiceCall();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-white hover:bg-gray-700 rounded transition-colors"
                >
                  <FaPhone className="text-green-400" />
                  <span>Appel vocal</span>
                </button>
                
                <button
                  onClick={() => {
                    handleVideoCall();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-white hover:bg-gray-700 rounded transition-colors"
                >
                  <FaVideo className="text-blue-400" />
                  <span>Appel vidéo</span>
                </button>
              </div>

              {/* Quick Actions */}
              <div className="px-4 py-2">
                <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                  Actions rapides
                </h3>
                
                <button
                  onClick={() => {
                    console.log('Ajouter aux favoris');
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-white hover:bg-gray-700 rounded transition-colors"
                >
                  <FaStar className="text-yellow-400" />
                  <span>Ajouter aux favoris</span>
                </button>
                
                <button
                  onClick={() => {
                    console.log('Voir l\'historique');
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-white hover:bg-gray-700 rounded transition-colors"
                >
                  <FaClock className="text-gray-400" />
                  <span>Historique des appels</span>
                </button>
              </div>

              {/* Group Specific Options */}
              {isGroupDiscussion && (
                <div className="px-4 py-2 border-t border-gray-700">
                  <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                    Options de groupe
                  </h3>
                  
                  <button
                    onClick={() => {
                      console.log('Gérer les participants');
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-white hover:bg-gray-700 rounded transition-colors"
                  >
                    <FaUsers className="text-purple-400" />
                    <span>Gérer les participants</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      console.log('Paramètres de groupe');
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-white hover:bg-gray-700 rounded transition-colors"
                  >
                    <FaEllipsis className="text-gray-400" />
                    <span>Paramètres de groupe</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isCalling && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-lg flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CallButtons;
