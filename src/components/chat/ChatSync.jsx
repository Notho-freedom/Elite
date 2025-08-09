import { useEffect, useCallback, useRef, useState } from 'react';
import { useApp } from '../Context/AppContext';

// Simulateur de synchronisation temps réel
class ChatSyncManager {
  constructor() {
    this.subscribers = new Map();
    this.syncInterval = null;
    this.isOnline = navigator.onLine;
    this.pendingUpdates = [];
    this.lastSyncTime = Date.now();
    
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Écouter les changements de connectivité
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processPendingUpdates();
      this.notifySubscribers('connection', { status: 'online' });
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifySubscribers('connection', { status: 'offline' });
    });

    // Écouter les changements de visibilité de la page
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        this.forceSync();
      }
    });

    // Écouter les événements de stockage pour la synchronisation multi-onglets
    window.addEventListener('storage', (e) => {
      if (e.key?.startsWith('elite_chat_')) {
        this.notifySubscribers('storage', { key: e.key, newValue: e.newValue });
      }
    });
  }

  subscribe(chatId, callback) {
    if (!this.subscribers.has(chatId)) {
      this.subscribers.set(chatId, new Set());
    }
    this.subscribers.get(chatId).add(callback);

    // Retourner une fonction de désinscription
    return () => {
      const chatSubscribers = this.subscribers.get(chatId);
      if (chatSubscribers) {
        chatSubscribers.delete(callback);
        if (chatSubscribers.size === 0) {
          this.subscribers.delete(chatId);
        }
      }
    };
  }

  notifySubscribers(type, data) {
    this.subscribers.forEach((callbacks) => {
      callbacks.forEach(callback => {
        try {
          callback({ type, data, timestamp: Date.now() });
        } catch (error) {
          console.error('Erreur lors de la notification:', error);
        }
      });
    });
  }

  startSync(interval = 5000) {
    this.stopSync();
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.performSync();
      }
    }, interval);
  }

  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async performSync() {
    try {
      // Simuler une synchronisation avec le serveur
      const updates = await this.fetchUpdates();
      
      if (updates.length > 0) {
        this.notifySubscribers('updates', updates);
      }

      this.lastSyncTime = Date.now();
      
    } catch (error) {
      console.error('Erreur de synchronisation:', error);
      this.notifySubscribers('error', { error: error.message });
    }
  }

  async fetchUpdates() {
    // Simuler des mises à jour du serveur
    return new Promise((resolve) => {
      setTimeout(() => {
        const shouldHaveUpdate = Math.random() < 0.1; // 10% de chance d'avoir une mise à jour
        
        if (shouldHaveUpdate) {
          resolve([
            {
              id: `sync_${Date.now()}`,
              type: 'status_update',
              chatId: 'demo_chat',
              data: {
                isTyping: Math.random() < 0.3,
                isOnline: Math.random() < 0.8,
                lastSeen: new Date().toISOString()
              }
            }
          ]);
        } else {
          resolve([]);
        }
      }, 200);
    });
  }

  forceSync() {
    if (this.isOnline) {
      this.performSync();
    }
  }

  addPendingUpdate(update) {
    this.pendingUpdates.push({
      ...update,
      timestamp: Date.now()
    });
  }

  processPendingUpdates() {
    if (this.pendingUpdates.length === 0) return;

    // Traiter les mises à jour en attente
    this.notifySubscribers('pending_processed', {
      count: this.pendingUpdates.length,
      updates: [...this.pendingUpdates]
    });

    this.pendingUpdates = [];
  }

  getStatus() {
    return {
      isOnline: this.isOnline,
      lastSyncTime: this.lastSyncTime,
      pendingUpdates: this.pendingUpdates.length,
      subscribersCount: Array.from(this.subscribers.values()).reduce((total, set) => total + set.size, 0)
    };
  }
}

// Instance globale du gestionnaire de synchronisation
const syncManager = new ChatSyncManager();

// Hook pour utiliser la synchronisation dans les composants
export const useChatSync = (chatId) => {
  const { activeChat, setMessages } = useApp();
  const [syncStatus, setSyncStatus] = useState(syncManager.getStatus());
  const [connectionQuality, setConnectionQuality] = useState('good');
  const lastUpdateRef = useRef(Date.now());

  // Fonction pour mesurer la qualité de connexion
  const measureConnectionQuality = useCallback(async () => {
    if (!navigator.onLine) {
      setConnectionQuality('offline');
      return;
    }

    const startTime = Date.now();
    try {
      // Test simple de latence
      await fetch('/favicon.ico', { method: 'HEAD', cache: 'no-cache' });
      const latency = Date.now() - startTime;
      
      if (latency < 100) setConnectionQuality('excellent');
      else if (latency < 300) setConnectionQuality('good');
      else if (latency < 1000) setConnectionQuality('fair');
      else setConnectionQuality('poor');
      
    } catch (error) {
      setConnectionQuality('poor');
    }
  }, []);

  // Gestionnaire des mises à jour de synchronisation
  const handleSyncUpdate = useCallback((update) => {
    const now = Date.now();
    lastUpdateRef.current = now;

    switch (update.type) {
      case 'updates':
        // Traiter les mises à jour des messages
        update.data.forEach(updateItem => {
          if (updateItem.type === 'status_update' && updateItem.chatId === activeChat?.id) {
            // Mettre à jour le statut du chat actif
            console.log('Mise à jour du statut:', updateItem.data);
          }
        });
        break;

      case 'connection':
        setSyncStatus(prev => ({ ...prev, isOnline: update.data.status === 'online' }));
        if (update.data.status === 'online') {
          measureConnectionQuality();
        }
        break;

      case 'storage':
        // Synchronisation multi-onglets
        if (update.data.key === 'elite_chat_messages' && update.data.newValue) {
          try {
            const messages = JSON.parse(update.data.newValue);
            if (messages[activeChat?.id]) {
              setMessages(messages[activeChat.id]);
            }
          } catch (error) {
            console.error('Erreur de synchronisation multi-onglets:', error);
          }
        }
        break;

      case 'error':
        console.warn('Erreur de synchronisation:', update.data.error);
        break;

      default:
        break;
    }

    // Mettre à jour le statut de synchronisation
    setSyncStatus(syncManager.getStatus());
  }, [activeChat?.id, setMessages, measureConnectionQuality]);

  // Démarrer la synchronisation
  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = syncManager.subscribe(chatId, handleSyncUpdate);
    syncManager.startSync();

    // Mesurer la qualité de connexion au démarrage
    measureConnectionQuality();

    // Mesurer périodiquement la qualité de connexion
    const qualityInterval = setInterval(measureConnectionQuality, 30000);

    return () => {
      unsubscribe();
      clearInterval(qualityInterval);
      // Ne pas arrêter la sync si d'autres composants l'utilisent
      if (syncManager.getStatus().subscribersCount === 0) {
        syncManager.stopSync();
      }
    };
  }, [chatId, handleSyncUpdate, measureConnectionQuality]);

  // Forcer une synchronisation
  const forceSync = useCallback(() => {
    syncManager.forceSync();
  }, []);

  // Ajouter une mise à jour en attente
  const addPendingUpdate = useCallback((update) => {
    syncManager.addPendingUpdate(update);
  }, []);

  // Indicateur de fraîcheur des données
  const isDataFresh = useCallback(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;
    return timeSinceLastUpdate < 10000; // Considéré comme frais si moins de 10 secondes
  }, []);

  return {
    syncStatus,
    connectionQuality,
    isDataFresh: isDataFresh(),
    forceSync,
    addPendingUpdate
  };
};

// Composant d'indicateur de statut de connexion
export const ConnectionStatus = ({ theme }) => {
  const { syncStatus, connectionQuality } = useChatSync();

  const getStatusColor = () => {
    if (!syncStatus.isOnline) return 'text-red-500';
    
    switch (connectionQuality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-green-400';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = () => {
    if (!syncStatus.isOnline) return 'Hors ligne';
    
    switch (connectionQuality) {
      case 'excellent': return 'Connexion excellente';
      case 'good': return 'Connexion stable';
      case 'fair': return 'Connexion lente';
      case 'poor': return 'Connexion instable';
      default: return 'Connexion inconnue';
    }
  };

  const getStatusIcon = () => {
    if (!syncStatus.isOnline) return '⚡';
    
    switch (connectionQuality) {
      case 'excellent': return '🟢';
      case 'good': return '🟡';
      case 'fair': return '🟠';
      case 'poor': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className={`flex items-center gap-1 text-xs ${getStatusColor()}`} title={getStatusText()}>
      <span>{getStatusIcon()}</span>
      {syncStatus.pendingUpdates > 0 && (
        <span className="bg-red-500 text-white px-1 rounded-full text-xs">
          {syncStatus.pendingUpdates}
        </span>
      )}
    </div>
  );
};

// Composant d'optimisation des performances
export const PerformanceOptimizer = ({ children }) => {
  const [isVisible, setIsVisible] = useState(true);
  const observerRef = useRef(null);

  useEffect(() => {
    // Optimisation basée sur l'intersection observer
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Réduction de la fréquence de rendu si pas visible
  if (!isVisible) {
    return <div className="opacity-50">{children}</div>;
  }

  return children;
};

export default syncManager;
