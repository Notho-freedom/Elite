# 🚀 Guide d'installation - Supabase Bucket Storage

## ⚡ **Installation en 5 minutes**

### **Étape 1: Configuration Supabase (2 minutes)**

1. **Connectez-vous** à votre dashboard Supabase
2. **Allez dans** l'onglet "SQL Editor"
3. **Collez et exécutez** le script `setup_supabase_bucket.sql`

```sql
-- Le script va créer :
-- ✅ Bucket 'chat-media' (50MB par fichier)
-- ✅ Politiques RLS sécurisées
-- ✅ Support images, vidéos, audio, PDF
```

### **Étape 2: Vérification (1 minute)**

Dans l'onglet "Storage" de Supabase :
- ✅ Vous devez voir le bucket `chat-media`
- ✅ Politique "Public Access" active
- ✅ Politique "Authenticated upload" active

### **Étape 3: Test du système (2 minutes)**

1. **Rafraîchissez** votre application
2. **Envoyez une image** dans le chat
3. **Vérifiez les logs** de la console :

```javascript
📤 Upload de 1 médias...
📤 Upload fichier: {name: "image.jpg", size: 123456, type: "image/jpeg"}
📂 Nom de fichier généré: f077c2b4-8f6a-406e-b98c-48ff14fba862/1691234567890-abc123def.jpg
✅ Upload réussi: {path: "...", id: "..."}
🎯 Média traité: {url: "https://...supabase.co/storage/v1/object/public/chat-media/..."}
✅ Médias uploadés: [{url: "https://...", thumbnail: "https://..."}]
```

## 🎯 **Résultats attendus**

### ✅ **Avant (problème)**
```
Média envoyé → blob:http://localhost:5173/...
Refresh page → ❌ Image disparue
```

### ✅ **Maintenant (résolu)**
```
Média envoyé → https://...supabase.co/storage/v1/object/public/chat-media/...
Refresh page → ✅ Image toujours là !
```

## 🚀 **Fonctionnalités incluses**

### **📤 Upload intelligent**
- ✅ **Compression automatique** (images réduites à 1920px max)
- ✅ **Thumbnails générés** (200x200px pour aperçu)
- ✅ **Noms uniques** (timestamp + random ID)
- ✅ **Validation types** (images, vidéos, audio, PDF)

### **🔒 Sécurité**
- ✅ **RLS activé** (utilisateurs ne voient que leurs médias)
- ✅ **Upload authentifié** uniquement
- ✅ **Limite 50MB** par fichier
- ✅ **Types MIME** contrôlés

### **⚡ Performance**
- ✅ **CDN global** Supabase
- ✅ **Cache 1 heure** (header Cache-Control)
- ✅ **URLs publiques** partageables
- ✅ **Lazy loading** compatible

## 🧪 **Test complet**

1. **Envoyez une image** → Doit s'afficher immédiatement
2. **Refresh la page** → Image toujours visible ✅
3. **Inspectez l'URL** → Doit commencer par `https://...supabase.co/storage/`
4. **Ouvrez l'URL** dans un nouvel onglet → Image accessible ✅

## 🔧 **Dépannage**

### **Problème : "Bucket not found"**
```bash
# Solution : Exécuter setup_supabase_bucket.sql
```

### **Problème : "Permission denied"**
```bash
# Solution : Vérifier les politiques RLS dans Supabase
```

### **Problème : "File too large"**
```bash
# Solution : Le fichier dépasse 50MB, réduire la taille
```

## 📊 **Avantages vs Blobs**

| Critère | Blob (ancien) | Bucket (nouveau) |
|---------|---------------|------------------|
| **Persistance** | ❌ Temporaire | ✅ Permanent |
| **Partage** | ❌ Local only | ✅ URLs publiques |
| **Performance** | ⚠️ Local | ✅ CDN global |
| **Mobile** | ❌ Incompatible | ✅ Compatible |
| **Coût** | 🟨 RAM browser | ✅ $0.021/GB/mois |

---

**🎉 Votre système de médias Elite Chat est maintenant professionnel !**

**Testez maintenant l'envoi d'une image et vérifiez qu'elle persiste après refresh !** 🚀
