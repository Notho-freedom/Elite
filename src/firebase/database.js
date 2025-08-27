import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { 
  ref, 
  set, 
  push, 
  onValue, 
  off,
  update,
  remove
} from 'firebase/database';
import { db, rtdb } from './config';

export const databaseService = {
  // === CONVERSATIONS ===
  
  // Créer une nouvelle conversation
  async createConversation(participants, type = 'direct') {
    try {
      const conversationData = {
        participants: participants.sort(),
        type,
        createdAt: serverTimestamp(),
        lastMessage: null,
        lastMessageTime: null,
        unreadCount: {},
        metadata: {}
      };

      const docRef = await addDoc(collection(db, 'conversations'), conversationData);
      return docRef.id;
    } catch (error) {
      console.error('Erreur création conversation:', error);
      throw error;
    }
  },

  // Obtenir les conversations d'un utilisateur
  getConversations(userId, callback) {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId)
    );

    return onSnapshot(q, (snapshot) => {
      const conversations = [];
      snapshot.forEach((doc) => {
        conversations.push({
          id: doc.id,
          ...doc.data()
        });
      });
      // Trier côté client pour éviter l'index composite
      conversations.sort((a, b) => {
        const timeA = a.lastMessageTime?.toDate?.() || new Date(0);
        const timeB = b.lastMessageTime?.toDate?.() || new Date(0);
        return timeB - timeA;
      });
      callback(conversations);
    });
  },

  // === MESSAGES ===

  // Envoyer un message
  async sendMessage(conversationId, messageData) {
    try {
      const message = {
        ...messageData,
        conversationId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        reactions: [],
        readBy: [messageData.senderId],
        status: 'sent'
      };

      const docRef = await addDoc(collection(db, 'messages'), message);

      // Mettre à jour la conversation
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        lastMessage: messageData.text || 'Média',
        lastMessageTime: serverTimestamp(),
        [`unreadCount.${messageData.senderId}`]: 0
      });

      // Incrémenter le compteur de messages non lus pour les autres participants
      const conversationDoc = await getDoc(conversationRef);
      const participants = conversationDoc.data()?.participants || [];
      
      participants.forEach(participantId => {
        if (participantId !== messageData.senderId) {
          updateDoc(conversationRef, {
            [`unreadCount.${participantId}`]: increment(1)
          });
        }
      });

      return docRef.id;
    } catch (error) {
      console.error('Erreur envoi message:', error);
      throw error;
    }
  },

  // Obtenir les messages d'une conversation
  getMessages(conversationId, callback, limitCount = 50) {
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      limit(limitCount)
    );

    return onSnapshot(q, (snapshot) => {
      const messages = [];
      snapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data()
        });
      });
      // Trier côté client pour éviter l'index composite
      messages.sort((a, b) => {
        const timeA = a.createdAt?.toDate?.() || new Date(0);
        const timeB = b.createdAt?.toDate?.() || new Date(0);
        return timeA - timeB; // Ordre chronologique
      });
      callback(messages);
    });
  },

  // Marquer les messages comme lus
  async markMessagesAsRead(conversationId, userId) {
    try {
      const q = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId),
        where('senderId', '!=', userId),
        where('readBy', 'not-in', [[userId]])
      );

      const snapshot = await getDocs(q);
      const batch = [];

      snapshot.forEach((doc) => {
        batch.push(updateDoc(doc.ref, {
          readBy: arrayUnion(userId)
        }));
      });

      // Mettre à jour le compteur de messages non lus
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        [`unreadCount.${userId}`]: 0
      });

      await Promise.all(batch);
    } catch (error) {
      console.error('Erreur marquage messages lus:', error);
      throw error;
    }
  },

  // Ajouter une réaction à un message
  async addReaction(messageId, userId, reaction) {
    try {
      const messageRef = doc(db, 'messages', messageId);
      const messageDoc = await getDoc(messageRef);
      const reactions = messageDoc.data()?.reactions || [];

      const existingReactionIndex = reactions.findIndex(r => r.userId === userId);
      
      if (existingReactionIndex >= 0) {
        // Supprimer la réaction existante
        reactions.splice(existingReactionIndex, 1);
      } else {
        // Ajouter la nouvelle réaction
        reactions.push({ userId, reaction, timestamp: serverTimestamp() });
      }

      await updateDoc(messageRef, { reactions });
    } catch (error) {
      console.error('Erreur ajout réaction:', error);
      throw error;
    }
  },

  // === UTILISATEURS ===

  // Obtenir le profil d'un utilisateur
  async getUserProfile(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Erreur récupération profil:', error);
      throw error;
    }
  },

  // Mettre à jour le profil d'un utilisateur
  async updateUserProfile(userId, updates) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      throw error;
    }
  },

  // Mettre à jour le statut en ligne
  async updateOnlineStatus(userId, isOnline) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isOnline,
        lastSeen: serverTimestamp()
      });

      // Mettre à jour dans la Realtime Database pour la présence
      const presenceRef = ref(rtdb, `presence/${userId}`);
      if (isOnline) {
        await set(presenceRef, {
          online: true,
          lastSeen: new Date().toISOString()
        });
      } else {
        await remove(presenceRef);
      }
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      throw error;
    }
  },

  // Écouter la présence des utilisateurs
  listenToPresence(userIds, callback) {
    if (!userIds || userIds.length === 0) {
      return () => {}; // Retourner une fonction vide si pas d'utilisateurs
    }

    const presenceRefs = userIds.map(userId => ref(rtdb, `presence/${userId}`));
    const listeners = [];
    
    presenceRefs.forEach((presenceRef, index) => {
      try {
        const listener = onValue(presenceRef, (snapshot) => {
          const presence = snapshot.val();
          callback(userIds[index], presence);
        });
        listeners.push(listener);
      } catch (error) {
        console.error('Erreur lors de l\'écoute de la présence:', error);
      }
    });

    return () => {
      listeners.forEach(listener => {
        try {
          if (listener && typeof listener === 'function') {
            off(listener);
          }
        } catch (error) {
          console.error('Erreur lors de la fermeture du listener:', error);
        }
      });
    };
  },

  // === RECHERCHE ===

  // Rechercher des utilisateurs
  async searchUsers(query, currentUserId) {
    try {
      const q = query(
        collection(db, 'users'),
        where('displayName', '>=', query),
        where('displayName', '<=', query + '\uf8ff'),
        limit(20)
      );

      const snapshot = await getDocs(q);
      const users = [];
      
      snapshot.forEach((doc) => {
        if (doc.id !== currentUserId) {
          users.push({ id: doc.id, ...doc.data() });
        }
      });

      return users;
    } catch (error) {
      console.error('Erreur recherche utilisateurs:', error);
      throw error;
    }
  },

  // Obtenir tous les utilisateurs
  async getAllUsers() {
    try {
      const q = query(
        collection(db, 'users'),
        orderBy('displayName')
      );

      const snapshot = await getDocs(q);
      const users = [];
      
      snapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });

      return users;
    } catch (error) {
      console.error('Erreur récupération tous les utilisateurs:', error);
      // En cas d'erreur, retourner un tableau vide
      return [];
    }
  },

  // === NOTIFICATIONS ===

  // Créer une notification
  async createNotification(userId, notificationData) {
    try {
      const notification = {
        ...notificationData,
        userId,
        createdAt: serverTimestamp(),
        read: false
      };

      await addDoc(collection(db, 'notifications'), notification);
    } catch (error) {
      console.error('Erreur création notification:', error);
      throw error;
    }
  },

  // Obtenir les notifications d'un utilisateur
  getNotifications(userId, callback) {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = [];
      snapshot.forEach((doc) => {
        notifications.push({
          id: doc.id,
          ...doc.data()
        });
      });
      // Trier côté client pour éviter l'index composite
      notifications.sort((a, b) => {
        const timeA = a.createdAt?.toDate?.() || new Date(0);
        const timeB = b.createdAt?.toDate?.() || new Date(0);
        return timeB - timeA; // Ordre décroissant
      });
      callback(notifications);
    });
  },

  // Marquer une notification comme lue
  async markNotificationAsRead(notificationId) {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
    } catch (error) {
      console.error('Erreur marquage notification:', error);
      throw error;
    }
  }
};
