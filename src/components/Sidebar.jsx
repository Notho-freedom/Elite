import { FaComments, FaCircleNotch, FaPhoneAlt, FaCog } from 'react-icons/fa';
import { useTheme } from './ThemeContext';
import { motion } from 'framer-motion';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { theme } = useTheme();

  const tabs = [
    { id: 'chats', icon: <FaComments />, label: 'Chats' },
    { id: 'status', icon: <FaCircleNotch />, label: 'Status' },
    { id: 'calls', icon: <FaPhoneAlt />, label: 'Calls' },
    { id: 'settings', icon: <FaCog />, label: 'Settings' }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(prev => (prev === tabId ? null : tabId));
  };

  return (
    <motion.nav
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`
        flex flex-col justify-between items-center h-screen w-12 border-r ${theme.borderColor}
        p-3 gap-5 ${theme.headerBg} ${theme.textColor} shadow-[2px_0_8px_rgba(0,0,0,0.7)]
        rounded-tl-[12px] rounded-bl-[12px] select-none cursor-pointer flex-shrink-0
      `}
    >
      <div className="flex flex-col items-center gap-5">
        {tabs.map((tab) => (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            key={tab.id}
            aria-label={tab.label}
            title={tab.label}
            onClick={() => handleTabClick(tab.id)}
            className={`
  w-9 h-9 rounded-full flex items-center justify-center
  transition duration-300 ease-in-out
  ${activeTab === tab.id
    ? `${theme.accentBg} ${theme.accentText} ${theme.accentShadow}`
    : `${theme.hoverBg} ${theme.textColor}`}
  focus:outline-none ${theme.focusRing}
`}

          >
            {tab.icon}
          </motion.button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="w-9 h-9 rounded-full overflow-hidden border-2 border-transparent hover:border-[#0a84ff] transition duration-300"
      >
        <img
          alt="User avatar"
          src="https://storage.googleapis.com/a1aa/image/b3b21a49-79c4-48b8-083f-00e99da6ec57.jpg"
          className="w-full h-full object-cover"
        />
      </motion.div>
    </motion.nav>
  );
};

export default Sidebar;
