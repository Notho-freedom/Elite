import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaHeart, FaComment, FaCoins, FaCrown, FaGem, FaVolumeUp, FaMapMarkerAlt, FaPollH, FaEye, FaGlobe, FaUsers, FaUserFriends, FaCheck, FaUser } from 'react-icons/fa';
import { FaDiamond } from 'react-icons/fa6';
import { useStatusStore, STATUS_TYPES, MONETIZATION_TYPES } from '../../../lib/statusStore';
import { useApp } from '../../Context/AppContext';

const StatusViewer = ({ status, onClose }) => {
  const { theme } = useApp();
  const { viewStatus, addReaction, addReply, processPayment } = useStatusStore();
  
  const [currentReply, setCurrentReply] = useState('');
  const [showReplies, setShowReplies] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedPollOption, setSelectedPollOption] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(status?.monetization?.price || 1);

  useEffect(() => {
    if (status) {
      viewStatus(status.id);
    }
  }, [status]);

  const handleReaction = (reaction) => {
    addReaction(status.id, reaction);
  };

  const handleReply = () => {
    if (currentReply.trim()) {
      addReply(status.id, currentReply);
      setCurrentReply('');
    }
  };

  const handlePollVote = (optionIndex) => {
    setSelectedPollOption(optionIndex);
    // Logique de vote
  };

  const handlePayment = () => {
    if (paymentAmount >= (status?.monetization?.price || 1)) {
      processPayment(status.id, paymentAmount);
      setShowPaymentModal(false);
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

  const renderContent = () => {
    switch (status.type) {
      case STATUS_TYPES.TEXT:
        return (
          <div className={`text-lg leading-relaxed ${theme.textColor} text-center max-w-2xl mx-auto`}>
            {status.content}
          </div>
        );

      case STATUS_TYPES.IMAGE:
        return (
          <div className="relative max-w-2xl mx-auto">
            <img 
              src={status.content} 
              alt="Status" 
              className="w-full h-auto rounded-2xl shadow-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-2xl" />
          </div>
        );

      case STATUS_TYPES.VIDEO:
        return (
          <div className="relative max-w-2xl mx-auto">
            <video 
              src={status.content} 
              controls 
              className="w-full h-auto rounded-2xl shadow-2xl"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-2xl pointer-events-none" />
          </div>
        );

      case STATUS_TYPES.AUDIO:
        return (
          <div className={`max-w-md mx-auto p-8 rounded-2xl ${theme.accentBg} shadow-2xl`}>
            <div className="text-center mb-6">
              <FaVolumeUp className="w-16 h-16 text-white mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white">Message vocal</h3>
            </div>
            <audio 
              src={status.content} 
              controls 
              className="w-full"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        );

      case STATUS_TYPES.LOCATION:
        return (
          <div className={`max-w-md mx-auto p-6 rounded-2xl ${theme.buttonSecondary} shadow-2xl`}>
            <div className="text-center mb-4">
              <FaMapMarkerAlt className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold">Localisation partagée</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Latitude:</span>
                <span className="font-mono">{status.content.lat.toFixed(6)}</span>
              </div>
              <div className="flex justify-between">
                <span>Longitude:</span>
                <span className="font-mono">{status.content.lng.toFixed(6)}</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-gray-100 rounded-lg text-center">
              <span className="text-sm text-gray-600">Carte interactive à venir</span>
            </div>
          </div>
        );

      case STATUS_TYPES.POLL:
        return (
          <div className={`max-w-md mx-auto p-6 rounded-2xl ${theme.buttonSecondary} shadow-2xl`}>
            <div className="text-center mb-6">
              <FaPollH className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold">Sondage</h3>
            </div>
            <div className="space-y-3">
              {status.content.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePollVote(index)}
                  className={`w-full p-3 rounded-lg border-2 transition-all duration-200 ${
                    selectedPollOption === index
                      ? `border-amber-500 ${theme.accentBg} text-white`
                      : `${theme.borderColor} ${theme.itemHover}`
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {selectedPollOption === index && (
                      <FaCheck className="w-4 h-4" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case STATUS_TYPES.ELITE:
        return (
          <div className="max-w-2xl mx-auto">
            <div className={`p-8 rounded-2xl bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 shadow-2xl relative overflow-hidden`}>
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <FaCrown className="w-6 h-6 text-white" />
                <FaGem className="w-4 h-4 text-white" />
              </div>
              <div className="text-center text-white">
                <FaCrown className="w-16 h-16 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">Statut Elite</h2>
                <p className="text-lg mb-6">{status.content}</p>
                <div className="flex items-center justify-center gap-4">
                  <FaCoins className="w-5 h-5" />
                  <span className="font-bold">{status.monetization?.price || 1} Elite-Coins</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!status) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl ${theme.bgColor} ${theme.textColor}`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-500 via-yellow-400 to-orange-500" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        </div>

        {/* Header */}
        <div className={`relative z-10 flex items-center justify-between p-6 border-b ${theme.borderColor} bg-gradient-to-r ${theme.headerBg} backdrop-blur-sm`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full ${theme.accentBg} flex items-center justify-center shadow-lg`}>
              <FaCrown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Statut Elite</h2>
              <div className="flex items-center gap-3 text-sm">
                <span className={`${theme.secondaryText}`}>
                  {formatTimeAgo(status.createdAt)}
                </span>
                {status.privacy === 'public' && <FaGlobe className="w-4 h-4 text-gray-400" />}
                {status.privacy === 'contacts' && <FaUsers className="w-4 h-4 text-gray-400" />}
                {status.privacy === 'friends' && <FaUserFriends className="w-4 h-4 text-gray-400" />}
                {status.monetization?.enabled && (
                  <div className="flex items-center gap-1">
                    <FaCoins className="w-4 h-4 text-yellow-500" />
                    <FaDiamond className="w-3 h-3 text-blue-500" />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className={`p-3 rounded-xl ${theme.buttonSecondary} ${theme.buttonHover} transition-all duration-200`}
          >
            <FaTimes className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 overflow-y-auto p-8">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            {status.monetization?.enabled && !status.hasPaid && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 text-center"
              >
                <FaCrown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Contenu Premium</h3>
                <p className="text-gray-600 mb-4">Ce statut nécessite un paiement pour être consulté</p>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <FaCoins className="w-5 h-5 text-yellow-500" />
                  <span className="font-bold text-lg">{status.monetization.price} Elite-Coins</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPaymentModal(true)}
                  className={`${theme.buttonGold} px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-200 ${theme.accentShadow}`}
                >
                  <FaCoins className="w-4 h-4 inline mr-2" />
                  Payer pour voir
                </motion.button>
              </motion.div>
            )}

            {(!status.monetization?.enabled || status.hasPaid) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full"
              >
                {renderContent()}
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        {(!status.monetization?.enabled || status.hasPaid) && (
          <div className={`relative z-10 p-6 border-t ${theme.borderColor} bg-gradient-to-r ${theme.headerBg} backdrop-blur-sm`}>
            {/* Reactions */}
            <div className="flex items-center justify-center gap-4 mb-4">
              {['❤️', '👍', '😊', '🎉', '🔥'].map((reaction) => (
                <motion.button
                  key={reaction}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleReaction(reaction)}
                  className="text-2xl hover:scale-110 transition-transform duration-200"
                >
                  {reaction}
                </motion.button>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-6 text-sm mb-4">
              <span className={`flex items-center gap-2 ${theme.secondaryText}`}>
                <FaEye className="w-4 h-4" />
                <span>{status.views?.length || 0} vues</span>
              </span>
              <span className={`flex items-center gap-2 ${theme.secondaryText}`}>
                <FaHeart className="w-4 h-4" />
                <span>{status.reactions?.length || 0} réactions</span>
              </span>
              <span className={`flex items-center gap-2 ${theme.secondaryText}`}>
                <FaComment className="w-4 h-4" />
                <span>{status.replies?.length || 0} réponses</span>
              </span>
              {status.monetization?.enabled && (
                <span className={`flex items-center gap-2 ${theme.goldText} font-medium`}>
                  <FaCoins className="w-4 h-4" />
                  <span>{status.earnings || 0} gains</span>
                </span>
              )}
            </div>

            {/* Reply Input */}
            {status.allowReplies && (
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={currentReply}
                  onChange={(e) => setCurrentReply(e.target.value)}
                  placeholder="Ajouter une réponse..."
                  className={`flex-1 p-3 rounded-xl border ${theme.borderColor} ${theme.inputBg} focus:outline-none focus:ring-2 ${theme.focusRing}`}
                  onKeyPress={(e) => e.key === 'Enter' && handleReply()}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReply}
                  disabled={!currentReply.trim()}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    currentReply.trim()
                      ? `${theme.buttonGold} shadow-lg ${theme.accentShadow}`
                      : 'opacity-50 cursor-not-allowed bg-gray-300'
                  }`}
                >
                  <FaComment className="w-4 h-4" />
                </motion.button>
              </div>
            )}

            {/* Replies Section */}
            {status.replies && status.replies.length > 0 && (
              <div className="mt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowReplies(!showReplies)}
                  className={`w-full p-3 rounded-xl ${theme.buttonSecondary} ${theme.buttonHover} transition-all duration-200`}
                >
                  <div className="flex items-center justify-between">
                    <span>Voir les réponses ({status.replies.length})</span>
                    <FaComment className={`w-4 h-4 transition-transform ${showReplies ? 'rotate-180' : ''}`} />
                  </div>
                </motion.button>

                <AnimatePresence>
                  {showReplies && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 space-y-2"
                    >
                      {status.replies.map((reply, index) => (
                        <div key={index} className={`p-3 rounded-lg ${theme.itemHover}`}>
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-full ${theme.accentBg} flex items-center justify-center`}>
                              <FaUser className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">Utilisateur</span>
                                <span className="text-xs text-gray-500">{formatTimeAgo(reply.timestamp)}</span>
                              </div>
                              <p className="text-sm">{reply.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* Payment Modal */}
        <AnimatePresence>
          {showPaymentModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`p-6 rounded-2xl shadow-2xl ${theme.bgColor} ${theme.textColor} max-w-md w-full mx-4`}
              >
                <div className="text-center mb-6">
                  <FaCrown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Paiement Elite</h3>
                  <p className="text-gray-600">Accédez à ce contenu premium</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Montant (Elite-Coins)</label>
                    <input
                      type="number"
                      min={status.monetization?.price || 1}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(parseInt(e.target.value) || 1)}
                      className={`w-full p-3 rounded-lg border ${theme.borderColor} ${theme.inputBg} focus:outline-none focus:ring-2 ${theme.focusRing}`}
                    />
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowPaymentModal(false)}
                      className={`flex-1 p-3 rounded-lg ${theme.buttonSecondary} ${theme.buttonHover} transition-all duration-200`}
                    >
                      Annuler
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePayment}
                      className={`flex-1 p-3 rounded-lg ${theme.buttonGold} shadow-lg transition-all duration-200 ${theme.accentShadow}`}
                    >
                      <FaCoins className="w-4 h-4 inline mr-2" />
                      Payer
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default StatusViewer;
