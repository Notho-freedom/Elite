import React, { useState } from 'react';
import { FaUsers, FaPlus, FaClock, FaShieldAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import TabHeader from '../UI/TabHeader';
import { useApp } from '../Context/AppContext';

const GroupList = () => {
  const { theme } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'groups', 'rooms'

  const handleCreateGroup = () => {
    console.log('Créer un groupe');
  };

  const handleCreateRoom = () => {
    console.log('Créer une instant-room');
  };

  const handleFilter = () => {
    // Cycle through filters
    const filters = ['all', 'groups', 'rooms'];
    const currentIndex = filters.indexOf(filter);
    const nextIndex = (currentIndex + 1) % filters.length;
    setFilter(filters[nextIndex]);
  };

  const getFilterLabel = () => {
    switch (filter) {
      case 'groups': return 'Groupes';
      case 'rooms': return 'Rooms';
      default: return 'Tous';
    }
  };

  return (
    <div className={`${theme.w} ${theme.bgColor} h-screen flex flex-col`}>
      <TabHeader
        title="Groupes & Rooms"
        theme={theme}
        showSearch={true}
        showAdd={true}
        showFilter={true}
        onSearch={() => {}}
        onAdd={handleCreateGroup}
        onFilter={handleFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Rechercher un groupe..."
        customActions={[
          {
            icon: <FaClock className="w-4 h-4" />,
            label: 'Instant Room',
            onClick: handleCreateRoom
          }
        ]}
      />

      {/* Filter indicator */}
      {filter !== 'all' && (
        <div className={`px-4 py-2 ${theme.headerBg} border-b ${theme.borderColor}`}>
          <span className={`text-sm ${theme.secondaryText}`}>
            Filtré par: <span className={theme.textColor}>{getFilterLabel()}</span>
          </span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-center ${theme.secondaryText} mt-20`}
        >
          <div className="mb-6">
            <div className={`w-16 h-16 rounded-full ${theme.accentBg} mx-auto flex items-center justify-center mb-4`}>
              <FaUsers className="text-white text-xl" />
            </div>
            <h3 className={`text-lg font-medium ${theme.textColor} mb-2`}>
              Créez votre premier groupe
            </h3>
            <p className={`${theme.secondaryText} mb-4`}>
              Discutez avec plusieurs personnes en même temps
            </p>
          </div>

          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateGroup}
              className={`w-full px-6 py-3 ${theme.accentBg} text-white rounded-lg font-medium flex items-center justify-center gap-2`}
            >
              <FaUsers className="w-4 h-4" />
              Créer un groupe
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateRoom}
              className={`w-full px-6 py-3 border-2 ${theme.borderColor} ${theme.textColor} rounded-lg font-medium flex items-center justify-center gap-2 hover:${theme.hoverBg}`}
            >
              <FaClock className="w-4 h-4" />
              Instant Room
              <FaShieldAlt className="w-3 h-3 opacity-60" />
            </motion.button>
          </div>

          <div className={`mt-6 p-3 ${theme.headerBg} rounded-lg`}>
            <p className={`text-xs ${theme.secondaryText}`}>
              💡 <strong>Instant Rooms:</strong> Discussions temporaires avec suppression automatique après un délai défini
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GroupList;
