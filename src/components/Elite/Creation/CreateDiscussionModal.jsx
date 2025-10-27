import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, FaSearch, FaUserPlus, FaUsers, FaBroadcastTower,
  FaPhone, FaVideo, FaCamera, FaLock, FaGlobe, FaEye,
  FaArrowLeft, FaCheck, FaPlusCircle, FaMinus, FaCrown,
  FaStar, FaShieldAlt, FaUserEdit, FaHashtag
} from 'react-icons/fa';
import { BsPersonCheck, BsPersonX, BsThreeDotsVertical } from 'react-icons/bs';
import { IoMdClose } from 'react-icons/io';
import { useApp } from '../../Context/AppContext';
import { DetailsForm, ParticipantSelection, ConfirmationStep } from './CreationSteps';

// Types de création
const CREATION_TYPES = {
  CONTACT: 'contact',
  GROUP: 'group',
  BROADCAST: 'broadcast',
  ROOM: 'room'
};

// Niveaux de confidentialité
const PRIVACY_LEVELS = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  SECRET: 'secret'
};

// Composant principal de création de discussions
const CreateDiscussionModal = ({ isOpen, onClose, theme }) => {
  const [step, setStep] = useState('type'); // type, details, participants, confirmation
  const [selectedType, setSelectedType] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [discussionDetails, setDiscussionDetails] = useState({
    name: '',
    description: '',
    privacy: PRIVACY_LEVELS.PRIVATE,
    avatar: null,
    allowInvites: true,
    adminApproval: false,
    disappearingMessages: false,
    restrictMedia: false,
    isMonetized: false,
    entryFee: 0,
    maxMembers: 256
  });

  const { discussions: mockContacts } = useApp();

  // Simuler des contacts depuis les discussions mockées
  const contacts = useMemo(() => {
    return mockContacts.map((contact, index) => ({
      id: contact.id,
      name: contact.name,
      avatar: contact.avatar,
      isOnline: contact.isOnline,
      lastSeen: contact.lastMessageTime,
      isVerified: Math.random() > 0.7,
      isPremium: Math.random() > 0.8,
      isElite: Math.random() > 0.9,
      phoneNumber: `+33 ${Math.floor(Math.random() * 900000000) + 100000000}`,
      status: ['Disponible', 'Occupé', 'Ne pas déranger', 'Absent'][Math.floor(Math.random() * 4)]
    }));
  }, [mockContacts]);

  // Filtrer les contacts selon la recherche
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    const query = searchQuery.toLowerCase();
    return contacts.filter(contact => 
      contact.name.toLowerCase().includes(query) ||
      contact.phoneNumber.includes(query)
    );
  }, [contacts, searchQuery]);

  // Réinitialiser au changement de type
  const handleTypeSelect = useCallback((type) => {
    setSelectedType(type);
    setSelectedContacts([]);
    setDiscussionDetails(prev => ({
      ...prev,
      name: '',
      description: '',
      privacy: type === CREATION_TYPES.BROADCAST ? PRIVACY_LEVELS.PUBLIC : PRIVACY_LEVELS.PRIVATE
    }));
    setStep('details');
  }, []);

  // Gérer la sélection de contacts
  const toggleContactSelection = useCallback((contact) => {
    setSelectedContacts(prev => {
      const isSelected = prev.find(c => c.id === contact.id);
      if (isSelected) {
        return prev.filter(c => c.id !== contact.id);
      } else {
        // Limites selon le type
        const maxContacts = selectedType === CREATION_TYPES.BROADCAST ? 256 : 
                          selectedType === CREATION_TYPES.GROUP ? 256 : 1;
        if (prev.length >= maxContacts) return prev;
        return [...prev, contact];
      }
    });
  }, [selectedType]);

  // Créer la discussion
  const handleCreate = useCallback(async () => {
    const discussionData = {
      type: selectedType,
      participants: selectedContacts,
      details: discussionDetails,
      createdAt: new Date().toISOString(),
      creator: 'me'
    };

    console.log('Création de discussion:', discussionData);
    
    // TODO: Intégrer avec le système de création réel
    // await createDiscussion(discussionData);
    
    onClose();
    
    // Réinitialiser
    setStep('type');
    setSelectedType(null);
    setSelectedContacts([]);
    setDiscussionDetails({
      name: '',
      description: '',
      privacy: PRIVACY_LEVELS.PRIVATE,
      avatar: null,
      allowInvites: true,
      adminApproval: false,
      disappearingMessages: false,
      restrictMedia: false,
      isMonetized: false,
      entryFee: 0,
      maxMembers: 256
    });
  }, [selectedType, selectedContacts, discussionDetails, onClose]);

  // Revenir à l'étape précédente
  const handleBack = useCallback(() => {
    if (step === 'details') setStep('type');
    else if (step === 'participants') setStep('details');
    else if (step === 'confirmation') setStep('participants');
  }, [step]);

  // Passer à l'étape suivante
  const handleNext = useCallback(() => {
    if (step === 'details') {
      if (selectedType === CREATION_TYPES.CONTACT) {
        setStep('participants');
      } else {
        setStep('participants');
      }
    } else if (step === 'participants') {
      setStep('confirmation');
    }
  }, [step, selectedType]);

  // Vérifier si on peut continuer
  const canProceed = useMemo(() => {
    if (step === 'type') return selectedType !== null;
    if (step === 'details') {
      if (selectedType === CREATION_TYPES.CONTACT) return true;
      return discussionDetails.name.trim().length > 0;
    }
    if (step === 'participants') {
      return selectedContacts.length > 0;
    }
    return true;
  }, [step, selectedType, discussionDetails.name, selectedContacts.length]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className={`w-full max-w-md ${theme.bgColor} rounded-2xl shadow-xl overflow-hidden`}
        >
          {/* Header */}
          <div className={`p-4 border-b ${theme.borderColor} ${theme.headerBg} flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              {step !== 'type' && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBack}
                  className={`p-2 rounded-full ${theme.hoverBg}`}
                >
                  <FaArrowLeft className={`w-4 h-4 ${theme.textColor}`} />
                </motion.button>
              )}
              <div>
                <h2 className={`text-lg font-semibold ${theme.textColor}`}>
                  {step === 'type' && 'Nouvelle discussion'}
                  {step === 'details' && 'Détails'}
                  {step === 'participants' && 'Participants'}
                  {step === 'confirmation' && 'Confirmation'}
                </h2>
                <p className={`text-sm ${theme.secondaryText}`}>
                  {step === 'type' && 'Choisissez le type de discussion'}
                  {step === 'details' && 'Configurez votre discussion'}
                  {step === 'participants' && `${selectedContacts.length} sélectionné(s)`}
                  {step === 'confirmation' && 'Vérifiez avant de créer'}
                </p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className={`p-2 rounded-full ${theme.hoverBg}`}
            >
              <IoMdClose className={`w-5 h-5 ${theme.textColor}`} />
            </motion.button>
          </div>

          {/* Contenu */}
          <div className="p-4 max-h-[70vh] overflow-y-auto">
            <AnimatePresence mode="wait">
              {step === 'type' && (
                <TypeSelection
                  key="type"
                  onSelect={handleTypeSelect}
                  theme={theme}
                />
              )}
              
              {step === 'details' && (
                <DetailsForm
                  key="details"
                  type={selectedType}
                  details={discussionDetails}
                  onUpdate={setDiscussionDetails}
                  theme={theme}
                />
              )}
              
              {step === 'participants' && (
                <ParticipantSelection
                  key="participants"
                  type={selectedType}
                  contacts={filteredContacts}
                  selectedContacts={selectedContacts}
                  onToggleContact={toggleContactSelection}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  theme={theme}
                />
              )}
              
              {step === 'confirmation' && (
                <ConfirmationStep
                  key="confirmation"
                  type={selectedType}
                  details={discussionDetails}
                  participants={selectedContacts}
                  theme={theme}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className={`p-4 border-t ${theme.borderColor} ${theme.headerBg} flex justify-between`}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className={`px-4 py-2 rounded-lg ${theme.buttonSecondary} ${theme.textColor}`}
            >
              Annuler
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={step === 'confirmation' ? handleCreate : handleNext}
              disabled={!canProceed}
              className={`px-6 py-2 rounded-lg font-medium ${
                canProceed 
                  ? `${theme.accentBg} ${theme.accentText}` 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {step === 'confirmation' ? 'Créer' : 'Suivant'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Composant de sélection du type
const TypeSelection = ({ onSelect, theme }) => {
  const types = [
    {
      id: CREATION_TYPES.CONTACT,
      title: 'Discussion privée',
      description: 'Conversation 1 à 1 avec un contact',
      icon: <FaUserPlus className="w-6 h-6" />,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      features: ['Messages privés', 'Appels vocaux/vidéo', 'Partage de fichiers']
    },
    {
      id: CREATION_TYPES.GROUP,
      title: 'Groupe',
      description: 'Discussion avec plusieurs personnes',
      icon: <FaUsers className="w-6 h-6" />,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      features: ['Jusqu\'à 256 membres', 'Rôles et permissions', 'Messages épinglés']
    },
    {
      id: CREATION_TYPES.BROADCAST,
      title: 'Diffusion',
      description: 'Envoyez des messages à de nombreuses personnes',
      icon: <FaBroadcastTower className="w-6 h-6" />,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      features: ['Messages à sens unique', 'Statistiques', 'Monétisation']
    },
    {
      id: CREATION_TYPES.ROOM,
      title: 'Instant-Room',
      description: 'Salon temporaire pour événements',
      icon: <FaHashtag className="w-6 h-6" />,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      features: ['Temporaire', 'Accès par lien', 'Modération avancée']
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-3"
    >
      {types.map((type) => (
        <motion.button
          key={type.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(type.id)}
          className={`w-full p-4 rounded-xl border ${theme.borderColor} ${theme.hoverBg} text-left transition-all duration-200`}
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${type.bgColor}`}>
              <div className={type.color}>
                {type.icon}
              </div>
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold ${theme.textColor} mb-1`}>
                {type.title}
              </h3>
              <p className={`text-sm ${theme.secondaryText} mb-2`}>
                {type.description}
              </p>
              <div className="flex flex-wrap gap-1">
                {type.features.map((feature, index) => (
                  <span
                    key={index}
                    className={`text-xs px-2 py-1 rounded-full ${theme.bgColor} ${theme.secondaryText} border ${theme.borderColor}`}
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.button>
      ))}
    </motion.div>
  );
};

export default CreateDiscussionModal;
