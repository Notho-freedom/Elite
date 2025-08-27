import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject, 
  listAll,
  uploadBytesResumable
} from 'firebase/storage';
import { storage } from './config';

export const storageService = {
  // === UPLOAD DE FICHIERS ===

  // Upload simple
  async uploadFile(file, path, metadata = {}) {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        url: downloadURL,
        path: snapshot.ref.fullPath,
        size: snapshot.metadata.size,
        contentType: snapshot.metadata.contentType
      };
    } catch (error) {
      console.error('Erreur upload fichier:', error);
      throw error;
    }
  },

  // Upload avec progression
  uploadFileWithProgress(file, path, onProgress, metadata = {}) {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress);
        },
        (error) => {
          console.error('Erreur upload avec progression:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              url: downloadURL,
              path: uploadTask.snapshot.ref.fullPath,
              size: uploadTask.snapshot.metadata.size,
              contentType: uploadTask.snapshot.metadata.contentType
            });
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  },

  // === MÉDIAS DE CONVERSATION ===

  // Upload d'image de conversation
  async uploadChatImage(file, conversationId, userId) {
    const timestamp = Date.now();
    const fileName = `chat-images/${conversationId}/${userId}_${timestamp}_${file.name}`;
    
    const metadata = {
      contentType: file.type,
      customMetadata: {
        conversationId,
        uploadedBy: userId,
        uploadedAt: timestamp.toString()
      }
    };

    return this.uploadFile(file, fileName, metadata);
  },

  // Upload de vidéo de conversation
  async uploadChatVideo(file, conversationId, userId) {
    const timestamp = Date.now();
    const fileName = `chat-videos/${conversationId}/${userId}_${timestamp}_${file.name}`;
    
    const metadata = {
      contentType: file.type,
      customMetadata: {
        conversationId,
        uploadedBy: userId,
        uploadedAt: timestamp.toString()
      }
    };

    return this.uploadFileWithProgress(file, fileName, () => {}, metadata);
  },

  // Upload d'audio de conversation
  async uploadChatAudio(file, conversationId, userId) {
    const timestamp = Date.now();
    const fileName = `chat-audio/${conversationId}/${userId}_${timestamp}_${file.name}`;
    
    const metadata = {
      contentType: file.type,
      customMetadata: {
        conversationId,
        uploadedBy: userId,
        uploadedAt: timestamp.toString()
      }
    };

    return this.uploadFile(file, fileName, metadata);
  },

  // Upload de document
  async uploadChatDocument(file, conversationId, userId) {
    const timestamp = Date.now();
    const fileName = `chat-documents/${conversationId}/${userId}_${timestamp}_${file.name}`;
    
    const metadata = {
      contentType: file.type,
      customMetadata: {
        conversationId,
        uploadedBy: userId,
        uploadedAt: timestamp.toString(),
        originalName: file.name
      }
    };

    return this.uploadFile(file, fileName, metadata);
  },

  // === PROFILS UTILISATEURS ===

  // Upload d'avatar utilisateur
  async uploadUserAvatar(file, userId) {
    const timestamp = Date.now();
    const fileName = `user-avatars/${userId}/avatar_${timestamp}.jpg`;
    
    const metadata = {
      contentType: 'image/jpeg',
      customMetadata: {
        userId,
        uploadedAt: timestamp.toString(),
        type: 'avatar'
      }
    };

    return this.uploadFile(file, fileName, metadata);
  },

  // Upload de photo de profil
  async uploadUserPhoto(file, userId, photoType = 'profile') {
    const timestamp = Date.now();
    const fileName = `user-photos/${userId}/${photoType}_${timestamp}.jpg`;
    
    const metadata = {
      contentType: 'image/jpeg',
      customMetadata: {
        userId,
        uploadedAt: timestamp.toString(),
        type: photoType
      }
    };

    return this.uploadFile(file, fileName, metadata);
  },

  // === GESTION DES FICHIERS ===

  // Supprimer un fichier
  async deleteFile(path) {
    try {
      const fileRef = ref(storage, path);
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Erreur suppression fichier:', error);
      throw error;
    }
  },

  // Lister les fichiers d'un dossier
  async listFiles(folderPath) {
    try {
      const folderRef = ref(storage, folderPath);
      const result = await listAll(folderRef);
      
      const files = [];
      for (const item of result.items) {
        const url = await getDownloadURL(item);
        files.push({
          name: item.name,
          path: item.fullPath,
          url
        });
      }
      
      return files;
    } catch (error) {
      console.error('Erreur liste fichiers:', error);
      throw error;
    }
  },

  // Obtenir l'URL de téléchargement
  async getDownloadURL(path) {
    try {
      const fileRef = ref(storage, path);
      return await getDownloadURL(fileRef);
    } catch (error) {
      console.error('Erreur récupération URL:', error);
      throw error;
    }
  },

  // === UTILITAIRES ===

  // Générer un nom de fichier unique
  generateUniqueFileName(originalName, userId) {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    return `${userId}_${timestamp}_${randomString}.${extension}`;
  },

  // Vérifier le type de fichier
  isValidFileType(file, allowedTypes) {
    return allowedTypes.includes(file.type);
  },

  // Vérifier la taille du fichier
  isValidFileSize(file, maxSizeMB) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  },

  // Obtenir l'extension du fichier
  getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  },

  // === CONSTANTES ===

  // Types de fichiers autorisés
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
  ALLOWED_AUDIO_TYPES: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ],

  // Tailles maximales
  MAX_IMAGE_SIZE: 10, // MB
  MAX_VIDEO_SIZE: 100, // MB
  MAX_AUDIO_SIZE: 50, // MB
  MAX_DOCUMENT_SIZE: 25 // MB
};
