import { useState, useEffect, useCallback, useRef } from 'react';
import userService from '../services/userService';
import { useAuth } from '../components/Context/AuthContext';

/**
 * Hook pour récupérer la liste intégrale des utilisateurs (incluant l'utilisateur courant)
 */
const useAllUsers = (filters = {}) => {
  const { isAuthenticated } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const filtersRef = useRef(filters);

  // Mettre à jour la ref des filtres
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const loadUsers = useCallback(async () => {
    try {
      console.log('🔄 useAllUsers: Chargement des utilisateurs...');
      setLoading(true);
      setError(null);
      const result = await userService.getAllUsers(filtersRef.current);
      console.log('📊 useAllUsers: Résultat:', result);
      if (result.success) {
        setUsers(result.data || []);
        console.log('✅ useAllUsers: Utilisateurs chargés:', result.data?.length || 0);
      } else {
        setUsers([]);
        setError(result.error);
        console.log('❌ useAllUsers: Erreur:', result.error);
      }
    } catch (err) {
      console.log('💥 useAllUsers: Exception:', err);
      setUsers([]);
      setError(err.message);
    } finally {
      setLoading(false);
      console.log('🏁 useAllUsers: Chargement terminé');
    }
  }, []); // Pas de dépendances pour éviter la boucle infinie

  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
    }
  }, [isAuthenticated, loadUsers]);

  const searchUsers = useCallback(async (searchTerm) => {
    try {
      setLoading(true);
      setError(null);
      const result = await userService.getAllUsers({ ...filtersRef.current, search: searchTerm });
      if (result.success) {
        setUsers(result.data || []);
      } else {
        setUsers([]);
        setError(result.error);
      }
    } catch (err) {
      setUsers([]);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []); // Pas de dépendances pour éviter la boucle infinie

  const onlineUsers = users.filter(u => u.is_online);

  const recentUsers = users.filter(u => {
    if (!u.last_seen) return false;
    const lastSeen = new Date(u.last_seen);
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    return lastSeen > threeDaysAgo;
  });

  return { users, onlineUsers, recentUsers, loading, error, loadUsers, searchUsers };
};

export default useAllUsers;