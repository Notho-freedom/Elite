# 🚀 Configuration Vercel Blob - Guide Express

## 📋 **Étapes de configuration**

### **1. Créer un token Vercel Blob**

1. **Aller sur:** https://vercel.com/dashboard/stores
2. **Créer un nouveau store** ou utiliser existant
3. **Copier le token** `BLOB_READ_WRITE_TOKEN`

### **2. Ajouter le token à votre .env.local**

```bash
# Créer le fichier .env.local à la racine du projet
echo "BLOB_READ_WRITE_TOKEN=your_actual_token_here" >> .env.local
```

**Ou manuellement:**
```env
# .env.local (à créer)
BLOB_READ_WRITE_TOKEN=blob_rw_abcd1234_xyz789

# Vos variables Supabase existantes
VITE_SUPABASE_URL=https://oxazzejsmratrlzvrdfq.supabase.co
VITE_SUPABASE_ANON_KEY=your_key_here
```

### **3. Redémarrer le serveur de développement**

```bash
npm run dev
# ou
npm run dev:full
```

## ✅ **Vérification**

Le service VercelBlobService est maintenant prêt !

### **Logs attendus lors de l'upload:**
```
🚀 DÉBUT UPLOAD VERCEL BLOB - VercelBlobService.uploadFile
📤 Fichier original: {name: "photo.jpg", size: 2MB, type: "image/jpeg"}
🗜️ Compression image en cours...
✅ Compression terminée: {compressed: true, savings: "65.2%"}
📡 Upload vers Vercel Blob...
✅ Upload Vercel Blob réussi
🖼️ Génération thumbnail...
✅ Thumbnail généré
```

## 🎯 **Avantages immédiats**

- ✅ **4x plus d'espace** (compression WebP)
- ✅ **URLs permanentes** (plus de blob temporaires)
- ✅ **CDN mondial** (performance)
- ✅ **Thumbnails automatiques**
- ✅ **1GB gratuit** sur Vercel

## 🔧 **Dépannage**

### **Erreur: "unauthorized"**
→ Vérifiez que `BLOB_READ_WRITE_TOKEN` est correct

### **Erreur: "quota exceeded"**
→ Compte gratuit dépassé, upgrade ou créer nouveau compte

### **Compression ne fonctionne pas**
→ Vérifiez la console pour les logs de compression
