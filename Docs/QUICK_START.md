# Guide de Démarrage Rapide - Elite Chat Backend

## 🚀 Démarrage en 5 minutes

### 1. Prérequis

- Node.js 18+ installé
- Un compte Supabase (gratuit sur [supabase.com](https://supabase.com))
- Git

### 2. Installation

```bash
# Cloner le projet
git clone [votre-repo]
cd elite

# Installer les dépendances
npm install
```

### 3. Configuration Supabase

#### Étape 1 : Créer un projet Supabase
1. Allez sur [app.supabase.com](https://app.supabase.com)
2. Cliquez sur "New Project"
3. Remplissez les informations :
   - Name: `elite-chat`
   - Database Password: (notez-le bien!)
   - Region: Choisissez la plus proche

#### Étape 2 : Exécuter le schéma SQL
1. Dans Supabase Dashboard, allez dans "SQL Editor"
2. Cliquez sur "New Query"
3. Copiez tout le contenu de `tests/database_schema_updated.sql`
4. Collez et cliquez sur "Run"

#### Étape 3 : Récupérer les clés API
1. Allez dans "Settings" > "API"
2. Copiez :
   - Project URL
   - anon public key

### 4. Configuration locale

Créez un fichier `.env` à la racine :

```env
VITE_SUPABASE_URL=https://[votre-projet].supabase.co
VITE_SUPABASE_ANON_KEY=[votre-anon-key]
```

### 5. Lancement

```bash
npm run dev
```

Ouvrez [http://localhost:5173](http://localhost:5173)

## 📋 Checklist de vérification

- [ ] Supabase projet créé
- [ ] Schéma SQL exécuté sans erreur
- [ ] Fichier `.env` configuré
- [ ] `npm install` réussi
- [ ] `npm run dev` lance l'application

## 🔧 Configuration rapide des fonctionnalités

### Activer l'authentification Google

1. Dans Supabase : Auth > Providers > Google
2. Activez et ajoutez vos credentials OAuth
3. Ajoutez l'URL de callback dans Google Console

### Créer les buckets de stockage

Dans SQL Editor, exécutez :

```sql
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('images', 'images', true),
  ('videos', 'videos', true),
  ('avatars', 'avatars', true);
```

### Tester l'envoi de messages

1. Créez un compte via l'interface
2. Le profil est créé automatiquement
3. Commencez à discuter!

## 🏗️ Structure du code backend

```
src/services/
├── userService.js      # Authentification et profils
├── messageService.js   # Gestion des messages
├── chatService.js      # Orchestration du chat
└── realtimeService.js  # Connexions temps réel
```

## 📝 Exemples d'utilisation

### Envoyer un message

```javascript
import { chatService } from './services';

const result = await chatService.sendMessage({
  discussion_id: 'uuid-discussion',
  sender_id: 'uuid-user',
  content: 'Bonjour!',
  message_type: 'text'
});
```

### Uploader une image

```javascript
import { mediaService } from './services';

const file = document.getElementById('file-input').files[0];
const result = await mediaService.uploadMedia(file, userId, 'message');

if (result.success) {
  console.log('Image URL:', result.data.url);
}
```

### S'abonner aux messages temps réel

```javascript
import { realtimeService } from './services';

await realtimeService.subscribeToDiscussion(discussionId, {
  onNewMessage: (message) => {
    console.log('Nouveau message:', message);
  },
  onTypingUpdate: (typingUsers) => {
    console.log('Utilisateurs en train d\'écrire:', typingUsers);
  }
});
```

## ⚡ Commandes utiles

```bash
# Développement
npm run dev              # Lancer en mode dev

# Build
npm run build           # Build pour production
npm run preview         # Prévisualiser le build

# Mobile
npm run cap:sync        # Synchroniser avec Capacitor
npm run cap:android     # Ouvrir dans Android Studio
npm run cap:ios         # Ouvrir dans Xcode
```

## 🐛 Dépannage rapide

### "Missing Supabase environment variables"
→ Vérifiez que le fichier `.env` existe et contient les bonnes valeurs

### "Permission denied" 
→ L'utilisateur doit être connecté pour accéder aux données

### Page blanche au chargement
→ Ouvrez la console (F12) et vérifiez les erreurs

### Messages non envoyés
→ Vérifiez la connexion internet et les logs Supabase

## 📚 Ressources

- [Documentation complète](./BACKEND_ARCHITECTURE.md)
- [Guide de configuration](./CONFIGURATION_GUIDE.md)
- [Supabase Docs](https://supabase.com/docs)

## 💡 Prochaines étapes

1. **Personnaliser l'interface** : Modifiez les composants React dans `src/components`
2. **Ajouter des fonctionnalités** : Consultez les services disponibles
3. **Déployer** : Utilisez Vercel, Netlify ou tout autre hébergeur

## 🆘 Besoin d'aide?

- Vérifiez les logs dans la console du navigateur
- Consultez les logs Supabase (Dashboard > Logs)
- Assurez-vous que toutes les tables sont créées
- Vérifiez les politiques RLS si "permission denied"

---

**Félicitations!** 🎉 Votre backend Elite Chat est maintenant opérationnel!
