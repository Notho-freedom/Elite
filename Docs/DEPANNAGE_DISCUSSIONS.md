# 🔧 Dépannage - Liste de Discussions Vide

## 🎯 **Problème Identifié**
Votre liste de discussions est vide. Voici les causes possibles et les solutions.

## 🔍 **Diagnostic**

### **1. Vérifiez la Console du Navigateur**
Ouvrez les outils de développement (F12) et regardez la console pour voir :
- Les messages de debug de `DiscussionList`
- Les erreurs Supabase
- Les erreurs JavaScript

### **2. Vérifiez l'État d'Authentification**
Dans la console, vous devriez voir :
```javascript
DiscussionList Debug: {
  realDiscussionsCount: 0,
  mockDiscussionsCount: 0, // ou un nombre > 0
  discussionsCount: 0,
  isAuthenticated: false, // ou true
  user: false // ou true
}
```

## 🛠️ **Solutions**

### **Solution 1: Mode Démonstration (Recommandé pour tester)**
Si vous n'êtes pas connecté à Supabase :
1. Les données mockées devraient se charger automatiquement
2. Vous devriez voir "(Mode Demo)" dans le titre
3. Un message bleu devrait apparaître

### **Solution 2: Connexion Supabase**
Si vous voulez utiliser vos vraies données :

#### **Étape 1: Vérifiez les Variables d'Environnement**
Dans votre fichier `.env` :
```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_clé_anon
```

#### **Étape 2: Vérifiez la Base de Données**
1. Allez sur votre dashboard Supabase
2. Vérifiez que les tables existent :
   - `discussions`
   - `discussion_participants`
   - `users`
   - `messages`

#### **Étape 3: Créez des Données de Test**
Exécutez ce script SQL dans l'éditeur SQL de Supabase :

```sql
-- Insérer un utilisateur de test
INSERT INTO users (id, name, avatar_url, status) 
VALUES ('test-user-1', 'John Doe', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 'online')
ON CONFLICT (id) DO NOTHING;

-- Insérer une discussion de test
INSERT INTO discussions (id, name, type, created_at, updated_at)
VALUES ('test-discussion-1', 'Discussion Test', 'direct', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Ajouter l'utilisateur à la discussion
INSERT INTO discussion_participants (discussion_id, user_id)
VALUES ('test-discussion-1', 'test-user-1')
ON CONFLICT (discussion_id, user_id) DO NOTHING;

-- Insérer un message de test
INSERT INTO messages (discussion_id, sender_id, content, message_type, created_at)
VALUES ('test-discussion-1', 'test-user-1', 'Bonjour ! Ceci est un message de test.', 'text', NOW());
```

### **Solution 3: Forcer le Chargement des Données Mockées**
Si les données mockées ne se chargent pas :

1. Ouvrez la console du navigateur
2. Exécutez :
```javascript
// Forcer le chargement des données mockées
window.location.reload();
```

## 🚨 **Erreurs Courantes**

### **Erreur 1: "Variables d'environnement manquantes"**
**Solution :** Vérifiez votre fichier `.env`

### **Erreur 2: "Table not found"**
**Solution :** Exécutez le script de création de tables dans Supabase

### **Erreur 3: "RLS policy error"**
**Solution :** Exécutez le script de correction des politiques RLS

## 📱 **Test Rapide**

### **Pour Tester Immédiatement :**
1. Ouvrez l'application
2. Vérifiez que vous voyez "(Mode Demo)" dans le titre
3. Si non, rechargez la page (F5)
4. Vous devriez voir des discussions de démonstration

### **Pour Tester avec Supabase :**
1. Connectez-vous à votre compte Supabase
2. Vérifiez que les tables existent
3. Ajoutez des données de test
4. Rechargez l'application

## 🎯 **Prochaines Étapes**

Une fois que vous voyez des discussions :
1. Testez la navigation entre les discussions
2. Testez l'envoi de messages
3. Testez les nouvelles fonctionnalités (réponses, épinglage, etc.)

---

**💡 Conseil :** Commencez par le mode démonstration pour tester l'interface, puis configurez Supabase pour vos vraies données.
