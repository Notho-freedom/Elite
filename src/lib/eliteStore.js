// Elite Store - Gestion centralisée des états des discussions et messages
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Store principal pour les états Elite
export const useEliteStore = create(
  persist(
    (set, get) => ({
      // États des discussions
      discussionStates: {
        pinned: [], // IDs des discussions épinglées
        archived: [], // IDs des discussions archivées
        favorites: [], // IDs des discussions favorites
        locked: [], // IDs des discussions verrouillées
        muted: [], // IDs des discussions en sourdine
        blocked: [], // IDs des utilisateurs bloqués
        hidden: [], // IDs des discussions masquées
      },
      
      // États des messages
      messageStates: {
        pinned: [], // IDs des messages épinglés
        favorites: [], // IDs des messages favoris
        locked: [], // IDs des messages verrouillés
        hidden: [], // IDs des messages masqués
      },
      
      // Métadonnées
      lastUpdated: Date.now(),
      
      // Actions pour les discussions
      toggleDiscussionPin: (discussionId) => {
        set((state) => {
          const pinned = [...state.discussionStates.pinned];
          const index = pinned.indexOf(discussionId);
          
          if (index > -1) {
            pinned.splice(index, 1);
          } else {
            pinned.push(discussionId);
          }
          
          return {
            discussionStates: {
              ...state.discussionStates,
              pinned
            },
            lastUpdated: Date.now()
          };
        });
      },
      
      toggleDiscussionArchive: (discussionId) => {
        set((state) => {
          const archived = [...state.discussionStates.archived];
          const index = archived.indexOf(discussionId);
          
          if (index > -1) {
            archived.splice(index, 1);
          } else {
            archived.push(discussionId);
            // Désépingler si archivé
            const pinned = state.discussionStates.pinned.filter(id => id !== discussionId);
            return {
              discussionStates: {
                ...state.discussionStates,
                archived,
                pinned
              },
              lastUpdated: Date.now()
            };
          }
          
          return {
            discussionStates: {
              ...state.discussionStates,
              archived
            },
            lastUpdated: Date.now()
          };
        });
      },
      
      toggleDiscussionFavorite: (discussionId) => {
        set((state) => {
          const favorites = [...state.discussionStates.favorites];
          const index = favorites.indexOf(discussionId);
          
          if (index > -1) {
            favorites.splice(index, 1);
          } else {
            favorites.push(discussionId);
          }
          
          return {
            discussionStates: {
              ...state.discussionStates,
              favorites
            },
            lastUpdated: Date.now()
          };
        });
      },
      
      toggleDiscussionLock: (discussionId) => {
        set((state) => {
          const locked = [...state.discussionStates.locked];
          const index = locked.indexOf(discussionId);
          
          if (index > -1) {
            locked.splice(index, 1);
          } else {
            locked.push(discussionId);
          }
          
          return {
            discussionStates: {
              ...state.discussionStates,
              locked
            },
            lastUpdated: Date.now()
          };
        });
      },
      
      toggleDiscussionMute: (discussionId) => {
        set((state) => {
          const muted = [...state.discussionStates.muted];
          const index = muted.indexOf(discussionId);
          
          if (index > -1) {
            muted.splice(index, 1);
          } else {
            muted.push(discussionId);
          }
          
          return {
            discussionStates: {
              ...state.discussionStates,
              muted
            },
            lastUpdated: Date.now()
          };
        });
      },
      
      blockUser: (discussionId) => {
        set((state) => {
          const blocked = [...state.discussionStates.blocked];
          if (!blocked.includes(discussionId)) {
            blocked.push(discussionId);
          }
          
          return {
            discussionStates: {
              ...state.discussionStates,
              blocked
            },
            lastUpdated: Date.now()
          };
        });
      },
      
      unblockUser: (discussionId) => {
        set((state) => {
          const blocked = state.discussionStates.blocked.filter(id => id !== discussionId);
          
          return {
            discussionStates: {
              ...state.discussionStates,
              blocked
            },
            lastUpdated: Date.now()
          };
        });
      },
      
      markDiscussionAsRead: (discussionId) => {
        // Cette action sera intégrée avec le système de messages
        console.log('Marquer comme lu:', discussionId);
      },
      
      deleteDiscussion: (discussionId) => {
        set((state) => {
          // Supprimer de tous les états
          const newStates = {};
          Object.keys(state.discussionStates).forEach(key => {
            newStates[key] = state.discussionStates[key].filter(id => id !== discussionId);
          });
          
          return {
            discussionStates: newStates,
            lastUpdated: Date.now()
          };
        });
      },
      
      // Actions pour les messages
      toggleMessagePin: (messageId) => {
        set((state) => {
          const pinned = [...state.messageStates.pinned];
          const index = pinned.indexOf(messageId);
          
          if (index > -1) {
            pinned.splice(index, 1);
          } else {
            pinned.push(messageId);
          }
          
          return {
            messageStates: {
              ...state.messageStates,
              pinned
            },
            lastUpdated: Date.now()
          };
        });
      },
      
      toggleMessageFavorite: (messageId) => {
        set((state) => {
          const favorites = [...state.messageStates.favorites];
          const index = favorites.indexOf(messageId);
          
          if (index > -1) {
            favorites.splice(index, 1);
          } else {
            favorites.push(messageId);
          }
          
          return {
            messageStates: {
              ...state.messageStates,
              favorites
            },
            lastUpdated: Date.now()
          };
        });
      },
      
      // Getters pour vérifier les états
      isDiscussionPinned: (discussionId) => {
        return get().discussionStates.pinned.includes(discussionId);
      },
      
      isDiscussionArchived: (discussionId) => {
        return get().discussionStates.archived.includes(discussionId);
      },
      
      isDiscussionFavorite: (discussionId) => {
        return get().discussionStates.favorites.includes(discussionId);
      },
      
      isDiscussionLocked: (discussionId) => {
        return get().discussionStates.locked.includes(discussionId);
      },
      
      isDiscussionMuted: (discussionId) => {
        return get().discussionStates.muted.includes(discussionId);
      },
      
      isUserBlocked: (discussionId) => {
        return get().discussionStates.blocked.includes(discussionId);
      },
      
      isMessagePinned: (messageId) => {
        return get().messageStates.pinned.includes(messageId);
      },
      
      isMessageFavorite: (messageId) => {
        return get().messageStates.favorites.includes(messageId);
      },
      
      // Statistiques
      getStats: () => {
        const state = get();
        return {
          discussions: {
            pinned: state.discussionStates.pinned.length,
            archived: state.discussionStates.archived.length,
            favorites: state.discussionStates.favorites.length,
            locked: state.discussionStates.locked.length,
            muted: state.discussionStates.muted.length,
            blocked: state.discussionStates.blocked.length,
          },
          messages: {
            pinned: state.messageStates.pinned.length,
            favorites: state.messageStates.favorites.length,
            locked: state.messageStates.locked.length,
          }
        };
      },
      
      // Reset complet
      resetAll: () => {
        set({
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
          lastUpdated: Date.now()
        });
      }
    }),
    {
      name: 'elite-store', // nom du localStorage
      version: 1,
    }
  )
);

// Hook personnalisé pour les actions de discussion
export const useDiscussionActions = () => {
  const store = useEliteStore();
  
  return {
    // Actions
    togglePin: store.toggleDiscussionPin,
    toggleArchive: store.toggleDiscussionArchive,
    toggleFavorite: store.toggleDiscussionFavorite,
    toggleLock: store.toggleDiscussionLock,
    toggleMute: store.toggleDiscussionMute,
    blockUser: store.blockUser,
    unblockUser: store.unblockUser,
    markAsRead: store.markDiscussionAsRead,
    deleteDiscussion: store.deleteDiscussion,
    
    // Getters
    isPinned: store.isDiscussionPinned,
    isArchived: store.isDiscussionArchived,
    isFavorite: store.isDiscussionFavorite,
    isLocked: store.isDiscussionLocked,
    isMuted: store.isDiscussionMuted,
    isBlocked: store.isUserBlocked,
    
    // Stats
    getStats: store.getStats,
  };
};

// Hook personnalisé pour les actions de message
export const useMessageActions = () => {
  const store = useEliteStore();
  
  return {
    // Actions
    togglePin: store.toggleMessagePin,
    toggleFavorite: store.toggleMessageFavorite,
    
    // Getters
    isPinned: store.isMessagePinned,
    isFavorite: store.isMessageFavorite,
  };
};

export default useEliteStore;
