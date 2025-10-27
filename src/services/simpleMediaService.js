/**
 * 🎯 Service d'upload média SIMPLE et EFFICACE
 * Approche directe sans complications Vercel Blob
 */

export class SimpleMediaService {
  /**
   * 📤 Upload de fichier avec compression client-side uniquement
   */
  static async uploadFile(file, userId, options = {}) {
    try {
      console.log('🚀 DÉBUT UPLOAD SIMPLE - SimpleMediaService.uploadFile');
      console.log('📤 Fichier original:', { 
        name: file.name, 
        size: file.size, 
        type: file.type,
        sizeFormatted: this.formatFileSize(file.size)
      });

      // Compression locale et conversion en base64
      let processedFile = file;
      let compressionInfo = { compressed: false, originalSize: file.size };

      if (file.type.startsWith('image/') && file.size > 100 * 1024) { // > 100KB
        console.log('🗜️ Compression image locale...');
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
      }

      // Conversion en base64 pour stockage
      const base64Data = await this.fileToBase64(processedFile);
      
      // Génération du thumbnail
      let thumbnailBase64 = null;
      if (file.type.startsWith('image/')) {
        console.log('🖼️ Génération thumbnail...');
        try {
          const thumbnail = await this.generateThumbnail(file, {
            width: 150,
            height: 150,
            quality: 0.7
          });
          thumbnailBase64 = await this.fileToBase64(thumbnail);
          console.log('✅ Thumbnail généré');
        } catch (thumbError) {
          console.warn('⚠️ Erreur génération thumbnail:', thumbError);
        }
      }

      // Création d'un identifiant unique
      const mediaId = this.generateMediaId(userId);
      
      const result = {
        id: mediaId,
        url: base64Data, // URL de données base64
        type: file.type,
        size: processedFile.size,
        name: file.name,
        thumbnail: thumbnailBase64,
        provider: 'simple-base64',
        compression: compressionInfo,
        uploaded_at: new Date().toISOString()
      };

      console.log('🎯 Résultat SimpleMediaService:', {
        id: result.id,
        type: result.type,
        size: this.formatFileSize(result.size),
        compression: result.compression,
        hasThumbnail: !!result.thumbnail
      });

      return result;

    } catch (error) {
      console.error('❌ Erreur SimpleMediaService.uploadFile:', error);
      throw new Error(`Erreur upload simple: ${error.message}`);
    }
  }

  /**
   * 🗜️ Compression d'image client-side
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

          // Conversion en blob
          canvas.toBlob((blob) => {
            if (blob) {
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
   * 📄 Conversion fichier en base64
   */
  static async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * 🆔 Génération d'identifiant unique
   */
  static generateMediaId(userId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `media_${userId}_${timestamp}_${random}`;
  }

  /**
   * 📐 Calcul des dimensions optimales
   */
  static calculateOptimalDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
    let { width, height } = { width: originalWidth, height: originalHeight };

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
   * 🖼️ Affichage d'image base64 (utilitaire pour le rendu)
   */
  static renderBase64Image(base64Data, className = '', alt = '') {
    if (!base64Data || !base64Data.startsWith('data:')) {
      return null;
    }

    return {
      src: base64Data,
      className,
      alt,
      style: { maxWidth: '100%', height: 'auto' }
    };
  }

  /**
   * 📏 Validation de fichier
   */
  static validateFile(file, maxSize = 10 * 1024 * 1024) { // 10MB par défaut
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm',
      'audio/mp3', 'audio/wav', 'audio/ogg'
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Type de fichier non supporté: ${file.type}`);
    }

    if (file.size > maxSize) {
      throw new Error(`Fichier trop volumineux: ${this.formatFileSize(file.size)} (max: ${this.formatFileSize(maxSize)})`);
    }

    return true;
  }
}

export default SimpleMediaService;
