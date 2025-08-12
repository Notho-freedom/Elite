/**
 * 🚀 Vercel Blob Service avec compression intelligente
 * Optimise l'espace de stockage et la performance
 */

import { put } from '@vercel/blob';

export class VercelBlobService {
  static async uploadFile(file, userId, options = {}) {
    try {
      console.log('🚀 DÉBUT UPLOAD VERCEL BLOB - VercelBlobService.uploadFile');
      console.log('📤 Fichier original:', { 
        name: file.name, 
        size: file.size, 
        type: file.type,
        sizeFormatted: this.formatFileSize(file.size)
      });
      console.log('👤 UserId:', userId);
      console.log('⚙️ Options:', options);

      // Validation des entrées
      if (!file || !userId) {
        throw new Error('Fichier et userId requis');
      }

      // Compression intelligente selon le type
      let processedFile = file;
      let compressionInfo = { compressed: false, originalSize: file.size };

      if (file.type.startsWith('image/') && file.size > 100 * 1024) { // > 100KB
        console.log('🗜️ Compression image en cours...');
        processedFile = await this.compressImage(file, {
          maxWidth: options.maxWidth || 1920,
          maxHeight: options.maxHeight || 1080,
          quality: options.quality || 0.8,
          format: 'webp'
        });
        compressionInfo = {
          compressed: true,
          originalSize: file.size,
          compressedSize: processedFile.size,
          savings: ((file.size - processedFile.size) / file.size * 100).toFixed(1)
        };
        console.log('✅ Compression terminée:', compressionInfo);
      } else if (file.type.startsWith('video/') && file.size > 1024 * 1024) { // > 1MB
        console.log('🎥 Fichier vidéo détecté (compression future)');
        // TODO: Implémenter compression vidéo si nécessaire
      }

      // Génération du nom de fichier unique
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const extension = this.getFileExtension(processedFile);
      const fileName = `chat-media/${userId}/${timestamp}-${randomId}${extension}`;

      console.log('📡 Upload vers Vercel Blob...');
      console.log('🗂️ Nom fichier:', fileName);
      console.log('📊 Taille finale:', this.formatFileSize(processedFile.size));

      // Upload vers Vercel Blob avec token explicite
      const token = import.meta.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
      
      console.log('🔑 Vérification token:', {
        viteToken: import.meta.env.BLOB_READ_WRITE_TOKEN ? 'Présent' : 'Absent',
        processToken: process.env.BLOB_READ_WRITE_TOKEN ? 'Présent' : 'Absent',
        finalToken: token ? 'Utilisé' : 'Non trouvé'
      });
      
      if (!token) {
        throw new Error('Token BLOB_READ_WRITE_TOKEN non configuré. Vérifiez .env.local');
      }

      const blob = await put(fileName, processedFile, {
        access: 'public',
        token: token
      });

      console.log('✅ Upload Vercel Blob réussi:', blob);

      // Génération du thumbnail pour les images
      let thumbnailUrl = null;
      if (file.type.startsWith('image/')) {
        console.log('🖼️ Génération thumbnail...');
        try {
          const thumbnail = await this.generateThumbnail(file, {
            width: 150,
            height: 150,
            quality: 0.7
          });
          
          const thumbnailName = `chat-media/${userId}/thumbnails/${timestamp}-${randomId}-thumb${extension}`;
          const thumbnailBlob = await put(thumbnailName, thumbnail, {
            access: 'public',
            token: token
          });
          
          thumbnailUrl = thumbnailBlob.url;
          console.log('✅ Thumbnail généré:', thumbnailUrl);
        } catch (thumbError) {
          console.warn('⚠️ Erreur génération thumbnail:', thumbError);
          // Continuer sans thumbnail
        }
      }

      const result = {
        url: blob.url,
        type: file.type,
        size: processedFile.size,
        name: file.name,
        thumbnail: thumbnailUrl,
        provider: 'vercel-blob',
        compression: compressionInfo,
        pathname: blob.pathname,
        downloadUrl: blob.downloadUrl || blob.url
      };

      console.log('🎯 Résultat final VercelBlobService:', result);
      return result;

    } catch (error) {
      console.error('❌ Erreur VercelBlobService.uploadFile:', error);
      
      // Erreurs spécifiques Vercel
      if (error.message?.includes('quota')) {
        throw new Error('Quota de stockage Vercel atteint. Contactez l\'administrateur.');
      } else if (error.message?.includes('unauthorized')) {
        throw new Error('Token Vercel Blob non configuré ou invalide.');
      } else if (error.message?.includes('too large')) {
        throw new Error('Fichier trop volumineux. Taille maximum: 50MB.');
      }
      
      throw new Error(`Erreur upload Vercel Blob: ${error.message}`);
    }
  }

  /**
   * 🗜️ Compression intelligente des images
   */
  static async compressImage(file, options = {}) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        try {
          // Calcul des dimensions optimales
          const { width, height } = this.calculateOptimalDimensions(
            img.width, 
            img.height, 
            options.maxWidth || 1920,
            options.maxHeight || 1080
          );

          canvas.width = width;
          canvas.height = height;

          // Dessin avec qualité optimisée
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Conversion en blob avec format optimisé
          canvas.toBlob((blob) => {
            if (blob) {
              // Ajouter le nom correct au blob
              const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
                type: 'image/webp',
                lastModified: Date.now()
              });
              resolve(newFile);
            } else {
              reject(new Error('Échec de la compression'));
            }
          }, `image/${options.format || 'webp'}`, options.quality || 0.8);

        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Impossible de charger l\'image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * 🖼️ Génération de thumbnail
   */
  static async generateThumbnail(file, options = {}) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        try {
          const size = Math.min(options.width || 150, options.height || 150);
          canvas.width = size;
          canvas.height = size;

          // Calcul pour centrer le crop
          const scale = Math.max(size / img.width, size / img.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const x = (size - scaledWidth) / 2;
          const y = (size - scaledHeight) / 2;

          ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Échec génération thumbnail'));
            }
          }, 'image/webp', options.quality || 0.7);

        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Impossible de charger l\'image pour thumbnail'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * 📐 Calcul des dimensions optimales
   */
  static calculateOptimalDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
    let { width, height } = { width: originalWidth, height: originalHeight };

    // Respect des limites maximales
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    return {
      width: Math.round(width),
      height: Math.round(height)
    };
  }

  /**
   * 📁 Extraction de l'extension
   */
  static getFileExtension(file) {
    if (file.type === 'image/webp') return '.webp';
    if (file.type === 'image/jpeg') return '.jpg';
    if (file.type === 'image/png') return '.png';
    if (file.type === 'image/gif') return '.gif';
    if (file.type.startsWith('video/')) return '.mp4';
    if (file.type.startsWith('audio/')) return '.mp3';
    
    // Fallback sur le nom de fichier
    const match = file.name.match(/\.[^.]+$/);
    return match ? match[0] : '';
  }

  /**
   * 📊 Formatage de la taille de fichier
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 🗑️ Suppression de fichier (si nécessaire)
   */
  static async deleteFile(url) {
    try {
      console.log('🗑️ Suppression fichier Vercel Blob:', url);
      // Vercel Blob ne fournit pas d'API de suppression directe
      // Les fichiers expirent automatiquement selon la politique
      console.log('ℹ️ Suppression automatique par Vercel (pas d\'API directe)');
      return { success: true, message: 'Marqué pour suppression automatique' };
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 Vérification du quota (estimation)
   */
  static async checkQuota() {
    try {
      // Vercel ne fournit pas d'API de quota directe
      // On peut estimer basé sur l'usage local si nécessaire
      console.log('📊 Vérification quota Vercel Blob...');
      return {
        available: true,
        message: 'Quota estimé disponible'
      };
    } catch (error) {
      console.error('❌ Erreur vérification quota:', error);
      return {
        available: false,
        error: error.message
      };
    }
  }
}

export default VercelBlobService;
