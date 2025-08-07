import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  FaCamera, FaLock, FaGlobe, FaEye, FaSearch, FaUserCheck,
  FaCrown, FaStar, FaShieldAlt, FaCoins, FaUsers, FaClock,
  FaImage, FaFile, FaVideo, FaMicrophone, FaMapMarkerAlt
} from 'react-icons/fa';
import { BsPersonCheck, BsPersonX } from 'react-icons/bs';

// Étape de configuration des détails
export const DetailsForm = ({ type, details, onUpdate, theme }) => {
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
        onUpdate(prev => ({ ...prev, avatar: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  const privacyOptions = [
    {
      id: 'public',
      title: 'Public',
      description: 'Tout le monde peut voir et rejoindre',
      icon: <FaGlobe className="w-4 h-4" />,
      color: 'text-green-500',
      available: type === 'broadcast' || type === 'room'
    },
    {
      id: 'private',
      title: 'Privé',
      description: 'Seuls les invités peuvent rejoindre',
      icon: <FaLock className="w-4 h-4" />,
      color: 'text-blue-500',
      available: true
    },
    {
      id: 'secret',
      title: 'Secret',
      description: 'Invisible, accès par lien uniquement',
      icon: <FaEye className="w-4 h-4" />,
      color: 'text-purple-500',
      available: type === 'group' || type === 'room'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Avatar et nom */}
      <div className="space-y-4">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className={`w-20 h-20 rounded-full ${theme.bgColor} border-2 border-dashed ${theme.borderColor} flex items-center justify-center overflow-hidden`}>
              {previewImage ? (
                <img src={previewImage} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <FaCamera className={`w-6 h-6 ${theme.secondaryText}`} />
              )}
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${theme.accentBg} ${theme.accentText} flex items-center justify-center text-xs`}
            >
              +
            </motion.button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageUpload}
            />
          </div>
          <p className={`text-sm ${theme.secondaryText}`}>
            Photo du {type === 'group' ? 'groupe' : type === 'broadcast' ? 'canal' : 'salon'}
          </p>
        </div>

        {/* Nom */}
        {type !== 'contact' && (
          <div>
            <label className={`block text-sm font-medium ${theme.textColor} mb-2`}>
              Nom{type === 'group' ? ' du groupe' : type === 'broadcast' ? ' du canal' : ' du salon'}
            </label>
            <input
              type="text"
              value={details.name}
              onChange={(e) => onUpdate(prev => ({ ...prev, name: e.target.value }))}
              placeholder={`Mon ${type === 'group' ? 'groupe' : type === 'broadcast' ? 'canal' : 'salon'} Elite`}
              className={`w-full px-3 py-2 rounded-lg border ${theme.borderColor} ${theme.inputBg} ${theme.textColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              maxLength={50}
            />
            <p className={`text-xs ${theme.secondaryText} mt-1`}>
              {details.name.length}/50
            </p>
          </div>
        )}

        {/* Description */}
        {(type === 'group' || type === 'broadcast' || type === 'room') && (
          <div>
            <label className={`block text-sm font-medium ${theme.textColor} mb-2`}>
              Description (optionnelle)
            </label>
            <textarea
              value={details.description}
              onChange={(e) => onUpdate(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Décrivez le sujet de votre discussion..."
              className={`w-full px-3 py-2 rounded-lg border ${theme.borderColor} ${theme.inputBg} ${theme.textColor} focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
              rows={3}
              maxLength={200}
            />
            <p className={`text-xs ${theme.secondaryText} mt-1`}>
              {details.description.length}/200
            </p>
          </div>
        )}
      </div>

      {/* Confidentialité */}
      {type !== 'contact' && (
        <div>
          <label className={`block text-sm font-medium ${theme.textColor} mb-3`}>
            Confidentialité
          </label>
          <div className="space-y-2">
            {privacyOptions.filter(option => option.available).map((option) => (
              <motion.button
                key={option.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => onUpdate(prev => ({ ...prev, privacy: option.id }))}
                className={`w-full p-3 rounded-lg border ${
                  details.privacy === option.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : `${theme.borderColor} ${theme.hoverBg}`
                } flex items-center gap-3 text-left`}
              >
                <div className={option.color}>
                  {option.icon}
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${theme.textColor}`}>
                    {option.title}
                  </h4>
                  <p className={`text-sm ${theme.secondaryText}`}>
                    {option.description}
                  </p>
                </div>
                {details.privacy === option.id && (
                  <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                    ✓
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Options avancées */}
      {(type === 'group' || type === 'room') && (
        <div>
          <label className={`block text-sm font-medium ${theme.textColor} mb-3`}>
            Options avancées
          </label>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaUsers className={`w-4 h-4 ${theme.secondaryText}`} />
                <div>
                  <p className={`font-medium ${theme.textColor}`}>Autoriser les invitations</p>
                  <p className={`text-sm ${theme.secondaryText}`}>Les membres peuvent inviter d'autres personnes</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={details.allowInvites}
                onChange={(e) => onUpdate(prev => ({ ...prev, allowInvites: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaShieldAlt className={`w-4 h-4 ${theme.secondaryText}`} />
                <div>
                  <p className={`font-medium ${theme.textColor}`}>Approbation administrateur</p>
                  <p className={`text-sm ${theme.secondaryText}`}>Nécessite l'approbation pour rejoindre</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={details.adminApproval}
                onChange={(e) => onUpdate(prev => ({ ...prev, adminApproval: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaClock className={`w-4 h-4 ${theme.secondaryText}`} />
                <div>
                  <p className={`font-medium ${theme.textColor}`}>Messages éphémères</p>
                  <p className={`text-sm ${theme.secondaryText}`}>Les messages disparaissent automatiquement</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={details.disappearingMessages}
                onChange={(e) => onUpdate(prev => ({ ...prev, disappearingMessages: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </label>

            {type === 'room' && (
              <label className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaCoins className={`w-4 h-4 ${theme.secondaryText}`} />
                  <div>
                    <p className={`font-medium ${theme.textColor}`}>Salon monétisé</p>
                    <p className={`text-sm ${theme.secondaryText}`}>Frais d'entrée pour rejoindre</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={details.isMonetized}
                  onChange={(e) => onUpdate(prev => ({ ...prev, isMonetized: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
            )}

            {details.isMonetized && (
              <div className="ml-7">
                <label className={`block text-sm font-medium ${theme.textColor} mb-2`}>
                  Frais d'entrée (Elite-Coins)
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={details.entryFee}
                  onChange={(e) => onUpdate(prev => ({ ...prev, entryFee: parseInt(e.target.value) || 0 }))}
                  className={`w-32 px-3 py-2 rounded-lg border ${theme.borderColor} ${theme.inputBg} ${theme.textColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Étape de sélection des participants
export const ParticipantSelection = ({ 
  type, 
  contacts, 
  selectedContacts, 
  onToggleContact, 
  searchQuery, 
  onSearchChange, 
  theme 
}) => {
  const maxSelections = type === 'contact' ? 1 : type === 'broadcast' ? 256 : 256;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      {/* Barre de recherche */}
      <div className="relative">
        <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme.secondaryText} w-4 h-4`} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher un contact..."
          className={`w-full pl-10 pr-3 py-2 rounded-lg border ${theme.borderColor} ${theme.inputBg} ${theme.textColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
      </div>

      {/* Contacts sélectionnés */}
      {selectedContacts.length > 0 && (
        <div>
          <h3 className={`text-sm font-medium ${theme.textColor} mb-2`}>
            Sélectionnés ({selectedContacts.length}/{maxSelections})
          </h3>
          <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
            {selectedContacts.map((contact) => (
              <motion.div
                key={contact.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-5 h-5 rounded-full"
                />
                <span className="font-medium">{contact.name}</span>
                <button
                  onClick={() => onToggleContact(contact)}
                  className="text-blue-600 hover:text-blue-800 font-bold text-xs"
                >
                  ×
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Liste des contacts */}
      <div>
        <h3 className={`text-sm font-medium ${theme.textColor} mb-2`}>
          Contacts ({contacts.length})
        </h3>
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {contacts.map((contact) => {
            const isSelected = selectedContacts.find(c => c.id === contact.id);
            const canSelect = selectedContacts.length < maxSelections || isSelected;
            
            return (
              <motion.button
                key={contact.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => canSelect && onToggleContact(contact)}
                disabled={!canSelect}
                className={`w-full p-3 rounded-lg flex items-center gap-3 text-left transition-all ${
                  isSelected 
                    ? 'bg-blue-50 border border-blue-200' 
                    : canSelect 
                      ? `${theme.hoverBg} border ${theme.borderColor}` 
                      : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="relative">
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-10 h-10 rounded-full"
                  />
                  {contact.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-medium ${theme.textColor} truncate`}>
                      {contact.name}
                    </h4>
                    {contact.isVerified && (
                      <FaUserCheck className="w-3 h-3 text-blue-500" />
                    )}
                    {contact.isPremium && (
                      <FaStar className="w-3 h-3 text-yellow-500" />
                    )}
                    {contact.isElite && (
                      <FaCrown className="w-3 h-3 text-purple-500" />
                    )}
                  </div>
                  <p className={`text-sm ${theme.secondaryText} truncate`}>
                    {contact.status}
                  </p>
                </div>
                
                <div className={`w-5 h-5 rounded-full border-2 ${
                  isSelected 
                    ? 'bg-blue-500 border-blue-500' 
                    : `border-gray-300`
                } flex items-center justify-center`}>
                  {isSelected && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

// Étape de confirmation
export const ConfirmationStep = ({ type, details, participants, theme }) => {
  const getTypeLabel = (type) => {
    const labels = {
      contact: 'Discussion privée',
      group: 'Groupe',
      broadcast: 'Canal de diffusion',
      room: 'Instant-Room'
    };
    return labels[type] || type;
  };

  const getPrivacyLabel = (privacy) => {
    const labels = {
      public: 'Public',
      private: 'Privé',
      secret: 'Secret'
    };
    return labels[privacy] || privacy;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Résumé */}
      <div className={`p-4 rounded-lg ${theme.headerBg} border ${theme.borderColor}`}>
        <h3 className={`font-semibold ${theme.textColor} mb-3`}>
          Résumé de création
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className={theme.secondaryText}>Type :</span>
            <span className={theme.textColor}>{getTypeLabel(type)}</span>
          </div>
          
          {details.name && (
            <div className="flex justify-between">
              <span className={theme.secondaryText}>Nom :</span>
              <span className={theme.textColor}>{details.name}</span>
            </div>
          )}
          
          {type !== 'contact' && (
            <div className="flex justify-between">
              <span className={theme.secondaryText}>Confidentialité :</span>
              <span className={theme.textColor}>{getPrivacyLabel(details.privacy)}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className={theme.secondaryText}>Participants :</span>
            <span className={theme.textColor}>{participants.length}</span>
          </div>
          
          {details.isMonetized && (
            <div className="flex justify-between">
              <span className={theme.secondaryText}>Frais d'entrée :</span>
              <span className={`${theme.textColor} flex items-center gap-1`}>
                <FaCoins className="w-3 h-3 text-yellow-500" />
                {details.entryFee}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Participants */}
      <div>
        <h3 className={`font-semibold ${theme.textColor} mb-3`}>
          Participants ({participants.length})
        </h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {participants.map((participant) => (
            <div key={participant.id} className="flex items-center gap-3 p-2 rounded-lg">
              <img
                src={participant.avatar}
                alt={participant.name}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${theme.textColor}`}>
                    {participant.name}
                  </span>
                  {participant.isVerified && (
                    <FaUserCheck className="w-3 h-3 text-blue-500" />
                  )}
                  {participant.isPremium && (
                    <FaStar className="w-3 h-3 text-yellow-500" />
                  )}
                  {participant.isElite && (
                    <FaCrown className="w-3 h-3 text-purple-500" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Description si présente */}
      {details.description && (
        <div>
          <h3 className={`font-semibold ${theme.textColor} mb-2`}>
            Description
          </h3>
          <p className={`${theme.secondaryText} text-sm p-3 rounded-lg ${theme.headerBg}`}>
            {details.description}
          </p>
        </div>
      )}
    </motion.div>
  );
};
