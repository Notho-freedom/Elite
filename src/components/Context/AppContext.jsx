import { useState, useEffect, useContext, createContext, useCallback } from 'react';
import { useTheme } from './ThemeContext';
import { useMediaQuery } from 'react-responsive';
import { 
  useFirebase, 
  useConversations, 
  useMessages, 
  useNotifications,
  authService,
  databaseService,
  storageService,
  messagingService,
  initDemoUsers,
  checkDemoUsers
} from '../../firebase';

// Enum pour éviter les strings magiques
export const TABS = {
  CHATS: 'chats',
  STATUS: 'status',
  GROUPS: 'groups',
  CALLS: 'calls',
  SETTINGS: 'settings',
};

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { theme, mode, setMode, toggleTheme } = useTheme();
  const { user, loading: authLoading } = useFirebase();
  const isMobile = useMediaQuery({ maxWidth: 779 });

  // États de l'application
  const [activeCall, setActiveCall] = useState(null);
  const [activeTab, setActiveTab] = useState(TABS.CHATS);
  const [activeChat, setActiveChat] = useState(null);
  const [isLogin, setIsLogin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // État du profil utilisateur
  const [userProfile, setUserProfile] = useState(null);
  const [userStatus, setUserStatus] = useState('disponible');

  // États Firebase
  const { conversations, loading: conversationsLoading } = useConversations(user?.uid);
  const { messages, loading: messagesLoading } = useMessages(activeChat?.id);
  const { notifications, loading: notificationsLoading } = useNotifications(user?.uid);

  // Notifications dynamiques
  const [notificationCounts, setNotificationCounts] = useState({
    [TABS.CHATS]: 0,
    [TABS.STATUS]: 0,
    [TABS.GROUPS]: 0,
    [TABS.CALLS]: 0,
    [TABS.SETTINGS]: 0,
  });

  // Gestion appels
  const callHandlers = {
    toggleMute: () => setActiveCall(prev => prev ? { ...prev, isMuted: !prev.isMuted } : prev),
    toggleVideo: () => setActiveCall(prev => prev ? { ...prev, isVideoOn: !prev.isVideoOn } : prev),
    endCall: () => setActiveCall(null),
  };

  // Gérer les redirections d'authentification web
  useEffect(() => {
    const handleAuthRedirect = async () => {
      try {
        // Vérifier s'il y a un résultat de redirection Firebase
        const redirectUser = await authService.handleRedirectResult();
        if (redirectUser) {
          console.log('Utilisateur authentifié via redirection:', redirectUser);
        }
      } catch (error) {
        console.error('Erreur lors du traitement de la redirection:', error);
      }
    };

    // Appeler la fonction au chargement de l'app
    handleAuthRedirect();

    // Écouter les événements de redirection personnalisés
    const handleCustomRedirect = (event) => {
      console.log('Événement de redirection personnalisé reçu:', event.detail);
      // Traiter les paramètres d'authentification si nécessaire
    };

    // Écouter les changements d'URL pour détecter les retours d'authentification
    const handleUrlChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const authResult = urlParams.get('authResult');
      const error = urlParams.get('error');
      
      if (authResult || error) {
        console.log('Paramètres d\'authentification détectés dans l\'URL:', { authResult, error });
        
        // Nettoyer l'URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Traiter le résultat d'authentification
        if (authResult) {
          // L'utilisateur s'est authentifié avec succès
          console.log('Authentification réussie via navigateur externe');
          // L'état sera mis à jour automatiquement par Firebase
        } else if (error) {
          console.error('Erreur d\'authentification:', error);
        }
      }
    };

    // Vérifier l'URL au chargement
    handleUrlChange();

    // Écouter les changements d'URL
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('firebaseAuthRedirect', handleCustomRedirect);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('firebaseAuthRedirect', handleCustomRedirect);
    };
  }, []);

  // Synchroniser les informations utilisateur
  useEffect(() => {
    const syncUserInfo = async () => {
      if (user) {
        try {
          // Récupérer le profil utilisateur depuis Firestore
          const profile = await databaseService.getUserProfile(user.uid);
          if (profile) {
            setUserProfile(profile);
            setUserStatus(profile.status || 'disponible');
          } else {
            // Créer un profil par défaut si il n'existe pas
            const defaultProfile = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || user.email?.split('@')[0] || 'Utilisateur',
              photoURL: user.photoURL || null,
              status: 'disponible',
              bio: '',
              isOnline: true,
              lastSeen: new Date().toISOString(),
              settings: {
                notifications: true,
                soundEnabled: true,
                theme: 'dark',
                language: 'fr'
              }
            };
            setUserProfile(defaultProfile);
            setUserStatus('disponible');
          }
        } catch (error) {
          console.error('Erreur synchronisation profil:', error);
        }
      } else {
        setUserProfile(null);
        setUserStatus('disponible');
      }
    };

    syncUserInfo();
  }, [user]);

  // Initialiser les utilisateurs de démonstration si nécessaire
  useEffect(() => {
    const initializeDemoUsers = async () => {
      if (user) {
        try {
          const hasUsers = await checkDemoUsers();
          if (!hasUsers) {
            console.log('Initialisation des utilisateurs de démonstration...');
            await initDemoUsers();
          }
        } catch (error) {
          console.error('Erreur initialisation utilisateurs de démonstration:', error);
        }
      }
    };

    initializeDemoUsers();
  }, [user]);

  // Mettre à jour l'état de connexion
  useEffect(() => {
    setIsLogin(!!user);
    setLoading(authLoading);
  }, [user, authLoading]);

  // Mettre à jour les compteurs de notifications
  useEffect(() => {
    if (conversations) {
      const unreadCount = conversations.reduce((total, conv) => {
        return total + (conv.unreadCount?.[user?.uid] || 0);
      }, 0);
      
      setNotificationCounts(prev => ({
        ...prev,
        [TABS.CHATS]: unreadCount
      }));
    }
  }, [conversations, user?.uid]);

  // Mettre à jour le statut en ligne
  useEffect(() => {
    if (user) {
      // Mettre en ligne quand l'utilisateur se connecte
      databaseService.updateOnlineStatus(user.uid, true);

      // Mettre hors ligne quand l'utilisateur se déconnecte
      const handleBeforeUnload = () => {
        databaseService.updateOnlineStatus(user.uid, false);
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        databaseService.updateOnlineStatus(user.uid, false);
      };
    }
  }, [user]);

  // Configurer les notifications
  useEffect(() => {
    if (user && messagingService.isSupported()) {
      messagingService.setupNotificationHandlers();
      messagingService.ensurePermission();
    }
  }, [user]);

  // Hook helper pour changer d'onglet et reset activeChat si besoin
  const switchTab = useCallback((tabId) => {
    setActiveTab(tabId);
    if (tabId !== TABS.CHATS && activeChat) setActiveChat(null);
  }, [activeChat]);

  // Fonctions d'authentification
  const signInWithProvider = useCallback(async (providerName) => {
    try {
      await authService.signInWithProvider(providerName);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authService.signOut();
      setUserProfile(null);
      setUserStatus('disponible');
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      throw error;
    }
  }, []);

  // Fonction de débogage pour vérifier les utilisateurs
  const debugUsers = useCallback(async () => {
    try {
      const users = await databaseService.getAllUsers();
      console.log('Utilisateurs dans Firestore:', users);
      return users;
    } catch (error) {
      console.error('Erreur récupération utilisateurs:', error);
      return [];
    }
  }, []);

  // Fonctions de gestion du profil utilisateur
  const updateUserProfile = useCallback(async (updates) => {
    try {
      if (!user) throw new Error('Utilisateur non connecté');
      
      // Mettre à jour le profil dans Firestore
      await databaseService.updateUserProfile(user.uid, updates);
      
      // Mettre à jour l'état local
      setUserProfile(prev => ({
        ...prev,
        ...updates
      }));
      
      // Si le statut a changé, mettre à jour l'état local
      if (updates.status) {
        setUserStatus(updates.status);
      }
      
      return true;
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      throw error;
    }
  }, [user]);

  const updateUserStatus = useCallback(async (status) => {
    try {
      await updateUserProfile({ status });
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      throw error;
    }
  }, [updateUserProfile]);

  const updateUserAvatar = useCallback(async (file) => {
    try {
      if (!user) throw new Error('Utilisateur non connecté');
      
      // Upload de l'avatar
      const uploadResult = await storageService.uploadUserAvatar(file, user.uid);
      
      // Mettre à jour le profil avec la nouvelle URL
      await updateUserProfile({ photoURL: uploadResult.url });
      
      return uploadResult.url;
    } catch (error) {
      console.error('Erreur mise à jour avatar:', error);
      throw error;
    }
  }, [user, updateUserProfile]);

  // Fonctions de conversation
  const createConversation = useCallback(async (participants, type = 'direct') => {
    try {
      return await databaseService.createConversation(participants, type);
    } catch (error) {
      console.error('Erreur création conversation:', error);
      throw error;
    }
  }, []);

  const sendMessage = useCallback(async (conversationId, messageData) => {
    try {
      return await databaseService.sendMessage(conversationId, {
        ...messageData,
        senderId: user.uid
      });
    } catch (error) {
      console.error('Erreur envoi message:', error);
      throw error;
    }
  }, [user?.uid]);

  const markMessagesAsRead = useCallback(async (conversationId) => {
    try {
      await databaseService.markMessagesAsRead(conversationId, user.uid);
    } catch (error) {
      console.error('Erreur marquage messages:', error);
      throw error;
    }
  }, [user?.uid]);

  // Fonctions de stockage
  const uploadMedia = useCallback(async (file, conversationId, type = 'image') => {
    try {
      switch (type) {
        case 'image':
          return await storageService.uploadChatImage(file, conversationId, user.uid);
        case 'video':
          return await storageService.uploadChatVideo(file, conversationId, user.uid);
        case 'audio':
          return await storageService.uploadChatAudio(file, conversationId, user.uid);
        case 'document':
          return await storageService.uploadChatDocument(file, conversationId, user.uid);
        default:
          throw new Error('Type de média non supporté');
      }
    } catch (error) {
      console.error('Erreur upload média:', error);
      throw error;
    }
  }, [user?.uid]);

  const value = {
    // Thème
    theme, toggleTheme, mode, setMode,
    
    // Authentification
    user, loading, isLogin, signInWithProvider, signOut,
    
    // Profil utilisateur
    userProfile, userStatus, updateUserProfile, updateUserStatus, updateUserAvatar, debugUsers,
    
    // Conversations et messages
    conversations, conversationsLoading,
    messages, messagesLoading,
    createConversation, sendMessage, markMessagesAsRead,
    
    // Notifications
    notifications, notificationsLoading, notificationCounts,
    
    // Interface
    isMobile, activeCall, setActiveCall, callHandlers,
    activeTab, setActiveTab, switchTab,
    activeChat, setActiveChat,
    showProfile, setShowProfile,
    
    // Stockage
    uploadMedia,
    
    // Services Firebase
    authService, databaseService, storageService, messagingService
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
