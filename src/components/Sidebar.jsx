import React from 'react';
import { FaComments, FaCircleNotch, FaPhoneAlt, FaCog, FaUsers } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useApp, TABS } from './Context/AppContext';

// Composant bouton tab optimisé
const TabButton = React.memo(({ tab, active, onClick, notificationCount, theme }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    aria-label={tab.label}
    onClick={onClick}
    className={`w-10 h-10 rounded-full flex items-center justify-center
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
    isLogin,
    theme,
    isMobile,
    switchTab,
    notifications,
  } = useApp();

  const tabs = [
    { id: TABS.CHATS, icon: <FaComments size={20} />, label: 'Discussions' },
    { id: TABS.STATUS, icon: <FaCircleNotch size={20} />, label: 'Status' },
    { id: TABS.GROUPS, icon: <FaUsers size={20} />, label: 'Groupes' },
    { id: TABS.CALLS, icon: <FaPhoneAlt size={20} />, label: 'Appels' },
    { id: TABS.SETTINGS, icon: <FaCog size={20} />, label: 'Paramètres' },
  ];

  const handleTabClick = (tabId) => {
    if (!isLogin) return;
    switchTab(tabId);
  };

  if (!isLogin) return null;

  if (isMobile) {
    return (
      <motion.nav
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`fixed -bottom-1 left-0 right-0 ${activeChat?.name ? 'hidden' : 'flex'} justify-center items-stretch h-[80px] sm:h-[14vh] p-0 gap-2
          ${theme.headerBg} ${theme.textColor} border-t ${theme.borderColor} z-50`}
      >
        {tabs.slice(0, 4).map(tab => (
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

  // Desktop sidebar
  return (
    <motion.nav
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col justify-between items-center h-screen w-16 border-r ${theme.borderColor}
        p-3 gap-5 ${theme.headerBg} ${theme.textColor} shadow-md
        flex-shrink-0 `}
    >
      <div className="flex flex-col items-center gap-5">
        {tabs.map(tab => (
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

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-blue-400 transition relative cursor-pointer"
        title="Profil utilisateur"
      >
        <img
          alt="User avatar"
          src="https://storage.googleapis.com/a1aa/image/b3b21a49-79c4-48b8-083f-00e99da6ec57.jpg"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
      </motion.div>
    </motion.nav>
  );
};

export default Sidebar;
