// Version simplifiée du Elite Store sans Zustand
// Utilise localStorage directement

const STORAGE_KEY = 'elite-store';

// Obtenir l'état initial
const getInitialState = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Erreur lecture localStorage:', error);
  }
  
  return {
    discussionStates: {
      pinned: [],
      archived: [],
      favorites: [],
      locked: [],
      muted: [],
      blocked: [],
      hidden: [],
    },
    messageStates: {
      pinned: [],
      favorites: [],
      locked: [],
      hidden: [],
    },
    lastUpdated: Date.now(),
  };
};

// Sauvegarder l'état
const saveState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...state,
      lastUpdated: Date.now()
    }));
  } catch (error) {
    console.error('Erreur sauvegarde localStorage:', error);
  }
};

// État global
let globalState = getInitialState();
let listeners = [];

// Notifier les listeners
const notifyListeners = () => {
  listeners.forEach(listener => listener(globalState));
};

// Actions pour les discussions
export const discussionActions = {
  togglePin: (discussionId) => {
    const pinned = [...globalState.discussionStates.pinned];
    const index = pinned.indexOf(discussionId);
    
    if (index > -1) {
      pinned.splice(index, 1);
    } else {
      pinned.push(discussionId);
    }
    
    globalState.discussionStates.pinned = pinned;
    saveState(globalState);
    notifyListeners();
  },
  
  toggleArchive: (discussionId) => {
    const archived = [...globalState.discussionStates.archived];
    const index = archived.indexOf(discussionId);
    
    if (index > -1) {
      archived.splice(index, 1);
    } else {
      archived.push(discussionId);
      // Désépingler si archivé
      globalState.discussionStates.pinned = globalState.discussionStates.pinned.filter(id => id !== discussionId);
    }
    
    globalState.discussionStates.archived = archived;
    saveState(globalState);
    notifyListeners();
  },
  
  toggleFavorite: (discussionId) => {
    const favorites = [...globalState.discussionStates.favorites];
    const index = favorites.indexOf(discussionId);
    
    if (index > -1) {
      favorites.splice(index, 1);
    } else {
      favorites.push(discussionId);
    }
    
    globalState.discussionStates.favorites = favorites;
    saveState(globalState);
    notifyListeners();
  },
  
  toggleLock: (discussionId) => {
    const locked = [...globalState.discussionStates.locked];
    const index = locked.indexOf(discussionId);
    
    if (index > -1) {
      locked.splice(index, 1);
    } else {
      locked.push(discussionId);
    }
    
    globalState.discussionStates.locked = locked;
    saveState(globalState);
    notifyListeners();
  },
  
  toggleMute: (discussionId) => {
    const muted = [...globalState.discussionStates.muted];
    const index = muted.indexOf(discussionId);
    
    if (index > -1) {
      muted.splice(index, 1);
    } else {
      muted.push(discussionId);
    }
    
    globalState.discussionStates.muted = muted;
    saveState(globalState);
    notifyListeners();
  },
  
  blockUser: (discussionId) => {
    const blocked = [...globalState.discussionStates.blocked];
    if (!blocked.includes(discussionId)) {
      blocked.push(discussionId);
    }
    
    globalState.discussionStates.blocked = blocked;
    saveState(globalState);
    notifyListeners();
  },
  
  unblockUser: (discussionId) => {
    globalState.discussionStates.blocked = globalState.discussionStates.blocked.filter(id => id !== discussionId);
    saveState(globalState);
    notifyListeners();
  },
  
  markAsRead: (discussionId) => {
    console.log('Marquer comme lu:', discussionId);
    // Cette action sera intégrée avec le système de messages
  },
  
  deleteDiscussion: (discussionId) => {
    // Supprimer de tous les états
    Object.keys(globalState.discussionStates).forEach(key => {
      globalState.discussionStates[key] = globalState.discussionStates[key].filter(id => id !== discussionId);
    });
    
    saveState(globalState);
    notifyListeners();
  },
  
  // Getters
  isPinned: (discussionId) => globalState.discussionStates.pinned.includes(discussionId),
  isArchived: (discussionId) => globalState.discussionStates.archived.includes(discussionId),
  isFavorite: (discussionId) => globalState.discussionStates.favorites.includes(discussionId),
  isLocked: (discussionId) => globalState.discussionStates.locked.includes(discussionId),
  isMuted: (discussionId) => globalState.discussionStates.muted.includes(discussionId),
  isBlocked: (discussionId) => globalState.discussionStates.blocked.includes(discussionId),
};

// Actions pour les messages
export const messageActions = {
  togglePin: (messageId) => {
    const pinned = [...globalState.messageStates.pinned];
    const index = pinned.indexOf(messageId);
    
    if (index > -1) {
      pinned.splice(index, 1);
    } else {
      pinned.push(messageId);
    }
    
    globalState.messageStates.pinned = pinned;
    saveState(globalState);
    notifyListeners();
  },
  
  toggleFavorite: (messageId) => {
    const favorites = [...globalState.messageStates.favorites];
    const index = favorites.indexOf(messageId);
    
    if (index > -1) {
      favorites.splice(index, 1);
    } else {
      favorites.push(messageId);
    }
    
    globalState.messageStates.favorites = favorites;
    saveState(globalState);
    notifyListeners();
  },
  
  // Getters
  isPinned: (messageId) => globalState.messageStates.pinned.includes(messageId),
  isFavorite: (messageId) => globalState.messageStates.favorites.includes(messageId),
};

// Hook React pour s'abonner aux changements (version simple)
export const useEliteStore = () => {
  // Pour l'instant, retourner l'état global directement
  // Dans une vraie application, on utiliserait un système de state management
  return globalState;
};

// Hook personnalisé pour les actions de discussion
export const useDiscussionActions = () => {
  useEliteStore(); // S'abonner aux changements
  
  return {
    // Actions
    togglePin: discussionActions.togglePin,
    toggleArchive: discussionActions.toggleArchive,
    toggleFavorite: discussionActions.toggleFavorite,
    toggleLock: discussionActions.toggleLock,
    toggleMute: discussionActions.toggleMute,
    blockUser: discussionActions.blockUser,
    unblockUser: discussionActions.unblockUser,
    markAsRead: discussionActions.markAsRead,
    deleteDiscussion: discussionActions.deleteDiscussion,
    
    // Getters
    isPinned: discussionActions.isPinned,
    isArchived: discussionActions.isArchived,
    isFavorite: discussionActions.isFavorite,
    isLocked: discussionActions.isLocked,
    isMuted: discussionActions.isMuted,
    isBlocked: discussionActions.isBlocked,
  };
};

// Hook personnalisé pour les actions de message
export const useMessageActions = () => {
  useEliteStore(); // S'abonner aux changements
  
  return {
    // Actions
    togglePin: messageActions.togglePin,
    toggleFavorite: messageActions.toggleFavorite,
    
    // Getters
    isPinned: messageActions.isPinned,
    isFavorite: messageActions.isFavorite,
  };
};

// Statistiques
export const getStats = () => {
  return {
    discussions: {
      pinned: globalState.discussionStates.pinned.length,
      archived: globalState.discussionStates.archived.length,
      favorites: globalState.discussionStates.favorites.length,
      locked: globalState.discussionStates.locked.length,
      muted: globalState.discussionStates.muted.length,
      blocked: globalState.discussionStates.blocked.length,
    },
    messages: {
      pinned: globalState.messageStates.pinned.length,
      favorites: globalState.messageStates.favorites.length,
      locked: globalState.messageStates.locked.length,
    }
  };
};

export default globalState;
