import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash,
 FaEllipsis, FaCrown, FaHand,
  FaUser, FaSignal, FaWifi
} from 'react-icons/fa6';
import { AnimatePresence } from 'framer-motion';
import { FaVolumeUp} from 'react-icons/fa';

const CallParticipant = ({ participant, isMain = false, mediaState }) => {
  const [showControls, setShowControls] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Simuler la parole aléatoirement
  React.useEffect(() => {
    if (!isMain) {
      const interval = setInterval(() => {
        setIsSpeaking(Math.random() > 0.7);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isMain]);

  const getParticipantStatus = () => {
    if (participant.isMe) return 'Vous';
    if (participant.isHost) return 'Hôte';
    if (participant.isSpeaking) return 'Parle';
    return 'Connecté';
  };

  const getStatusColor = () => {
    if (participant.isMe) return 'text-blue-400';
    if (participant.isHost) return 'text-yellow-400';
    if (participant.isSpeaking) return 'text-green-400';
    return 'text-gray-400';
  };

  return (
    <motion.div
      className={`relative rounded-2xl overflow-hidden ${
        isMain ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'
      } ${isSpeaking ? 'ring-4 ring-green-400' : ''}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Vidéo ou placeholder */}
      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 relative">
        {isVideoEnabled ? (
          // Placeholder pour la vidéo (simulation)
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <FaUser className="text-white text-3xl" />
              </div>
              <p className="text-white text-lg font-medium">{participant.name}</p>
              <p className="text-gray-400 text-sm">{getParticipantStatus()}</p>
            </div>
          </div>
        ) : (
          // Caméra coupée
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-3 flex items-center justify-center">
                <FaVideoSlash className="text-gray-400 text-2xl" />
              </div>
              <p className="text-white text-sm font-medium">{participant.name}</p>
              <p className="text-gray-400 text-xs">Caméra coupée</p>
            </div>
          </div>
        )}

        {/* Indicateurs de statut */}
        <div className="absolute top-3 left-3 flex items-center space-x-2">
          {/* Statut de connexion */}
          <div className="flex items-center space-x-1">
            <FaSignal className="text-green-400 text-xs" />
            <FaWifi className="text-blue-400 text-xs" />
          </div>
          
          {/* Rôle */}
          {participant.isHost && (
            <div className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <FaCrown className="mr-1" />
              Hôte
            </div>
          )}
          
          {/* Statut de parole */}
          {isSpeaking && (
            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center animate-pulse">
              <FaHand className="mr-1" />
              Parle
            </div>
          )}
        </div>

        {/* Nom du participant */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium text-sm">{participant.name}</p>
                <p className={`text-xs ${getStatusColor()}`}>{getParticipantStatus()}</p>
              </div>
              
              {/* Indicateurs audio/vidéo */}
              <div className="flex items-center space-x-2">
                {isMuted ? (
                  <FaMicrophoneSlash className="text-red-400 text-sm" />
                ) : (
                  <FaMicrophone className="text-green-400 text-sm" />
                )}
                
                {!isVideoEnabled && (
                  <FaVideoSlash className="text-red-400 text-sm" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contrôles au survol */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute top-3 right-3 flex items-center space-x-2"
            >
              {/* Bouton Mute */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isMuted 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-black/50 hover:bg-black/70 text-white'
                }`}
                title={isMuted ? 'Activer le micro' : 'Couper le micro'}
              >
                {isMuted ? <FaMicrophoneSlash className="text-xs" /> : <FaMicrophone className="text-xs" />}
              </button>

              {/* Bouton Vidéo */}
              <button
                onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  !isVideoEnabled 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-black/50 hover:bg-black/70 text-white'
                }`}
                title={isVideoEnabled ? 'Couper la caméra' : 'Activer la caméra'}
              >
                {isVideoEnabled ? <FaVideo className="text-xs" /> : <FaVideoSlash className="text-xs" />}
              </button>

              {/* Bouton Volume */}
              <button
                className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                title="Ajuster le volume"
              >
                <FaVolumeUp className="text-xs" />
              </button>

              {/* Menu d'options */}
              <button
                className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                title="Plus d'options"
              >
                <FaEllipsis className="text-xs" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Indicateur de qualité de connexion */}
        <div className="absolute top-3 right-3">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-white text-xs">HD</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CallParticipant;
