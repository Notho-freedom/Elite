# 🔑 Guide de configuration Token Vercel Blob

## 📋 **Étapes détaillées**

### **1. 🌐 Aller sur le dashboard Vercel**
```
https://vercel.com/dashboard
```

### **2. 🏪 Créer un Blob Store**

1. **Dans le dashboard Vercel :**
   - Cliquez sur **"Storage"** dans la sidebar gauche
   - Ou allez directement sur : https://vercel.com/dashboard/stores

2. **Créer un nouveau store :**
   - Cliquez sur **"Create Database"**
   - Sélectionnez **"Blob"**
   - Donnez un nom : `elite-chat-media` (ou autre)
   - Cliquez sur **"Create"**

### **3. 🔑 Récupérer le token**

1. **Une fois le store créé :**
   - Cliquez sur votre store `elite-chat-media`
   - Allez dans l'onglet **"Settings"**
   - Dans la section **"Environment Variables"**
   - Copiez la valeur de `BLOB_READ_WRITE_TOKEN`

### **4. 📝 Configurer le projet**

1. **Créer le fichier `.env.local` :**
```bash
# Dans le terminal (racine du projet Elite)
echo BLOB_READ_WRITE_TOKEN=votre_token_copié_ici > .env.local
```

2. **Ou manuellement :**
```env
# Créer .env.local à la racine du projet
BLOB_READ_WRITE_TOKEN=blob_rw_abcd1234_votre_vrai_token_ici

# Vos variables existantes (optionnel)
VITE_SUPABASE_URL=https://oxazzejsmratrlzvrdfq.supabase.co
VITE_SUPABASE_ANON_KEY=votre_clé_supabase
```

### **5. 🔄 Redémarrer le serveur**
```bash
# Arrêter le serveur (Ctrl+C)
# Puis relancer
npm run dev
```

## ✅ **Vérification**

### **1. Logs de démarrage**
Vous devriez voir dans la console :
```
✓ Ready in 2.3s
✓ Local: http://localhost:5173/
```

### **2. Test d'upload**
1. Ouvrir Elite Chat
2. Envoyer une image
3. Vérifier les logs console :

```
🚀 DÉBUT UPLOAD VERCEL BLOB - VercelBlobService.uploadFile
📤 Fichier original: {name: "photo.jpg", size: "2.1 MB"}
🗜️ Compression image en cours...
✅ Compression terminée: {savings: "65.2%"}
📡 Upload vers Vercel Blob...
✅ Upload Vercel Blob réussi: {url: "https://blob.vercel-storage.com/..."}
```

## 🔧 **Dépannage**

### **❌ Erreur: "unauthorized"**
- **Cause :** Token incorrect ou non configuré
- **Solution :** Vérifier le token dans `.env.local`

### **❌ Erreur: "quota exceeded"**
- **Cause :** 1GB gratuit dépassé
- **Solution :** Créer un nouveau compte ou upgrade

### **❌ Token non trouvé**
- **Cause :** `.env.local` mal placé ou mal nommé
- **Solution :** Vérifier que le fichier est à la racine

### **❌ Serveur ne redémarre pas**
- **Solution :** 
```bash
# Forcer l'arrêt
Ctrl+C
# Attendre 2-3 secondes
npm run dev
```

## 🎯 **Résultat attendu**

Après configuration correcte :

### **✅ URLs des médias :**
```
Avant: blob:http://localhost:5173/abc123 (temporaire)
Après: https://blob.vercel-storage.com/chat-media/... (permanent)
```

### **✅ Persistance :**
- Envoi image → Upload réussi
- Rafraîchir page → Image toujours visible ! 🎊

### **✅ Performance :**
- Compression automatique
- CDN mondial
- Thumbnails générés

## 🚀 **Prêt à tester !**

Une fois le token configuré et le serveur redémarré, Elite Chat utilisera automatiquement Vercel Blob pour tous les uploads médias.

**Fini les blobs temporaires ! 🎉**
