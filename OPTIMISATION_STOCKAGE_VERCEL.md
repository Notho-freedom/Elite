# 🚀 Stratégies d'optimisation Vercel Blob Storage

## 📊 **Limites Vercel Blob**
- ✅ **1GB gratuit** par projet/compte
- 💰 **$0.15/GB** au-delà
- 🔄 **Bande passante illimitée** (même gratuit)

## 🎯 **Stratégies d'optimisation**

### **1. 🎭 Multi-comptes Vercel (Switch automatique)**

```javascript
// Configuration multi-tokens
const BLOB_CONFIGS = [
  { token: process.env.BLOB_TOKEN_1, name: 'storage1' },
  { token: process.env.BLOB_TOKEN_2, name: 'storage2' },
  { token: process.env.BLOB_TOKEN_3, name: 'storage3' },
  // Jusqu'à 10 comptes = 10GB gratuit
];

class MultiVercelBlobService {
  static currentIndex = 0;
  
  static async uploadFile(file, userId) {
    const config = BLOB_CONFIGS[this.currentIndex];
    
    try {
      const blob = await put(`${userId}/${Date.now()}-${file.name}`, file, {
        access: 'public',
        token: config.token
      });
      
      return {
        url: blob.url,
        storage: config.name,
        size: file.size
      };
    } catch (error) {
      if (error.message.includes('quota')) {
        // Switch au prochain storage
        this.currentIndex = (this.currentIndex + 1) % BLOB_CONFIGS.length;
        return this.uploadFile(file, userId); // Retry
      }
      throw error;
    }
  }
}
```

**✅ Avantages:**
- 10 comptes = **10GB gratuit**
- Switch automatique
- Resilience

**❌ Inconvénients:**
- Gestion multiple comptes
- Complexité accrue

---

### **2. 🗜️ Compression intelligente (RECOMMANDÉ)**

```javascript
class OptimizedBlobService {
  static async uploadFile(file, userId, options = {}) {
    let processedFile = file;
    
    // Compression selon le type
    if (file.type.startsWith('image/')) {
      processedFile = await this.compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.85,
        format: 'webp' // 25-50% plus petit que JPEG
      });
    } else if (file.type.startsWith('video/')) {
      processedFile = await this.compressVideo(file, {
        maxBitrate: '1M',
        resolution: '720p'
      });
    }
    
    const blob = await put(`${userId}/${Date.now()}-${processedFile.name}`, processedFile, {
      access: 'public'
    });
    
    return { url: blob.url, originalSize: file.size, compressedSize: processedFile.size };
  }
  
  static async compressImage(file, options) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    return new Promise((resolve) => {
      img.onload = () => {
        // Calcul dimensions optimales
        const { width, height } = this.calculateDimensions(
          img.width, img.height, 
          options.maxWidth, options.maxHeight
        );
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(resolve, `image/${options.format}`, options.quality);
      };
      img.src = URL.createObjectURL(file);
    });
  }
}
```

**💾 Économies possibles:**
- **Images WebP:** -40% vs JPEG
- **Compression:** -60% taille originale
- **Résolution adaptée:** -70% pour mobiles

---

### **3. 🗂️ Stockage hybride (Intelligent)**

```javascript
class HybridStorageService {
  static async uploadFile(file, userId) {
    const sizeThreshold = 5 * 1024 * 1024; // 5MB
    
    if (file.size < sizeThreshold) {
      // Petits fichiers → Vercel Blob (rapide)
      return this.uploadToVercel(file, userId);
    } else {
      // Gros fichiers → Supabase Storage (moins cher)
      return this.uploadToSupabase(file, userId);
    }
  }
  
  static async uploadToVercel(file, userId) {
    const compressed = await OptimizedBlobService.compressImage(file);
    const blob = await put(`${userId}/${Date.now()}-${file.name}`, compressed, {
      access: 'public'
    });
    return { url: blob.url, provider: 'vercel' };
  }
  
  static async uploadToSupabase(file, userId) {
    // Fallback vers Supabase pour gros fichiers
    const fileName = `${userId}/${Date.now()}-${file.name}`;
    const { data } = await supabase.storage.from('chat-media').upload(fileName, file);
    const { publicUrl } = supabase.storage.from('chat-media').getPublicUrl(fileName);
    return { url: publicUrl, provider: 'supabase' };
  }
}
```

---

### **4. 🧹 Nettoyage automatique (Lifecycle)**

```javascript
class SmartCleanupService {
  // Nettoyer les anciens médias automatiquement
  static async cleanupOldMedia() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Supprimer médias > 30 jours des discussions inactives
    const { data: oldMessages } = await supabase
      .from('messages')
      .select('media_url')
      .lt('created_at', thirtyDaysAgo.toISOString())
      .not('media_url', 'is', null);
    
    for (const message of oldMessages) {
      if (message.media_url.includes('vercel.com')) {
        await this.deleteFromVercel(message.media_url);
      }
    }
  }
}
```

## 🏆 **Stratégie recommandée pour Elite Chat**

### **Phase 1: Compression intelligente (Immédiat)**
```javascript
// 1GB → 4-5GB effectif avec compression
const config = {
  images: { format: 'webp', quality: 0.8, maxRes: '1080p' },
  videos: { bitrate: '1M', resolution: '720p' },
  audio: { bitrate: '128k' }
};
```

### **Phase 2: Multi-comptes si nécessaire**
```javascript
// 3 comptes Vercel = 15GB effectif avec compression
const accounts = ['main', 'backup1', 'backup2'];
```

### **Phase 3: Hybride (Scale)**
```javascript
// Vercel (petits) + Supabase (gros) + Cleanup automatique
```

## 📊 **Calcul d'optimisation**

| Stratégie | Espace gratuit | Effort | Fiabilité |
|-----------|----------------|--------|-----------|
| **Compression seule** | ~4GB effectif | ⭐ | ⭐⭐⭐ |
| **Multi-comptes** | 10GB+ | ⭐⭐ | ⭐⭐ |
| **Hybride** | Illimité | ⭐⭐⭐ | ⭐⭐⭐ |

## 🎯 **Action immédiate**

**Commençons par la compression intelligente ?**
- ✅ 4x plus d'espace avec le même quota
- ✅ Implémentation simple
- ✅ Performance améliorée (fichiers plus légers)
- ✅ Fonctionne immédiatement

**Puis multi-comptes si besoin réel.**
