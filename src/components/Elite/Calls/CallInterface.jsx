import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPhone, 
  FaExpand, FaCompress, 
  FaClock, FaSignal, FaWifi, FaBatteryThreeQuarters
} from 'react-icons/fa6';
import {  FaCog } from 'react-icons/fa';
import { useCallStore, CALL_STATES, CALL_TYPES } from '../../../lib/callStore';
import { useApp } from '../../Context/AppContext';
import CallControls from './CallControls';
import CallParticipant from './CallParticipant';
import CallSettings from './CallSettings';
import CallHistory from './CallHistory';

const CallInterface = () => {
  const { currentCall, participants, mediaState, callStats, isInCall, isCallActive } = useCallStore();
  const { user } = useApp();
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  // Timer pour la durée d'appel
  useEffect(() => {
    let interval;
    if (isCallActive()) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    
    return () => clearInterval(interval);
  }, [isCallActive]);

  // Format de la durée
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Gestion des touches clavier
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isInCall()) return;
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          useCallStore.getState().toggleMute();
          break;
        case 'Escape':
          useCallStore.getState().endCall();
          break;
        case 'v':
        case 'V':
          useCallStore.getState().toggleVideo();
          break;
        case 's':
        case 'S':
          useCallStore.getState().toggleSpeaker();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isInCall]);

  if (!isInCall()) return null;

  const isVideoCall = currentCall?.type === CALL_TYPES.VIDEO || currentCall?.type === CALL_TYPES.GROUP_VIDEO;
  const isGroupCall = currentCall?.type === CALL_TYPES.GROUP_VOICE || currentCall?.type === CALL_TYPES.GROUP_VIDEO;
  const connectedParticipants = participants.filter(p => p.state === 'connected');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 ${
          isMinimized ? 'w-80 h-96 bottom-4 right-4 rounded-2xl shadow-2xl' : ''
        }`}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-black/20 backdrop-blur-sm border-b border-white/10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <FaSignal className="text-green-400 text-sm" />
                <FaWifi className="text-blue-400 text-sm" />
                <FaBatteryThreeQuarters className="text-yellow-400 text-sm" />
              </div>
              <div className="text-white text-sm">
                {formatDuration(callDuration)}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                {isMinimized ? <FaExpand className="text-white" /> : <FaCompress className="text-white" />}
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <FaCog className="text-white" />
              </button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <FaClock className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="h-full pt-16 pb-32 flex flex-col">
          {/* Zone des participants */}
          <div className="flex-1 flex items-center justify-center p-4">
            {isVideoCall ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-6xl">
                {/* Participant principal (moi) */}
                <div className="relative col-span-1 md:col-span-2 lg:col-span-2">
                  <CallParticipant
                    participant={{
                      id: user?.id,
                      name: user?.name || 'Vous',
                      avatar: user?.avatar,
                      isMe: true
                    }}
                    isMain={true}
                    mediaState={mediaState}
                  />
                </div>
                
                {/* Autres participants */}
                {connectedParticipants.map((participant, index) => (
                  <div key={participant.id} className="relative">
                    <CallParticipant
                      participant={participant}
                      isMain={false}
                      mediaState={mediaState}
                    />
                  </div>
                ))}
              </div>
            ) : (
              // Interface audio
              <div className="text-center">
                <div className="mb-8">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                    <FaPhone className="text-white text-4xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {isGroupCall ? 'Appel de groupe' : 'Appel en cours'}
                  </h2>
                  <p className="text-white/80">
                    {isGroupCall 
                      ? `${connectedParticipants.length} participants`
                      : participants.find(p => !p.isMe)?.name || 'Contact'
                    }
                  </p>
                </div>
                
                {/* Liste des participants pour les appels de groupe */}
                {isGroupCall && (
                  <div className="max-w-md mx-auto">
                    <div className="grid grid-cols-3 gap-2">
                      {connectedParticipants.map(participant => (
                        <div key={participant.id} className="text-center">
                          <div className="w-12 h-12 bg-gray-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {participant.name?.charAt(0)}
                            </span>
                          </div>
                          <p className="text-white/80 text-xs truncate">{participant.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Statistiques d'appel */}
          {isCallActive() && (
            <div className="absolute top-20 right-4 bg-black/30 backdrop-blur-sm rounded-lg p-3 text-white text-xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span>Qualité:</span>
                  <span className={`px-2 py-1 rounded ${
                    callStats.quality === 'excellent' ? 'bg-green-500' :
                    callStats.quality === 'good' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}>
                    {callStats.quality}
                  </span>
                </div>
                <div>Bande passante: {callStats.bandwidth} kbps</div>
                <div>Perte de paquets: {callStats.packetLoss}%</div>
              </div>
            </div>
          )}
        </div>

        {/* Contrôles d'appel */}
        <CallControls 
          currentCall={currentCall}
          mediaState={mediaState}
          isVideoCall={isVideoCall}
          isGroupCall={isGroupCall}
        />

        {/* Modals */}
        <AnimatePresence>
          {showSettings && (
            <CallSettings 
              onClose={() => setShowSettings(false)}
            />
          )}
          
          {showHistory && (
            <CallHistory 
              onClose={() => setShowHistory(false)}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default CallInterface;
