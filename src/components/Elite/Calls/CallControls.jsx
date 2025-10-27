import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaPhoneSlash, FaMicrophone, FaMicrophoneSlash, 
  FaVideo, FaVideoSlash, FaDesktop,
  FaCameraRotate, FaUserPlus, FaRecordVinyl
} from 'react-icons/fa6';
import { FaVolumeMute, FaVolumeUp } from 'react-icons/fa'; 
import { useCallStore } from '../../../lib/callStore';

const CallControls = ({ currentCall, mediaState, isVideoCall, isGroupCall }) => {
  const { 
    toggleMute, toggleVideo, toggleSpeaker, toggleRecording, 
    toggleScreenShare, endCall, addParticipant 
  } = useCallStore();

  const controlButtons = [
    // Bouton Mute
    {
      id: 'mute',
      icon: mediaState.isMuted ? FaMicrophoneSlash : FaMicrophone,
      label: mediaState.isMuted ? 'Activer le micro' : 'Couper le micro',
      action: toggleMute,
      variant: mediaState.isMuted ? 'danger' : 'primary',
      shortcut: 'Espace'
    },
    
    // Bouton Vidéo (seulement pour les appels vidéo)
    ...(isVideoCall ? [{
      id: 'video',
      icon: mediaState.isVideoEnabled ? FaVideo : FaVideoSlash,
      label: mediaState.isVideoEnabled ? 'Couper la caméra' : 'Activer la caméra',
      action: toggleVideo,
      variant: mediaState.isVideoEnabled ? 'primary' : 'danger',
      shortcut: 'V'
    }] : []),
    
    // Bouton Haut-parleur
    {
      id: 'speaker',
      icon: mediaState.isSpeakerOn ? FaVolumeUp : FaVolumeMute,
      label: mediaState.isSpeakerOn ? 'Désactiver haut-parleur' : 'Activer haut-parleur',
      action: toggleSpeaker,
      variant: mediaState.isSpeakerOn ? 'primary' : 'secondary',
      shortcut: 'S'
    },
    
    // Bouton Partage d'écran (seulement pour les appels vidéo)
    ...(isVideoCall ? [{
      id: 'screen',
      icon: FaDesktop,
      label: mediaState.isScreenSharing ? 'Arrêter le partage' : 'Partager l\'écran',
      action: toggleScreenShare,
      variant: mediaState.isScreenSharing ? 'warning' : 'secondary'
    }] : []),
    
    // Bouton Enregistrement
    {
      id: 'record',
      icon: FaRecordVinyl,
      label: mediaState.isRecording ? 'Arrêter l\'enregistrement' : 'Enregistrer l\'appel',
      action: toggleRecording,
      variant: mediaState.isRecording ? 'danger' : 'secondary'
    },
    
    // Bouton Ajouter participant (seulement pour les appels de groupe)
    ...(isGroupCall ? [{
      id: 'add',
      icon: FaUserPlus,
      label: 'Ajouter un participant',
      action: () => addParticipant({ id: 'temp', name: 'Nouveau participant' }),
      variant: 'secondary'
    }] : []),
    
    // Bouton Rotation caméra (seulement pour les appels vidéo)
    ...(isVideoCall ? [{
      id: 'rotate',
      icon: FaCameraRotate,
      label: 'Rotation caméra',
      action: () => console.log('Rotation caméra'),
      variant: 'secondary'
    }] : [])
  ];

  const getButtonStyle = (variant) => {
    const baseStyle = "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 active:scale-95";
    
    switch (variant) {
      case 'primary':
        return `${baseStyle} bg-blue-600 hover:bg-blue-700 text-white`;
      case 'danger':
        return `${baseStyle} bg-red-600 hover:bg-red-700 text-white`;
      case 'warning':
        return `${baseStyle} bg-yellow-600 hover:bg-yellow-700 text-white`;
      case 'secondary':
        return `${baseStyle} bg-gray-600 hover:bg-gray-700 text-white`;
      default:
        return `${baseStyle} bg-gray-600 hover:bg-gray-700 text-white`;
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-black/20 backdrop-blur-sm border-t border-white/10">
      <div className="flex items-center justify-center space-x-4 p-6">
        {/* Boutons de contrôle principaux */}
        <div className="flex items-center space-x-4">
          {controlButtons.map((button) => (
            <motion.button
              key={button.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={button.action}
              className={getButtonStyle(button.variant)}
              title={`${button.label} (${button.shortcut || 'Pas de raccourci'})`}
            >
              <button.icon className="text-xl" />
            </motion.button>
          ))}
        </div>
        
        {/* Bouton raccrocher */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={endCall}
          className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all duration-200 transform hover:scale-110 active:scale-95"
          title="Raccrocher (Échap)"
        >
          <FaPhoneSlash className="text-2xl" />
        </motion.button>
      </div>
      
      {/* Indicateurs d'état */}
      <div className="flex items-center justify-center space-x-6 pb-4">
        {mediaState.isMuted && (
          <div className="flex items-center space-x-2 text-red-400 text-sm">
            <FaMicrophoneSlash />
            <span>Micro coupé</span>
          </div>
        )}
        
        {isVideoCall && !mediaState.isVideoEnabled && (
          <div className="flex items-center space-x-2 text-red-400 text-sm">
            <FaVideoSlash />
            <span>Caméra coupée</span>
          </div>
        )}
        
        {mediaState.isRecording && (
          <div className="flex items-center space-x-2 text-red-400 text-sm animate-pulse">
            <FaRecordVinyl />
            <span>Enregistrement en cours</span>
          </div>
        )}
        
        {mediaState.isScreenSharing && (
          <div className="flex items-center space-x-2 text-yellow-400 text-sm">
            <FaDesktop />
            <span>Partage d'écran actif</span>
          </div>
        )}
      </div>
      
      {/* Raccourcis clavier */}
      <div className="text-center pb-2 text-white/60 text-xs">
        <p>Raccourcis: Espace (Mute) • V (Vidéo) • S (Haut-parleur) • Échap (Raccrocher)</p>
      </div>
    </div>
  );
};

export default CallControls;
