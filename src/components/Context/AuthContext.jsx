import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, supabase } from '../../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialiser l'état d'authentification
  useEffect(() => {
    // Récupérer la session actuelle
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Erreur lors de la récupération de la session:', error);
          setError(error.message);
        } else {
          setUser(session?.user || null);
        }
      } catch (err) {
        console.error('Erreur lors de l\'initialisation de l\'auth:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = auth.onAuthStateChange(
      async (event, session) => {
        console.log('Changement d\'état d\'authentification:', event, session?.user?.id);
        setUser(session?.user || null);
        setLoading(false);
        setError(null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Connexion avec email/mot de passe
  const signInWithPassword = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await auth.signInWithPassword(email, password);
      
      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }
      
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors de la connexion';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Inscription avec email/mot de passe
  const signUpWithPassword = async (email, password, userData = {}) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await auth.signUpWithPassword(email, password, userData);
      
      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }
      
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors de l\'inscription';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Connexion avec OAuth
  const signInWithOAuth = async (provider) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await auth.signInWithOAuth(provider);
      
      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }
      
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors de la connexion OAuth';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion
  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await auth.signOut();
      
      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }
      
      setUser(null);
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors de la déconnexion';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour le profil utilisateur
  const updateProfile = async (updates) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      });
      
      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }
      
      setUser(data.user);
      return { success: true, data: data.user };
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors de la mise à jour du profil';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Effacer les erreurs
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    signInWithPassword,
    signUpWithPassword,
    signInWithOAuth,
    signOut,
    updateProfile,
    clearError,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 