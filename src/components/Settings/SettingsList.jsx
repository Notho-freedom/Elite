import React, { useState } from 'react';
import { 
  FaCog, FaUser, FaLock, FaBell, FaComments, FaEye, 
  FaImage, FaUsers, FaKeyboard, FaQuestionCircle, 
  FaSignOutAlt, FaInfoCircle, FaUserSlash, FaShieldAlt,
  FaPalette, FaClock, FaLink
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import TabHeader from '../UI/TabHeader';
import { useApp } from '../Context/AppContext';

const SettingsList = () => {
  const { theme } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const settingsCategories = [
    {
      title: 'Compte',
      items: [
        { icon: <FaUser />, label: 'Gestion du compte', action: () => console.log('Account') },
        { icon: <FaImage />, label: 'Photo de profil', action: () => console.log('Profile pic') },
        { icon: <FaEye />, label: 'Présence en ligne', action: () => console.log('Online presence') },
      ]
    },
    {
      title: 'Confidentialité & Sécurité',
      items: [
        { icon: <FaLock />, label: 'Confidentialité', action: () => console.log('Privacy') },
        { icon: <FaUserSlash />, label: 'Contacts bloqués', action: () => console.log('Blocked') },
        { icon: <FaShieldAlt />, label: 'Verrouillage de l\'application', action: () => console.log('App lock') },
      ]
    },
    {
      title: 'Discussions',
      items: [
        { icon: <FaComments />, label: 'Discussions', action: () => console.log('Chats') },
        { icon: <FaClock />, label: 'Messages éphémères', action: () => console.log('Disappearing') },
        { icon: <FaLink />, label: 'Connexions multiples', action: () => console.log('Multi-device') },
      ]
    },
    {
      title: 'Notifications',
      items: [
        { icon: <FaBell />, label: 'Notifications', action: () => console.log('Notifications') },
      ]
    },
    {
      title: 'Apparence',
      items: [
        { icon: <FaPalette />, label: 'Thème (clair/sombre)', action: () => console.log('Theme') },
        { icon: <FaImage />, label: 'Fond d\'écran', action: () => console.log('Wallpaper') },
      ]
    },
    {
      title: 'Groupes',
      items: [
        { icon: <FaUsers />, label: 'Groupes', action: () => console.log('Groups') },
      ]
    },
    {
      title: 'Système',
      items: [
        { icon: <FaKeyboard />, label: 'Raccourcis clavier', action: () => console.log('Shortcuts') },
        { icon: <FaQuestionCircle />, label: 'Aide et support', action: () => console.log('Help') },
        { icon: <FaInfoCircle />, label: 'Informations de l\'application', action: () => console.log('App info') },
      ]
    }
  ];

  const filteredCategories = settingsCategories.map(category => ({
    ...category,
    items: category.items.filter(item => 
      !searchQuery || 
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <div className={`${theme.w} ${theme.bgColor} h-screen flex flex-col`}>
      <TabHeader
        title="Paramètres"
        theme={theme}
        showSearch={true}
        showMore={false}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Rechercher un paramètre..."
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {filteredCategories.map((category, index) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <h3 className={`text-sm font-medium ${theme.secondaryText} uppercase tracking-wide mb-3`}>
              {category.title}
            </h3>
            
            <div className={`${theme.cardBg} rounded-lg overflow-hidden border ${theme.borderColor}`}>
              {category.items.map((item, itemIndex) => (
                <motion.button
                  key={item.label}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={item.action}
                  className={`w-full px-4 py-3 flex items-center gap-3 ${theme.hoverBg} transition-colors ${
                    itemIndex !== category.items.length - 1 ? `border-b ${theme.borderColor}` : ''
                  }`}
                >
                  <div className={`text-lg ${theme.secondaryText}`}>
                    {item.icon}
                  </div>
                  <span className={`flex-1 text-left ${theme.textColor}`}>
                    {item.label}
                  </span>
                  <div className={`text-xs ${theme.secondaryText}`}>
                    ›
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Déconnexion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: filteredCategories.length * 0.1 }}
          className="pt-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => console.log('Logout')}
            className={`w-full px-4 py-3 flex items-center gap-3 ${theme.cardBg} rounded-lg border ${theme.borderColor} text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors`}
          >
            <FaSignOutAlt className="text-lg" />
            <span className="flex-1 text-left font-medium">
              Déconnexion
            </span>
          </motion.button>
        </motion.div>

        {/* Version info */}
        <div className={`text-center ${theme.secondaryText} text-xs py-4`}>
          Elite v1.0.0 - Premium Communication
        </div>
      </div>
    </div>
  );
};

export default SettingsList;
