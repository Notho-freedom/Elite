/**
 * Point d'entrée centralisé pour tous les services backend
 * Export de tous les services pour une utilisation simplifiée
 */

// Services principaux
export { default as userService } from './userService';
export { default as messageService } from './messageService';
export { default as chatService } from './chatService';
export { default as discussionService } from './discussionService';
export { default as callService } from './callService';
export { default as statusService } from './statusService';
export { default as notificationService } from './notificationService';
export { default as mediaService } from './mediaService';
export { default as realtimeService } from './realtimeService';

// Réexport des fonctions utilitaires de Supabase
export { supabase, auth, db, calls } from '../lib/supabase';

/**
 * Initialiser tous les services nécessaires
 * @param {string} userId - ID de l'utilisateur connecté
 */
export async function initializeServices(userId) {
  try {
    console.log('🚀 Initialisation des services Elite...');

    // Initialiser le service temps réel (qui initialise les autres)
    const realtimeResult = await realtimeService.initialize(userId);
    if (!realtimeResult.success) {
      throw new Error(realtimeResult.error);
    }

    // Nettoyer les anciennes données
    await cleanupExpiredData();

    console.log('✅ Services Elite initialisés avec succès');
    return { success: true };

  } catch (error) {
    console.error('❌ Erreur initialisation services:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Nettoyer toutes les ressources des services
 */
export async function cleanupServices() {
  try {
    console.log('🧹 Nettoyage des services Elite...');

    // Nettoyer le service temps réel (nettoie les autres)
    await realtimeService.cleanup();

    console.log('✅ Services Elite nettoyés');
    return { success: true };

  } catch (error) {
    console.error('❌ Erreur nettoyage services:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Nettoyer les données expirées
 */
async function cleanupExpiredData() {
  try {
    // Nettoyer les statuts expirés
    await statusService.cleanupExpiredStatuses();

    // Nettoyer les notifications expirées
    await notificationService.cleanupExpiredNotifications();

    // Nettoyer les indicateurs de frappe expirés
    const { error } = await supabase.rpc('cleanup_expired_typing');
    if (error) {
      console.error('Erreur nettoyage indicateurs frappe:', error);
    }

  } catch (error) {
    console.error('Erreur nettoyage données expirées:', error);
  }
}

// Exporter un objet contenant tous les services pour un import groupé
export const services = {
  user: userService,
  message: messageService,
  chat: chatService,
  discussion: discussionService,
  call: callService,
  status: statusService,
  notification: notificationService,
  media: mediaService,
  realtime: realtimeService
};

// Configuration des intervalles de nettoyage
if (typeof window !== 'undefined') {
  // Nettoyer les données expirées toutes les 5 minutes
  setInterval(() => {
    cleanupExpiredData();
  }, 5 * 60 * 1000);

  // Gérer le nettoyage à la fermeture
  window.addEventListener('beforeunload', () => {
    cleanupServices();
  });
}

export default services;
