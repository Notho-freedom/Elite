import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiUsers, FiMessageSquare, FiPhone, FiVideo,
  FiUserPlus, FiRefreshCw, FiFilter, FiCheck, FiClock
} from 'react-icons/fi';
import { useApp } from '../Context/AppContext';
import useAvailableUsers from '../../hooks/useAvailableUsers';

const AvailableUsersList = ({ onUserSelect, onCreateConversation }) => {
  const { theme } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, online, recent
  
  const filters = {
    isOnline: filterType === 'online',
    isActive: true
  };

  const {
    users,
    onlineUsers,
    recentUsers,
    loading,
    error,
    loadUsers,
    searchUsers,
    createConversationWithUser,
    currentUserId
  } = useAvailableUsers(filters);

  // Gérer la recherche
  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.trim()) {
      await searchUsers(term.trim());
    } else {
      await loadUsers();
    }
  };

  // Filtrer les utilisateurs selon le type
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

  // Gérer la création de conversation
  const handleCreateConversation = async (otherUser) => {
    try {
      const result = await createConversationWithUser(otherUser.id);
      
      if (result.success) {
        // Transformer les données pour correspondre au format attendu
        const discussionData = {
          id: result.conversation.id,
          name: otherUser.full_name || otherUser.username || 'Utilisateur',
          avatar: otherUser.avatar_url || 'https://via.placeholder.com/150',
          lastMessage: result.isNew ? 'Nouvelle conversation' : 'Conversation existante',
          time: new Date().toISOString(),
          unread: false,
          unread_count: 0,
          isOnline: otherUser.is_online || false,
          typing: false,
          user_id: otherUser.id,
          conversation_id: result.conversation.id,
          type: 'private'
        };

        if (onCreateConversation) {
          onCreateConversation(discussionData);
        }
      } else {
        console.error('Erreur lors de la création:', result.error);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const UserCard = ({ user }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      className={`p-4 rounded-lg border ${theme.borderColor} ${theme.bgSecondary} hover:${theme.hoverBg} transition-all duration-200 cursor-pointer`}
      onClick={() => onUserSelect?.(user)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar avec statut en ligne */}
          <div className="relative">
            <img
              src={user.avatar_url || 'https://via.placeholder.com/40'}
              alt={user.full_name || user.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            {user.is_online && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
            )}
          </div>

          {/* Informations utilisateur */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate">
                {user.full_name || user.username || 'Utilisateur'}
              </h3>
              {user.is_online && (
                <span className="text-xs text-green-500 font-medium">En ligne</span>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>@{user.username || user.email?.split('@')[0]}</span>
              {user.last_sign_in_at && (
                <span className="flex items-center gap-1">
                  <FiClock size={12} />
                  {new Date(user.last_sign_in_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              handleCreateConversation(user);
            }}
            className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            title="Démarrer une conversation"
          >
            <FiMessageSquare size={16} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              // Fonctionnalité d'appel à implémenter
            }}
            className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
            title="Appeler"
          >
            <FiPhone size={16} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className={`flex flex-col h-full ${theme.bgColor}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FiUsers className="text-blue-500" />
          Utilisateurs disponibles
        </h2>

        {/* Barre de recherche */}
        <div className="relative mb-4">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${theme.borderColor} ${theme.bgSecondary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>

        {/* Filtres */}
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'Tous', icon: FiUsers },
            { id: 'online', label: 'En ligne', icon: FiCheck },
            { id: 'recent', label: 'Récents', icon: FiClock }
          ].map((filter) => {
            const Icon = filter.icon;
            const isActive = filterType === filter.id;
            
            return (
              <motion.button
                key={filter.id}
                onClick={() => setFilterType(filter.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-500 text-white'
                    : `${theme.bgSecondary} ${theme.textColor} hover:${theme.hoverBg}`
                }`}
              >
                <Icon size={14} />
                {filter.label}
              </motion.button>
            );
          })}
          
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

        {/* Stats */}
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
          <span>{users.length} utilisateurs</span>
          <span>{onlineUsers.length} en ligne</span>
          <span>{recentUsers.length} récents</span>
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <FiRefreshCw className="animate-spin text-blue-500" size={24} />
            <span className="ml-2">Chargement...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">Erreur: {error}</p>
            <motion.button
              onClick={loadUsers}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Réessayer
            </motion.button>
          </div>
        )}

        {!loading && !error && filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <FiUsers className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
              Aucun utilisateur trouvé
            </h3>
            <p className="text-gray-500">
              {searchTerm 
                ? 'Essayez une autre recherche'
                : 'Aucun utilisateur disponible pour le moment'
              }
            </p>
          </div>
        )}

        {!loading && !error && filteredUsers.length > 0 && (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredUsers.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer avec informations */}
      {currentUserId && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            Votre ID: {currentUserId} • Vous êtes exclu(e) de cette liste
          </p>
        </div>
      )}
    </div>
  );
};

export default AvailableUsersList;
