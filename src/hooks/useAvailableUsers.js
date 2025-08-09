import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../components/Context/AuthContext';
import userService from '../services/userService';

/**
 * Hook pour récupérer les utilisateurs disponibles (excluant l'utilisateur courant)
 */
const useAvailableUsers = (filters = {}) => {
  const { user, isAuthenticated } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fonction pour charger les utilisateurs
  const loadUsers = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setUsers([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Chargement des utilisateurs disponibles, excluant:', user.id);

      const result = await userService.getUsersExceptCurrent(user.id, filters);

      if (result.success) {
        console.log('✅ Utilisateurs chargés:', result.data?.length || 0);
        setUsers(result.data || []);
      } else {
        console.error('❌ Erreur lors du chargement des utilisateurs:', result.error);
        setError(result.error);
        setUsers([]);
      }
    } catch (err) {
      console.error('❌ Erreur dans useAvailableUsers:', err);
      setError(err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, filters]);

  // Charger au montage et quand les dépendances changent
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Fonction pour rechercher des utilisateurs
  const searchUsers = useCallback(async (searchTerm) => {
    if (!isAuthenticated || !user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const searchFilters = {
        ...filters,
        search: searchTerm
      };

      const result = await userService.getUsersExceptCurrent(user.id, searchFilters);

      if (result.success) {
        setUsers(result.data || []);
      } else {
        setError(result.error);
        setUsers([]);
      }
    } catch (err) {
      setError(err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, filters]);

  // Fonction pour créer une nouvelle conversation
  const createConversationWithUser = useCallback(async (otherUserId) => {
    if (!isAuthenticated || !user?.id) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    try {
      console.log('🔄 Création conversation entre', user.id, 'et', otherUserId);

      const result = await userService.createConversation(user.id, otherUserId);

      if (result.success) {
        console.log('✅ Conversation créée:', result.data);
        return {
          success: true,
          conversation: result.data,
          isNew: result.isNew
        };
      } else {
        console.error('❌ Erreur création conversation:', result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('❌ Erreur dans createConversationWithUser:', err);
      return { success: false, error: err.message };
    }
  }, [isAuthenticated, user?.id]);

  // Filtrer les utilisateurs en ligne
  const onlineUsers = users.filter(u => u.is_online);

  // Filtrer les utilisateurs récemment actifs
  const recentUsers = users.filter(u => {
    if (!u.last_sign_in_at) return false;
    const lastSignIn = new Date(u.last_sign_in_at);
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    return lastSignIn > threeDaysAgo;
  });

  return {
    users,
    onlineUsers,
    recentUsers,
    loading,
    error,
    loadUsers,
    searchUsers,
    createConversationWithUser,
    currentUserId: user?.id
  };
};

export default useAvailableUsers;
