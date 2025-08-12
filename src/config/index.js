/**
 * Configuration centralisée de l'application Elite
 * Gestion des variables d'environnement et paramètres
 */

// Validation des variables d'environnement requises
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

// Vérifier la présence des variables requises
for (const envVar of requiredEnvVars) {
  if (!import.meta.env[envVar]) {
    console.error(`❌ Variable d'environnement manquante: ${envVar}`);
    throw new Error(`Variable d'environnement manquante: ${envVar}`);
  }
}

// Configuration Supabase
export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  options: {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: window.localStorage,
      storageKey: 'elite-auth'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      },
      heartbeatIntervalMs: 15000
    },
    global: {
      headers: {
        'x-application-name': 'Elite Chat'
      }
    }
  }
};

// Configuration des médias
export const mediaConfig = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  maxImageSize: 10 * 1024 * 1024, // 10MB
  maxVideoSize: 50 * 1024 * 1024, // 50MB
  maxAudioSize: 20 * 1024 * 1024, // 20MB
  
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  allowedVideoTypes: ['video/mp4', 'video/webm', 'video/ogg'],
  allowedAudioTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'],
  allowedDocumentTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ],
  
  thumbnailSize: {
    width: 200,
    height: 200,
    quality: 0.8
  },
  
  imageOptimization: {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.85
  },
  
  buckets: {
    images: 'images',
    videos: 'videos',
    audio: 'audio',
    documents: 'documents',
    thumbnails: 'thumbnails',
    avatars: 'avatars',
    status: 'status-media'
  }
};

// Configuration des appels
export const callConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ],
  
  // Ajouter des serveurs TURN si disponibles
  ...(import.meta.env.VITE_TURN_SERVER && {
    iceServers: [
      ...callConfig.iceServers,
      {
        urls: import.meta.env.VITE_TURN_SERVER,
        username: import.meta.env.VITE_TURN_USERNAME,
        credential: import.meta.env.VITE_TURN_PASSWORD
      }
    ]
  }),
  
  constraints: {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    },
    video: {
      width: { min: 640, ideal: 1280, max: 1920 },
      height: { min: 480, ideal: 720, max: 1080 },
      frameRate: { ideal: 30, max: 60 }
    }
  },
  
  reconnectAttempts: 3,
  reconnectDelay: 1000,
  callTimeout: 30000, // 30 secondes pour répondre
  maxCallDuration: 3600000 // 1 heure max
};

// Configuration des notifications
export const notificationConfig = {
  permission: {
    requestOnLoad: false, // Demander seulement après connexion
    reminderDelay: 7 * 24 * 60 * 60 * 1000 // Rappeler après 7 jours
  },
  
  sounds: {
    message: '/sounds/message.mp3',
    call: '/sounds/ringtone.mp3',
    notification: '/sounds/notification.mp3'
  },
  
  vibration: {
    message: [200],
    call: [200, 100, 200, 100, 200],
    notification: [100, 50, 100]
  },
  
  priorities: {
    low: { requireInteraction: false, silent: true },
    normal: { requireInteraction: false, silent: false },
    high: { requireInteraction: true, silent: false },
    urgent: { requireInteraction: true, silent: false, vibrate: true }
  }
};

// Configuration des messages
export const messageConfig = {
  maxLength: 5000,
  maxMentions: 20,
  typingIndicatorDuration: 10000, // 10 secondes
  typingDebounceDelay: 1000, // 1 seconde
  
  reactions: {
    maxPerMessage: 20,
    maxPerUser: 5,
    allowedEmojis: ['👍', '❤️', '😂', '😮', '😢', '🙏', '👏', '🔥', '🎉', '💯']
  },
  
  pagination: {
    messagesPerPage: 50,
    initialLoad: 30
  },
  
  autoSave: {
    enabled: true,
    interval: 5000 // 5 secondes
  }
};

// Configuration des discussions
export const discussionConfig = {
  types: {
    private: { maxParticipants: 2, allowInviteLinks: false },
    group: { maxParticipants: 256, allowInviteLinks: true },
    channel: { maxParticipants: 5000, allowInviteLinks: true }
  },
  
  roles: {
    admin: { canDelete: true, canEdit: true, canAddMembers: true, canRemoveMembers: true },
    moderator: { canDelete: false, canEdit: true, canAddMembers: true, canRemoveMembers: true },
    member: { canDelete: false, canEdit: false, canAddMembers: false, canRemoveMembers: false }
  },
  
  defaultSettings: {
    muted: false,
    pinned: false,
    archived: false
  }
};

// Configuration des statuts
export const statusConfig = {
  defaultDuration: 24 * 60 * 60, // 24 heures
  maxDuration: 7 * 24 * 60 * 60, // 7 jours
  
  types: {
    text: { maxLength: 500 },
    image: { maxSize: 5 * 1024 * 1024 }, // 5MB
    video: { maxSize: 20 * 1024 * 1024, maxDuration: 60 } // 20MB, 60 secondes
  },
  
  visibility: {
    public: 'Tout le monde',
    contacts: 'Mes contacts',
    close_friends: 'Amis proches',
    custom: 'Personnalisé'
  },
  
  backgrounds: [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#48DBFB', '#0ABDE3', '#006BA6'
  ]
};

// Configuration de l'interface utilisateur
export const uiConfig = {
  theme: {
    defaultMode: 'system', // 'light', 'dark', 'system'
    enableAutoSwitch: true
  },
  
  animations: {
    enabled: true,
    duration: {
      fast: 200,
      normal: 300,
      slow: 500
    }
  },
  
  layout: {
    sidebarWidth: 320,
    chatHeaderHeight: 64,
    messageInputHeight: 120,
    mobileBreakpoint: 768
  },
  
  shortcuts: {
    sendMessage: ['Enter', 'Ctrl+Enter'],
    newLine: ['Shift+Enter'],
    searchMessages: ['Ctrl+F', 'Cmd+F'],
    toggleSidebar: ['Ctrl+B', 'Cmd+B']
  }
};

// Configuration de sécurité
export const securityConfig = {
  session: {
    timeout: 30 * 24 * 60 * 60 * 1000, // 30 jours
    refreshThreshold: 60 * 60 * 1000, // Rafraîchir si expire dans 1 heure
    checkInterval: 5 * 60 * 1000 // Vérifier toutes les 5 minutes
  },
  
  validation: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    username: /^[a-zA-Z0-9_]{3,30}$/,
    phone: /^\+?[1-9]\d{1,14}$/
  },
  
  sanitization: {
    allowedTags: ['b', 'i', 'u', 'strong', 'em', 'code', 'pre', 'a'],
    allowedAttributes: {
      'a': ['href', 'target']
    }
  },
  
  rateLimit: {
    messages: { max: 100, window: 60000 }, // 100 messages par minute
    uploads: { max: 10, window: 300000 }, // 10 uploads par 5 minutes
    calls: { max: 5, window: 3600000 } // 5 appels par heure
  }
};

// Configuration de développement
export const devConfig = {
  enableLogs: import.meta.env.DEV,
  enableDebugPanel: import.meta.env.DEV,
  mockData: import.meta.env.VITE_USE_MOCK_DATA === 'true',
  apiDelay: import.meta.env.VITE_API_DELAY ? parseInt(import.meta.env.VITE_API_DELAY) : 0
};

// URLs de l'application
export const appUrls = {
  base: import.meta.env.VITE_APP_URL || window.location.origin,
  api: import.meta.env.VITE_API_URL || supabaseConfig.url,
  cdn: import.meta.env.VITE_CDN_URL || supabaseConfig.url + '/storage/v1/object/public',
  websocket: import.meta.env.VITE_WS_URL || supabaseConfig.url.replace('https', 'wss') + '/realtime/v1'
};

// Configuration des fonctionnalités
export const features = {
  calls: import.meta.env.VITE_ENABLE_CALLS !== 'false',
  status: import.meta.env.VITE_ENABLE_STATUS !== 'false',
  reactions: import.meta.env.VITE_ENABLE_REACTIONS !== 'false',
  typing: import.meta.env.VITE_ENABLE_TYPING !== 'false',
  presence: import.meta.env.VITE_ENABLE_PRESENCE !== 'false',
  encryption: import.meta.env.VITE_ENABLE_ENCRYPTION === 'true',
  payments: import.meta.env.VITE_ENABLE_PAYMENTS === 'true'
};

// Export de la configuration complète
const config = {
  supabase: supabaseConfig,
  media: mediaConfig,
  call: callConfig,
  notification: notificationConfig,
  message: messageConfig,
  discussion: discussionConfig,
  status: statusConfig,
  ui: uiConfig,
  security: securityConfig,
  dev: devConfig,
  urls: appUrls,
  features
};

export default config;
