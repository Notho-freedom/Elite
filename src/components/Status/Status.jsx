import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEllipsisH, FaCheck } from 'react-icons/fa';
import { useTheme } from '../Context/ThemeContext';
import { useEffect, useState } from 'react';

const Status = ({ users }) => {
  const { theme } = useTheme();
  const [activeStatus, setActiveStatus] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  
  // Séparer les statuts non lus et déjà vus
  const [unreadStatus, setUnreadStatus] = useState([]);
  const [seenStatus, setSeenStatus] = useState([]);

  useEffect(() => {
    // Trier les utilisateurs par date (du plus récent au plus ancien)
    const sortedUsers = [...users].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Filtrer les statuts non lus
    const unread = sortedUsers.filter(user => user.unread);
    
    // Filtrer les statuts déjà vus (sauf l'utilisateur actuel)
    const seen = sortedUsers.filter(user => !user.unread && user.id !== 0);
    
    setUnreadStatus(unread);
    setSeenStatus(seen);
  }, [users]);

  const addNewStatus = () => {
    // Logique pour ajouter un nouveau statut
  };

  const markAsSeen = (index, isUnreadSection) => {
    if (isUnreadSection) {
      // Mettre à jour le statut comme "vu"
      const updatedUnread = [...unreadStatus];
      updatedUnread[index].unread = false;
      setUnreadStatus(updatedUnread.filter(user => user.unread));
      setSeenStatus([updatedUnread[index], ...seenStatus]);
    }
    setActiveStatus(index + 1);
  };

  function SegmentedRing({ segments = 1, radius = 24, stroke = 3, color = '#3B82F6', active=true }) {
    const size = radius * 2 + stroke * 2
    const circumference = 2 * Math.PI * radius
    const gap = circumference * 0.02 // petit espace entre segments
    const dashLength = (circumference - gap * segments) / segments
  
    const circles = Array.from({ length: segments }, (_, i) => {
      const offset = (dashLength + gap) * i
      return (
        <circle
          key={i}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          fill="none"
          stroke={active? color : '#b4b4b4'}
          strokeWidth={stroke}
          strokeDasharray={`${dashLength} ${circumference}`}
          strokeDashoffset={-offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      )
    })
  
    return (
      <svg width={size} height={size} className="absolute">
        {circles}
      </svg>
    )
  }
  


  return (
    <motion.div 
      className={`${theme.w} overflow-hidden ${theme.bgColor} h-full`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header style macOS */}
      <div className={`flex justify-between items-center px-4 py-3 ${theme.headerBg}   ${theme.borderColor} ${theme.textColor}`}>
        <h3 className={`text-lg font-semibold ${theme.textColor}`}>Statut</h3>
        <div className="flex space-x-3">
          <button 
            className={`p-1 rounded-full ${theme.buttonHover}`}
            onClick={addNewStatus}
          >
            <FaPlus className={theme.iconColor} />
          </button>
          <button 
            className={`p-1 rounded-full ${theme.buttonHover}`}
            onClick={() => setShowOptions(!showOptions)}
          >
            <FaEllipsisH className={theme.iconColor} />
          </button>
        </div>
      </div>

      {/* Menu déroulant options */}
      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`absolute right-4 mt-2 w-48 text-xs rounded-sm shadow-lg z-10 ${theme.bgColor} ${theme.textColor} ${theme.borderColor} border`}
          >
            <div className="py-1">
              <button className={`block w-full text-left px-4 py-2 ${theme.menuItemHover}`}>
                Paramètres des statuts
              </button>
              <button className={`block w-full text-left px-4 py-2 ${theme.menuItemHover}`}>
                Masquer les statuts
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste des statuts */}
      <div className="overflow-y-auto h-full">
        {/* Votre statut */}
        <div 
          className={`flex items-center px-4 py-3   ${theme.borderColor} ${theme.itemHover} cursor-pointer`}
          onClick={() => setActiveStatus(0)}
        >
          <div className="relative">
            <div className={`w-14 h-14 rounded-full border-2 ${activeStatus === 0 ? ' lue-500' : theme.borderColor} flex items-center justify-center`}>
              <img 
                src={users[0].avatar} 
                alt="Votre statut" 
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${theme.buttonBg} border-2 ${theme.borderColor} flex items-center justify-center`}>
                <FaPlus className="text-xs text-white" />
              </div>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className={`font-medium ${theme.textColor}`}>Mon Statut</p>
            <p className={`text-xs ${theme.secondaryText}`}>Ajouter à mon statut</p>
          </div>
          {activeStatus === 0 && <FaCheck className={`text-blue-500 ml-2`} />}
        </div>

        {/* Statuts non lus */}
        {unreadStatus.length > 0 && (
          <div className="px-3 py-2">
            <p className={`text-sm font-medium ${theme.textColor} mb-2`}>récents</p>
            {unreadStatus.map((status, index) => (
              <motion.div
                key={`unread-${index}`}
                className={`flex items-center px-1 py-3 rounded-lg ${theme.itemHover} cursor-pointer`}
                whileHover={{ scale: 1.01 }}
                onClick={() => markAsSeen(index, true)}
              >
                <div className="relative">
                    <div className="relative w-14 h-14 flex items-center justify-center">
                        <SegmentedRing segments={status.id} active={status.unread} />
                        <img 
                            src={status.avatar} 
                            alt={status.name}
                            className="w-12 h-12 rounded-full object-cover z-10"
                        />
                    </div>

                </div>
                <div className="ml-3 flex-1">
                  <p className={`font-medium ${theme.textColor}`}>{status.name}</p>
                  <p className={`text-xs ${theme.secondaryText}`}>{status.timeDisplay}</p>
                </div>
                {activeStatus === index + 1 && <FaCheck className={`text-blue-500 ml-2`} />}
              </motion.div>
            ))}
          </div>
        )}

        {/* Statuts déjà vus */}
        {seenStatus.length > 0 && (
          <div className="px-1 py-2">
            <p className={`text-sm pl-1 font-bold ${theme.textColor} mb-2`}>Déjà vus</p>
            {seenStatus.map((status, index) => (
              <motion.div
                key={`seen-${index}`}
                className={`flex items-center px-2 py-3 rounded-lg ${theme.itemHover} cursor-pointer`}
                whileHover={{ scale: 1.01 }}
                onClick={() => markAsSeen(index + unreadStatus.length, false)}
              >
                <div className="relative">
                <div className="relative w-14 h-14 flex items-center justify-center">
                        <SegmentedRing segments={status.id} active={!status.isRead} />
                        <img 
                            src={status.avatar} 
                            alt={status.name}
                            className="w-12 h-12 rounded-full object-cover z-10"
                        />
                    </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className={`font-medium ${theme.textColor}`}>{status.name}</p>
                  <p className={`text-xs ${theme.secondaryText}`}>{status.timeDisplay}</p>
                </div>
                {activeStatus === index + unreadStatus.length + 1 && <FaCheck className={`text-blue-500 ml-2`} />}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Status;