import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { 
  FiSearch,
  FiMoreVertical,
  FiX,
  FiMessageSquare,
  FiPhone,
  FiVideo,
  FiUser,
  FiMail,
  FiClock,
  FiStar,
  FiLink
} from 'react-icons/fi';
import { 
  IoMdNotificationsOutline,
  IoMdCheckmarkCircleOutline
} from 'react-icons/io';
import { 
  BsCheck2All, 
  BsThreeDots,
  BsEmojiSmile,
  BsCamera,
  BsFileEarmark
} from 'react-icons/bs';
import { RiVipCrownLine } from 'react-icons/ri';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../Context/ThemeContext';

const Profile = ({ user, onClose }) => {
  const { theme, mode } = useTheme();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('media');
  const [isScrolled, setIsScrolled] = useState(false);
  const contentRef = useRef(null);
  const menuRef = useRef(null);

  // Fermer le menu quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Gestion du scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(contentRef.current.scrollTop > 50);
    };
    contentRef.current?.addEventListener('scroll', handleScroll);
    return () => contentRef.current?.removeEventListener('scroll', handleScroll);
  }, []);

  // Données du profil
  const profileData = {
    info: [
      { icon: <FiUser />, label: "Bio", value: "Digital designer & photographer" },
      { icon: <FiMail />, label: "Email", value: `${user?.name?.toLowerCase().replace(/\s/g, '')}@eliteapp.com` },
      { icon: <FiClock />, label: "Member since", value: "January 2020" },
      { icon: <RiVipCrownLine />, label: "Status", value: "Premium Member" }
    ],
    media: Array(9).fill(null).map((_, i) => ({ id: i+1, type: Math.random() > 0.5 ? 'photo' : 'video' })),
    links: [
      { title: "Portfolio", url: "portfolio.design", icon: <FiLink /> },
      { title: "Dribbble", url: "dribbble.com/me", icon: <FiStar /> }
    ]
  };

  return (
    <div className={clsx(
      "fixed inset-0 z-50 flex flex-col",
      theme.bgColor,
      theme.textColor
    )}>
      {/* Header animé */}
      <motion.div 
        className={clsx(
          "sticky top-0 z-10 flex items-center justify-between p-4",
          "border-b",
          theme.borderColor,
          theme.headerBg,
          "transition-all duration-300"
        )}
        animate={{
          backdropFilter: isScrolled ? 'blur(10px)' : 'none',
          backgroundColor: isScrolled ? 
            (mode === 'dark' ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)') : 
            'transparent'
        }}
      >
        <div className="flex items-center space-x-4">
          <motion.button 
            onClick={onClose}
            whileTap={{ scale: 0.9 }}
            className={clsx(
              "p-2 rounded-full",
              theme.hoverBg
            )}
          >
            <FiX className="text-lg" />
          </motion.button>
          <AnimatePresence>
            {isScrolled && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center space-x-2"
              >
              <motion.button 
                className="text-xl font-semibold"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >

<img 
              src={user?.avatar || 'https://via.placeholder.com/150'} 
              alt={user?.name}
              className={clsx(
                "w-12 h-12 flex flex-col rounded-full object-cover shadow-lg border-4",
                mode === 'dark' ? "border-gray-800" : "border-white",
                theme.accentShadow
              )}
            />
              </motion.button>

              <motion.h1 
                className="text-xl font-semibold"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >

                {user?.name}
              </motion.h1>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="flex items-center space-x-2" ref={menuRef}>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            className={clsx(
              "p-2 rounded-full",
              theme.hoverBg
            )}
          >
            <FiSearch className="text-lg" />
          </motion.button>
          <motion.button 
            onClick={() => setMenuOpen(!isMenuOpen)}
            whileTap={{ scale: 0.9 }}
            className={clsx(
              "p-2 rounded-full",
              theme.hoverBg,
              isMenuOpen && "bg-gray-200 dark:bg-gray-700"
            )}
          >
            <FiMoreVertical className="text-lg" />
          </motion.button>
        </div>
      </motion.div>

      {/* Contenu principal avec scroll */}
      <div 
        ref={contentRef}
        className="flex-1 overflow-y-auto scroll-smooth"
      >
        {/* Section profil */}
        <div className="flex flex-col items-center pt-8 pb-6 px-4">
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="relative mb-4 group"
          >
            <img 
              src={user?.avatar || 'https://via.placeholder.com/150'} 
              alt={user?.name}
              className={clsx(
                "w-32 h-32 rounded-full object-cover shadow-lg border-4",
                mode === 'dark' ? "border-gray-800" : "border-white",
                theme.accentShadow
              )}
            />
            {user?.isOnline && (
              <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
            )}
            <div className="absolute inset-0 rounded-full bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <BsCamera className="text-white text-2xl" />
            </div>
          </motion.div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-1 flex items-center justify-center">
              {user?.name}
              <IoMdCheckmarkCircleOutline className={clsx(
                "ml-1",
                mode === 'dark' ? "text-purple-400" : "text-purple-600"
              )} />
            </h2>
            <p className={clsx("text-sm", theme.secondaryText)}>
              {user?.isOnline ? (
                <span className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Online
                </span>
              ) : `last seen ${user?.timeDisplay}`}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className={clsx(
          "flex justify-around py-3 mx-4 mb-6 rounded-xl",
          mode === 'dark' ? "bg-gray-800" : "bg-gray-100",
          "border",
          theme.borderColor,
          theme.accentShadow
        )}>
          {[
            { icon: <FiMessageSquare />, label: "Message" },
            { icon: <FiPhone />, label: "Call" },
            { icon: <FiVideo />, label: "Video" }
          ].map((action, index) => (
            <motion.button
              key={index}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center"
            >
              <div className={clsx(
                "w-12 h-12 rounded-full flex items-center justify-center",
                mode === 'dark' ? "bg-gray-700" : "bg-white",
                theme.accentBg,
                theme.accentText,
                "shadow-sm"
              )}>
                {action.icon}
              </div>
              <span className="text-xs mt-2">{action.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Onglets */}
        <div className={clsx(
          "flex border-b mx-4",
          theme.borderColor
        )}>
          {[
            { id: 'info', label: "Info" },
            { id: 'media', label: "Media" },
            { id: 'links', label: "Links" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex-1 py-3 text-sm font-medium relative",
                activeTab === tab.id
                  ? clsx(
                      mode === 'dark' ? "text-purple-400" : "text-purple-600",
                      "after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1/3 after:h-0.5",
                      mode === 'dark' ? "after:bg-purple-400" : "after:bg-purple-600",
                      "after:rounded-full"
                    )
                  : theme.secondaryText
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu des onglets */}
        <div className="p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'info' && (
                <div className="space-y-4">
                  {profileData.info.map((item, index) => (
                    <div key={index} className="flex items-start">
                      <div className={clsx(
                        "p-2 rounded-lg mr-3",
                        mode === 'dark' ? "bg-purple-900/30" : "bg-purple-100",
                        mode === 'dark' ? "text-purple-400" : "text-purple-600"
                      )}>
                        {item.icon}
                      </div>
                      <div>
                        <p className={clsx("text-sm", theme.secondaryText)}>{item.label}</p>
                        <p className="text-sm mt-1">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'media' && (
                <div className="grid grid-cols-3 gap-2">
                  {profileData.media.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.02 }}
                      className={clsx(
                        "aspect-square rounded-lg overflow-hidden",
                        mode === 'dark' ? "bg-gray-700" : "bg-gray-200",
                        "flex items-center justify-center",
                        "relative group"
                      )}
                    >
                      {item.type === 'photo' ? (
                        <>
                          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <BsCamera className="text-white text-xl" />
                          </div>
                          <span className={clsx("text-xs", theme.secondaryText)}>Photo</span>
                        </>
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <FiVideo className="text-white text-xl" />
                          </div>
                          <span className={clsx("text-xs text-white", "absolute bottom-1 right-1")}>0:12</span>
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}

              {activeTab === 'links' && (
                <div className="space-y-3">
                  {profileData.links.map((link, index) => (
                    <motion.a
                      key={index}
                      href={`https://${link.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ x: 5 }}
                      className={clsx(
                        "flex items-center p-3 rounded-lg",
                        mode === 'dark' ? "bg-gray-800" : "bg-gray-100",
                        "border",
                        theme.borderColor,
                        theme.accentShadow
                      )}
                    >
                      <div className={clsx(
                        "p-2 rounded-lg mr-3",
                        mode === 'dark' ? "bg-purple-900/30" : "bg-purple-100",
                        mode === 'dark' ? "text-purple-400" : "text-purple-600"
                      )}>
                        {link.icon}
                      </div>
                      <div>
                        <p className="font-medium">{link.title}</p>
                        <p className={clsx("text-sm", theme.secondaryText)}>{link.url}</p>
                      </div>
                    </motion.a>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Menu contextuel */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={clsx(
              "absolute top-14 right-4 w-56 p-1 rounded-lg shadow-xl z-20",
              theme.bgColor,
              "border",
              theme.borderColor,
              theme.accentShadow
            )}
          >
            {[
              { icon: <IoMdNotificationsOutline />, label: "Notifications", color: "" },
              { icon: <FiStar />, label: "Add to favorites", color: mode === 'dark' ? "text-purple-400" : "text-purple-600" },
              { icon: <BsFileEarmark />, label: "Export chat", color: "" },
              { icon: <BsEmojiSmile />, label: "Change emoji", color: "" },
              { icon: <FiX />, label: "Block user", color: "text-red-500" }
            ].map((item, index) => (
              <motion.button
                key={index}
                whileHover={{ backgroundColor: mode === 'dark' ? 'rgba(107, 33, 168, 0.3)' : 'rgba(168, 85, 247, 0.1)' }}
                className={clsx(
                  "w-full flex items-center px-4 py-3 rounded-lg text-left",
                  item.color || theme.textColor
                )}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;