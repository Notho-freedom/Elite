import { useState, useEffect, useCallback } from 'react';
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

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await userService.getAllUsers(filters);
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
  }, [filters]);

  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
    }
  }, [isAuthenticated, loadUsers]);

  const searchUsers = useCallback(async (searchTerm) => {
    try {
      setLoading(true);
      setError(null);
      const result = await userService.getAllUsers({ ...filters, search: searchTerm });
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
  }, [filters]);

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