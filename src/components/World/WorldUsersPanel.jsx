import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiUsers, FiRefreshCw, FiCheck, FiClock, FiGlobe } from 'react-icons/fi';
import { useApp } from '../Context/AppContext';
import useAllUsers from '../../hooks/useAllUsers';

const WorldUsersPanel = () => {
  const { theme } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filters = {
    isOnline: filterType === 'online',
    // Pour la WORLD panel, on veut potentiellement tous, ne pas forcer isActive
  };

  const { users, onlineUsers, recentUsers, loading, error, loadUsers, searchUsers } = useAllUsers(filters);

  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.trim()) {
      await searchUsers(term.trim());
    } else {
      await loadUsers();
    }
  };

  const getFilteredUsers = () => {
    switch (filterType) {
      case 'online':
        return onlineUsers;
      case 'recent':
        return recentUsers;
      default:
        return users;
    }
  };

  const filteredUsers = getFilteredUsers();

  const UserRow = ({ user }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className={`p-3 rounded-lg border ${theme.borderColor} ${theme.bgSecondary}`}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={user.avatar_url || 'https://via.placeholder.com/40'}
            alt={user.name || user.username || 'Utilisateur'}
            className="w-9 h-9 rounded-full object-cover"
          />
          {user.is_online && (
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{user.name || user.username || user.email}</span>
            {user.is_online && <span className="text-xs text-green-500">En ligne</span>}
          </div>
          <div className="text-xs text-gray-500 truncate">@{user.username || user.email?.split('@')[0]}</div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className={`flex flex-col h-full ${theme.bgColor}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FiGlobe className="text-blue-500" />
          Monde • Tous les utilisateurs
        </h2>
        <div className="relative mb-4">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${theme.borderColor} ${theme.bgSecondary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'Tous', icon: FiUsers },
            { id: 'online', label: 'En ligne', icon: FiCheck },
            { id: 'recent', label: 'Récents', icon: FiClock }
          ].map(({ id, label, icon: Icon }) => (
            <motion.button
              key={id}
              onClick={() => setFilterType(id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === id ? 'bg-blue-500 text-white' : `${theme.bgSecondary} ${theme.textColor} hover:${theme.hoverBg}`
              }`}
            >
              <Icon size={14} />
              {label}
            </motion.button>
          ))}
          <motion.button
            onClick={loadUsers}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            className={`p-2 rounded-lg ${theme.bgSecondary} ${theme.textColor} hover:${theme.hoverBg} transition-colors disabled:opacity-50`}
            title="Actualiser"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} size={16} />
          </motion.button>
        </div>
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
          <span>{users.length} utilisateurs</span>
          <span>{onlineUsers.length} en ligne</span>
          <span>{recentUsers.length} récents</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <FiRefreshCw className="animate-spin text-blue-500" size={24} />
            <span className="ml-2">Chargement...</span>
          </div>
        )}
        {error && (
          <div className="text-center py-8">
            <p className="text-red-500">Erreur: {error}</p>
          </div>
        )}
        {!loading && !error && (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredUsers.map((u) => (
                <UserRow key={u.id} user={u} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorldUsersPanel;