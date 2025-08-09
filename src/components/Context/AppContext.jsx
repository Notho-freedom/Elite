import { useState, useEffect, useContext, createContext, useCallback } from 'react';
import useFetchDiscussions from './../hooks/useFetchDiscussions';
import { useTheme } from './ThemeContext';
import { useMediaQuery } from 'react-responsive';
import { useAuth } from './AuthContext';
import { supabase, calls } from '../../lib/supabase';
import { createEliteDemoMessages, enrichMessagesWithEliteFeatures } from '../Enhanced/EliteDataEnricher';
import userService from '../../services/userService';

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

  // Charger toutes les données de l'utilisateur (nouveau schéma)
  const loadUserData = async () => {
    if (!user?.id) return;

    try {
      setLoadingData(true);
      setDataError(null);

      console.log('🔄 Chargement des données pour utilisateur:', user.id);

      // Charger les discussions de l'utilisateur (nouveau schéma avec vue optimisée)
      const discussionsResult = await userService.getUserDiscussions(user.id);
      
      if (!discussionsResult.success) {
        throw new Error(`Erreur discussions: ${discussionsResult.error}`);
      }

      // Charger l'historique des appels depuis la nouvelle table
      const { data: callHistoryData, error: callHistoryError } = await supabase
        .from('calls')
        .select(`
          *,
          initiator:initiator_id(*),
          call_participants(*)
        `)
        .or(`initiator_id.eq.${user.id},call_participants.user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (callHistoryError) {
        console.warn('Avertissement calls:', callHistoryError.message);
        // Les appels ne sont pas critiques, on continue
      }

      // Mettre à jour les états
      setRealDiscussions(discussionsResult.data || []);
      setRealCallHistory(callHistoryData || []);

      // Mettre à jour les notifications (nouveau format)
      updateNotifications(discussionsResult.data || [], callHistoryData || []);

      console.log('✅ Données utilisateur chargées (nouveau schéma):', {
        discussions: discussionsResult.data?.length || 0,
        calls: callHistoryData?.length || 0,
        currentUser: user.id,
        excludedFromDiscussions: true,
        schema: 'updated'
      });

    } catch (error) {
      console.error('❌ Erreur lors du chargement des données:', error);
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

  // Charger les messages d'une discussion (nouveau schéma)
  const loadMessages = async (discussionId) => {
    if (!discussionId) return;

    try {
      setLoadingData(true);
      
      // Utiliser la nouvelle table messages avec tous les champs
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(*),
          reply_to:reply_to_id(*),
          message_reactions(*),
          message_read_status(*)
        `)
        .eq('discussion_id', discussionId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Transformer les données pour le frontend
      const formattedMessages = data?.map(message => ({
        id: message.id,
        discussion_id: message.discussion_id,
        sender_id: message.sender_id,
        content: message.content,
        type: message.message_type || 'text',
        
        // Métadonnées médias
        media_url: message.media_url,
        media_type: message.media_type,
        media_size: message.media_size,
        media_name: message.media_name,
        thumbnail_url: message.thumbnail_url,
        
        // Réponses et mentions
        reply_to_id: message.reply_to_id,
        reply_to: message.reply_to,
        mentions: message.mentions || [],
        
        // Statuts
        status: message.status || 'sent',
        is_edited: message.is_edited || false,
        is_deleted: message.is_deleted || false,
        is_pinned: message.is_pinned || false,
        is_important: message.is_important || false,
        
        // Réactions
        reactions: message.reactions || [],
        message_reactions: message.message_reactions || [],
        
        // Lecture
        message_read_status: message.message_read_status || [],
        
        // Métadonnées et localisation
        metadata: message.metadata || {},
        location: message.location,
        
        // Timestamps
        created_at: message.created_at,
        updated_at: message.updated_at,
        deleted_at: message.deleted_at,
        
        // Compatibilité frontend existant
        time: new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: message.sender?.name || 'Utilisateur',
        avatar: message.sender?.avatar_url,
        isRead: message.message_read_status?.some(rs => rs.user_id === user?.id) || false
      })) || [];
      
      setRealMessages(formattedMessages);
      
      console.log('✅ Messages chargés (nouveau schéma):', formattedMessages.length);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      setDataError(error.message);
    } finally {
      setLoadingData(false);
    }
  };

  // Envoyer un message (nouveau schéma)
  const sendMessage = async (content, messageType = 'text', additionalData = {}) => {
    if (!activeChat) return;

    try {
      if (isAuthenticated && user) {
        // Mode Supabase avec nouveau schéma
        const messageData = {
          discussion_id: activeChat.discussion_id || activeChat.id,
          sender_id: user.id,
          content: content.text || content,
          message_type: messageType,
          status: 'sent',
          
          // Données supplémentaires du nouveau schéma
          media_url: additionalData.media_url || null,
          media_type: additionalData.media_type || null,
          media_size: additionalData.media_size || null,
          media_name: additionalData.media_name || null,
          thumbnail_url: additionalData.thumbnail_url || null,
          reply_to_id: additionalData.reply_to_id || null,
          mentions: additionalData.mentions || [],
          metadata: additionalData.metadata || {},
          location: additionalData.location || null
        };

        const { data, error } = await supabase
          .from('messages')
          .insert(messageData)
          .select(`
            *,
            sender:sender_id(*)
          `)
          .single();
        
        if (error) throw error;
        
        // Recharger les messages pour voir le nouveau message
        await loadMessages(activeChat.discussion_id || activeChat.id);
        
        // Recharger les discussions pour mettre à jour le dernier message
        await loadUserData();

        console.log('✅ Message envoyé (nouveau schéma):', data.id);
        return { success: true, data: [data] };
      } else {
        // Mode démonstration (compatible)
        const newMessage = {
          id: Date.now().toString(),
          text: content.text || content,
          sender: 'me',
          senderId: 'me',
          timestamp: new Date().toISOString(),
          isRead: false,
          type: messageType || 'text',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          status: 'sent',
          ...additionalData
        };

        // Ajouter le message à la liste locale
        setMockMessages(prev => [newMessage, ...prev]);
        
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
      const { data, error } = await supabase.createDiscussion([user.id, ...participantIds], name);
      
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
