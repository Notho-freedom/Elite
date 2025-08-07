import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaHeart, FaComment, FaShare, FaCrown, FaCoins, FaEye, FaMapMarkerAlt, FaPollH, FaVolumeUp, FaVolumeMute, FaPlay, FaPause, FaChevronLeft, FaChevronRight, FaSmile, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import { useStatusStore, STATUS_TYPES, MONETIZATION_TYPES } from '../../../lib/statusStore';
import { useApp } from '../../Context/AppContext';

const StatusViewer = ({ status, onClose }) => {
  const { theme, user } = useApp();
  const { viewStatus, addReaction, addReply } = useStatusStore();
  
  const [currentView, setCurrentView] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [selectedPollOption, setSelectedPollOption] = useState(null);
  const [viewDuration, setViewDuration] = useState(0);
  const [hasPaid, setHasPaid] = useState(false);

  const videoRef = useRef();
  const audioRef = useRef();
  const viewStartTime = useRef(Date.now());

  // Marquer comme vu
  useEffect(() => {
    if (status && user) {
      viewStatus(status.id, user.id);
      viewStartTime.current = Date.now();
    }
  }, [status, user]);

  // Calculer la durée de visualisation
  useEffect(() => {
    const interval = setInterval(() => {
      setViewDuration(Math.floor((Date.now() - viewStartTime.current) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Mettre à jour la durée de visualisation quand on ferme
  useEffect(() => {
    return () => {
      if (status && user) {
        // Mettre à jour la durée de visualisation dans le store
        const finalDuration = Math.floor((Date.now() - viewStartTime.current) / 1000);
        // Ici on pourrait mettre à jour la durée dans le store
      }
    };
  }, [status, user]);

  const handleClose = () => {
    onClose();
  };

  const handleReaction = (reactionType) => {
    if (status && user) {
      addReaction(status.id, {
        userId: user.id,
        type: reactionType,
        timestamp: new Date().toISOString()
      });
      setShowReactions(false);
    }
  };

  const handleReply = () => {
    if (replyText.trim() && status && user) {
      addReply(status.id, {
        userId: user.id,
        text: replyText,
        timestamp: new Date().toISOString()
      });
      setReplyText('');
      setShowReplyInput(false);
    }
  };

  const handlePollVote = (optionIndex) => {
    if (status && user) {
      setSelectedPollOption(optionIndex);
      // Ici on pourrait ajouter le vote au store
    }
  };

  const handlePayment = () => {
    if (status.monetization?.enabled && !hasPaid) {
      // Simuler le paiement
      setHasPaid(true);
      // Ici on appellerait la fonction de paiement du store
    }
  };

  const renderContent = () => {
    switch (status.type) {
      case STATUS_TYPES.TEXT:
        return (
          <div className="text-center p-8">
            <p className="text-xl leading-relaxed">{status.content}</p>
          </div>
        );

      case STATUS_TYPES.IMAGE:
        return (
          <div className="relative h-full">
            <img
              src={status.content}
              alt="Status"
              className="w-full h-full object-cover"
            />
            {status.description && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
                <p>{status.description}</p>
              </div>
            )}
          </div>
        );

      case STATUS_TYPES.VIDEO:
        return (
          <div className="relative h-full">
            <video
              ref={videoRef}
              src={status.content}
              className="w-full h-full object-cover"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              {!isPlaying && (
                <button
                  onClick={() => videoRef.current?.play()}
                  className="bg-black bg-opacity-50 text-white p-4 rounded-full"
                >
                  <FaPlay className="w-8 h-8" />
                </button>
              )}
            </div>
            {status.description && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
                <p>{status.description}</p>
              </div>
            )}
          </div>
        );

      case STATUS_TYPES.AUDIO:
        return (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center mb-6">
              <FaVolumeUp className="w-16 h-16 text-white" />
            </div>
            <audio
              ref={audioRef}
              src={status.content}
              controls
              className="w-full max-w-md"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />
            {status.description && (
              <p className="mt-4 text-center">{status.description}</p>
            )}
          </div>
        );

      case STATUS_TYPES.LOCATION:
        return (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center mb-6">
              <FaMapMarkerAlt className="w-16 h-16 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{status.content.address}</h3>
            <p className="text-gray-600 mb-4">
              {status.content.lat.toFixed(6)}, {status.content.lng.toFixed(6)}
            </p>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">
              Voir sur la carte
            </button>
          </div>
        );

      case STATUS_TYPES.POLL:
        return (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="w-32 h-32 bg-purple-500 rounded-full flex items-center justify-center mb-6">
              <FaPollH className="w-16 h-16 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-6 text-center">{status.content.question}</h3>
            <div className="w-full max-w-md space-y-3">
              {status.content.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handlePollVote(index)}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    selectedPollOption === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {selectedPollOption === index && (
                      <FaThumbsUp className="text-blue-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case STATUS_TYPES.ELITE:
        return (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="w-32 h-32 bg-yellow-500 rounded-full flex items-center justify-center mb-6">
              <FaCrown className="w-16 h-16 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-center">Contenu Premium</h3>
            <p className="text-center mb-6">{status.content}</p>
            
            {status.monetization?.enabled && !hasPaid ? (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Ce contenu nécessite un paiement de {status.monetization.price} Elite-Coins
                </p>
                <button
                  onClick={handlePayment}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                >
                  <FaCoins className="w-4 h-4" />
                  Payer pour voir
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-green-600 mb-4">Contenu débloqué</p>
                <div className="flex items-center gap-2 text-yellow-500">
                  <FaCoins className="w-4 h-4" />
                  <span>+{status.monetization?.price || 0} Elite-Coins gagnés</span>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return <div>Type de contenu non supporté</div>;
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'À l\'instant';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    return `Il y a ${Math.floor(diffInHours / 24)}j`;
  };

  const reactions = [
    { type: 'like', icon: <FaHeart />, label: 'J\'aime' },
    { type: 'love', icon: <FaHeart className="text-red-500" />, label: 'J\'adore' },
    { type: 'laugh', icon: <FaSmile className="text-yellow-500" />, label: 'Rire' },
    { type: 'wow', icon: <FaSmile className="text-purple-500" />, label: 'Wow' },
    { type: 'sad', icon: <FaSmile className="text-blue-500" />, label: 'Triste' },
    { type: 'angry', icon: <FaThumbsDown className="text-red-500" />, label: 'En colère' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
    >
      <div className="relative w-full h-full max-w-2xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
        {/* Header */}
        <div className={`absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black to-transparent ${
          theme === 'dark' ? 'text-white' : 'text-white'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="font-semibold">U</span>
              </div>
              <div>
                <p className="font-semibold">Utilisateur</p>
                <p className="text-sm opacity-75">{formatTimeAgo(status.createdAt)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {status.monetization?.enabled && (
                <div className="flex items-center gap-1 bg-yellow-500 text-white px-2 py-1 rounded-full text-sm">
                  <FaCoins className="w-3 h-3" />
                  <span>{status.monetization.price}</span>
                </div>
              )}
              <button
                onClick={handleClose}
                className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="w-full h-full">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className={`absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black to-transparent ${
          theme === 'dark' ? 'text-white' : 'text-white'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Réactions */}
              <div className="relative">
                <button
                  onClick={() => setShowReactions(!showReactions)}
                  className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75"
                >
                  <FaHeart className="w-5 h-5" />
                </button>
                
                <AnimatePresence>
                  {showReactions && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg p-2 flex gap-1"
                    >
                      {reactions.map((reaction) => (
                        <button
                          key={reaction.type}
                          onClick={() => handleReaction(reaction.type)}
                          className="p-2 hover:bg-gray-100 rounded-full"
                          title={reaction.label}
                        >
                          {reaction.icon}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Commentaires */}
              <button
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75"
              >
                <FaComment className="w-5 h-5" />
              </button>

              {/* Partage */}
              <button className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75">
                <FaShare className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-sm opacity-75">
              <FaEye className="w-4 h-4" />
              <span>{status.views.length} vues</span>
              {status.monetization?.enabled && (
                <>
                  <FaCoins className="w-4 h-4 text-yellow-500" />
                  <span>{status.earnings} gains</span>
                </>
              )}
            </div>
          </div>

          {/* Input de réponse */}
          <AnimatePresence>
            {showReplyInput && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-4 flex gap-2"
              >
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Ajouter un commentaire..."
                  className="flex-1 p-2 rounded-lg bg-white text-gray-900"
                  onKeyPress={(e) => e.key === 'Enter' && handleReply()}
                />
                <button
                  onClick={handleReply}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                >
                  Envoyer
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <button className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 text-white">
          <FaChevronLeft className="w-5 h-5" />
        </button>
        <button className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 text-white">
          <FaChevronRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};

export default StatusViewer;
