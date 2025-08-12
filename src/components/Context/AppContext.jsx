import { useState, useEffect, useContext, createContext, useCallback } from 'react';
import useFetchDiscussions from './../hooks/useFetchDiscussions';
import { useTheme } from './ThemeContext';
import { useMediaQuery } from 'react-responsive';
import { useAuth } from './AuthContext';
import { db, calls } from '../../lib/supabase';
import { createEliteDemoMessages, enrichMessagesWithEliteFeatures } from '../Enhanced/EliteDataEnricher';
import { SimpleMediaService } from '../../services/simpleMediaService.js';

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
    if (!user?.id) {
      console.log('❌ Aucun utilisateur connecté pour charger les données');
      return;
    }

    try {
      console.log('🔄 Chargement des données utilisateur pour:', user.id);
      setLoadingData(true);
      setDataError(null);

      // Charger les discussions
      console.log('📨 Chargement des discussions...');
      const { data: discussionsData, error: discussionsError, warning } = await db.getDiscussions(user.id);
      
      if (discussionsError && !warning) {
        console.error('❌ Erreur discussions:', discussionsError);
        throw discussionsError;
      }
      
      if (warning) {
        console.warn('⚠️ Avertissement discussions:', warning);
      }
      
      console.log('✅ Discussions chargées:', discussionsData?.length || 0, 'discussions');
      setRealDiscussions(discussionsData || []);

      // Charger l'historique des appels
      console.log('📞 Chargement de l\'historique des appels...');
      const { data: callHistoryData, error: callHistoryError } = await calls.getCallHistory(user.id);
      if (callHistoryError) {
        console.error('❌ Erreur appels:', callHistoryError);
        throw callHistoryError;
      }
      console.log('✅ Historique appels chargé:', callHistoryData?.length || 0, 'appels');
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

  // Envoyer un message (adapté à la nouvelle structure)
  const sendMessage = async (messageContent, messageType = 'text') => {
    if (!activeChat || !user) {
      console.warn('Pas de chat actif ou d\'utilisateur connecté');
      return { success: false, error: 'Pas de chat actif' };
    }

    try {
      console.log('📤 AppContext.sendMessage - Données reçues:', { messageContent, messageType, activeChat: activeChat.id });
      
      if (isAuthenticated) {
        // Mode Supabase - envoyer selon la nouvelle structure
        let messageData;
        
        if (typeof messageContent === 'string') {
          // Message texte simple
          messageData = {
            content: messageContent.trim(),
            message: messageContent.trim(),
            text: messageContent.trim()
          };
        } else if (messageContent && typeof messageContent === 'object') {
          // Message complexe avec texte et/ou médias
          
          // 🚀 Upload des médias vers Supabase Storage
          let uploadedMedia = [];
          if (messageContent.media && messageContent.media.length > 0) {
            console.log('🎬 DÉBUT UPLOAD MÉDIAS - AppContext');
            console.log('📤 Nombre de médias à uploader:', messageContent.media.length);
            console.log('📋 Détail des médias:', messageContent.media);
            
            try {
              for (const [index, mediaItem] of messageContent.media.entries()) {
                console.log(`🔄 Traitement média ${index + 1}/${messageContent.media.length}:`, mediaItem);
                
                if (mediaItem.file) {
                  console.log(`📤 Upload du fichier ${index + 1}:`, mediaItem.file.name);
                  
                  // Upload avec service simple et compression locale
                  const uploadResult = await SimpleMediaService.uploadFile(
                    mediaItem.file,
                    user.id,
                    { compress: true, quality: 0.8 }
                  );
                  
                  console.log(`✅ Média ${index + 1} uploadé:`, uploadResult);
                  uploadedMedia.push(uploadResult);
                  
                  // Nettoyer l'URL blob temporaire
                  if (mediaItem.url && mediaItem.url.startsWith('blob:')) {
                    URL.revokeObjectURL(mediaItem.url);
                  }
                } else if (mediaItem.url && !mediaItem.url.startsWith('blob:')) {
                  // Média déjà uploadé (édition par exemple)
                  uploadedMedia.push(mediaItem);
                }
              }
              
              console.log('✅ Médias uploadés:', uploadedMedia);
                          } catch (uploadError) {
                console.error('❌ Erreur upload simple:', uploadError);
                return { success: false, error: `Erreur upload: ${uploadError.message}` };
              }
          }
          
          messageData = {
            content: messageContent.text || messageContent.message || messageContent.content || '',
            message: messageContent.text || messageContent.message || messageContent.content || '',
            text: messageContent.text || messageContent.message || messageContent.content || '',
            media: uploadedMedia,
            reply_to_id: messageContent.replyTo || null
          };
        } else {
          messageData = {
            content: '',
            message: '',
            text: '',
            reply_to_id: messageContent.replyTo || null
          };
        }
        
        console.log('🔄 Données normalisées pour envoi:', messageData);
        console.log('📨 ReplyTo ID transmis:', messageData.reply_to_id);

        const { data, error } = await db.sendMessage(
          activeChat.id,
          user.id,
          messageData
        );

        if (error) throw error;

        console.log('✅ Message envoyé avec succès:', data);

        // Ajouter les nouveaux messages à la liste locale
        if (data && Array.isArray(data)) {
          setRealMessages(prev => [...prev, ...data]);
        }
        
        // Recharger les discussions pour mettre à jour la liste
        await loadUserData();

        return { success: true, data };
      } else {
        // Mode démonstration
        let demoMessage;
        
        if (typeof messageContent === 'string') {
          demoMessage = {
            id: Date.now().toString(),
            text: messageContent,
            sender: 'me',
            senderId: 'demo-user',
            timestamp: new Date().toISOString(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'text',
            isRead: false,
            reactions: [],
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
          };
        } else if (messageContent && messageContent.media?.length > 0) {
          // Messages avec médias - créer un message par média
          const mediaMessages = [];
          
          // Message texte d'abord s'il y en a un
          if (messageContent.text || messageContent.message) {
            mediaMessages.push({
              id: `${Date.now()}-text`,
              text: messageContent.text || messageContent.message,
              sender: 'me',
              senderId: 'demo-user',
              timestamp: new Date().toISOString(),
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: 'text',
              isRead: false,
              reactions: [],
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
            });
          }
          
          // Puis un message par média
          messageContent.media.forEach((media, index) => {
            mediaMessages.push({
              id: `${Date.now()}-media-${index}`,
              text: '',
              sender: 'me',
              senderId: 'demo-user',
              timestamp: new Date().toISOString(),
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: media.type || 'file',
              isRead: false,
              reactions: [],
              media: [media],
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
            });
          });
          
          setMockMessages(prev => [...prev, ...mediaMessages]);
          return { success: true, data: mediaMessages };
        }

        setMockMessages(prev => [...prev, demoMessage]);
        return { success: true, data: [demoMessage] };
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

  // Fonction helper pour mettre à jour les messages (pour les actions comme édition, suppression)
  const setMessages = useCallback((updater) => {
    if (isAuthenticated) {
      setRealMessages(updater);
    } else {
      setMockMessages(updater);
    }
  }, [isAuthenticated]);

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
    discussions: isAuthenticated ? realDiscussions : mockDiscussions, 
    messages: isAuthenticated ? realMessages : mockMessages,
    setMessages, // Nouvelle fonction helper
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
