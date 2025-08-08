import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaRocket, FaLock, FaGlobe, FaShieldAlt, FaUserFriends, FaEye, FaCoins, FaCamera, FaUpload, FaSave, FaUndo, FaClock, FaUsers, FaCrown, FaGem, FaFire, FaStar, FaCheck, FaBan, FaVolumeMute, FaVolumeUp, FaBell, FaBellSlash, FaMapMarkerAlt, FaPollH, FaMicrophone, FaVideo } from 'react-icons/fa';
import { useGroupStore, useGroupActions, GROUP_TYPES, PRIVACY_TYPES } from '../../../lib/groupStore';
import { useApp } from '../../Context/AppContext';

const InstantRoomCreator = ({ onClose, onCreated }) => {
  const { theme } = useApp();
  const { createInstantRoom } = useGroupActions();
  
  const [step, setStep] = useState(1);
  const [roomData, setRoomData] = useState({
    name: '',
    description: '',
    privacy: PRIVACY_TYPES.PUBLIC,
    avatar: null,
    coverImage: null,
    maxMembers: 50,
    duration: 3600, // 1 heure par défaut
    allowInvites: true,
    requireApproval: false,
    allowMedia: true,
    allowVoiceMessages: true,
    allowLocation: true,
    allowPolls: true,
    allowReactions: true,
    allowReplies: true,
    allowForwarding: true,
    allowEditing: true,
    allowDeletion: true,
    slowMode: false,
    slowModeInterval: 5,
    autoArchive: true,
    archiveAfter: 24, // heures
    monetization: {
      enabled: false,
      type: 'pay_per_join',
      price: 5,
      currency: 'elite_coins',
      minPrice: 1,
      maxPrice: 100
    },
    features: {
      voiceChat: false,
      videoChat: false,
      screenShare: false,
      recording: false,
      liveStreaming: false,
      polls: false,
      reactions: false,
      location: false
    }
  });

  const fileInputRef = useRef();

  const privacyOptions = [
    { 
      value: PRIVACY_TYPES.PUBLIC, 
      label: 'Public', 
      icon: <FaGlobe />, 
      description: 'Visible par tous, accessible à tous',
      color: 'from-green-500 to-emerald-500'
    },
    { 
      value: PRIVACY_TYPES.APPROVAL_REQUIRED, 
      label: 'Approbation requise', 
      icon: <FaUserFriends />, 
      description: 'Visible par tous, approbation nécessaire',
      color: 'from-orange-500 to-red-500'
    },
    { 
      value: PRIVACY_TYPES.PRIVATE, 
      label: 'Privé', 
      icon: <FaLock />, 
      description: 'Visible par invitation uniquement',
      color: 'from-blue-500 to-indigo-500'
    },
    { 
      value: PRIVACY_TYPES.SECRET, 
      label: 'Secret', 
      icon: <FaShieldAlt />, 
      description: 'Invisible, accès par lien uniquement',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const durationOptions = [
    { value: 1800, label: '30 minutes' },
    { value: 3600, label: '1 heure' },
    { value: 7200, label: '2 heures' },
    { value: 14400, label: '4 heures' },
    { value: 28800, label: '8 heures' },
    { value: 86400, label: '24 heures' },
    { value: 604800, label: '1 semaine' }
  ];

  const monetizationTypes = [
    { value: 'pay_per_join', label: 'Paiement par adhésion', icon: <FaUsers /> },
    { value: 'pay_per_message', label: 'Paiement par message', icon: <FaComment /> },
    { value: 'subscription', label: 'Abonnement', icon: <FaCrown /> },
    { value: 'donation', label: 'Don', icon: <FaHeart /> }
  ];

  const featureOptions = [
    { key: 'voiceChat', label: 'Chat vocal', icon: <FaMicrophone />, description: 'Permettre les appels vocaux' },
    { key: 'videoChat', label: 'Chat vidéo', icon: <FaVideo />, description: 'Permettre les appels vidéo' },
    { key: 'screenShare', label: 'Partage d\'écran', icon: <FaDesktop />, description: 'Permettre le partage d\'écran' },
    { key: 'recording', label: 'Enregistrement', icon: <FaRecordVinyl />, description: 'Permettre l\'enregistrement' },
    { key: 'liveStreaming', label: 'Diffusion en direct', icon: <FaBroadcastTower />, description: 'Permettre la diffusion' },
    { key: 'polls', label: 'Sondages', icon: <FaPollH />, description: 'Permettre les sondages' },
    { key: 'reactions', label: 'Réactions', icon: <FaSmile />, description: 'Permettre les réactions' },
    { key: 'location', label: 'Localisation', icon: <FaMapMarkerAlt />, description: 'Permettre le partage de localisation' }
  ];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setRoomData(prev => ({
        ...prev,
        avatar: URL.createObjectURL(file)
      }));
    }
  };

  const handleFeatureToggle = (featureKey) => {
    setRoomData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [featureKey]: !prev.features[featureKey]
      }
    }));
  };

  const handleCreate = () => {
    const instantRoom = createInstantRoom(
      roomData.name,
      roomData.description,
      roomData.monetization.enabled ? roomData.monetization : null
    );

    // Mettre à jour avec les paramètres spécifiques
    useGroupStore.getState().updateGroup(instantRoom.id, {
      privacy: roomData.privacy,
      avatar: roomData.avatar,
      maxMembers: roomData.maxMembers,
      settings: {
        allowInvites: roomData.allowInvites,
        requireApproval: roomData.requireApproval,
        allowMedia: roomData.allowMedia,
        allowVoiceMessages: roomData.allowVoiceMessages,
        allowLocation: roomData.allowLocation,
        allowPolls: roomData.allowPolls,
        allowReactions: roomData.allowReactions,
        allowReplies: roomData.allowReplies,
        allowForwarding: roomData.allowForwarding,
        allowEditing: roomData.allowEditing,
        allowDeletion: roomData.allowDeletion,
        slowMode: roomData.slowMode,
        slowModeInterval: roomData.slowModeInterval,
        autoArchive: roomData.autoArchive,
        archiveAfter: roomData.archiveAfter
      },
      features: roomData.features,
      duration: roomData.duration
    });

    onCreated(instantRoom);
  };

  const canProceed = () => {
    return roomData.name.trim().length > 0 && roomData.description.trim().length > 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl ${theme.bgColor} ${theme.textColor}`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        </div>

        {/* Header */}
        <div className={`relative z-10 flex items-center justify-between p-6 border-b ${theme.borderColor} bg-gradient-to-r ${theme.headerBg} backdrop-blur-sm`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center shadow-lg`}>
              <FaRocket className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Créer un Instant-Room</h2>
              <p className={`text-sm ${theme.secondaryText}`}>Étape {step} sur 4</p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className={`p-2 rounded-xl ${theme.buttonSecondary} ${theme.buttonHover} transition-all duration-200`}
          >
            <FaTimes className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Progress Bar */}
        <div className={`relative z-10 h-1 bg-gray-200 ${theme.borderColor}`}>
          <motion.div
            className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-r-full"
            initial={{ width: 0 }}
            animate={{ width: `${(step / 4) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold mb-4">Informations de base</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nom de l'Instant-Room *</label>
                      <input
                        type="text"
                        value={roomData.name}
                        onChange={(e) => setRoomData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nom de votre Instant-Room..."
                        className={`w-full p-4 rounded-xl border ${theme.borderColor} ${theme.inputBg} focus:outline-none focus:ring-2 ${theme.focusRing}`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Description *</label>
                      <textarea
                        value={roomData.description}
                        onChange={(e) => setRoomData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Décrivez votre Instant-Room..."
                        rows={3}
                        className={`w-full p-4 rounded-xl border ${theme.borderColor} ${theme.inputBg} resize-none focus:outline-none focus:ring-2 ${theme.focusRing}`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Avatar (optionnel)</label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      {roomData.avatar ? (
                        <div className="relative">
                          <img src={roomData.avatar} alt="Preview" className="w-32 h-32 object-cover rounded-xl" />
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setRoomData(prev => ({ ...prev, avatar: null }))}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full"
                          >
                            <FaTimes className="w-4 h-4" />
                          </motion.button>
                        </div>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => fileInputRef.current?.click()}
                          className={`w-32 h-32 border-2 border-dashed ${theme.borderColor} rounded-xl ${theme.itemHover} transition-all duration-200 flex items-center justify-center`}
                        >
                          <FaUpload className="w-8 h-8 text-gray-400" />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold mb-4">Confidentialité et accès</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-3">Niveau de confidentialité</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {privacyOptions.map((option) => (
                          <motion.button
                            key={option.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setRoomData(prev => ({ ...prev, privacy: option.value }))}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                              roomData.privacy === option.value
                                ? `border-orange-500 bg-gradient-to-r ${option.color} text-white shadow-lg`
                                : `${theme.borderColor} ${theme.itemHover}`
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{option.icon}</span>
                              <div className="text-left">
                                <div className="font-medium">{option.label}</div>
                                <div className="text-sm opacity-80">{option.description}</div>
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Nombre maximum de membres</label>
                        <input
                          type="number"
                          min="2"
                          max="1000"
                          value={roomData.maxMembers}
                          onChange={(e) => setRoomData(prev => ({ ...prev, maxMembers: parseInt(e.target.value) }))}
                          className={`w-full p-3 rounded-lg border ${theme.borderColor} ${theme.inputBg} focus:outline-none focus:ring-2 ${theme.focusRing}`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Durée de vie</label>
                        <select
                          value={roomData.duration}
                          onChange={(e) => setRoomData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                          className={`w-full p-3 rounded-lg border ${theme.borderColor} ${theme.inputBg} focus:outline-none focus:ring-2 ${theme.focusRing}`}
                        >
                          {durationOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={roomData.allowInvites}
                          onChange={(e) => setRoomData(prev => ({ ...prev, allowInvites: e.target.checked }))}
                          className="w-4 h-4 text-orange-500 rounded focus:ring-orange-400"
                        />
                        <span>Autoriser les invitations</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={roomData.requireApproval}
                          onChange={(e) => setRoomData(prev => ({ ...prev, requireApproval: e.target.checked }))}
                          className="w-4 h-4 text-orange-500 rounded focus:ring-orange-400"
                        />
                        <span>Exiger une approbation pour rejoindre</span>
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold mb-4">Fonctionnalités et permissions</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-3">Fonctionnalités avancées</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {featureOptions.map((feature) => (
                          <motion.button
                            key={feature.key}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleFeatureToggle(feature.key)}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                              roomData.features[feature.key]
                                ? `border-orange-500 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg`
                                : `${theme.borderColor} ${theme.itemHover}`
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{feature.icon}</span>
                              <div className="text-left">
                                <div className="font-medium">{feature.label}</div>
                                <div className="text-sm opacity-80">{feature.description}</div>
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-3">Permissions de messages</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          { key: 'allowMedia', label: 'Médias', icon: <FaCamera /> },
                          { key: 'allowVoiceMessages', label: 'Messages vocaux', icon: <FaMicrophone /> },
                          { key: 'allowLocation', label: 'Localisation', icon: <FaMapMarkerAlt /> },
                          { key: 'allowPolls', label: 'Sondages', icon: <FaPollH /> },
                          { key: 'allowReactions', label: 'Réactions', icon: <FaSmile /> },
                          { key: 'allowReplies', label: 'Réponses', icon: <FaReply /> },
                          { key: 'allowForwarding', label: 'Transférer', icon: <FaShare /> },
                          { key: 'allowEditing', label: 'Modifier', icon: <FaEdit /> },
                          { key: 'allowDeletion', label: 'Supprimer', icon: <FaTrash /> }
                        ].map((permission) => (
                          <label key={permission.key} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={roomData[permission.key]}
                              onChange={(e) => setRoomData(prev => ({ ...prev, [permission.key]: e.target.checked }))}
                              className="w-4 h-4 text-orange-500 rounded focus:ring-orange-400"
                            />
                            <span className="text-lg">{permission.icon}</span>
                            <span>{permission.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={roomData.slowMode}
                          onChange={(e) => setRoomData(prev => ({ ...prev, slowMode: e.target.checked }))}
                          className="w-4 h-4 text-orange-500 rounded focus:ring-orange-400"
                        />
                        <span>Mode lent (limiter la fréquence des messages)</span>
                      </label>
                      {roomData.slowMode && (
                        <div>
                          <label className="block text-sm font-medium mb-2">Intervalle (secondes)</label>
                          <input
                            type="number"
                            min="1"
                            max="60"
                            value={roomData.slowModeInterval}
                            onChange={(e) => setRoomData(prev => ({ ...prev, slowModeInterval: parseInt(e.target.value) }))}
                            className={`w-full p-3 rounded-lg border ${theme.borderColor} ${theme.inputBg} focus:outline-none focus:ring-2 ${theme.focusRing}`}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold mb-4">Monétisation (optionnel)</h3>
                  
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 p-4 rounded-xl cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={roomData.monetization.enabled}
                        onChange={(e) => setRoomData(prev => ({ 
                          ...prev, 
                          monetization: { ...prev.monetization, enabled: e.target.checked }
                        }))}
                        className="w-5 h-5 text-orange-500 rounded focus:ring-orange-400"
                      />
                      <div className="flex items-center gap-2">
                        <FaCoins className="w-5 h-5 text-yellow-500" />
                        <span className="font-medium">Activer la monétisation</span>
                      </div>
                    </label>

                    {roomData.monetization.enabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4 p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200"
                      >
                        <div>
                          <label className="block text-sm font-medium mb-2">Type de monétisation</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {monetizationTypes.map((type) => (
                              <motion.button
                                key={type.value}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setRoomData(prev => ({ 
                                  ...prev, 
                                  monetization: { ...prev.monetization, type: type.value }
                                }))}
                                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                                  roomData.monetization.type === type.value
                                    ? `border-orange-500 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg`
                                    : `${theme.borderColor} ${theme.itemHover}`
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span>{type.icon}</span>
                                  <span>{type.label}</span>
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Prix (Elite-Coins)</label>
                          <input
                            type="number"
                            min={roomData.monetization.minPrice}
                            max={roomData.monetization.maxPrice}
                            value={roomData.monetization.price}
                            onChange={(e) => setRoomData(prev => ({ 
                              ...prev, 
                              monetization: { ...prev.monetization, price: parseInt(e.target.value) }
                            }))}
                            className={`w-full p-3 rounded-lg border ${theme.borderColor} ${theme.inputBg} focus:outline-none focus:ring-2 ${theme.focusRing}`}
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            Prix entre {roomData.monetization.minPrice} et {roomData.monetization.maxPrice} Elite-Coins
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Aperçu</h3>
                  <div className={`p-4 rounded-xl border ${theme.borderColor} ${theme.itemHover}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                        <FaRocket className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{roomData.name}</span>
                          <span className="text-sm text-gray-500">• Instant-Room</span>
                          {getPrivacyIcon(roomData.privacy)}
                          {roomData.monetization.enabled && (
                            <div className="flex items-center gap-1">
                              <FaCoins className="w-4 h-4 text-yellow-500" />
                              <FaGem className="w-3 h-3 text-blue-500" />
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {roomData.description}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <FaUsers className="w-3 h-3" />
                            <span>Max {roomData.maxMembers} membres</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <FaClock className="w-3 h-3" />
                            <span>{durationOptions.find(d => d.value === roomData.duration)?.label}</span>
                          </span>
                          {roomData.monetization.enabled && (
                            <span className="flex items-center gap-1 text-yellow-600">
                              <FaCoins className="w-3 h-3" />
                              <span>{roomData.monetization.price} Elite-Coins</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className={`relative z-10 flex items-center justify-between p-6 border-t ${theme.borderColor} bg-gradient-to-r ${theme.headerBg} backdrop-blur-sm`}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => step > 1 && setStep(step - 1)}
            disabled={step === 1}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              step === 1
                ? 'opacity-50 cursor-not-allowed'
                : `${theme.buttonSecondary} ${theme.buttonHover}`
            }`}
          >
            Précédent
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => step < 4 ? setStep(step + 1) : handleCreate()}
            disabled={!canProceed()}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              canProceed()
                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
                : 'opacity-50 cursor-not-allowed bg-gray-300'
            }`}
          >
            {step === 4 ? (
              <>
                <FaRocket className="w-4 h-4 inline mr-2" />
                Créer l'Instant-Room
              </>
            ) : (
              'Suivant'
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InstantRoomCreator;
