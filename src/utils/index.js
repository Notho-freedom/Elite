/**
 * Point d'entrée centralisé pour tous les utilitaires
 * Export des fonctions et classes utilitaires
 */

// Export des utilitaires de validation
export * from './validation';
export { default as validation } from './validation';

// Export des utilitaires d'erreur
export * from './errors';
export { default as errors } from './errors';

// Fonctions utilitaires générales

/**
 * Formater une date de manière conviviale
 * @param {string|Date} date - Date à formater
 */
export function formatDate(date) {
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      if (minutes === 0) {
        return 'À l\'instant';
      }
      return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  } else if (days === 1) {
    return 'Hier à ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (days < 7) {
    return d.toLocaleDateString([], { weekday: 'long' }) + ' à ' + 
           d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
    return d.toLocaleDateString([], { day: 'numeric', month: 'short' }) + ' à ' +
           d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}

/**
 * Formater un numéro de téléphone
 * @param {string} phone - Numéro de téléphone
 */
export function formatPhoneNumber(phone) {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    // Format français
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    // Format US/Canada
    return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4');
  } else {
    // Format international par défaut
    return '+' + cleaned;
  }
}

/**
 * Générer un ID unique
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Attendre un délai
 * @param {number} ms - Millisecondes à attendre
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Debounce une fonction
 * @param {Function} func - Fonction à debouncer
 * @param {number} wait - Délai en ms
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle une fonction
 * @param {Function} func - Fonction à throttler
 * @param {number} limit - Limite en ms
 */
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Tronquer un texte
 * @param {string} text - Texte à tronquer
 * @param {number} maxLength - Longueur maximale
 * @param {string} suffix - Suffixe à ajouter
 */
export function truncateText(text, maxLength = 100, suffix = '...') {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Extraire les URLs d'un texte
 * @param {string} text - Texte à analyser
 */
export function extractUrls(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
}

/**
 * Extraire les mentions d'un texte
 * @param {string} text - Texte à analyser
 */
export function extractMentions(text) {
  const mentionRegex = /@(\w+)/g;
  const matches = [];
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    matches.push({
      text: match[0],
      username: match[1],
      index: match.index
    });
  }
  
  return matches;
}

/**
 * Cloner un objet en profondeur
 * @param {*} obj - Objet à cloner
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (obj instanceof Object) {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

/**
 * Fusionner des objets en profondeur
 * @param {Object} target - Objet cible
 * @param {...Object} sources - Objets sources
 */
export function deepMerge(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
}

/**
 * Vérifier si une valeur est un objet
 * @param {*} item - Valeur à vérifier
 */
export function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Obtenir la taille d'un fichier formatée
 * @param {number} bytes - Taille en octets
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Vérifier si on est sur mobile
 */
export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Vérifier si on est sur iOS
 */
export function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

/**
 * Vérifier si on est sur Android
 */
export function isAndroid() {
  return /Android/.test(navigator.userAgent);
}

/**
 * Copier du texte dans le presse-papier
 * @param {string} text - Texte à copier
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback pour les anciens navigateurs
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (error) {
    console.error('Erreur copie presse-papier:', error);
    return false;
  }
}

/**
 * Télécharger un fichier
 * @param {string} url - URL du fichier
 * @param {string} filename - Nom du fichier
 */
export function downloadFile(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Obtenir les initiales d'un nom
 * @param {string} name - Nom complet
 */
export function getInitials(name) {
  if (!name) return '';
  
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * Générer une couleur à partir d'une chaîne
 * @param {string} str - Chaîne source
 */
export function stringToColor(str) {
  if (!str) return '#000000';
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  
  return color;
}

/**
 * Grouper des éléments par une clé
 * @param {Array} array - Tableau à grouper
 * @param {string|Function} key - Clé ou fonction de groupement
 */
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const group = typeof key === 'function' ? key(item) : item[key];
    if (!result[group]) result[group] = [];
    result[group].push(item);
    return result;
  }, {});
}

/**
 * Mélanger un tableau
 * @param {Array} array - Tableau à mélanger
 */
export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Classe pour gérer le stockage local
 */
export class LocalStorage {
  static get(key, defaultValue = null) {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Erreur lecture localStorage:', error);
      return defaultValue;
    }
  }

  static set(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Erreur écriture localStorage:', error);
      return false;
    }
  }

  static remove(key) {
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Erreur suppression localStorage:', error);
      return false;
    }
  }

  static clear() {
    try {
      window.localStorage.clear();
      return true;
    } catch (error) {
      console.error('Erreur nettoyage localStorage:', error);
      return false;
    }
  }
}

/**
 * Classe pour gérer les événements personnalisés
 */
export class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return () => this.off(event, listener);
  }

  off(event, listenerToRemove) {
    if (!this.events[event]) return;
    
    this.events[event] = this.events[event].filter(
      listener => listener !== listenerToRemove
    );
  }

  emit(event, data) {
    if (!this.events[event]) return;
    
    this.events[event].forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Erreur dans listener pour ${event}:`, error);
      }
    });
  }

  once(event, listener) {
    const onceWrapper = (data) => {
      listener(data);
      this.off(event, onceWrapper);
    };
    this.on(event, onceWrapper);
  }
}

// Export par défaut
export default {
  formatDate,
  formatPhoneNumber,
  generateId,
  sleep,
  debounce,
  throttle,
  truncateText,
  extractUrls,
  extractMentions,
  deepClone,
  deepMerge,
  isObject,
  formatFileSize,
  isMobile,
  isIOS,
  isAndroid,
  copyToClipboard,
  downloadFile,
  getInitials,
  stringToColor,
  groupBy,
  shuffleArray,
  LocalStorage,
  EventEmitter
};
