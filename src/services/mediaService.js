import { supabase } from '../lib/supabase';

/**
 * Service pour la gestion des médias (upload, stockage, thumbnails)
 * Compatible avec le schéma database_schema_updated.sql
 */
class MediaService {
  constructor() {
    this.maxFileSize = 50 * 1024 * 1024; // 50MB par défaut
    this.allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    this.allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    this.allowedAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'];
    this.allowedDocumentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];
  }

  /**
   * Upload un fichier média
   * @param {File} file - Fichier à uploader
   * @param {string} userId - ID de l'utilisateur
   * @param {string} context - Contexte d'upload ('message', 'avatar', 'status', etc.)
   */
  async uploadMedia(file, userId, context = 'message') {
    try {
      console.log('🔄 Upload média:', file.name, file.type, file.size);

      // Valider le fichier
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Générer un nom unique pour le fichier
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${context}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Déterminer le bucket selon le type
      const bucket = this.getBucketName(validation.mediaType);

      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false
        });

      if (error) {
        console.error('❌ Erreur upload:', error);
        return { success: false, error: error.message };
      }

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      // Générer une miniature si c'est une image ou vidéo
      let thumbnailUrl = null;
      if (validation.mediaType === 'image') {
        thumbnailUrl = await this.generateImageThumbnail(file, userId, context);
      } else if (validation.mediaType === 'video') {
        thumbnailUrl = await this.generateVideoThumbnail(file, userId, context);
      }

      const result = {
        url: publicUrl,
        thumbnailUrl,
        fileName: file.name,
        fileSize: file.size,
        mediaType: validation.mediaType,
        mimeType: file.type,
        path: data.path
      };

      console.log('✅ Upload réussi:', result.url);
      return { success: true, data: result };

    } catch (error) {
      console.error('❌ Erreur dans uploadMedia:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Upload plusieurs fichiers
   * @param {FileList} files - Liste de fichiers
   * @param {string} userId - ID de l'utilisateur
   * @param {string} context - Contexte d'upload
   */
  async uploadMultipleMedia(files, userId, context = 'message') {
    try {
      const uploadPromises = Array.from(files).map(file => 
        this.uploadMedia(file, userId, context)
      );

      const results = await Promise.all(uploadPromises);
      
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      return {
        success: failed.length === 0,
        uploaded: successful.map(r => r.data),
        failed: failed.map(r => ({ fileName: r.fileName, error: r.error }))
      };

    } catch (error) {
      console.error('❌ Erreur dans uploadMultipleMedia:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Supprimer un média
   * @param {string} mediaPath - Chemin du média dans le bucket
   * @param {string} mediaType - Type de média
   */
  async deleteMedia(mediaPath, mediaType) {
    try {
      const bucket = this.getBucketName(mediaType);

      const { error } = await supabase.storage
        .from(bucket)
        .remove([mediaPath]);

      if (error) {
        console.error('❌ Erreur suppression média:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Média supprimé:', mediaPath);
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur dans deleteMedia:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Valider un fichier avant upload
   * @param {File} file - Fichier à valider
   */
  validateFile(file) {
    // Vérifier la taille
    if (file.size > this.maxFileSize) {
      return {
        valid: false,
        error: `Le fichier est trop volumineux. Taille maximale: ${this.maxFileSize / 1024 / 1024}MB`
      };
    }

    // Déterminer le type de média
    let mediaType = null;
    if (this.allowedImageTypes.includes(file.type)) {
      mediaType = 'image';
    } else if (this.allowedVideoTypes.includes(file.type)) {
      mediaType = 'video';
    } else if (this.allowedAudioTypes.includes(file.type)) {
      mediaType = 'audio';
    } else if (this.allowedDocumentTypes.includes(file.type)) {
      mediaType = 'document';
    } else {
      return {
        valid: false,
        error: `Type de fichier non supporté: ${file.type}`
      };
    }

    return { valid: true, mediaType };
  }

  /**
   * Obtenir le nom du bucket selon le type de média
   * @param {string} mediaType - Type de média
   */
  getBucketName(mediaType) {
    const buckets = {
      'image': 'images',
      'video': 'videos',
      'audio': 'audio',
      'document': 'documents'
    };
    return buckets[mediaType] || 'files';
  }

  /**
   * Générer une miniature pour une image
   * @param {File} imageFile - Fichier image
   * @param {string} userId - ID de l'utilisateur
   * @param {string} context - Contexte
   */
  async generateImageThumbnail(imageFile, userId, context) {
    try {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          const img = new Image();
          
          img.onload = async () => {
            // Créer un canvas pour la miniature
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Définir les dimensions de la miniature (max 200px)
            const maxSize = 200;
            let width = img.width;
            let height = img.height;
            
            if (width > height) {
              if (width > maxSize) {
                height = (height * maxSize) / width;
                width = maxSize;
              }
            } else {
              if (height > maxSize) {
                width = (width * maxSize) / height;
                height = maxSize;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Dessiner l'image redimensionnée
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convertir en blob
            canvas.toBlob(async (blob) => {
              if (!blob) {
                resolve(null);
                return;
              }
              
              // Créer un fichier à partir du blob
              const thumbnailFile = new File([blob], `thumb_${imageFile.name}`, {
                type: 'image/jpeg'
              });
              
              // Upload la miniature
              const fileName = `${userId}/${context}/thumbnails/${Date.now()}_thumb.jpg`;
              
              const { data, error } = await supabase.storage
                .from('thumbnails')
                .upload(fileName, thumbnailFile);
              
              if (error) {
                console.error('❌ Erreur upload miniature:', error);
                resolve(null);
                return;
              }
              
              const { data: { publicUrl } } = supabase.storage
                .from('thumbnails')
                .getPublicUrl(fileName);
              
              resolve(publicUrl);
            }, 'image/jpeg', 0.8);
          };
          
          img.onerror = () => {
            console.error('❌ Erreur chargement image pour miniature');
            resolve(null);
          };
          
          img.src = e.target.result;
        };
        
        reader.onerror = () => {
          console.error('❌ Erreur lecture fichier pour miniature');
          resolve(null);
        };
        
        reader.readAsDataURL(imageFile);
      });

    } catch (error) {
      console.error('❌ Erreur génération miniature image:', error);
      return null;
    }
  }

  /**
   * Générer une miniature pour une vidéo
   * @param {File} videoFile - Fichier vidéo
   * @param {string} userId - ID de l'utilisateur
   * @param {string} context - Contexte
   */
  async generateVideoThumbnail(videoFile, userId, context) {
    try {
      return new Promise((resolve) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        video.onloadedmetadata = () => {
          // Aller à 1 seconde dans la vidéo
          video.currentTime = Math.min(1, video.duration / 2);
        };
        
        video.onseeked = async () => {
          // Définir les dimensions
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          // Capturer l'image
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Convertir en blob
          canvas.toBlob(async (blob) => {
            if (!blob) {
              resolve(null);
              return;
            }
            
            // Créer un fichier
            const thumbnailFile = new File([blob], `thumb_${videoFile.name}.jpg`, {
              type: 'image/jpeg'
            });
            
            // Upload
            const fileName = `${userId}/${context}/thumbnails/${Date.now()}_video_thumb.jpg`;
            
            const { data, error } = await supabase.storage
              .from('thumbnails')
              .upload(fileName, thumbnailFile);
            
            if (error) {
              console.error('❌ Erreur upload miniature vidéo:', error);
              resolve(null);
              return;
            }
            
            const { data: { publicUrl } } = supabase.storage
              .from('thumbnails')
              .getPublicUrl(fileName);
            
            resolve(publicUrl);
          }, 'image/jpeg', 0.8);
        };
        
        video.onerror = () => {
          console.error('❌ Erreur chargement vidéo pour miniature');
          resolve(null);
        };
        
        // Créer l'URL de la vidéo
        video.src = URL.createObjectURL(videoFile);
      });

    } catch (error) {
      console.error('❌ Erreur génération miniature vidéo:', error);
      return null;
    }
  }

  /**
   * Optimiser une image avant upload
   * @param {File} imageFile - Fichier image
   * @param {Object} options - Options d'optimisation
   */
  async optimizeImage(imageFile, options = {}) {
    try {
      const {
        maxWidth = 1920,
        maxHeight = 1080,
        quality = 0.85
      } = options;

      return new Promise((resolve) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          const img = new Image();
          
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            let width = img.width;
            let height = img.height;
            
            // Redimensionner si nécessaire
            if (width > maxWidth || height > maxHeight) {
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              width *= ratio;
              height *= ratio;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob((blob) => {
              if (!blob) {
                resolve(imageFile); // Retourner l'original en cas d'erreur
                return;
              }
              
              const optimizedFile = new File([blob], imageFile.name, {
                type: blob.type,
                lastModified: Date.now()
              });
              
              resolve(optimizedFile);
            }, imageFile.type, quality);
          };
          
          img.onerror = () => {
            resolve(imageFile); // Retourner l'original en cas d'erreur
          };
          
          img.src = e.target.result;
        };
        
        reader.onerror = () => {
          resolve(imageFile); // Retourner l'original en cas d'erreur
        };
        
        reader.readAsDataURL(imageFile);
      });

    } catch (error) {
      console.error('❌ Erreur optimisation image:', error);
      return imageFile; // Retourner l'original en cas d'erreur
    }
  }

  /**
   * Obtenir les métadonnées d'un fichier
   * @param {File} file - Fichier
   */
  async getFileMetadata(file) {
    const metadata = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified),
      humanSize: this.formatFileSize(file.size)
    };

    // Métadonnées spécifiques pour les images
    if (file.type.startsWith('image/')) {
      try {
        const dimensions = await this.getImageDimensions(file);
        metadata.width = dimensions.width;
        metadata.height = dimensions.height;
      } catch (error) {
        console.error('Erreur obtention dimensions image:', error);
      }
    }

    // Métadonnées spécifiques pour les vidéos
    if (file.type.startsWith('video/')) {
      try {
        const videoData = await this.getVideoMetadata(file);
        metadata.duration = videoData.duration;
        metadata.width = videoData.width;
        metadata.height = videoData.height;
      } catch (error) {
        console.error('Erreur obtention métadonnées vidéo:', error);
      }
    }

    return metadata;
  }

  /**
   * Obtenir les dimensions d'une image
   * @param {File} imageFile - Fichier image
   */
  getImageDimensions(imageFile) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(imageFile);
    });
  }

  /**
   * Obtenir les métadonnées d'une vidéo
   * @param {File} videoFile - Fichier vidéo
   */
  getVideoMetadata(videoFile) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        resolve({
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight
        });
      };
      video.onerror = reject;
      video.src = URL.createObjectURL(videoFile);
    });
  }

  /**
   * Formater la taille d'un fichier
   * @param {number} bytes - Taille en octets
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Vérifier si un fichier est une image
   * @param {File} file - Fichier à vérifier
   */
  isImage(file) {
    return this.allowedImageTypes.includes(file.type);
  }

  /**
   * Vérifier si un fichier est une vidéo
   * @param {File} file - Fichier à vérifier
   */
  isVideo(file) {
    return this.allowedVideoTypes.includes(file.type);
  }

  /**
   * Vérifier si un fichier est un audio
   * @param {File} file - Fichier à vérifier
   */
  isAudio(file) {
    return this.allowedAudioTypes.includes(file.type);
  }

  /**
   * Obtenir l'icône appropriée pour un type de fichier
   * @param {string} mimeType - Type MIME
   */
  getFileIcon(mimeType) {
    if (this.allowedImageTypes.includes(mimeType)) return '🖼️';
    if (this.allowedVideoTypes.includes(mimeType)) return '🎥';
    if (this.allowedAudioTypes.includes(mimeType)) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return '📊';
    return '📎';
  }
}

// Instance singleton
const mediaService = new MediaService();

export default mediaService;
