import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCamera, FaVideo, FaMicrophone, FaMapMarkerAlt, FaPollH, FaCrown, FaEye, FaCoins, FaGlobe, FaUsers, FaUserFriends, FaCog, FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaSmile, FaAt, FaHashtag } from 'react-icons/fa';
import { useStatusStore, useStatusActions, STATUS_TYPES, MONETIZATION_TYPES } from '../../../lib/statusStore';
import { useApp } from '../../Context/AppContext';

const StatusCreator = ({ onClose, onCreated }) => {
  const { theme, user } = useApp();
  const { createStatus, creationSettings } = useStatusStore();
  const { createTextStatus, createMediaStatus, createEliteStatus } = useStatusActions();
  
  const [step, setStep] = useState('type'); // type, content, settings, preview
  const [selectedType, setSelectedType] = useState(null);
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [location, setLocation] = useState(null);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [settings, setSettings] = useState({
    privacy: creationSettings.privacy,
    duration: creationSettings.duration,
    allowReplies: creationSettings.allowReplies,
    allowReactions: creationSettings.allowReactions,
    monetization: { ...creationSettings.monetization }
  });

  const fileInputRef = useRef();
  const mediaRecorderRef = useRef();

  const statusTypes = [
    {
      id: STATUS_TYPES.TEXT,
      label: 'Texte',
      icon: null,
      description: 'Partagez vos pensées'
    },
    {
      id: STATUS_TYPES.IMAGE,
      label: 'Photo',
      icon: <FaCamera className="w-6 h-6" />,
      description: 'Partagez une image'
    },
    {
      id: STATUS_TYPES.VIDEO,
      label: 'Vidéo',
      icon: <FaVideo className="w-6 h-6" />,
      description: 'Partagez une vidéo'
    },
    {
      id: STATUS_TYPES.AUDIO,
      label: 'Audio',
      icon: <FaMicrophone className="w-6 h-6" />,
      description: 'Enregistrez un message vocal'
    },
    {
      id: STATUS_TYPES.LOCATION,
      label: 'Localisation',
      icon: <FaMapMarkerAlt className="w-6 h-6" />,
      description: 'Partagez votre position'
    },
    {
      id: STATUS_TYPES.POLL,
      label: 'Sondage',
      icon: <FaPollH className="w-6 h-6" />,
      description: 'Créez un sondage'
    },
    {
      id: STATUS_TYPES.ELITE,
      label: 'Statut Elite',
      icon: <FaCrown className="w-6 h-6 text-yellow-500" />,
      description: 'Contenu premium monétisé'
    }
  ];

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setStep('content');
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setMediaFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setMediaPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    // Simulation de capture photo
    const mockImage = 'https://via.placeholder.com/400x600/4F46E5/FFFFFF?text=Photo+Capture';
    setMediaPreview(mockImage);
    setMediaFile({ name: 'captured-photo.jpg', type: 'image/jpeg' });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setMediaPreview(URL.createObjectURL(blob));
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
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: 'Position actuelle'
          });
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
        }
      );
    }
  };

  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, '']);
    }
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
    let statusData = {
      ...settings,
      duration: settings.duration * 60 * 60 * 1000 // Convertir en millisecondes
    };

    switch (selectedType) {
      case STATUS_TYPES.TEXT:
        createTextStatus(content, statusData);
        break;
      case STATUS_TYPES.IMAGE:
        createMediaStatus(mediaPreview, 'image', statusData);
        break;
      case STATUS_TYPES.VIDEO:
        createMediaStatus(mediaPreview, 'video', statusData);
        break;
      case STATUS_TYPES.AUDIO:
        createMediaStatus(mediaPreview, 'audio', statusData);
        break;
      case STATUS_TYPES.LOCATION:
        createStatus({
          type: STATUS_TYPES.LOCATION,
          content: location,
          ...statusData
        });
        break;
      case STATUS_TYPES.POLL:
        createStatus({
          type: STATUS_TYPES.POLL,
          content: {
            question: content,
            options: pollOptions.filter(opt => opt.trim() !== '')
          },
          ...statusData
        });
        break;
      case STATUS_TYPES.ELITE:
        createEliteStatus(content, settings.monetization, statusData);
        break;
    }

    onCreated();
  };

  const renderContentStep = () => {
    switch (selectedType) {
      case STATUS_TYPES.TEXT:
      case STATUS_TYPES.ELITE:
        return (
          <div className="space-y-4">
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={selectedType === STATUS_TYPES.ELITE ? "Contenu premium..." : "Que voulez-vous partager ?"}
                className={`w-full h-32 p-4 rounded-lg resize-none ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-600 text-white' 
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                } border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                maxLength={selectedType === STATUS_TYPES.ELITE ? 500 : 1000}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                {content.length}/{selectedType === STATUS_TYPES.ELITE ? 500 : 1000}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-500 hover:text-blue-500">
                <FaSmile className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-blue-500">
                <FaAt className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-blue-500">
                <FaHashtag className="w-5 h-5" />
              </button>
            </div>
          </div>
        );

      case STATUS_TYPES.IMAGE:
      case STATUS_TYPES.VIDEO:
        return (
          <div className="space-y-4">
            {!mediaPreview ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="space-y-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
                  >
                    Choisir un fichier
                  </button>
                  {selectedType === STATUS_TYPES.IMAGE && (
                    <button
                      onClick={handleCameraCapture}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg ml-4"
                    >
                      <FaCamera className="w-4 h-4 inline mr-2" />
                      Prendre une photo
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={selectedType === STATUS_TYPES.IMAGE ? 'image/*' : 'video/*'}
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative">
                {selectedType === STATUS_TYPES.IMAGE ? (
                  <img src={mediaPreview} alt="Preview" className="w-full rounded-lg" />
                ) : (
                  <video src={mediaPreview} controls className="w-full rounded-lg" />
                )}
                <button
                  onClick={() => {
                    setMediaPreview(null);
                    setMediaFile(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ajouter une description..."
              className={`w-full p-4 rounded-lg resize-none ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              } border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              rows={3}
            />
          </div>
        );

      case STATUS_TYPES.AUDIO:
        return (
          <div className="space-y-4">
            {!mediaPreview ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`px-8 py-4 rounded-full text-white ${
                    isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <FaPause className="w-6 h-6 inline mr-2" />
                      Arrêter l'enregistrement
                    </>
                  ) : (
                    <>
                      <FaMicrophone className="w-6 h-6 inline mr-2" />
                      Commencer l'enregistrement
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-100 rounded-lg p-4">
                  <audio src={mediaPreview} controls className="w-full" />
                </div>
                <button
                  onClick={() => {
                    setMediaPreview(null);
                    setAudioBlob(null);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  <FaTimes className="w-4 h-4 inline mr-2" />
                  Supprimer l'enregistrement
                </button>
              </div>
            )}
          </div>
        );

      case STATUS_TYPES.LOCATION:
        return (
          <div className="space-y-4">
            <button
              onClick={getCurrentLocation}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
            >
              <FaMapMarkerAlt className="w-4 h-4 inline mr-2" />
              Obtenir ma position
            </button>
            
            {location && (
              <div className="bg-gray-100 rounded-lg p-4">
                <p className="font-semibold">{location.address}</p>
                <p className="text-sm text-gray-600">
                  {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              </div>
            )}
          </div>
        );

      case STATUS_TYPES.POLL:
        return (
          <div className="space-y-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Posez votre question..."
              className={`w-full p-4 rounded-lg resize-none ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              } border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              rows={3}
            />
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Options du sondage</label>
              {pollOptions.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updatePollOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className={`flex-1 p-2 rounded border ${
                      theme === 'dark' 
                        ? 'bg-gray-800 border-gray-600 text-white' 
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                  />
                  {pollOptions.length > 2 && (
                    <button
                      onClick={() => removePollOption(index)}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      <FaTimes className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              
              {pollOptions.length < 4 && (
                <button
                  onClick={addPollOption}
                  className="text-blue-500 hover:text-blue-700 text-sm"
                >
                  + Ajouter une option
                </button>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderSettingsStep = () => (
    <div className="space-y-6">
      {/* Confidentialité */}
      <div>
        <label className="block text-sm font-medium mb-3">Confidentialité</label>
        <div className="space-y-2">
          {[
            { id: 'contacts', label: 'Mes contacts', icon: <FaUserFriends /> },
            { id: 'public', label: 'Public', icon: <FaGlobe /> },
            { id: 'custom', label: 'Personnalisé', icon: <FaCog /> }
          ].map((option) => (
            <label key={option.id} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="privacy"
                value={option.id}
                checked={settings.privacy === option.id}
                onChange={(e) => setSettings({ ...settings, privacy: e.target.value })}
                className="text-blue-500"
              />
              <span className="text-gray-600">{option.icon}</span>
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Durée */}
      <div>
        <label className="block text-sm font-medium mb-3">Durée d'affichage</label>
        <select
          value={settings.duration}
          onChange={(e) => setSettings({ ...settings, duration: parseInt(e.target.value) })}
          className={`w-full p-3 rounded-lg border ${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-600 text-white' 
              : 'bg-gray-50 border-gray-300 text-gray-900'
          }`}
        >
          <option value={1}>1 heure</option>
          <option value={6}>6 heures</option>
          <option value={12}>12 heures</option>
          <option value={24}>24 heures</option>
          <option value={48}>48 heures</option>
        </select>
      </div>

      {/* Options */}
      <div className="space-y-3">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.allowReplies}
            onChange={(e) => setSettings({ ...settings, allowReplies: e.target.checked })}
            className="text-blue-500"
          />
          <span>Autoriser les réponses</span>
        </label>
        
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.allowReactions}
            onChange={(e) => setSettings({ ...settings, allowReactions: e.target.checked })}
            className="text-blue-500"
          />
          <span>Autoriser les réactions</span>
        </label>
      </div>

      {/* Monétisation (pour les statuts Elite) */}
      {selectedType === STATUS_TYPES.ELITE && (
        <div className="border-t pt-6">
          <label className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              checked={settings.monetization.enabled}
              onChange={(e) => setSettings({
                ...settings,
                monetization: { ...settings.monetization, enabled: e.target.checked }
              })}
              className="text-blue-500"
            />
            <span className="font-medium">Activer la monétisation</span>
          </label>
          
          {settings.monetization.enabled && (
            <div className="space-y-4 ml-6">
              <div>
                <label className="block text-sm font-medium mb-2">Type de monétisation</label>
                <select
                  value={settings.monetization.type}
                  onChange={(e) => setSettings({
                    ...settings,
                    monetization: { ...settings.monetization, type: e.target.value }
                  })}
                  className={`w-full p-2 rounded border ${
                    theme === 'dark' 
                      ? 'bg-gray-800 border-gray-600 text-white' 
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                >
                  <option value={MONETIZATION_TYPES.VIEW_PAYMENT}>Paiement par vue</option>
                  <option value={MONETIZATION_TYPES.TIP}>Pourboire</option>
                  <option value={MONETIZATION_TYPES.PREMIUM_CONTENT}>Contenu premium</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Prix (Elite-Coins)</label>
                <input
                  type="number"
                  min="0"
                  value={settings.monetization.price}
                  onChange={(e) => setSettings({
                    ...settings,
                    monetization: { ...settings.monetization, price: parseInt(e.target.value) || 0 }
                  })}
                  className={`w-full p-2 rounded border ${
                    theme === 'dark' 
                      ? 'bg-gray-800 border-gray-600 text-white' 
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg ${
          theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className="text-xl font-bold">Créer un statut</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 'type' && (
              <motion.div
                key="type"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-2 gap-4"
              >
                {statusTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleTypeSelect(type.id)}
                    className={`p-6 rounded-lg border-2 text-left transition-all ${
                      theme === 'dark' 
                        ? 'border-gray-700 hover:border-blue-500 hover:bg-gray-800' 
                        : 'border-gray-200 hover:border-blue-500 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {type.icon}
                      <span className="font-semibold">{type.label}</span>
                    </div>
                    <p className="text-sm text-gray-500">{type.description}</p>
                  </button>
                ))}
              </motion.div>
            )}

            {step === 'content' && (
              <motion.div
                key="content"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {renderContentStep()}
              </motion.div>
            )}

            {step === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {renderSettingsStep()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between p-6 border-t ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            onClick={() => {
              if (step === 'content') setStep('type');
              if (step === 'settings') setStep('content');
            }}
            className={`px-4 py-2 rounded-lg ${
              step === 'type' ? 'invisible' : 'visible'
            } ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            Retour
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
            >
              Annuler
            </button>
            
            {step === 'content' && (
              <button
                onClick={() => setStep('settings')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
              >
                Suivant
              </button>
            )}
            
            {step === 'settings' && (
              <button
                onClick={handleCreate}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
              >
                Publier
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StatusCreator;
