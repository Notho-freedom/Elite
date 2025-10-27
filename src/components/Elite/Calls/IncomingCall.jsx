import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPhone, FaPhoneSlash, FaVideo, FaMicrophone, FaMicrophoneSlash,
  FaVolumeUp, FaVolumeMute, FaTimes, FaUser, FaUsers
} from 'react-icons/fa6';
import { useCallStore, CALL_TYPES } from '../../../lib/callStore';

const IncomingCall = ({ call, onAccept, onReject, onClose }) => {
  const [isRinging, setIsRinging] = useState(true);
  const [ringCount, setRingCount] = useState(0);
  const { answerCall, rejectCall } = useCallStore();

  const isVideoCall = call?.type === CALL_TYPES.VIDEO || call?.type === CALL_TYPES.GROUP_VIDEO;
  const isGroupCall = call?.type === CALL_TYPES.GROUP_VOICE || call?.type === CALL_TYPES.GROUP_VIDEO;
  const caller = call?.participants?.find(p => !p.isMe);

  // Sonnerie simulée
  useEffect(() => {
    const interval = setInterval(() => {
      setRingCount(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Arrêter la sonnerie après 30 secondes
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsRinging(false);
      onReject();
    }, 30000);

    return () => clearTimeout(timeout);
  }, [onReject]);

  const handleAccept = () => {
    setIsRinging(false);
    answerCall(call.id);
    onAccept();
  };

  const handleReject = () => {
    setIsRinging(false);
    rejectCall(call.id);
    onReject();
  };

  const handleAcceptVideo = () => {
    handleAccept();
  };

  const handleAcceptVoice = () => {
    handleAccept();
  };

  if (!call || !isRinging) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Call Card */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
        >
          {/* Ringing Animation */}
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute inset-0 rounded-3xl border-2 border-blue-500/30"
          />

          {/* Caller Info */}
          <div className="relative z-10">
            {/* Avatar */}
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
            >
              {isGroupCall ? (
                <FaUsers className="text-white text-3xl" />
              ) : (
                <FaUser className="text-white text-3xl" />
              )}
            </motion.div>

            {/* Caller Name */}
            <h2 className="text-2xl font-bold text-white mb-2">
              {caller?.name || 'Contact inconnu'}
            </h2>

            {/* Call Type */}
            <div className="flex items-center justify-center space-x-2 mb-6">
              {isVideoCall ? (
                <FaVideo className="text-blue-400" />
              ) : (
                <FaPhone className="text-green-400" />
              )}
              <span className="text-gray-300">
                {isVideoCall ? 'Appel vidéo' : 'Appel vocal'}
                {isGroupCall && ' de groupe'}
              </span>
            </div>

            {/* Ringing Status */}
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-blue-400 text-lg font-medium mb-8"
            >
              Appel entrant...
            </motion.div>

            {/* Call Duration */}
            <div className="text-gray-400 text-sm mb-8">
              {Math.floor(ringCount / 60)}:{(ringCount % 60).toString().padStart(2, '0')}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center space-x-6">
              {/* Reject Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleReject}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors shadow-lg"
              >
                <FaPhoneSlash className="text-2xl" />
              </motion.button>

              {/* Accept Voice Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleAcceptVoice}
                className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center transition-colors shadow-lg"
              >
                <FaPhone className="text-2xl" />
              </motion.button>

              {/* Accept Video Button (only for video calls) */}
              {isVideoCall && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleAcceptVideo}
                  className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors shadow-lg"
                >
                  <FaVideo className="text-2xl" />
                </motion.button>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 flex items-center justify-center space-x-4">
              <button
                onClick={() => console.log('Message rapide')}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Message rapide
              </button>
              <button
                onClick={() => console.log('Rappeler plus tard')}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Rappeler plus tard
              </button>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
          >
            <FaTimes className="text-gray-400" />
          </button>
        </motion.div>

        {/* Keyboard Shortcuts Info */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center text-white/60 text-sm">
          <p>Raccourcis: Espace (Accepter) • Échap (Rejeter)</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default IncomingCall;
