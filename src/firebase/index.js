// Configuration Firebase
export { default as app } from './config';
export { auth, db, rtdb, storage, messaging, analytics } from './config';

// Services Firebase
export { authService } from './auth';
export { databaseService } from './database';
export { storageService } from './storage';
export { messagingService } from './messaging';

// Utilitaires
export { initDemoUsers, checkDemoUsers } from './initDemoUsers';

// Hook personnalisé pour Firebase
import { useState, useEffect } from 'react';
import { authService } from './auth';
import { databaseService } from './database';

export const useFirebase = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
};

// Hook pour les conversations
export const useConversations = (userId) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const unsubscribe = databaseService.getConversations(userId, (conversations) => {
      setConversations(conversations);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  return { conversations, loading };
};

// Hook pour les messages
export const useMessages = (conversationId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const unsubscribe = databaseService.getMessages(conversationId, (messages) => {
      setMessages(messages);
      setLoading(false);
    });

    return unsubscribe;
  }, [conversationId]);

  return { messages, loading };
};

// Hook pour les notifications
export const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const unsubscribe = databaseService.getNotifications(userId, (notifications) => {
      setNotifications(notifications);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  return { notifications, loading };
};

// Hook pour récupérer les profils des utilisateurs
export const useUserProfiles = (userIds) => {
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userIds || userIds.length === 0) {
      setProfiles({});
      setLoading(false);
      return;
    }

    const fetchProfiles = async () => {
      try {
        setLoading(true);
        const profilesData = {};
        
        // Récupérer les profils en parallèle
        const profilePromises = userIds.map(async (userId) => {
          try {
            const profile = await databaseService.getUserProfile(userId);
            return { userId, profile };
          } catch (error) {
            console.error(`Erreur récupération profil ${userId}:`, error);
            return { userId, profile: null };
          }
        });

        const results = await Promise.all(profilePromises);
        
        results.forEach(({ userId, profile }) => {
          if (profile) {
            profilesData[userId] = profile;
          }
        });

        setProfiles(profilesData);
      } catch (error) {
        console.error('Erreur récupération profils:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [userIds]);

  return { profiles, loading };
};

// Hook pour écouter la présence des utilisateurs
export const useUserPresence = (userIds) => {
  const [presence, setPresence] = useState({});

  useEffect(() => {
    if (!userIds || userIds.length === 0) {
      setPresence({});
      return;
    }

    const unsubscribe = databaseService.listenToPresence(userIds, (userId, presenceData) => {
      setPresence(prev => ({
        ...prev,
        [userId]: presenceData
      }));
    });

    return unsubscribe;
  }, [userIds]);

  return { presence };
};
