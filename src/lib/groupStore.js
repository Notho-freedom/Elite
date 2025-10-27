import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types de groupes
export const GROUP_TYPES = {
  PRIVATE: 'private',
  PUBLIC: 'public',
  SECRET: 'secret',
  INSTANT_ROOM: 'instant_room',
  BROADCAST: 'broadcast'
};

// États des groupes
export const GROUP_STATES = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  SUSPENDED: 'suspended',
  DELETED: 'deleted'
};

// Rôles des participants
export const PARTICIPANT_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  MEMBER: 'member',
  GUEST: 'guest'
};

// Types de confidentialité
export const PRIVACY_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  SECRET: 'secret',
  INVITE_ONLY: 'invite_only',
  APPROVAL_REQUIRED: 'approval_required'
};

// États des demandes
export const REQUEST_STATES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
};

// État initial
const initialState = {
  // Mes groupes
  myGroups: [
    {
      id: 'group_1',
      name: 'Tech Elite',
      description: 'Groupe pour les passionnés de technologie',
      type: GROUP_TYPES.PRIVATE,
      state: GROUP_STATES.ACTIVE,
      privacy: PRIVACY_TYPES.PRIVATE,
      avatar: 'https://ui-avatars.com/api/?name=Tech+Elite&background=6366f1&color=fff',
      coverImage: null,
      memberCount: 45,
      maxMembers: 100,
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      lastActivity: new Date(Date.now() - 1800000).toISOString(),
      isPinned: true,
      isMuted: false,
      unreadCount: 3,
      settings: {
        allowInvites: true,
        requireApproval: false,
        allowMedia: true,
        allowVoiceMessages: true,
        allowLocation: true,
        allowPolls: true,
        allowReactions: true,
        allowReplies: true,
        allowForwarding: true,
        allowEditing: true,
        allowDeletion: true,
        autoArchive: false,
        archiveAfter: 30,
        maxMessageLength: 1000,
        maxMediaSize: 10,
        slowMode: false,
        slowModeInterval: 5
      },
      monetization: {
        enabled: false,
        type: null,
        price: 0,
        currency: 'elite_coins'
      },
      stats: {
        totalMessages: 1247,
        totalMedia: 89,
        totalVoiceMessages: 23,
        totalReactions: 456,
        activeMembers: 32,
        averageResponseTime: 2.5
      }
    },
    {
      id: 'group_2',
      name: 'Instant Room - Gaming',
      description: 'Salle de discussion instantanée pour les gamers',
      type: GROUP_TYPES.INSTANT_ROOM,
      state: GROUP_STATES.ACTIVE,
      privacy: PRIVACY_TYPES.PUBLIC,
      avatar: 'https://ui-avatars.com/api/?name=Gaming+Room&background=dc2626&color=fff',
      coverImage: null,
      memberCount: 156,
      maxMembers: 500,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 300000).toISOString(),
      lastActivity: new Date(Date.now() - 60000).toISOString(),
      isPinned: false,
      isMuted: false,
      unreadCount: 12,
      settings: {
        allowInvites: true,
        requireApproval: false,
        allowMedia: true,
        allowVoiceMessages: true,
        allowLocation: false,
        allowPolls: true,
        allowReactions: true,
        allowReplies: true,
        allowForwarding: true,
        allowEditing: false,
        allowDeletion: false,
        autoArchive: true,
        archiveAfter: 7,
        maxMessageLength: 500,
        maxMediaSize: 5,
        slowMode: true,
        slowModeInterval: 3
      },
      monetization: {
        enabled: true,
        type: 'pay_per_join',
        price: 5,
        currency: 'elite_coins'
      },
      stats: {
        totalMessages: 892,
        totalMedia: 67,
        totalVoiceMessages: 45,
        totalReactions: 234,
        activeMembers: 89,
        averageResponseTime: 1.2
      }
    },
    {
      id: 'group_3',
      name: 'Secret Elite',
      description: 'Groupe secret pour les membres VIP',
      type: GROUP_TYPES.SECRET,
      state: GROUP_STATES.ACTIVE,
      privacy: PRIVACY_TYPES.SECRET,
      avatar: 'https://ui-avatars.com/api/?name=Secret+Elite&background=7c3aed&color=fff',
      coverImage: null,
      memberCount: 12,
      maxMembers: 50,
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      updatedAt: new Date(Date.now() - 7200000).toISOString(),
      lastActivity: new Date(Date.now() - 3600000).toISOString(),
      isPinned: true,
      isMuted: false,
      unreadCount: 0,
      settings: {
        allowInvites: false,
        requireApproval: true,
        allowMedia: true,
        allowVoiceMessages: true,
        allowLocation: true,
        allowPolls: true,
        allowReactions: true,
        allowReplies: true,
        allowForwarding: false,
        allowEditing: true,
        allowDeletion: true,
        autoArchive: false,
        archiveAfter: 90,
        maxMessageLength: 2000,
        maxMediaSize: 20,
        slowMode: false,
        slowModeInterval: 0
      },
      monetization: {
        enabled: false,
        type: null,
        price: 0,
        currency: 'elite_coins'
      },
      stats: {
        totalMessages: 567,
        totalMedia: 34,
        totalVoiceMessages: 12,
        totalReactions: 189,
        activeMembers: 8,
        averageResponseTime: 5.2
      }
    }
  ],

  // Groupes publics découverts
  discoveredGroups: [
    {
      id: 'public_1',
      name: 'Elite Developers',
      description: 'Communauté de développeurs Elite',
      type: GROUP_TYPES.PUBLIC,
      state: GROUP_STATES.ACTIVE,
      privacy: PRIVACY_TYPES.PUBLIC,
      avatar: 'https://ui-avatars.com/api/?name=Elite+Devs&background=059669&color=fff',
      coverImage: null,
      memberCount: 234,
      maxMembers: 1000,
      createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
      isJoined: false,
      isRequested: false,
      category: 'Technology',
      tags: ['development', 'programming', 'elite']
    },
    {
      id: 'public_2',
      name: 'Elite Entrepreneurs',
      description: 'Réseau d\'entrepreneurs et de startups',
      type: GROUP_TYPES.PUBLIC,
      state: GROUP_STATES.ACTIVE,
      privacy: PRIVACY_TYPES.APPROVAL_REQUIRED,
      avatar: 'https://ui-avatars.com/api/?name=Elite+Entrepreneurs&background=f59e0b&color=fff',
      coverImage: null,
      memberCount: 89,
      maxMembers: 200,
      createdAt: new Date(Date.now() - 86400000 * 21).toISOString(),
      isJoined: false,
      isRequested: true,
      category: 'Business',
      tags: ['entrepreneurship', 'startup', 'business']
    }
  ],

  // Demandes d'adhésion
  joinRequests: [
    {
      id: 'request_1',
      groupId: 'public_2',
      groupName: 'Elite Entrepreneurs',
      userId: 'user_123',
      userName: 'John Doe',
      userAvatar: 'https://ui-avatars.com/api/?name=John+Doe&background=3b82f6&color=fff',
      message: 'Je suis entrepreneur dans le secteur tech et j\'aimerais rejoindre votre communauté.',
      state: REQUEST_STATES.PENDING,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ],

  // Participants des groupes
  participants: {
    'group_1': [
      {
        id: 'user_1',
        name: 'Alice Martin',
        avatar: 'https://ui-avatars.com/api/?name=Alice+Martin&background=ec4899&color=fff',
        role: PARTICIPANT_ROLES.OWNER,
        joinedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        lastSeen: new Date(Date.now() - 300000).toISOString(),
        isOnline: true,
        isVerified: true,
        isElite: true,
        messageCount: 234,
        reactionCount: 89
      },
      {
        id: 'user_2',
        name: 'Bob Wilson',
        avatar: 'https://ui-avatars.com/api/?name=Bob+Wilson&background=8b5cf6&color=fff',
        role: PARTICIPANT_ROLES.ADMIN,
        joinedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
        lastSeen: new Date(Date.now() - 1800000).toISOString(),
        isOnline: false,
        isVerified: true,
        isElite: false,
        messageCount: 156,
        reactionCount: 67
      }
    ]
  },

  // Messages des groupes
  groupMessages: {
    'group_1': [
      {
        id: 'msg_1',
        senderId: 'user_1',
        senderName: 'Alice Martin',
        senderAvatar: 'https://ui-avatars.com/api/?name=Alice+Martin&background=ec4899&color=fff',
        content: 'Salut tout le monde ! Qui a testé la nouvelle fonctionnalité Elite ?',
        type: 'text',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        isEdited: false,
        isDeleted: false,
        reactions: [
          { type: '👍', count: 3, users: ['user_2', 'user_3', 'user_4'] },
          { type: '❤️', count: 1, users: ['user_5'] }
        ],
        replies: [
          {
            id: 'reply_1',
            senderId: 'user_2',
            senderName: 'Bob Wilson',
            content: 'Je l\'ai testée hier, c\'est vraiment impressionnant !',
            timestamp: new Date(Date.now() - 1700000).toISOString()
          }
        ]
      }
    ]
  },

  // Paramètres globaux
  settings: {
    defaultPrivacy: PRIVACY_TYPES.PRIVATE,
    allowGroupInvites: true,
    allowPublicGroups: true,
    allowInstantRooms: true,
    maxGroupsPerUser: 10,
    maxMembersPerGroup: 1000,
    autoArchiveInactive: true,
    archiveAfterDays: 30,
    notifications: {
      newMessages: true,
      mentions: true,
      reactions: true,
      joinRequests: true,
      groupUpdates: true
    }
  },

  // Statistiques
  stats: {
    totalGroups: 3,
    totalMembers: 213,
    totalMessages: 2706,
    totalReactions: 889,
    averageGroupSize: 71,
    mostActiveGroup: 'group_2',
    groupsCreatedThisMonth: 1,
    membersJoinedThisMonth: 23
  },

  // Interface
  ui: {
    activeGroup: null,
    showCreateModal: false,
    showSettingsModal: false,
    showParticipantsModal: false,
    showJoinRequestsModal: false,
    showInviteModal: false,
    searchQuery: '',
    selectedFilter: 'all',
    sortBy: 'lastActivity',
    viewMode: 'list' // list, grid, compact
  }
};

// Store principal
export const useGroupStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // Actions pour les groupes
      createGroup: (groupData) => {
        const newGroup = {
          id: `group_${Date.now()}`,
          ...groupData,
          state: GROUP_STATES.ACTIVE,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          memberCount: 1,
          isPinned: false,
          isMuted: false,
          unreadCount: 0,
          stats: {
            totalMessages: 0,
            totalMedia: 0,
            totalVoiceMessages: 0,
            totalReactions: 0,
            activeMembers: 1,
            averageResponseTime: 0
          }
        };

        set((state) => ({
          myGroups: [newGroup, ...state.myGroups],
          stats: {
            ...state.stats,
            totalGroups: state.stats.totalGroups + 1,
            groupsCreatedThisMonth: state.stats.groupsCreatedThisMonth + 1
          }
        }));
      },

      updateGroup: (groupId, updates) => {
        set((state) => ({
          myGroups: state.myGroups.map(group =>
            group.id === groupId
              ? { ...group, ...updates, updatedAt: new Date().toISOString() }
              : group
          )
        }));
      },

      deleteGroup: (groupId) => {
        set((state) => ({
          myGroups: state.myGroups.filter(group => group.id !== groupId),
          stats: {
            ...state.stats,
            totalGroups: state.stats.totalGroups - 1
          }
        }));
      },

      archiveGroup: (groupId) => {
        set((state) => ({
          myGroups: state.myGroups.map(group =>
            group.id === groupId
              ? { ...group, state: GROUP_STATES.ARCHIVED }
              : group
          )
        }));
      },

      pinGroup: (groupId) => {
        set((state) => ({
          myGroups: state.myGroups.map(group =>
            group.id === groupId
              ? { ...group, isPinned: !group.isPinned }
              : group
          )
        }));
      },

      muteGroup: (groupId) => {
        set((state) => ({
          myGroups: state.myGroups.map(group =>
            group.id === groupId
              ? { ...group, isMuted: !group.isMuted }
              : group
          )
        }));
      },

      // Actions pour les participants
      addParticipant: (groupId, participant) => {
        set((state) => ({
          participants: {
            ...state.participants,
            [groupId]: [
              ...(state.participants[groupId] || []),
              {
                ...participant,
                joinedAt: new Date().toISOString(),
                lastSeen: new Date().toISOString(),
                isOnline: true,
                messageCount: 0,
                reactionCount: 0
              }
            ]
          }
        }));
      },

      removeParticipant: (groupId, userId) => {
        set((state) => ({
          participants: {
            ...state.participants,
            [groupId]: (state.participants[groupId] || []).filter(p => p.id !== userId)
          }
        }));
      },

      updateParticipantRole: (groupId, userId, newRole) => {
        set((state) => ({
          participants: {
            ...state.participants,
            [groupId]: (state.participants[groupId] || []).map(p =>
              p.id === userId ? { ...p, role: newRole } : p
            )
          }
        }));
      },

      // Actions pour les demandes d'adhésion
      createJoinRequest: (groupId, requestData) => {
        const newRequest = {
          id: `request_${Date.now()}`,
          groupId,
          ...requestData,
          state: REQUEST_STATES.PENDING,
          createdAt: new Date().toISOString()
        };

        set((state) => ({
          joinRequests: [...state.joinRequests, newRequest]
        }));
      },

      approveJoinRequest: (requestId) => {
        set((state) => ({
          joinRequests: state.joinRequests.map(req =>
            req.id === requestId
              ? { ...req, state: REQUEST_STATES.APPROVED }
              : req
          )
        }));
      },

      rejectJoinRequest: (requestId) => {
        set((state) => ({
          joinRequests: state.joinRequests.map(req =>
            req.id === requestId
              ? { ...req, state: REQUEST_STATES.REJECTED }
              : req
          )
        }));
      },

      // Actions pour les messages
      addGroupMessage: (groupId, message) => {
        const newMessage = {
          id: `msg_${Date.now()}`,
          ...message,
          timestamp: new Date().toISOString(),
          isEdited: false,
          isDeleted: false,
          reactions: [],
          replies: []
        };

        set((state) => ({
          groupMessages: {
            ...state.groupMessages,
            [groupId]: [...(state.groupMessages[groupId] || []), newMessage]
          },
          myGroups: state.myGroups.map(group =>
            group.id === groupId
              ? {
                  ...group,
                  lastActivity: new Date().toISOString(),
                  stats: {
                    ...group.stats,
                    totalMessages: group.stats.totalMessages + 1
                  }
                }
              : group
          )
        }));
      },

      // Actions pour l'interface
      setActiveGroup: (groupId) => {
        set((state) => ({
          ui: { ...state.ui, activeGroup: groupId }
        }));
      },

      toggleCreateModal: () => {
        set((state) => ({
          ui: { ...state.ui, showCreateModal: !state.ui.showCreateModal }
        }));
      },

      toggleSettingsModal: () => {
        set((state) => ({
          ui: { ...state.ui, showSettingsModal: !state.ui.showSettingsModal }
        }));
      },

      toggleParticipantsModal: () => {
        set((state) => ({
          ui: { ...state.ui, showParticipantsModal: !state.ui.showParticipantsModal }
        }));
      },

      toggleJoinRequestsModal: () => {
        set((state) => ({
          ui: { ...state.ui, showJoinRequestsModal: !state.ui.showJoinRequestsModal }
        }));
      },

      toggleInviteModal: () => {
        set((state) => ({
          ui: { ...state.ui, showInviteModal: !state.ui.showInviteModal }
        }));
      },

      setSearchQuery: (query) => {
        set((state) => ({
          ui: { ...state.ui, searchQuery: query }
        }));
      },

      setFilter: (filter) => {
        set((state) => ({
          ui: { ...state.ui, selectedFilter: filter }
        }));
      },

      setSortBy: (sortBy) => {
        set((state) => ({
          ui: { ...state.ui, sortBy }
        }));
      },

      setViewMode: (viewMode) => {
        set((state) => ({
          ui: { ...state.ui, viewMode }
        }));
      },

      // Actions pour les paramètres
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },

      // Actions pour les statistiques
      updateStats: (newStats) => {
        set((state) => ({
          stats: { ...state.stats, ...newStats }
        }));
      },

      // Reset
      reset: () => {
        set(initialState);
      }
    }),
    {
      name: 'elite-group-store',
      partialize: (state) => ({
        myGroups: state.myGroups,
        settings: state.settings,
        stats: state.stats
      })
    }
  )
);

// Hook d'aide pour les actions de groupe
export const useGroupActions = () => {
  return {
    createPrivateGroup: (name, description, participants = []) => {
      return useGroupStore.getState().createGroup({
        name,
        description,
        type: GROUP_TYPES.PRIVATE,
        privacy: PRIVACY_TYPES.PRIVATE,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`,
        participants
      });
    },

    createPublicGroup: (name, description, privacy = PRIVACY_TYPES.PUBLIC) => {
      return useGroupStore.getState().createGroup({
        name,
        description,
        type: GROUP_TYPES.PUBLIC,
        privacy,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=059669&color=fff`
      });
    },

    createInstantRoom: (name, description, monetization = null) => {
      return useGroupStore.getState().createGroup({
        name,
        description,
        type: GROUP_TYPES.INSTANT_ROOM,
        privacy: PRIVACY_TYPES.PUBLIC,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=dc2626&color=fff`,
        monetization
      });
    },

    createSecretGroup: (name, description, participants = []) => {
      return useGroupStore.getState().createGroup({
        name,
        description,
        type: GROUP_TYPES.SECRET,
        privacy: PRIVACY_TYPES.SECRET,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c3aed&color=fff`,
        participants
      });
    },

    getActiveGroups: () => {
      const state = useGroupStore.getState();
      return state.myGroups.filter(group => group.state === GROUP_STATES.ACTIVE);
    },

    getPinnedGroups: () => {
      const state = useGroupStore.getState();
      return state.myGroups.filter(group => group.isPinned);
    },

    getGroupStats: (groupId) => {
      const state = useGroupStore.getState();
      const group = state.myGroups.find(g => g.id === groupId);
      return group ? group.stats : null;
    },

    getGroupParticipants: (groupId) => {
      const state = useGroupStore.getState();
      return state.participants[groupId] || [];
    },

    getGroupMessages: (groupId) => {
      const state = useGroupStore.getState();
      return state.groupMessages[groupId] || [];
    },

    getPendingRequests: () => {
      const state = useGroupStore.getState();
      return state.joinRequests.filter(req => req.state === REQUEST_STATES.PENDING);
    }
  };
};
