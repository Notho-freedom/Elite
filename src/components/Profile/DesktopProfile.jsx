import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  FiX, FiEdit3, FiSettings, FiShare2, FiMoreHorizontal,
  FiMapPin, FiGlobe, FiCalendar, FiMail, FiPhone,
  FiMessageSquare, FiVideo, FiUserPlus, FiUserMinus,
  FiStar, FiHeart, FiEye, FiTrendingUp, FiAward,
  FiShield, FiCheck, FiCamera, FiImage,
  FiActivity, FiUsers, FiGrid, FiList, FiMaximize2,
  FiMinimize2, FiZap, FiTarget, FiBookmark
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
import { 
  FloatingParticles, 
  MorphingGradient, 
  GlowHalo, 
  Constellation,
  ScanningLines 
} from './DesktopAnimations';

const DesktopProfile = () => {
  const { theme, activeChat, setShowProfile, isAuthenticated } = useApp();
  
  // États spécifiques desktop
  const [activeTab, setActiveTab] = useState('about');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [hoveredSection, setHoveredSection] = useState(null);
  
  // Parallax et scroll effects
  const containerRef = useRef(null);
  const { scrollY } = useScroll({
    container: containerRef
  });
  
  const headerY = useTransform(scrollY, [0, 300], [0, -150]);
  const headerOpacity = useTransform(scrollY, [0, 200], [1, 0]);
  const contentY = useTransform(scrollY, [0, 300], [0, -50]);

  // Profil utilisateur
  const userProfile = ProfileFactory.createDemoProfile(activeChat?.id, activeChat);

  // Configuration des onglets avec icônes et couleurs
  const tabs = [
    { 
      id: 'about', 
      label: 'À propos', 
      icon: FiEdit3, 
      color: 'blue',
      description: 'Informations personnelles'
    },
    { 
      id: 'activity', 
      label: 'Activité', 
      icon: FiActivity, 
      color: 'green',
      description: 'Timeline et interactions'
    },
    { 
      id: 'media', 
      label: 'Médias', 
      icon: FiImage, 
      color: 'purple',
      description: 'Photos et vidéos'
    },
    { 
      id: 'stats', 
      label: 'Statistiques', 
      icon: FiTrendingUp, 
      color: 'orange',
      description: 'Analytics et métriques'
    },
    { 
      id: 'social', 
      label: 'Réseaux', 
      icon: FiShare2, 
      color: 'pink',
      description: 'Liens sociaux'
    },
    { 
      id: 'settings', 
      label: 'Paramètres', 
      icon: FiSettings, 
      color: 'gray',
      description: 'Confidentialité et préférences'
    }
  ];

  // Icônes pour réseaux sociaux
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
        return 'from-yellow-400 via-orange-500 to-red-500';
      case USER_TYPES.CREATOR:
        return 'from-purple-400 via-pink-500 to-rose-500';
      case USER_TYPES.BUSINESS:
        return 'from-blue-400 via-indigo-500 to-purple-500';
      case USER_TYPES.PREMIUM:
        return 'from-green-400 via-emerald-500 to-teal-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  // Actions du profil
  const handleFollow = () => setIsFollowing(!isFollowing);
  const handleMessage = () => setShowProfile(false);
  const handleCall = () => console.log('Appel...');
  const handleVideoCall = () => console.log('Appel vidéo...');

  // Gestion fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const sidebarVariants = {
    expanded: { width: 280 },
    collapsed: { width: 80 }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`fixed inset-0 z-50 flex ${theme.bgColor} ${theme.textColor} overflow-hidden`}
      style={{ backdropFilter: 'blur(10px)' }}
    >
      {/* Sidebar Navigation Ultra Stylée */}
      <motion.div
        variants={sidebarVariants}
        animate={sidebarCollapsed ? 'collapsed' : 'expanded'}
        className="relative bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col"
        style={{
          boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(20px)'
        }}
      >
        {/* Header sidebar */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <FiUsers className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Elite Profile</h3>
                  <p className="text-xs text-gray-500">Version Desktop</p>
                </div>
              </motion.div>
            )}
            
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {sidebarCollapsed ? <FiMaximize2 size={16} /> : <FiMinimize2 size={16} />}
              </motion.button>
              
              <motion.button
                onClick={() => setShowProfile(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 transition-colors"
              >
                <FiX size={16} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                onMouseEnter={() => setHoveredSection(tab.id)}
                onMouseLeave={() => setHoveredSection(null)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  transition: { delay: index * 0.1 }
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group relative ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-200/50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-r-full"
                  />
                )}
                
                <div className={`p-2 rounded-lg transition-all ${
                  isActive 
                    ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-lg`
                    : `bg-gray-200 dark:bg-gray-700 group-hover:bg-${tab.color}-100 dark:group-hover:bg-${tab.color}-900/20`
                }`}>
                  <Icon size={16} />
                </div>
                
                {!sidebarCollapsed && (
                  <div className="flex-1 text-left">
                    <p className="font-medium">{tab.label}</p>
                    <p className="text-xs opacity-70">{tab.description}</p>
                  </div>
                )}

                {/* Hover tooltip pour sidebar collapsed */}
                {sidebarCollapsed && hoveredSection === tab.id && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="absolute left-full ml-4 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap z-50 shadow-xl"
                  >
                    {tab.label}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Footer sidebar */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <motion.button
              onClick={toggleFullscreen}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Mode plein écran"
            >
              {isFullscreen ? <FiMinimize2 size={16} /> : <FiMaximize2 size={16} />}
            </motion.button>
            
            {!sidebarCollapsed && (
              <div className="flex-1 text-xs text-gray-500">
                <p>Elite Chat Desktop</p>
                <p>v2.0.0</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Contenu Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Hero Section avec Parallax */}
        <motion.div
          style={{ y: headerY, opacity: headerOpacity }}
          className="relative h-80 overflow-hidden"
        >
                     {/* Background avec animations premium */}
           <div className="absolute inset-0">
             {/* Gradient morphing de base */}
             <MorphingGradient userType={userProfile.userType} />
             
             {/* Overlay sombre */}
             <div className="absolute inset-0 bg-black/30" />
             
             {/* Particules flottantes premium */}
             <FloatingParticles count={30} userType={userProfile.userType} />
             
             {/* Constellation pour les utilisateurs Elite */}
             {userProfile.userType === USER_TYPES.ELITE && (
               <Constellation userType={userProfile.userType} starCount={20} />
             )}
             
             {/* Scanning lines pour les comptes Business */}
             {userProfile.userType === USER_TYPES.BUSINESS && (
               <ScanningLines userType={userProfile.userType} />
             )}
           </div>

          {/* Actions Header */}
          <div className="absolute top-6 right-6 flex items-center gap-3 z-10">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
            >
              <FiShare2 size={20} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
            >
              <FiBookmark size={20} />
            </motion.button>
            
            <motion.button
              onMouseEnter={() => setShowQuickActions(true)}
              onMouseLeave={() => setShowQuickActions(false)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors relative"
            >
              <FiMoreHorizontal size={20} />
              
              <AnimatePresence>
                {showQuickActions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-2 min-w-48"
                  >
                    {[
                      { icon: FiStar, label: 'Ajouter aux favoris', color: 'text-yellow-500' },
                      { icon: FiShield, label: 'Signaler le profil', color: 'text-red-500' },
                      { icon: FiUserMinus, label: 'Bloquer utilisateur', color: 'text-red-500' }
                    ].map((action, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ x: 4 }}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${action.color}`}
                      >
                        <action.icon size={16} />
                        <span className="text-gray-900 dark:text-white">{action.label}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Profil Info dans Header */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-end gap-6">
                                 {/* Avatar avec effets premium */}
                 <motion.div
                   className="relative"
                   whileHover={{ scale: 1.05 }}
                   onClick={() => {
                     setSelectedImage(userProfile.avatar);
                     setShowImageViewer(true);
                   }}
                 >
                   {/* Halo lumineux autour de l'avatar */}
                   {userProfile.isPremium() && (
                     <div className="absolute inset-0 -m-4">
                       <GlowHalo userType={userProfile.userType} intensity={0.4} />
                     </div>
                   )}
                   
                   <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white/50 backdrop-blur-sm shadow-2xl cursor-pointer relative group">
                     <img
                       src={userProfile.avatar || 'https://via.placeholder.com/128'}
                       alt={userProfile.getDisplayName()}
                       className="w-full h-full object-cover"
                     />
                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                       <FiCamera className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                     </div>
                   </div>
                  
                  {/* Status Online */}
                  {userProfile.isOnline && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg"
                    />
                  )}
                  
                  {/* Badge Type Utilisateur */}
                  {userProfile.isPremium() && (
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-r ${getUserTypeColor()} rounded-full flex items-center justify-center shadow-lg border-2 border-white`}
                    >
                      {userProfile.userType === USER_TYPES.ELITE && <FaCrown className="text-white" size={16} />}
                      {userProfile.userType === USER_TYPES.CREATOR && <FiStar className="text-white" size={16} />}
                      {userProfile.userType === USER_TYPES.BUSINESS && <FiShield className="text-white" size={16} />}
                      {userProfile.userType === USER_TYPES.PREMIUM && <FiAward className="text-white" size={16} />}
                    </motion.div>
                  )}
                </motion.div>

                {/* Informations Profile */}
                <div className="flex-1 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-4xl font-bold"
                    >
                      {userProfile.getDisplayName()}
                    </motion.h1>
                    {getVerificationIcon()}
                  </div>
                  
                  {userProfile.tagline && (
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-xl text-white/90 mb-3"
                    >
                      {userProfile.tagline}
                    </motion.p>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-6 text-white/80"
                  >
                    {userProfile.location && (
                      <div className="flex items-center gap-2">
                        <FiMapPin size={16} />
                        <span>{userProfile.location.city}, {userProfile.location.country}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <FiCalendar size={16} />
                      <span>Membre depuis {new Date(userProfile.joinedAt).getFullYear()}</span>
                    </div>

                    {userProfile.stats.followers > 0 && (
                      <div className="flex items-center gap-2">
                        <FiUsers size={16} />
                        <span>{userProfile.stats.followers?.toLocaleString()} abonnés</span>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Actions Rapides */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-3"
                >
                  <motion.button
                    onClick={handleMessage}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg transition-colors"
                  >
                    <FiMessageSquare size={18} />
                    Message
                  </motion.button>

                  <motion.button
                    onClick={handleCall}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl transition-colors"
                  >
                    <FiPhone size={18} />
                  </motion.button>

                  <motion.button
                    onClick={handleVideoCall}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl transition-colors"
                  >
                    <FiVideo size={18} />
                  </motion.button>

                  <motion.button
                    onClick={handleFollow}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-3 rounded-xl transition-colors ${
                      isFollowing 
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    }`}
                  >
                    {isFollowing ? <FiUserMinus size={18} /> : <FiUserPlus size={18} />}
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contenu Principal avec Scroll */}
        <motion.div
          ref={containerRef}
          style={{ y: contentY }}
          className="flex-1 overflow-y-auto"
        >
          <div className="max-w-6xl mx-auto p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="min-h-96"
              >
                {/* Contenu des onglets */}
                {activeTab === 'about' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                      {/* Bio */}
                      {userProfile.bio && (
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
                        >
                          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <FiEdit3 className="text-blue-500" />
                            Biographie
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                            {userProfile.bio}
                          </p>
                        </motion.div>
                      )}

                      {/* Badges */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
                      >
                        <ProfileBadges badges={userProfile.badges} userType={userProfile.userType} />
                      </motion.div>

                      {/* Informations de contact */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
                      >
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <FiMail className="text-green-500" />
                          Informations de contact
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {userProfile.email && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <FiMail className="text-gray-500" />
                              <span>{userProfile.email}</span>
                            </div>
                          )}
                          
                          {userProfile.website && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <FiGlobe className="text-gray-500" />
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
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <FiMapPin className="text-gray-500" />
                              <span>{userProfile.location.city}, {userProfile.location.country}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </div>

                    <div className="space-y-8">
                      {/* Stats rapides */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
                      >
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <FiTrendingUp className="text-purple-500" />
                          Aperçu
                        </h3>
                        <div className="space-y-4">
                          {[
                            { label: 'Messages', value: userProfile.stats.totalMessages?.toLocaleString(), icon: FiMessageSquare, color: 'blue' },
                            { label: 'Abonnés', value: userProfile.stats.followers?.toLocaleString(), icon: FiUsers, color: 'green' },
                            { label: 'Vues', value: userProfile.stats.totalViews?.toLocaleString(), icon: FiEye, color: 'purple' }
                          ].map((stat, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <stat.icon className={`text-${stat.color}-500`} size={16} />
                                <span className="text-gray-600 dark:text-gray-400">{stat.label}</span>
                              </div>
                              <span className="font-semibold">{stat.value || '0'}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>

                      {/* Abonnement */}
                      {userProfile.isPremium() && (
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
                        >
                          <SubscriptionInfo subscription={userProfile.subscription} userType={userProfile.userType} />
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                      <FiActivity className="text-green-500" />
                      Timeline d'activité
                    </h2>
                    <div className="text-center py-12">
                      <FiActivity className="mx-auto text-6xl text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        Timeline en développement
                      </h3>
                      <p className="text-gray-500">
                        Cette section affichera l'activité récente de l'utilisateur.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'media' && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                    <MediaGallery userId={userProfile.id} />
                  </div>
                )}

                {activeTab === 'stats' && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                    <StatisticsPanel stats={userProfile.stats} userType={userProfile.userType} />
                  </div>
                )}

                {activeTab === 'social' && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                    <SocialLinks 
                      socialLinks={userProfile.socialLinks} 
                      socialIcons={socialIcons}
                      isEditable={false}
                    />
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                    <PrivacySettings 
                      privacy={userProfile.privacy}
                      preferences={userProfile.preferences}
                      isOwn={false}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
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
              alt="Image agrandie"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setShowImageViewer(false)}
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <FiX size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DesktopProfile;
