import React, { useState, useEffect } from 'react';
import { useApp } from '../Context/AppContext';
import userService from '../../services/userService';

const WorldUsersPanel = () => {
  const { theme } = useApp();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les utilisateurs au montage du composant
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Chargement des utilisateurs...');
      
      const result = await userService.getAllUsers();
      console.log('📊 Résultat:', result);
      
      if (result.success) {
        setUsers(result.data || []);
        console.log('✅ Utilisateurs chargés:', result.data?.length || 0);
      } else {
        setError(result.error);
        console.log('❌ Erreur:', result.error);
      }
    } catch (err) {
      console.log('💥 Exception:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      console.log('🏁 Chargement terminé');
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full ${theme.bgColor}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p>Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-full ${theme.bgColor}`}>
        <div className="text-center text-red-500">
          <p>Erreur: {error}</p>
          <button 
            onClick={loadUsers}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${theme.bgColor}`}>
      {/* En-tête simple */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-2">🌍 Monde - Tous les utilisateurs</h2>
        <p className="text-sm text-gray-500">{users.length} utilisateurs trouvés</p>
        <button 
          onClick={loadUsers}
          className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          Actualiser
        </button>
      </div>

      {/* Liste simple des utilisateurs */}
      <div className="flex-1 overflow-y-auto p-4">
        {users.length === 0 ? (
          <p className="text-center text-gray-500">Aucun utilisateur trouvé</p>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div 
                key={user.id}
                className={`p-3 rounded-lg border ${theme.borderColor} ${theme.bgSecondary} hover:bg-gray-50 dark:hover:bg-gray-700`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    <img
                      src={user.avatar_url || 'https://via.placeholder.com/40'}
                      alt={user.name || 'Utilisateur'}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {user.is_online && (
                      <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                    )}
                  </div>
                  
                  {/* Informations utilisateur */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">
                        {user.name || user.username || user.email || 'Utilisateur sans nom'}
                      </span>
                      {user.is_online && (
                        <span className="text-xs text-green-500 bg-green-100 dark:bg-green-900 px-2 py-1 rounded">
                          En ligne
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      @{user.username || user.email?.split('@')[0] || 'utilisateur'}
                    </div>
                    {user.location && (
                      <div className="text-xs text-gray-400 mt-1">
                        📍 {user.location}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorldUsersPanel;