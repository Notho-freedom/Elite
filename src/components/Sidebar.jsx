import React from 'react';
import { FaComments, FaCircleNotch, FaPhoneAlt, FaCog, FaUsers, FaMobile, FaBars, FaStar, FaArchive } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useApp, TABS } from './Context/AppContext';
import { useAuth } from './Context/AuthContext';

// Composant bouton tab optimisé
const TabButton = React.memo(({ tab, active, onClick, notificationCount, theme }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    aria-label={tab.label}
    onClick={onClick}
    className={`w-7 h-7 rounded-full flex items-center justify-center
      transition duration-200 relative
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
      ${active
        ? `${theme.accentBg} text-white shadow-md`
        : `${theme.hoverBg} ${theme.textColor}`}`}
  >
    {tab.icon}
    {notificationCount > 0 && (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`absolute -top-1 -right-1 flex items-center justify-center 
          h-5 w-5 rounded-full ${active ? 'text-white' : theme.baccentText} ${theme.accentShadow} 
          text-[0.75rem] font-extrabold`}
      >
        {notificationCount > 9 ? '+9' : notificationCount}
      </motion.div>
    )}
  </motion.button>
));

const Sidebar = () => {
  const {
    activeTab,
    activeChat,
    isAuthenticated,
    theme,
    isMobile,
    switchTab,
    notifications,
  } = useApp();
  
  const { user } = useAuth();

  // Onglets du haut
  const topTabs = [
    { id: 'toggle', icon: <FaBars size={17} />, label: 'Menu', isAction: true },
    { id: TABS.CHATS, icon: <FaComments size={17} />, label: 'Discussions' },
    { id: TABS.GROUPS, icon: <FaUsers size={17} />, label: 'Groupes' },
    { id: TABS.CALLS, icon: <FaPhoneAlt size={17} />, label: 'Appels' },
    { id: TABS.STATUS, icon: <FaCircleNotch size={17} />, label: 'Status' },
  ];

  // Onglets du bas
  const bottomTabs = [
    { id: 'favorites', icon: <FaStar size={17} />, label: 'Favoris', isAction: true },
    { id: 'archive', icon: <FaArchive size={17} />, label: 'Archives', isAction: true },
    { id: TABS.SETTINGS, icon: <FaCog size={17} />, label: 'Paramètres' },
  ];

  const handleTabClick = (tabId) => {
    if (!isAuthenticated) return;
    
    // Actions spéciales pour certains boutons
    if (tabId === 'toggle') {
      console.log('Toggle menu');
      return;
    }
    if (tabId === 'favorites') {
      console.log('Show favorites');
      return;
    }
    if (tabId === 'archive') {
      console.log('Show archives');
      return;
    }
    
    // Navigation normale pour les autres onglets
    switchTab(tabId);
  };

  if (!isAuthenticated) return null;

  if (isMobile) {
    return (
      <motion.nav
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`fixed -bottom-1 left-0 right-0 ${activeChat?.name ? 'hidden' : 'flex'} justify-center items-stretch h-[80px] sm:h-[14vh] p-0 gap-2
          ${theme.headerBg} ${theme.textColor} border-t ${theme.borderColor} z-50`}
      >
        {topTabs.slice(1, 5).map(tab => (
          <motion.button
            key={tab.id}
            whileTap={{ scale: 0.95 }}
            aria-label={tab.label}
            onClick={() => handleTabClick(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center
              transition-colors duration-200 relative mb-1
              ${theme.textColor}`}
          >
            <div className="relative">
              <div className={`p-2 mb-1 rounded-full
                ${activeTab === tab.id ? theme.accentBg + ' text-white ' + theme.accentShadow : 'transparent'}`}>
                {tab.icon}
              </div>
              {notifications[tab.id] > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`absolute -top-1 -right-1 flex items-center justify-center 
                    h-5 w-5 rounded-full ${activeTab === tab.id ? 'text-white' : theme.baccentText} ${theme.accentShadow} 
                    text-[0.75rem] font-extrabold`}
                >
                  {notifications[tab.id] > 9 ? '+9' : notifications[tab.id]}
                </motion.div>
              )}
            </div>
            <span className={`text-xs font-medium sm:hidden
            ${activeTab === tab.id ? theme.textColor + ' font-extrabold ' + 'opacity-100' : 'opacity-80'}`}>
              {tab.label}
            </span>
          </motion.button>
        ))}
      </motion.nav>
    );
  }

  // Desktop sidebar - Layout WhatsApp Desktop
  return (
    <motion.nav
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col justify-between items-center h-screen w-12 border-r ${theme.borderColor}
        p-3 ${theme.headerBg} ${theme.textColor} shadow-md
        flex-shrink-0 z-10`}
    >
      {/* Navigation tabs HAUT : toggle_btn, chat, group, call, status */}
      <div className="flex flex-col items-center gap-5">
        {topTabs.map(tab => (
          <TabButton
            key={tab.id}
            tab={tab}
            active={activeTab === tab.id}
            onClick={() => handleTabClick(tab.id)}
            notificationCount={notifications[tab.id]}
            theme={theme}
          />
        ))}
      </div>

      {/* Section BAS : favoris, archive, séparation, paramètres, avatar */}
      <div className="flex flex-col items-center gap-3">
        {/* Favoris et Archives */}
        {bottomTabs.slice(0, 2).map(tab => (
          <TabButton
            key={tab.id}
            tab={tab}
            active={false}
            onClick={() => handleTabClick(tab.id)}
            notificationCount={0}
            theme={theme}
          />
        ))}
        
        {/* Séparation */}
        <div className={`w-8 h-px border-t ${theme.borderColor} my-2`}></div>
        
        {/* Paramètres */}
        <TabButton
          key={bottomTabs[2].id}
          tab={bottomTabs[2]}
          active={activeTab === bottomTabs[2].id}
          onClick={() => handleTabClick(bottomTabs[2].id)}
          notificationCount={notifications[bottomTabs[2].id]}
          theme={theme}
        />
        
        {/* Avatar utilisateur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-9 h-9 rounded-full overflow-hidden border-2 border-transparent hover:border-blue-400 transition relative cursor-pointer mt-2"
          title={user?.user_metadata?.name || user?.email?.split('@')[0] || 'Utilisateur'}
        >
          <img
            alt="User avatar"
            src={user?.user_metadata?.avatar_url || user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata?.name || user?.email || 'User')}&background=646cff&color=fff&size=128`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata?.name || user?.email || 'User')}&background=646cff&color=fff&size=128`;
            }}
          />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Sidebar;
