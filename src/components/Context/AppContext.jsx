import { useState, useEffect, useContext, createContext, useCallback } from 'react';
import useFetchDiscussions from './../hooks/useFetchDiscussions';
import { useTheme } from './ThemeContext';
import { useMediaQuery } from 'react-responsive';
import { useAuth } from './AuthContext';
import { db, calls } from '../../lib/supabase';
import { createEliteDemoMessages, enrichMessagesWithEliteFeatures } from '../Enhanced/EliteDataEnricher';

// Enum pour éviter les strings magiques
export const TABS = {
  CHATS: 'chats',
  STATUS: 'status',
  GROUPS: 'groups',
  CALLS: 'calls',
  SETTINGS: 'settings',
  NATIVE: 'native',
};

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { theme, mode, setMode, toggleTheme } = useTheme();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { discussions: mockDiscussions, loading, error, fetchRandomUsers, sortedDiscussions } = useFetchDiscussions();
  const isMobile = useMediaQuery({ maxWidth: 779 });
  
  // États pour les données réelles
  const [realDiscussions, setRealDiscussions] = useState([]);
  const [realMessages, setRealMessages] = useState([]);
  const [realCallHistory, setRealCallHistory] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState(null);
  
  // Messages mockés pour le mode démonstration
  const [mockMessages, setMockMessages] = useState([]);

  const [activeCall, setActiveCall] = useState(null);
  const [activeTab, setActiveTab] = useState(TABS.CHATS);
  const [activeChat, setActiveChat] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  // Notifications dynamiques basées sur les vraies données
  const [notifications, setNotifications] = useState({
    [TABS.CHATS]: 0,
    [TABS.STATUS]: 0,
    [TABS.GROUPS]: 0,
    [TABS.CALLS]: 0,
    [TABS.SETTINGS]: 0,
    [TABS.NATIVE]: 0,
  });

  // Charger les discussions réelles quand l'utilisateur est connecté
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData();
    } else {
      // Reset des données quand l'utilisateur se déconnecte
      setRealDiscussions([]);
      setRealMessages([]);
      setRealCallHistory([]);
      setNotifications({
        [TABS.CHATS]: 0,
        [TABS.STATUS]: 0,
        [TABS.GROUPS]: 0,
        [TABS.CALLS]: 0,
        [TABS.SETTINGS]: 0,
        [TABS.NATIVE]: 0,
      });
    }
  }, [isAuthenticated, user]);

  // Charger les données mockées au démarrage si pas d'utilisateur connecté
  useEffect(() => {
    if (!isAuthenticated && mockDiscussions.length === 0) {
      fetchRandomUsers();
    }
  }, [isAuthenticated, mockDiscussions.length, fetchRandomUsers]);

  // Charger toutes les données de l'utilisateur
  const loadUserData = async () => {
    if (!user) return;

    try {
      setLoadingData(true);
      setDataError(null);

      // Charger les discussions
      const { data: discussionsData, error: discussionsError } = await db.getDiscussions(user.id);
      if (discussionsError) throw discussionsError;
      setRealDiscussions(discussionsData || []);

      // Charger l'historique des appels
      const { data: callHistoryData, error: callHistoryError } = await calls.getCallHistory(user.id);
      if (callHistoryError) throw callHistoryError;
      setRealCallHistory(callHistoryData || []);

      // Mettre à jour les notifications
      updateNotifications(discussionsData || [], callHistoryData || []);

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setDataError(error.message);
    } finally {
      setLoadingData(false);
    }
  };

  // Mettre à jour les notifications basées sur les vraies données
  const updateNotifications = (discussions, callHistory) => {
    const unreadMessages = discussions.filter(d => d.unread_count > 0).length;
    const missedCalls = callHistory.filter(c => c.status === 'missed').length;
    const activeCalls = callHistory.filter(c => c.status === 'active').length;

    setNotifications({
      [TABS.CHATS]: unreadMessages,
      [TABS.STATUS]: 0, // À implémenter selon vos besoins
      [TABS.GROUPS]: discussions.filter(d => d.type === 'group').length,
      [TABS.CALLS]: missedCalls + activeCalls,
      [TABS.SETTINGS]: 0,
      [TABS.NATIVE]: 0,
    });
  };

  // Charger les messages d'une discussion
  const loadMessages = async (discussionId) => {
    if (!discussionId) return;

    try {
      setLoadingData(true);
      const { data, error } = await db.getMessages(discussionId);
      
      if (error) throw error;
      
      setRealMessages(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      setDataError(error.message);
    } finally {
      setLoadingData(false);
    }
  };

  // Envoyer un message
  const sendMessage = async (content, messageType = 'text') => {
    if (!activeChat) return;

    try {
      if (isAuthenticated && user) {
        // Mode Supabase
        const { data, error } = await db.sendMessage(
          activeChat.id,
          user.id,
          content,
          messageType
        );

        if (error) throw error;

        // Ajouter le message à la liste locale
        setRealMessages(prev => [data[0], ...prev]);
        
        // Recharger les discussions pour mettre à jour le dernier message
        await loadUserData();

        return { success: true, data };
      } else {
        // Mode démonstration
        const newMessage = {
          id: Date.now().toString(),
          text: content.text || content,
          sender: 'me',
          senderId: 'me',
          timestamp: new Date().toISOString(),
          isRead: false,
          type: messageType || 'text',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        };

        // Ajouter le message à la liste locale
        setMockMessages(prev => [newMessage, ...prev]);
        
        // Mettre à jour le dernier message dans les discussions mockées
        // Note: Les discussions mockées sont gérées par useFetchDiscussions
        // Cette mise à jour sera visible lors du prochain rechargement

        return { success: true, data: [newMessage] };
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      return { success: false, error: error.message };
    }
  };

  // Créer une nouvelle discussion
  const createDiscussion = async (participantIds, name = null) => {
    if (!user) return;

    try {
      const { data, error } = await db.createDiscussion([user.id, ...participantIds], name);
      
      if (error) throw error;

      // Recharger les discussions
      await loadUserData();

      return { success: true, data };
    } catch (error) {
      console.error('Erreur lors de la création de la discussion:', error);
      return { success: false, error: error.message };
    }
  };

  // Gestion appels
  const callHandlers = {
    toggleMute: () => setActiveCall(prev => prev ? { ...prev, isMuted: !prev.isMuted } : prev),
    toggleVideo: () => setActiveCall(prev => prev ? { ...prev, isVideoOn: !prev.isVideoOn } : prev),
    endCall: async () => {
      if (activeCall) {
        try {
          await calls.updateCallStatus(activeCall.id, 'ended');
        } catch (error) {
          console.error('Erreur lors de la fin d\'appel:', error);
        }
      }
      setActiveCall(null);
    },
    startCall: async (discussionId, callType = 'audio') => {
      if (!user) return;

      try {
        const { data, error } = await calls.createCall(discussionId, user.id, callType);
        
        if (error) throw error;

        setActiveCall(data[0]);
        return { success: true, data: data[0] };
      } catch (error) {
        console.error('Erreur lors du démarrage de l\'appel:', error);
        return { success: false, error: error.message };
      }
    }
  };

  // Hook helper pour changer d'onglet et reset activeChat si besoin
  const switchTab = useCallback((tabId) => {
    setActiveTab(tabId);
    if (tabId !== TABS.CHATS && activeChat) setActiveChat(null);
  }, [activeChat]);

  // Charger les messages quand une discussion est sélectionnée
  useEffect(() => {
    if (activeChat?.id) {
      if (isAuthenticated && user) {
        loadMessages(activeChat.id);
      } else {
        // Générer des messages mockés pour le mode démonstration
        generateMockMessages(activeChat.id);
      }
    } else {
      setRealMessages([]);
      setMockMessages([]);
    }
  }, [activeChat, isAuthenticated, user]);

  // Générer des messages mockés pour une discussion
  const generateMockMessages = (discussionId) => {
    // Utiliser les messages de démonstration Elite
    const eliteMessages = createEliteDemoMessages();
    setMockMessages(eliteMessages);
  };

  const value = {
    // Authentification
    user,
    isAuthenticated,
    authLoading,
    
    // Thème
    theme, 
    toggleTheme,
    mode, 
    setMode,
    
    // Données réelles
    realDiscussions,
    realMessages,
    realCallHistory,
    loadingData,
    dataError,
    
    // Données mockées (pour la transition)
    discussions: mockDiscussions, 
    messages: realMessages.length > 0 ? realMessages : mockMessages,
    fetchRandomUsers, 
    sortedDiscussions,
    
    // UI
    isMobile,
    loading, 
    error,
    activeCall, 
    setActiveCall,
    activeTab, 
    setActiveTab, 
    switchTab,
    activeChat, 
    setActiveChat,
    showProfile, 
    setShowProfile,
    
    // Actions
    callHandlers,
    sendMessage,
    createDiscussion,
    loadUserData,
    
    // Notifications
    notifications, 
    setNotifications,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
