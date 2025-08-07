import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types de statuts
export const STATUS_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  LOCATION: 'location',
  POLL: 'poll',
  ELITE: 'elite' // Statut premium monétisé
};

// États des statuts
export const STATUS_STATES = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  EXPIRED: 'expired',
  ARCHIVED: 'archived'
};

// Types de monétisation
export const MONETIZATION_TYPES = {
  VIEW_PAYMENT: 'view_payment', // Paiement par vue
  SUBSCRIPTION: 'subscription', // Abonnement
  TIP: 'tip', // Pourboire
  PREMIUM_CONTENT: 'premium_content' // Contenu premium
};

// États de paiement
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

const initialState = {
  // Statuts de l'utilisateur
  myStatuses: [],
  
  // Statuts des contacts
  contactsStatuses: [],
  
  // Statut actuellement en cours de création
  currentStatus: null,
  
  // Statut en cours de visualisation
  viewingStatus: null,
  
  // Paramètres de création
  creationSettings: {
    privacy: 'contacts', // contacts, public, custom
    customViewers: [],
    duration: 24, // heures
    allowReplies: true,
    allowReactions: true,
    monetization: {
      enabled: false,
      type: MONETIZATION_TYPES.VIEW_PAYMENT,
      price: 0,
      currency: 'ELITE_COIN'
    }
  },
  
  // Statistiques
  stats: {
    totalViews: 0,
    totalEarnings: 0,
    totalStatuses: 0,
    averageViews: 0
  },
  
  // Historique des paiements
  paymentHistory: [],
  
  // Paramètres
  settings: {
    autoArchive: true,
    archiveAfterDays: 7,
    notifications: true,
    privacy: 'contacts',
    monetization: {
      enabled: false,
      defaultPrice: 1,
      currency: 'ELITE_COIN'
    }
  }
};

export const useStatusStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // Actions de base
      setCurrentStatus: (status) => set({ currentStatus: status }),
      setViewingStatus: (status) => set({ viewingStatus: status }),
      
      // Création de statuts
      createStatus: (statusData) => {
        const newStatus = {
          id: Date.now().toString(),
          ...statusData,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + (statusData.duration || 24) * 60 * 60 * 1000).toISOString(),
          state: STATUS_STATES.PUBLISHED,
          views: [],
          reactions: [],
          replies: [],
          earnings: 0,
          isViewed: false
        };
        
        set((state) => ({
          myStatuses: [newStatus, ...state.myStatuses],
          stats: {
            ...state.stats,
            totalStatuses: state.stats.totalStatuses + 1
          }
        }));
        
        return newStatus;
      },
      
      // Mise à jour de statut
      updateStatus: (statusId, updates) => {
        set((state) => ({
          myStatuses: state.myStatuses.map(status =>
            status.id === statusId ? { ...status, ...updates } : status
          )
        }));
      },
      
      // Suppression de statut
      deleteStatus: (statusId) => {
        set((state) => ({
          myStatuses: state.myStatuses.filter(status => status.id !== statusId),
          stats: {
            ...state.stats,
            totalStatuses: Math.max(0, state.stats.totalStatuses - 1)
          }
        }));
      },
      
      // Visualisation de statut
      viewStatus: (statusId, viewerId) => {
        const state = get();
        const status = state.myStatuses.find(s => s.id === statusId);
        
        if (status && !status.views.find(v => v.viewerId === viewerId)) {
          const view = {
            viewerId,
            viewedAt: new Date().toISOString(),
            duration: 0 // Sera mis à jour quand l'utilisateur ferme le statut
          };
          
          set((state) => ({
            myStatuses: state.myStatuses.map(s =>
              s.id === statusId
                ? {
                    ...s,
                    views: [...s.views, view],
                    isViewed: true
                  }
                : s
            ),
            stats: {
              ...state.stats,
              totalViews: state.stats.totalViews + 1
            }
          }));
          
          // Si le statut est monétisé, traiter le paiement
          if (status.monetization?.enabled) {
            get().processPayment(status, viewerId);
          }
        }
      },
      
      // Traitement des paiements
      processPayment: (status, viewerId) => {
        const payment = {
          id: Date.now().toString(),
          statusId: status.id,
          viewerId,
          amount: status.monetization.price,
          currency: status.monetization.currency,
          type: status.monetization.type,
          status: PAYMENT_STATUS.COMPLETED,
          createdAt: new Date().toISOString()
        };
        
        set((state) => ({
          paymentHistory: [payment, ...state.paymentHistory],
          myStatuses: state.myStatuses.map(s =>
            s.id === status.id
              ? { ...s, earnings: s.earnings + payment.amount }
              : s
          ),
          stats: {
            ...state.stats,
            totalEarnings: state.stats.totalEarnings + payment.amount
          }
        }));
      },
      
      // Réactions aux statuts
      addReaction: (statusId, reaction) => {
        set((state) => ({
          myStatuses: state.myStatuses.map(status =>
            status.id === statusId
              ? {
                  ...status,
                  reactions: [...status.reactions, reaction]
                }
              : status
          )
        }));
      },
      
      // Réponses aux statuts
      addReply: (statusId, reply) => {
        set((state) => ({
          myStatuses: state.myStatuses.map(status =>
            status.id === statusId
              ? {
                  ...status,
                  replies: [...status.replies, reply]
                }
              : status
          )
        }));
      },
      
      // Archivage automatique
      archiveExpiredStatuses: () => {
        const now = new Date();
        set((state) => ({
          myStatuses: state.myStatuses.map(status => {
            if (new Date(status.expiresAt) < now && status.state === STATUS_STATES.PUBLISHED) {
              return { ...status, state: STATUS_STATES.EXPIRED };
            }
            return status;
          })
        }));
      },
      
      // Mise à jour des paramètres
      updateSettings: (settings) => {
        set((state) => ({
          settings: { ...state.settings, ...settings }
        }));
      },
      
      // Mise à jour des paramètres de création
      updateCreationSettings: (settings) => {
        set((state) => ({
          creationSettings: { ...state.creationSettings, ...settings }
        }));
      },
      
      // Calcul des statistiques
      calculateStats: () => {
        const state = get();
        const totalViews = state.myStatuses.reduce((sum, status) => sum + status.views.length, 0);
        const totalEarnings = state.myStatuses.reduce((sum, status) => sum + status.earnings, 0);
        const totalStatuses = state.myStatuses.length;
        const averageViews = totalStatuses > 0 ? totalViews / totalStatuses : 0;
        
        set({
          stats: {
            totalViews,
            totalEarnings,
            totalStatuses,
            averageViews: Math.round(averageViews * 100) / 100
          }
        });
      },
      
      // Réinitialisation
      reset: () => set(initialState)
    }),
    {
      name: 'elite-status-store',
      partialize: (state) => ({
        myStatuses: state.myStatuses,
        settings: state.settings,
        stats: state.stats,
        paymentHistory: state.paymentHistory
      })
    }
  )
);

// Hooks utilitaires
export const useStatusActions = () => {
  return {
    createTextStatus: (text, options = {}) => {
      return useStatusStore.getState().createStatus({
        type: STATUS_TYPES.TEXT,
        content: text,
        ...options
      });
    },

    createMediaStatus: (mediaUrl, mediaType, options = {}) => {
      return useStatusStore.getState().createStatus({
        type: mediaType === 'image' ? STATUS_TYPES.IMAGE : STATUS_TYPES.VIDEO,
        content: mediaUrl,
        ...options
      });
    },

    createEliteStatus: (content, monetization, options = {}) => {
      return useStatusStore.getState().createStatus({
        type: STATUS_TYPES.ELITE,
        content,
        monetization,
        ...options
      });
    },

    getActiveStatuses: () => {
      const state = useStatusStore.getState(); // ✅
      return state.myStatuses.filter(status =>
        status.state === STATUS_STATES.PUBLISHED &&
        new Date(status.expiresAt) > new Date()
      );
    },

    getStatusStats: (statusId) => {
      const state = useStatusStore.getState(); // ✅
      const status = state.myStatuses.find(s => s.id === statusId);
      if (!status) return null;

      return {
        views: status.views.length,
        reactions: status.reactions.length,
        replies: status.replies.length,
        earnings: status.earnings,
        uniqueViewers: new Set(status.views.map(v => v.viewerId)).size
      };
    }
  };
};

