import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCamera, FaVideo, FaMicrophone, FaMapMarkerAlt, FaPollH, FaCrown, FaCoins, FaClock, FaGlobe, FaUsers, FaUserFriends, FaSave, FaUndo, FaPause, FaUpload, FaPlus } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi2';
import { useStatusStore, STATUS_TYPES, MONETIZATION_TYPES } from '../../../lib/statusStore';
import { useApp } from '../../Context/AppContext';

const StatusCreator = ({ onClose, onCreated }) => {
  const { theme } = useApp();
  const { createStatus, creationSettings } = useStatusStore();
  
  const [step, setStep] = useState(1);
  const [statusType, setStatusType] = useState(STATUS_TYPES.TEXT);
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [location, setLocation] = useState(null);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [privacy, setPrivacy] = useState(creationSettings.defaultPrivacy);
  const [duration, setDuration] = useState(creationSettings.defaultDuration);
  const [allowReplies, setAllowReplies] = useState(creationSettings.allowReplies);
  const [allowReactions, setAllowReactions] = useState(creationSettings.allowReactions);
  const [monetization, setMonetization] = useState({
    enabled: false,
    type: MONETIZATION_TYPES.PAY_PER_VIEW,
    price: 1,
    minPrice: 1,
    maxPrice: 100
  });

  const fileInputRef = useRef();
  const mediaRecorderRef = useRef();
  const audioChunksRef = useRef([]);

  const statusTypes = [
    { type: STATUS_TYPES.TEXT, label: 'Texte', icon: <HiSparkles />, color: 'from-blue-500 to-purple-500' },
    { type: STATUS_TYPES.IMAGE, label: 'Photo', icon: <FaCamera />, color: 'from-green-500 to-teal-500' },
    { type: STATUS_TYPES.VIDEO, label: 'Vidéo', icon: <FaVideo />, color: 'from-red-500 to-pink-500' },
    { type: STATUS_TYPES.AUDIO, label: 'Audio', icon: <FaMicrophone />, color: 'from-orange-500 to-red-500' },
    { type: STATUS_TYPES.LOCATION, label: 'Localisation', icon: <FaMapMarkerAlt />, color: 'from-indigo-500 to-blue-500' },
    { type: STATUS_TYPES.POLL, label: 'Sondage', icon: <FaPollH />, color: 'from-purple-500 to-indigo-500' },
    { type: STATUS_TYPES.ELITE, label: 'Elite', icon: <FaCrown />, color: 'from-yellow-400 via-amber-500 to-orange-500' }
  ];

  const privacyOptions = [
    { value: 'public', label: 'Public', icon: <FaGlobe />, description: 'Visible par tous' },
    { value: 'contacts', label: 'Contacts', icon: <FaUsers />, description: 'Visible par vos contacts' },
    { value: 'friends', label: 'Amis', icon: <FaUserFriends />, description: 'Visible par vos amis uniquement' }
  ];

  const durationOptions = [
    { value: 3600, label: '1 heure' },
    { value: 7200, label: '2 heures' },
    { value: 21600, label: '6 heures' },
    { value: 43200, label: '12 heures' },
    { value: 86400, label: '24 heures' }
  ];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setMediaFile(URL.createObjectURL(file));
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(URL.createObjectURL(audioBlob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
        }
      );
    }
  };

  const addPollOption = () => {
    setPollOptions([...pollOptions, '']);
  };

  const removePollOption = (index) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const updatePollOption = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const handleCreate = () => {
    const statusData = {
      type: statusType,
      content: content,
      privacy,
      duration,
      allowReplies,
      allowReactions,
      monetization: monetization.enabled ? monetization : null
    };

    if (statusType === STATUS_TYPES.IMAGE || statusType === STATUS_TYPES.VIDEO) {
      statusData.content = mediaFile;
    } else if (statusType === STATUS_TYPES.AUDIO) {
      statusData.content = audioBlob;
    } else if (statusType === STATUS_TYPES.LOCATION) {
      statusData.content = location;
    } else if (statusType === STATUS_TYPES.POLL) {
      statusData.content = pollOptions.filter(option => option.trim() !== '');
    }

    createStatus(statusData);
    onCreated();
  };

  const canProceed = () => {
    switch (statusType) {
      case STATUS_TYPES.TEXT:
        return content.trim().length > 0;
      case STATUS_TYPES.IMAGE:
      case STATUS_TYPES.VIDEO:
        return mediaFile !== null;
      case STATUS_TYPES.AUDIO:
        return audioBlob !== null;
      case STATUS_TYPES.LOCATION:
        return location !== null;
      case STATUS_TYPES.POLL:
        return pollOptions.filter(option => option.trim() !== '').length >= 2;
      default:
        return true;
    }
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
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl ${theme.bgColor} ${theme.textColor}`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-500 via-yellow-400 to-orange-500" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        </div>

        {/* Header */}
        <div className={`relative z-10 flex items-center justify-between p-6 border-b ${theme.borderColor} bg-gradient-to-r ${theme.headerBg} backdrop-blur-sm`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${theme.accentBg} flex items-center justify-center shadow-lg`}>
              <FaCrown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Créer un Statut Elite</h2>
              <p className={`text-sm ${theme.secondaryText}`}>Étape {step} sur 3</p>
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
            className={`h-full ${theme.accentBg} rounded-r-full`}
            initial={{ width: 0 }}
            animate={{ width: `${(step / 3) * 100}%` }}
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
                  <h3 className="text-lg font-semibold mb-4">Choisissez le type de statut</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {statusTypes.map((type) => (
                      <motion.button
                        key={type.type}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setStatusType(type.type)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          statusType === type.type
                            ? `border-amber-500 bg-gradient-to-r ${type.color} text-white shadow-lg`
                            : `${theme.borderColor} ${theme.itemHover}`
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-2xl">{type.icon}</span>
                          <span className="font-medium">{type.label}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Contenu</h3>
                  {statusType === STATUS_TYPES.TEXT && (
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Partagez votre pensée..."
                      className={`w-full p-4 rounded-xl border ${theme.borderColor} ${theme.inputBg} resize-none focus:outline-none focus:ring-2 ${theme.focusRing}`}
                      rows={4}
                    />
                  )}

                  {statusType === STATUS_TYPES.IMAGE && (
                    <div className="space-y-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      {mediaFile ? (
                        <div className="relative">
                          <img src={mediaFile} alt="Preview" className="w-full max-h-64 object-cover rounded-xl" />
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setMediaFile(null)}
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
                          className={`w-full p-8 border-2 border-dashed ${theme.borderColor} rounded-xl ${theme.itemHover} transition-all duration-200`}
                        >
                          <div className="flex flex-col items-center gap-3">
                            <FaUpload className="w-8 h-8 text-gray-400" />
                            <span className="font-medium">Cliquez pour sélectionner une image</span>
                          </div>
                        </motion.button>
                      )}
                    </div>
                  )}

                  {statusType === STATUS_TYPES.VIDEO && (
                    <div className="space-y-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      {mediaFile ? (
                        <div className="relative">
                          <video src={mediaFile} controls className="w-full max-h-64 object-cover rounded-xl" />
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setMediaFile(null)}
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
                          className={`w-full p-8 border-2 border-dashed ${theme.borderColor} rounded-xl ${theme.itemHover} transition-all duration-200`}
                        >
                          <div className="flex flex-col items-center gap-3">
                            <FaVideo className="w-8 h-8 text-gray-400" />
                            <span className="font-medium">Cliquez pour sélectionner une vidéo</span>
                          </div>
                        </motion.button>
                      )}
                    </div>
                  )}

                  {statusType === STATUS_TYPES.AUDIO && (
                    <div className="space-y-4">
                      {audioBlob ? (
                        <div className="space-y-3">
                          <audio src={audioBlob} controls className="w-full" />
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setAudioBlob(null)}
                            className={`px-4 py-2 rounded-lg ${theme.buttonSecondary} ${theme.buttonHover}`}
                          >
                            <FaUndo className="w-4 h-4 inline mr-2" />
                            Réenregistrer
                          </motion.button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`w-full p-6 rounded-xl flex items-center justify-center gap-3 ${
                              isRecording ? 'bg-red-500 text-white' : theme.accentBg
                            }`}
                          >
                            {isRecording ? (
                              <>
                                <FaPause className="w-6 h-6" />
                                <span>Arrêter l'enregistrement</span>
                              </>
                            ) : (
                              <>
                                <FaMicrophone className="w-6 h-6" />
                                <span>Commencer l'enregistrement</span>
                              </>
                            )}
                          </motion.button>
                          {isRecording && (
                            <div className="text-center">
                              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse mx-auto mb-2" />
                              <span className="text-sm text-gray-500">Enregistrement en cours...</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {statusType === STATUS_TYPES.LOCATION && (
                    <div className="space-y-4">
                      {location ? (
                        <div className="space-y-3">
                          <div className={`p-4 rounded-xl ${theme.buttonSecondary}`}>
                            <div className="flex items-center gap-2">
                              <FaMapMarkerAlt className="w-5 h-5 text-red-500" />
                              <span>Latitude: {location.lat.toFixed(6)}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <FaMapMarkerAlt className="w-5 h-5 text-red-500" />
                              <span>Longitude: {location.lng.toFixed(6)}</span>
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setLocation(null)}
                            className={`px-4 py-2 rounded-lg ${theme.buttonSecondary} ${theme.buttonHover}`}
                          >
                            <FaUndo className="w-4 h-4 inline mr-2" />
                            Relocaliser
                          </motion.button>
                        </div>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={getLocation}
                          className={`w-full p-6 rounded-xl ${theme.accentBg} flex items-center justify-center gap-3`}
                        >
                          <FaMapMarkerAlt className="w-6 h-6" />
                          <span>Obtenir ma localisation</span>
                        </motion.button>
                      )}
                    </div>
                  )}

                  {statusType === STATUS_TYPES.POLL && (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        {pollOptions.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updatePollOption(index, e.target.value)}
                              placeholder={`Option ${index + 1}`}
                              className={`flex-1 p-3 rounded-lg border ${theme.borderColor} ${theme.inputBg} focus:outline-none focus:ring-2 ${theme.focusRing}`}
                            />
                            {pollOptions.length > 2 && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => removePollOption(index)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                              >
                                <FaTimes className="w-4 h-4" />
                              </motion.button>
                            )}
                          </div>
                        ))}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={addPollOption}
                        className={`px-4 py-2 rounded-lg ${theme.buttonSecondary} ${theme.buttonHover}`}
                      >
                        <FaPlus className="w-4 h-4 inline mr-2" />
                        Ajouter une option
                      </motion.button>
                    </div>
                  )}
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
                  <h3 className="text-lg font-semibold mb-4">Paramètres de confidentialité</h3>
                  <div className="space-y-3">
                    {privacyOptions.map((option) => (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setPrivacy(option.value)}
                        className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                          privacy === option.value
                            ? `border-amber-500 ${theme.accentBg} text-white`
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

                <div>
                  <h3 className="text-lg font-semibold mb-4">Durée d'affichage</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {durationOptions.map((option) => (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setDuration(option.value)}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                          duration === option.value
                            ? `border-amber-500 ${theme.accentBg} text-white`
                            : `${theme.borderColor} ${theme.itemHover}`
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <FaClock className="w-4 h-4" />
                          <span>{option.label}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Options d'interaction</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={allowReplies}
                        onChange={(e) => setAllowReplies(e.target.checked)}
                        className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                      />
                      <span>Autoriser les réponses</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={allowReactions}
                        onChange={(e) => setAllowReactions(e.target.checked)}
                        className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                      />
                      <span>Autoriser les réactions</span>
                    </label>
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
                  <h3 className="text-lg font-semibold mb-4">Monétisation Elite</h3>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 p-4 rounded-xl cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={monetization.enabled}
                        onChange={(e) => setMonetization(prev => ({ ...prev, enabled: e.target.checked }))}
                        className="w-5 h-5 text-amber-500 rounded focus:ring-amber-400"
                      />
                      <div className="flex items-center gap-2">
                        <FaCoins className="w-5 h-5 text-yellow-500" />
                        <span className="font-medium">Activer la monétisation</span>
                      </div>
                    </label>

                    {monetization.enabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4 p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200"
                      >
                        <div>
                          <label className="block text-sm font-medium mb-2">Type de monétisation</label>
                          <select
                            value={monetization.type}
                            onChange={(e) => setMonetization(prev => ({ ...prev, type: e.target.value }))}
                            className={`w-full p-3 rounded-lg border ${theme.borderColor} ${theme.inputBg} focus:outline-none focus:ring-2 ${theme.focusRing}`}
                          >
                            <option value={MONETIZATION_TYPES.PAY_PER_VIEW}>Paiement par vue</option>
                            <option value={MONETIZATION_TYPES.SUBSCRIPTION}>Abonnement</option>
                            <option value={MONETIZATION_TYPES.DONATION}>Don</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Prix (Elite-Coins)</label>
                          <input
                            type="number"
                            min={monetization.minPrice}
                            max={monetization.maxPrice}
                            value={monetization.price}
                            onChange={(e) => setMonetization(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                            className={`w-full p-3 rounded-lg border ${theme.borderColor} ${theme.inputBg} focus:outline-none focus:ring-2 ${theme.focusRing}`}
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            Prix entre {monetization.minPrice} et {monetization.maxPrice} Elite-Coins
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
                      <div className={`w-12 h-12 rounded-full ${theme.accentBg} flex items-center justify-center`}>
                        <FaCrown className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">Votre nom</span>
                          <span className="text-sm text-gray-500">• {formatTimeAgo(new Date())}</span>
                          {privacy === 'public' && <FaGlobe className="w-4 h-4 text-gray-400" />}
                          {privacy === 'contacts' && <FaUsers className="w-4 h-4 text-gray-400" />}
                          {privacy === 'friends' && <FaUserFriends className="w-4 h-4 text-gray-400" />}
                        </div>
                        <div className="text-sm">
                          {statusType === STATUS_TYPES.TEXT && content}
                          {statusType === STATUS_TYPES.IMAGE && '📸 Image'}
                          {statusType === STATUS_TYPES.VIDEO && '🎥 Vidéo'}
                          {statusType === STATUS_TYPES.AUDIO && '🎤 Audio'}
                          {statusType === STATUS_TYPES.LOCATION && '📍 Localisation'}
                          {statusType === STATUS_TYPES.POLL && '📊 Sondage'}
                          {statusType === STATUS_TYPES.ELITE && '👑 Statut Elite'}
                        </div>
                        {monetization.enabled && (
                          <div className="flex items-center gap-2 mt-2">
                            <FaCoins className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm text-yellow-600 font-medium">{monetization.price} Elite-Coins</span>
                          </div>
                        )}
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
            onClick={() => step < 3 ? setStep(step + 1) : handleCreate()}
            disabled={!canProceed()}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              canProceed()
                ? `${theme.buttonGold} shadow-lg ${theme.accentShadow}`
                : 'opacity-50 cursor-not-allowed bg-gray-300'
            }`}
          >
            {step === 3 ? (
              <>
                <FaSave className="w-4 h-4 inline mr-2" />
                Créer le statut
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

const formatTimeAgo = (date) => {
  return 'À l\'instant';
};

export default StatusCreator;
