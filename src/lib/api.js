import axios from 'axios';
import { supabase } from './supabase.js';

// Configuration de l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Instance axios avec configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  async (config) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (error) {
      console.error('Erreur récupération token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      console.warn('Token expiré, redirection vers la connexion');
      // Vous pouvez ajouter ici la logique de déconnexion
    }
    return Promise.reject(error);
  }
);

// Services API

export const authAPI = {
  // Connexion
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Inscription
  register: async (email, password, name, username) => {
    const response = await api.post('/auth/register', { email, password, name, username });
    return response.data;
  },

  // Déconnexion
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Récupérer le profil
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Mettre à jour le profil
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  // Mettre à jour le statut
  updateStatus: async (status, isOnline) => {
    const response = await api.post('/auth/status', { status, is_online: isOnline });
    return response.data;
  }
};

export const discussionsAPI = {
  // Récupérer toutes les discussions
  getAll: async () => {
    const response = await api.get('/discussions');
    return response.data;
  },

  // Récupérer une discussion
  getById: async (id) => {
    const response = await api.get(`/discussions/${id}`);
    return response.data;
  },

  // Créer une discussion
  create: async (discussionData) => {
    const response = await api.post('/discussions', discussionData);
    return response.data;
  },

  // Mettre à jour une discussion
  update: async (id, updateData) => {
    const response = await api.put(`/discussions/${id}`, updateData);
    return response.data;
  },

  // Quitter une discussion
  leave: async (id) => {
    const response = await api.post(`/discussions/${id}/leave`);
    return response.data;
  },

  // Ajouter un participant
  addParticipant: async (id, userId, role = 'member') => {
    const response = await api.post(`/discussions/${id}/participants`, { user_id: userId, role });
    return response.data;
  },

  // Retirer un participant
  removeParticipant: async (id, userId) => {
    const response = await api.delete(`/discussions/${id}/participants/${userId}`);
    return response.data;
  }
};

export const messagesAPI = {
  // Récupérer les messages d'une discussion
  getByDiscussion: async (discussionId, options = {}) => {
    const { limit = 50, offset = 0, beforeId } = options;
    const params = new URLSearchParams({ limit, offset });
    if (beforeId) params.append('before_id', beforeId);
    
    const response = await api.get(`/messages/${discussionId}?${params}`);
    return response.data;
  },

  // Envoyer un message
  send: async (discussionId, messageData) => {
    const response = await api.post(`/messages/${discussionId}`, messageData);
    return response.data;
  },

  // Envoyer un message avec fichier
  sendWithFile: async (discussionId, messageData, file) => {
    const formData = new FormData();
    formData.append('content', messageData.content || '');
    formData.append('message_type', messageData.message_type || 'text');
    if (messageData.reply_to_id) {
      formData.append('reply_to_id', messageData.reply_to_id);
    }
    if (file) {
      formData.append('file', file);
    }

    const response = await api.post(`/messages/${discussionId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Modifier un message
  update: async (messageId, content) => {
    const response = await api.put(`/messages/${messageId}`, { content });
    return response.data;
  },

  // Supprimer un message
  delete: async (messageId) => {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  },

  // Ajouter une réaction
  addReaction: async (messageId, emoji) => {
    const response = await api.post(`/messages/${messageId}/reactions`, { emoji });
    return response.data;
  },

  // Supprimer une réaction
  removeReaction: async (messageId, emoji) => {
    const response = await api.delete(`/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`);
    return response.data;
  },

  // Marquer comme lu
  markAsRead: async (discussionId) => {
    const response = await api.post(`/messages/${discussionId}/read`);
    return response.data;
  }
};

export const usersAPI = {
  // Rechercher des utilisateurs
  search: async (query, limit = 10) => {
    const response = await api.get(`/users/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    return response.data;
  },

  // Récupérer tous les utilisateurs
  getAll: async (options = {}) => {
    const { limit = 50, status } = options;
    const params = new URLSearchParams({ limit });
    if (status) params.append('status', status);
    
    const response = await api.get(`/users?${params}`);
    return response.data;
  },

  // Récupérer un utilisateur
  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Récupérer les contacts
  getContacts: async () => {
    const response = await api.get('/users/me/contacts');
    return response.data;
  },

  // Récupérer les utilisateurs en ligne
  getOnlineUsers: async () => {
    const response = await api.get('/users/status/online');
    return response.data;
  },

  // Bloquer un utilisateur
  block: async (id) => {
    const response = await api.post(`/users/${id}/block`);
    return response.data;
  },

  // Débloquer un utilisateur
  unblock: async (id) => {
    const response = await api.delete(`/users/${id}/block`);
    return response.data;
  },

  // Signaler un utilisateur
  report: async (id, reason, details) => {
    const response = await api.post(`/users/${id}/report`, { reason, details });
    return response.data;
  }
};

// Fonction utilitaire pour vérifier la santé de l'API
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return { status: 'ok', data: response.data };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
};

// Fonction pour gérer les erreurs API
export const handleAPIError = (error) => {
  if (error.response) {
    // Erreur de réponse du serveur
    const { status, data } = error.response;
    return {
      type: 'server_error',
      status,
      message: data.error || 'Erreur du serveur',
      code: data.code
    };
  } else if (error.request) {
    // Erreur de réseau
    return {
      type: 'network_error',
      message: 'Erreur de connexion au serveur'
    };
  } else {
    // Autre erreur
    return {
      type: 'unknown_error',
      message: error.message || 'Erreur inconnue'
    };
  }
};

export default api;
