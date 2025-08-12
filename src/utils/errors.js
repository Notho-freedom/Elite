/**
 * Gestion centralisée des erreurs pour Elite Chat
 * Classes d'erreurs personnalisées et gestionnaire global
 */

/**
 * Classe de base pour les erreurs Elite
 */
export class EliteError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', details = {}) {
    super(message);
    this.name = 'EliteError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

/**
 * Erreur d'authentification
 */
export class AuthError extends EliteError {
  constructor(message, code = 'AUTH_ERROR', details = {}) {
    super(message, code, details);
    this.name = 'AuthError';
  }
}

/**
 * Erreur de validation
 */
export class ValidationError extends EliteError {
  constructor(message, code = 'VALIDATION_ERROR', details = {}) {
    super(message, code, details);
    this.name = 'ValidationError';
  }
}

/**
 * Erreur de permission
 */
export class PermissionError extends EliteError {
  constructor(message, code = 'PERMISSION_ERROR', details = {}) {
    super(message, code, details);
    this.name = 'PermissionError';
  }
}

/**
 * Erreur réseau
 */
export class NetworkError extends EliteError {
  constructor(message, code = 'NETWORK_ERROR', details = {}) {
    super(message, code, details);
    this.name = 'NetworkError';
  }
}

/**
 * Erreur de limite de taux
 */
export class RateLimitError extends EliteError {
  constructor(message, code = 'RATE_LIMIT_ERROR', details = {}) {
    super(message, code, details);
    this.name = 'RateLimitError';
  }
}

/**
 * Erreur de média
 */
export class MediaError extends EliteError {
  constructor(message, code = 'MEDIA_ERROR', details = {}) {
    super(message, code, details);
    this.name = 'MediaError';
  }
}

/**
 * Erreur d'appel
 */
export class CallError extends EliteError {
  constructor(message, code = 'CALL_ERROR', details = {}) {
    super(message, code, details);
    this.name = 'CallError';
  }
}

/**
 * Codes d'erreur standardisés
 */
export const ERROR_CODES = {
  // Authentification
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED',
  AUTH_USER_NOT_FOUND: 'AUTH_USER_NOT_FOUND',
  AUTH_EMAIL_NOT_VERIFIED: 'AUTH_EMAIL_NOT_VERIFIED',
  AUTH_ACCOUNT_DISABLED: 'AUTH_ACCOUNT_DISABLED',
  
  // Validation
  VALIDATION_REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
  VALIDATION_TOO_LONG: 'VALIDATION_TOO_LONG',
  VALIDATION_TOO_SHORT: 'VALIDATION_TOO_SHORT',
  
  // Permissions
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  PERMISSION_INSUFFICIENT_ROLE: 'PERMISSION_INSUFFICIENT_ROLE',
  PERMISSION_NOT_MEMBER: 'PERMISSION_NOT_MEMBER',
  
  // Réseau
  NETWORK_OFFLINE: 'NETWORK_OFFLINE',
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  NETWORK_SERVER_ERROR: 'NETWORK_SERVER_ERROR',
  
  // Limites
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  
  // Médias
  MEDIA_UPLOAD_FAILED: 'MEDIA_UPLOAD_FAILED',
  MEDIA_TOO_LARGE: 'MEDIA_TOO_LARGE',
  MEDIA_INVALID_TYPE: 'MEDIA_INVALID_TYPE',
  
  // Appels
  CALL_PEER_UNAVAILABLE: 'CALL_PEER_UNAVAILABLE',
  CALL_MEDIA_ACCESS_DENIED: 'CALL_MEDIA_ACCESS_DENIED',
  CALL_CONNECTION_FAILED: 'CALL_CONNECTION_FAILED',
  
  // Autres
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  OPERATION_FAILED: 'OPERATION_FAILED',
  INVALID_STATE: 'INVALID_STATE'
};

/**
 * Messages d'erreur par défaut
 */
export const ERROR_MESSAGES = {
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: 'Email ou mot de passe incorrect',
  [ERROR_CODES.AUTH_SESSION_EXPIRED]: 'Votre session a expiré. Veuillez vous reconnecter',
  [ERROR_CODES.AUTH_USER_NOT_FOUND]: 'Utilisateur introuvable',
  [ERROR_CODES.AUTH_EMAIL_NOT_VERIFIED]: 'Veuillez vérifier votre email',
  [ERROR_CODES.AUTH_ACCOUNT_DISABLED]: 'Ce compte a été désactivé',
  
  [ERROR_CODES.VALIDATION_REQUIRED_FIELD]: 'Ce champ est requis',
  [ERROR_CODES.VALIDATION_INVALID_FORMAT]: 'Format invalide',
  [ERROR_CODES.VALIDATION_TOO_LONG]: 'Trop long',
  [ERROR_CODES.VALIDATION_TOO_SHORT]: 'Trop court',
  
  [ERROR_CODES.PERMISSION_DENIED]: 'Permission refusée',
  [ERROR_CODES.PERMISSION_INSUFFICIENT_ROLE]: 'Rôle insuffisant pour cette action',
  [ERROR_CODES.PERMISSION_NOT_MEMBER]: 'Vous n\'êtes pas membre de cette discussion',
  
  [ERROR_CODES.NETWORK_OFFLINE]: 'Aucune connexion internet',
  [ERROR_CODES.NETWORK_TIMEOUT]: 'La requête a expiré',
  [ERROR_CODES.NETWORK_SERVER_ERROR]: 'Erreur serveur',
  
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Trop de requêtes. Veuillez patienter',
  [ERROR_CODES.QUOTA_EXCEEDED]: 'Quota dépassé',
  
  [ERROR_CODES.MEDIA_UPLOAD_FAILED]: 'Échec de l\'upload',
  [ERROR_CODES.MEDIA_TOO_LARGE]: 'Fichier trop volumineux',
  [ERROR_CODES.MEDIA_INVALID_TYPE]: 'Type de fichier non supporté',
  
  [ERROR_CODES.CALL_PEER_UNAVAILABLE]: 'Correspondant indisponible',
  [ERROR_CODES.CALL_MEDIA_ACCESS_DENIED]: 'Accès au micro/caméra refusé',
  [ERROR_CODES.CALL_CONNECTION_FAILED]: 'Échec de la connexion',
  
  [ERROR_CODES.NOT_FOUND]: 'Ressource introuvable',
  [ERROR_CODES.ALREADY_EXISTS]: 'Existe déjà',
  [ERROR_CODES.OPERATION_FAILED]: 'L\'opération a échoué',
  [ERROR_CODES.INVALID_STATE]: 'État invalide'
};

/**
 * Gestionnaire global d'erreurs
 */
export class ErrorHandler {
  constructor() {
    this.handlers = new Map();
    this.defaultHandler = this.logError.bind(this);
  }

  /**
   * Enregistrer un gestionnaire pour un type d'erreur
   * @param {string} errorType - Type d'erreur (nom de classe)
   * @param {Function} handler - Fonction de gestion
   */
  register(errorType, handler) {
    this.handlers.set(errorType, handler);
  }

  /**
   * Gérer une erreur
   * @param {Error} error - Erreur à gérer
   * @param {Object} context - Contexte additionnel
   */
  async handle(error, context = {}) {
    try {
      // Logger l'erreur
      this.logError(error, context);

      // Trouver le gestionnaire approprié
      const handler = this.handlers.get(error.constructor.name) || this.defaultHandler;
      
      // Appeler le gestionnaire
      await handler(error, context);

      // Notifier l'UI si nécessaire
      if (this.shouldNotifyUI(error)) {
        this.notifyUI(error);
      }

      // Envoyer au serveur si nécessaire
      if (this.shouldReportToServer(error)) {
        await this.reportToServer(error, context);
      }

    } catch (handlerError) {
      console.error('Erreur dans le gestionnaire d\'erreurs:', handlerError);
    }
  }

  /**
   * Logger une erreur
   * @param {Error} error - Erreur à logger
   * @param {Object} context - Contexte
   */
  logError(error, context) {
    const errorInfo = {
      name: error.name,
      message: error.message,
      code: error.code,
      details: error.details,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.error('Elite Error:', errorInfo);
  }

  /**
   * Déterminer si l'UI doit être notifiée
   * @param {Error} error - Erreur
   */
  shouldNotifyUI(error) {
    // Ne pas notifier pour certaines erreurs silencieuses
    const silentErrors = ['NETWORK_OFFLINE', 'RATE_LIMIT_EXCEEDED'];
    return !silentErrors.includes(error.code);
  }

  /**
   * Notifier l'interface utilisateur
   * @param {Error} error - Erreur
   */
  notifyUI(error) {
    window.dispatchEvent(new CustomEvent('eliteError', {
      detail: {
        type: error.name,
        message: this.getUserFriendlyMessage(error),
        code: error.code,
        severity: this.getErrorSeverity(error)
      }
    }));
  }

  /**
   * Obtenir un message convivial pour l'utilisateur
   * @param {Error} error - Erreur
   */
  getUserFriendlyMessage(error) {
    // Utiliser le message par défaut si disponible
    if (error.code && ERROR_MESSAGES[error.code]) {
      return ERROR_MESSAGES[error.code];
    }

    // Messages génériques par type
    const genericMessages = {
      'AuthError': 'Erreur d\'authentification',
      'ValidationError': 'Données invalides',
      'PermissionError': 'Permission refusée',
      'NetworkError': 'Erreur de connexion',
      'RateLimitError': 'Trop de requêtes',
      'MediaError': 'Erreur média',
      'CallError': 'Erreur d\'appel'
    };

    return genericMessages[error.name] || 'Une erreur est survenue';
  }

  /**
   * Obtenir la sévérité de l'erreur
   * @param {Error} error - Erreur
   */
  getErrorSeverity(error) {
    if (error instanceof AuthError || error instanceof PermissionError) {
      return 'high';
    }
    if (error instanceof ValidationError || error instanceof RateLimitError) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Déterminer si l'erreur doit être reportée au serveur
   * @param {Error} error - Erreur
   */
  shouldReportToServer(error) {
    // Ne pas reporter les erreurs de validation ou de limite
    if (error instanceof ValidationError || error instanceof RateLimitError) {
      return false;
    }
    
    // Ne pas reporter en développement
    if (import.meta.env.DEV) {
      return false;
    }

    return true;
  }

  /**
   * Reporter l'erreur au serveur
   * @param {Error} error - Erreur
   * @param {Object} context - Contexte
   */
  async reportToServer(error, context) {
    try {
      // TODO: Implémenter l'envoi au serveur de logging
      console.log('Erreur à reporter:', error.toJSON ? error.toJSON() : error);
    } catch (err) {
      console.error('Impossible de reporter l\'erreur:', err);
    }
  }
}

// Instance globale du gestionnaire d'erreurs
export const errorHandler = new ErrorHandler();

// Enregistrer les gestionnaires spécifiques
errorHandler.register('AuthError', async (error) => {
  // Rediriger vers la page de connexion si session expirée
  if (error.code === ERROR_CODES.AUTH_SESSION_EXPIRED) {
    window.location.href = '/login';
  }
});

errorHandler.register('NetworkError', async (error) => {
  // Afficher un indicateur hors ligne
  if (error.code === ERROR_CODES.NETWORK_OFFLINE) {
    window.dispatchEvent(new Event('offline'));
  }
});

errorHandler.register('RateLimitError', async (error) => {
  // Afficher le temps d'attente
  const resetIn = error.details.resetIn || 60000;
  const minutes = Math.ceil(resetIn / 60000);
  
  window.dispatchEvent(new CustomEvent('eliteNotification', {
    detail: {
      type: 'warning',
      message: `Veuillez patienter ${minutes} minute${minutes > 1 ? 's' : ''} avant de réessayer`,
      duration: 5000
    }
  }));
});

// Capturer les erreurs non gérées
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Promesse rejetée non gérée:', event.reason);
    errorHandler.handle(new EliteError(
      'Erreur inattendue',
      'UNHANDLED_REJECTION',
      { reason: event.reason }
    ));
  });

  window.addEventListener('error', (event) => {
    console.error('Erreur JavaScript:', event.error);
    errorHandler.handle(new EliteError(
      event.message,
      'JAVASCRIPT_ERROR',
      { 
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    ));
  });
}

/**
 * Fonction utilitaire pour créer des erreurs typées
 * @param {string} type - Type d'erreur
 * @param {string} message - Message
 * @param {string} code - Code d'erreur
 * @param {Object} details - Détails
 */
export function createError(type, message, code, details = {}) {
  const errorClasses = {
    auth: AuthError,
    validation: ValidationError,
    permission: PermissionError,
    network: NetworkError,
    rateLimit: RateLimitError,
    media: MediaError,
    call: CallError
  };

  const ErrorClass = errorClasses[type] || EliteError;
  return new ErrorClass(message, code, details);
}

// Export par défaut
export default {
  EliteError,
  AuthError,
  ValidationError,
  PermissionError,
  NetworkError,
  RateLimitError,
  MediaError,
  CallError,
  ERROR_CODES,
  ERROR_MESSAGES,
  errorHandler,
  createError
};
