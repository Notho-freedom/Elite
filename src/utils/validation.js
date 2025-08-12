/**
 * Utilitaires de validation et sanitisation pour Elite Chat
 * Sécurisation des entrées utilisateur
 */

import DOMPurify from 'dompurify';
import { securityConfig } from '../config';

/**
 * Valider une adresse email
 * @param {string} email - Email à valider
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email requis' };
  }

  const trimmedEmail = email.trim().toLowerCase();
  
  if (!securityConfig.validation.email.test(trimmedEmail)) {
    return { valid: false, error: 'Format d\'email invalide' };
  }

  if (trimmedEmail.length > 254) {
    return { valid: false, error: 'Email trop long' };
  }

  return { valid: true, value: trimmedEmail };
}

/**
 * Valider un nom d'utilisateur
 * @param {string} username - Nom d'utilisateur à valider
 */
export function validateUsername(username) {
  if (!username || typeof username !== 'string') {
    return { valid: false, error: 'Nom d\'utilisateur requis' };
  }

  const trimmedUsername = username.trim();
  
  if (!securityConfig.validation.username.test(trimmedUsername)) {
    return { valid: false, error: 'Le nom d\'utilisateur doit contenir 3-30 caractères alphanumériques ou _' };
  }

  return { valid: true, value: trimmedUsername };
}

/**
 * Valider un numéro de téléphone
 * @param {string} phone - Numéro à valider
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Numéro de téléphone requis' };
  }

  const cleanedPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  if (!securityConfig.validation.phone.test(cleanedPhone)) {
    return { valid: false, error: 'Format de téléphone invalide' };
  }

  return { valid: true, value: cleanedPhone };
}

/**
 * Valider un mot de passe
 * @param {string} password - Mot de passe à valider
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Mot de passe requis' };
  }

  const errors = [];

  if (password.length < 8) {
    errors.push('Au moins 8 caractères');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Au moins une minuscule');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Au moins une majuscule');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Au moins un chiffre');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Au moins un caractère spécial');
  }

  if (errors.length > 0) {
    return { valid: false, error: errors.join(', ') };
  }

  return { valid: true };
}

/**
 * Valider un nom
 * @param {string} name - Nom à valider
 */
export function validateName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Nom requis' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return { valid: false, error: 'Le nom doit contenir au moins 2 caractères' };
  }

  if (trimmedName.length > 100) {
    return { valid: false, error: 'Le nom est trop long' };
  }

  // Vérifier les caractères interdits
  if (/[<>\"\'\/\\]/.test(trimmedName)) {
    return { valid: false, error: 'Le nom contient des caractères non autorisés' };
  }

  return { valid: true, value: trimmedName };
}

/**
 * Valider le contenu d'un message
 * @param {string} content - Contenu à valider
 */
export function validateMessageContent(content) {
  if (!content || typeof content !== 'string') {
    return { valid: false, error: 'Message vide' };
  }

  const trimmedContent = content.trim();

  if (trimmedContent.length === 0) {
    return { valid: false, error: 'Message vide' };
  }

  if (trimmedContent.length > 5000) {
    return { valid: false, error: 'Message trop long (max 5000 caractères)' };
  }

  return { valid: true, value: trimmedContent };
}

/**
 * Sanitiser du HTML
 * @param {string} html - HTML à nettoyer
 * @param {Object} options - Options de sanitisation
 */
export function sanitizeHTML(html, options = {}) {
  const config = {
    ALLOWED_TAGS: options.allowedTags || securityConfig.sanitization.allowedTags,
    ALLOWED_ATTR: options.allowedAttributes || securityConfig.sanitization.allowedAttributes,
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true
  };

  return DOMPurify.sanitize(html, config);
}

/**
 * Sanitiser du texte pour affichage
 * @param {string} text - Texte à nettoyer
 */
export function sanitizeText(text) {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Valider une URL
 * @param {string} url - URL à valider
 */
export function validateURL(url) {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL requise' };
  }

  try {
    const urlObj = new URL(url);
    
    // Vérifier les protocoles autorisés
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { valid: false, error: 'Protocole non autorisé' };
    }

    return { valid: true, value: urlObj.href };
  } catch (error) {
    return { valid: false, error: 'URL invalide' };
  }
}

/**
 * Valider un UUID
 * @param {string} uuid - UUID à valider
 */
export function validateUUID(uuid) {
  if (!uuid || typeof uuid !== 'string') {
    return { valid: false, error: 'UUID requis' };
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(uuid)) {
    return { valid: false, error: 'Format UUID invalide' };
  }

  return { valid: true, value: uuid.toLowerCase() };
}

/**
 * Valider un fichier
 * @param {File} file - Fichier à valider
 * @param {Object} options - Options de validation
 */
export function validateFile(file, options = {}) {
  if (!file || !(file instanceof File)) {
    return { valid: false, error: 'Fichier requis' };
  }

  const {
    maxSize = 50 * 1024 * 1024, // 50MB par défaut
    allowedTypes = [],
    allowedExtensions = []
  } = options;

  // Vérifier la taille
  if (file.size > maxSize) {
    const sizeMB = Math.round(maxSize / 1024 / 1024);
    return { valid: false, error: `Fichier trop volumineux (max ${sizeMB}MB)` };
  }

  // Vérifier le type MIME
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Type de fichier non autorisé' };
  }

  // Vérifier l'extension
  if (allowedExtensions.length > 0) {
    const extension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      return { valid: false, error: 'Extension de fichier non autorisée' };
    }
  }

  return { valid: true };
}

/**
 * Détecter et prévenir les injections SQL
 * @param {string} input - Entrée à vérifier
 */
export function detectSQLInjection(input) {
  if (!input || typeof input !== 'string') return false;

  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|#|\/\*|\*\/)/,
    /(\bOR\b\s*\d+\s*=\s*\d+)/i,
    /(\bAND\b\s*\d+\s*=\s*\d+)/i,
    /(\'|\"|;|\\)/
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Détecter et prévenir les attaques XSS
 * @param {string} input - Entrée à vérifier
 */
export function detectXSS(input) {
  if (!input || typeof input !== 'string') return false;

  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<img[^>]*onerror\s*=/gi,
    /<svg[^>]*onload\s*=/gi
  ];

  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * Limiter le taux de requêtes
 */
export class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  /**
   * Vérifier si une requête est autorisée
   * @param {string} key - Clé unique (ex: userId)
   */
  checkLimit(key) {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];

    // Nettoyer les anciennes requêtes
    const validRequests = userRequests.filter(
      timestamp => now - timestamp < this.windowMs
    );

    if (validRequests.length >= this.maxRequests) {
      return {
        allowed: false,
        resetIn: this.windowMs - (now - validRequests[0])
      };
    }

    // Ajouter la nouvelle requête
    validRequests.push(now);
    this.requests.set(key, validRequests);

    return {
      allowed: true,
      remaining: this.maxRequests - validRequests.length
    };
  }

  /**
   * Réinitialiser les limites pour une clé
   * @param {string} key - Clé à réinitialiser
   */
  reset(key) {
    this.requests.delete(key);
  }

  /**
   * Nettoyer toutes les données expirées
   */
  cleanup() {
    const now = Date.now();
    
    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(
        timestamp => now - timestamp < this.windowMs
      );
      
      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    }
  }
}

// Instances de rate limiters
export const rateLimiters = {
  messages: new RateLimiter(
    securityConfig.rateLimit.messages.max,
    securityConfig.rateLimit.messages.window
  ),
  uploads: new RateLimiter(
    securityConfig.rateLimit.uploads.max,
    securityConfig.rateLimit.uploads.window
  ),
  calls: new RateLimiter(
    securityConfig.rateLimit.calls.max,
    securityConfig.rateLimit.calls.window
  )
};

// Nettoyer périodiquement les rate limiters
setInterval(() => {
  Object.values(rateLimiters).forEach(limiter => limiter.cleanup());
}, 60000); // Toutes les minutes

/**
 * Créer un validateur personnalisé
 * @param {Array} rules - Règles de validation
 */
export function createValidator(rules) {
  return function validate(data) {
    const errors = {};
    const validated = {};

    for (const rule of rules) {
      const { field, validator, required = true, transform } = rule;
      const value = data[field];

      if (!value && required) {
        errors[field] = `${field} est requis`;
        continue;
      }

      if (value && validator) {
        const result = validator(value);
        if (!result.valid) {
          errors[field] = result.error;
        } else {
          validated[field] = transform ? transform(result.value || value) : (result.value || value);
        }
      } else if (value) {
        validated[field] = transform ? transform(value) : value;
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
      data: validated
    };
  };
}

// Export des validateurs prédéfinis
export const validators = {
  email: validateEmail,
  username: validateUsername,
  phone: validatePhone,
  password: validatePassword,
  name: validateName,
  message: validateMessageContent,
  url: validateURL,
  uuid: validateUUID,
  file: validateFile
};

export default {
  validators,
  sanitizeHTML,
  sanitizeText,
  detectSQLInjection,
  detectXSS,
  RateLimiter,
  rateLimiters,
  createValidator
};
