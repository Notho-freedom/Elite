import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiX, FiEdit3, FiSettings, FiShare2, FiMoreHorizontal,
  FiMapPin, FiGlobe, FiCalendar, FiMail, FiPhone,
  FiMessageSquare, FiVideo, FiUserPlus, FiUserMinus,
  FiStar, FiHeart, FiEye, FiTrendingUp, FiAward,
  FiShield, FiCheck, FiCamera, FiImage
} from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';
import {
  BsInstagram, BsTwitter, BsLinkedin, BsGithub,
  BsTelegram, BsDiscord, BsYoutube, BsTiktok
} from 'react-icons/bs';
import { useApp } from '../Context/AppContext';
import { ProfileFactory, USER_TYPES, VERIFICATION_STATUS } from '../../models/UserProfile';
import StatisticsPanel from './StatisticsPanel';
import MediaGallery from './MediaGallery';
import SocialLinks from './SocialLinks';
import ProfileBadges from './ProfileBadges';
import PrivacySettings from './PrivacySettings';
import SubscriptionInfo from './SubscriptionInfo';

const EnhancedProfile = () => {
  const { theme, activeChat, setShowProfile, isAuthenticated } = useApp();
  
  // États du composant
  const [activeTab, setActiveTab] = useState('about');
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  // Références
  const contentRef = useRef(null);
  const menuRef = useRef(null);

  // Créer le profil à partir des données du contact actuel
  const userProfile = ProfileFactory.createDemoProfile(activeChat?.id, activeChat);

  // Fermer le menu contextuel avec Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowMenu(false);
        if (showImageViewer) setShowImageViewer(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showImageViewer]);

  // Configuration des onglets
  const tabs = [
    { id: 'about', label: 'À propos', icon: FiEdit3 },
    { id: 'media', label: 'Médias', icon: FiImage },
    { id: 'stats', label: 'Statistiques', icon: FiTrendingUp },
    { id: 'social', label: 'Réseaux', icon: FiShare2 },
    { id: 'settings', label: 'Paramètres', icon: FiSettings }
  ];

  // Icônes pour les réseaux sociaux
  const socialIcons = {
    instagram: BsInstagram,
    twitter: BsTwitter,
    linkedin: BsLinkedin,
    github: BsGithub,
    telegram: BsTelegram,
    discord: BsDiscord,
    youtube: BsYoutube,
    tiktok: BsTiktok,
    behance: FiImage
  };

  // Fonction pour obtenir l'icône de vérification
  const getVerificationIcon = () => {
    switch (userProfile.verificationStatus) {
      case VERIFICATION_STATUS.VERIFIED:
        return <FiCheck className="text-blue-500" />;
      case VERIFICATION_STATUS.PREMIUM_VERIFIED:
        return <FiStar className="text-purple-500" />;
      case VERIFICATION_STATUS.ELITE_VERIFIED:
        return <FaCrown className="text-yellow-500" />;
      default:
        return null;
    }
  };

  // Fonction pour obtenir la couleur du type d'utilisateur
  const getUserTypeColor = () => {
    switch (userProfile.userType) {
      case USER_TYPES.ELITE:
        return 'from-yellow-400 to-orange-500';
      case USER_TYPES.CREATOR:
        return 'from-purple-400 to-pink-500';
      case USER_TYPES.BUSINESS:
        return 'from-blue-400 to-indigo-500';
      case USER_TYPES.PREMIUM:
        return 'from-green-400 to-teal-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  // Actions du profil
  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const handleMessage = () => {
    setShowProfile(false);
    // Navigation vers le chat
  };

  const handleCall = () => {
    // Initier un appel
  };

  const handleVideoCall = () => {
    // Initier un appel vidéo
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${theme.bgColor} ${theme.textColor}`}>
      {/* Header avec image de couverture */}
      <div className="relative h-48 overflow-hidden">
        {/* Image de couverture */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"
          style={{
            backgroundImage: userProfile.coverImage ? `url(${userProfile.coverImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Navigation header */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-10">
          <motion.button
            onClick={() => setShowProfile(false)}
            whileTap={{ scale: 0.9 }}
            className="p-2 bg-black/20 backdrop-blur-sm rounded-full text-white"
          >
            <FiX size={20} />
          </motion.button>

          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="p-2 bg-black/20 backdrop-blur-sm rounded-full text-white"
            >
              <FiShare2 size={18} />
            </motion.button>
            
            <div className="relative" ref={menuRef}>
              <motion.button
                onClick={() => setShowMenu(!showMenu)}
                whileTap={{ scale: 0.9 }}
                className="p-2 bg-black/20 backdrop-blur-sm rounded-full text-white"
              >
                <FiMoreHorizontal size={18} />
              </motion.button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    className={`absolute right-0 top-12 w-56 ${theme.bgColor} rounded-lg shadow-xl border ${theme.borderColor} p-2 z-20`}
                  >
                    {[
                      { icon: FiStar, label: 'Ajouter aux favoris', action: () => {} },
                      { icon: FiShield, label: 'Signaler', action: () => {} },
                      { icon: FiUserMinus, label: 'Bloquer', action: () => {}, danger: true }
                    ].map((item, index) => (
                      <motion.button
                        key={index}
                        onClick={item.action}
                        whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left ${
                          item.danger ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' : ''
                        }`}
                      >
                        <item.icon size={16} />
                        <span>{item.label}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Photo de profil et infos de base */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-end gap-4">
            {/* Avatar */}
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                setSelectedImage(userProfile.avatar);
                setShowImageViewer(true);
              }}
            >
              <img
                src={userProfile.avatar || 'https://via.placeholder.com/120'}
                alt={userProfile.getDisplayName()}
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover cursor-pointer"
              />
              {userProfile.isOnline && (
                <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white" />
              )}
              
              {/* Badge de type d'utilisateur */}
              {userProfile.isPremium() && (
                <div className={`absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-r ${getUserTypeColor()} rounded-full flex items-center justify-center shadow-lg`}>
                  {userProfile.userType === USER_TYPES.ELITE && <FiCrown className="text-white text-sm" />}
                  {userProfile.userType === USER_TYPES.CREATOR && <FiStar className="text-white text-sm" />}
                  {userProfile.userType === USER_TYPES.BUSINESS && <FiShield className="text-white text-sm" />}
                  {userProfile.userType === USER_TYPES.PREMIUM && <FiAward className="text-white text-sm" />}
                </div>
              )}
            </motion.div>

            {/* Informations de base */}
            <div className="flex-1 text-white">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{userProfile.getDisplayName()}</h1>
                {getVerificationIcon()}
              </div>
              
              {userProfile.tagline && (
                <p className="text-white/80 text-sm mb-2">{userProfile.tagline}</p>
              )}

              <div className="flex items-center gap-4 text-sm">
                {userProfile.location && (
                  <div className="flex items-center gap-1">
                    <FiMapPin size={14} />
                    <span>{userProfile.location.city}, {userProfile.location.country}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <FiCalendar size={14} />
                  <span>Membre depuis {new Date(userProfile.joinedAt).getFullYear()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <motion.button
            onClick={handleMessage}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <FiMessageSquare size={16} />
            Message
          </motion.button>

          <motion.button
            onClick={handleCall}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg ${theme.hoverBg}`}
          >
            <FiPhone size={16} />
          </motion.button>

          <motion.button
            onClick={handleVideoCall}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg ${theme.hoverBg}`}
          >
            <FiVideo size={16} />
          </motion.button>

          <motion.button
            onClick={handleFollow}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-2 border-2 rounded-lg ${
              isFollowing 
                ? 'border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                : 'border-green-300 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
            }`}
          >
            {isFollowing ? <FiUserMinus size={16} /> : <FiUserPlus size={16} />}
          </motion.button>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="px-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon size={16} />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="flex-1 overflow-y-auto" ref={contentRef}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="p-4"
          >
            {/* Onglet À propos */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                {/* Bio */}
                {userProfile.bio && (
                  <div>
                    <h3 className="font-semibold mb-2">Biographie</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {userProfile.bio}
                    </p>
                  </div>
                )}

                {/* Badges */}
                <ProfileBadges badges={userProfile.badges} userType={userProfile.userType} />

                {/* Informations de contact */}
                <div>
                  <h3 className="font-semibold mb-3">Informations</h3>
                  <div className="space-y-3">
                    {userProfile.email && (
                      <div className="flex items-center gap-3">
                        <FiMail className="text-gray-500" size={16} />
                        <span className="text-gray-600 dark:text-gray-400">{userProfile.email}</span>
                      </div>
                    )}
                    
                    {userProfile.website && (
                      <div className="flex items-center gap-3">
                        <FiGlobe className="text-gray-500" size={16} />
                        <a
                          href={userProfile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {userProfile.website}
                        </a>
                      </div>
                    )}

                    {userProfile.location && (
                      <div className="flex items-center gap-3">
                        <FiMapPin className="text-gray-500" size={16} />
                        <span className="text-gray-600 dark:text-gray-400">
                          {userProfile.location.city}, {userProfile.location.country}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Abonnement Premium/Elite */}
                {userProfile.isPremium() && (
                  <SubscriptionInfo subscription={userProfile.subscription} userType={userProfile.userType} />
                )}
              </div>
            )}

            {/* Onglet Médias */}
            {activeTab === 'media' && (
              <MediaGallery userId={userProfile.id} />
            )}

            {/* Onglet Statistiques */}
            {activeTab === 'stats' && (
              <StatisticsPanel stats={userProfile.stats} userType={userProfile.userType} />
            )}

            {/* Onglet Réseaux sociaux */}
            {activeTab === 'social' && (
              <SocialLinks 
                socialLinks={userProfile.socialLinks} 
                socialIcons={socialIcons}
                isEditable={false}
              />
            )}

            {/* Onglet Paramètres */}
            {activeTab === 'settings' && (
              <PrivacySettings 
                privacy={userProfile.privacy}
                preferences={userProfile.preferences}
                isOwn={false}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Visualiseur d'images */}
      <AnimatePresence>
        {showImageViewer && selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-60 flex items-center justify-center p-4"
            onClick={() => setShowImageViewer(false)}
          >
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={selectedImage}
              alt="Agrandir l'image"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setShowImageViewer(false)}
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full"
            >
              <FiX size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedProfile;