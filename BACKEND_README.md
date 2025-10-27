# 🚀 Elite Chat - Backend Simple et Fonctionnel

Backend complet pour Elite Chat avec API REST et temps réel via Socket.io.

## ✨ Fonctionnalités

- **API REST complète** : Authentification, discussions, messages, utilisateurs
- **Temps réel** : Socket.io pour messages instantanés, indicateurs de frappe, statuts
- **Authentification** : Intégration Supabase Auth
- **Base de données** : Supabase PostgreSQL avec RLS
- **Upload de fichiers** : Support médias (images, vidéos, audio)
- **Sécurité** : Middleware d'authentification, validation des données

## 🏗️ Architecture

```
server/
├── index.js              # Point d'entrée principal
├── config.js             # Configuration centralisée
├── supabase.js           # Client Supabase et utilitaires
├── middleware/
│   └── auth.js          # Authentification JWT
├── routes/
│   ├── auth.js          # Routes d'authentification
│   ├── discussions.js   # Routes des discussions
│   ├── messages.js      # Routes des messages
│   └── users.js         # Routes des utilisateurs
└── socket/
    └── handlers.js      # Gestionnaires Socket.io
```

## 🚀 Démarrage rapide

### 1. Configuration

Copiez `.env.example` vers `.env` et configurez :

```env
# Frontend
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_anon_key
VITE_API_URL=http://localhost:3001

# Backend
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:5173
SUPABASE_SERVICE_KEY=votre_service_key
```

### 2. Base de données

Appliquez le schéma de base de données :

```bash
# Exécutez le fichier tests/database_schema_updated.sql dans Supabase
```

### 3. Démarrage

#### Option 1 : Développement complet (recommandé)

```bash
npm run dev:full
```

Lance automatiquement le backend et le frontend.

#### Option 2 : Backend seulement

```bash
npm run server
```

#### Option 3 : Séparément

```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend  
npm run dev
```

## 📡 API REST

### Authentification

```javascript
// Connexion
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

// Inscription
POST /api/auth/register
{
  "email": "user@example.com", 
  "password": "password",
  "name": "Nom Utilisateur"
}

// Profil
GET /api/auth/profile
PUT /api/auth/profile
```

### Discussions

```javascript
// Lister les discussions
GET /api/discussions

// Créer une discussion
POST /api/discussions
{
  "participant_ids": ["user_id"],
  "name": "Nom du groupe",
  "type": "private" // ou "group"
}

// Messages d'une discussion  
GET /api/messages/:discussionId
```

### Messages

```javascript
// Envoyer un message
POST /api/messages/:discussionId
{
  "content": "Message texte",
  "message_type": "text"
}

// Avec fichier
POST /api/messages/:discussionId
FormData: {
  content: "Message",
  file: File
}
```

## ⚡ Socket.io - Temps réel

### Connexion

```javascript
import socketService from './src/lib/socket.js';

// Se connecter
await socketService.connect();

// Écouter les nouveaux messages
socketService.on('new_message', (data) => {
  console.log('Nouveau message:', data);
});
```

### Événements disponibles

#### Client → Serveur

- `join_discussion` : Rejoindre une discussion
- `send_message` : Envoyer un message  
- `typing_start/stop` : Indicateurs de frappe
- `message_read` : Marquer comme lu
- `user_status` : Mettre à jour le statut

#### Serveur → Client

- `new_message` : Nouveau message reçu
- `message_sent` : Confirmation d'envoi
- `user_typing` : Utilisateur en train de taper
- `user_status_changed` : Changement de statut
- `message_read` : Message lu par quelqu'un

## 🎯 Intégration Frontend

### Hook personnalisé

```javascript
import { useChatBackend } from './src/hooks/useChatBackend.js';

function ChatComponent() {
  const {
    discussions,
    messages,
    sendMessage,
    loadMessages,
    isConnected
  } = useChatBackend();

  const handleSendMessage = async (discussionId, content) => {
    await sendMessage(discussionId, content);
  };

  return (
    <div>
      <div>Status: {isConnected ? '🟢' : '🔴'}</div>
      {/* Votre UI */}
    </div>
  );
}
```

### Service de chat

```javascript
import chatService from './src/lib/chatService.js';

// Initialiser (fait automatiquement par le hook)
await chatService.initialize();

// Envoyer un message
await chatService.sendMessage(discussionId, "Hello!");

// Rejoindre une discussion
chatService.joinDiscussion(discussionId);

// Écouter les événements
chatService.on('new_message', (data) => {
  // Nouveau message reçu
});
```

## 🔧 Configuration avancée

### Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|---------|
| `NODE_ENV` | Environnement | `development` |
| `PORT` | Port du serveur | `3001` |
| `CLIENT_URL` | URL du frontend | `http://localhost:5173` |
| `SUPABASE_URL` | URL Supabase | Requis |
| `SUPABASE_ANON_KEY` | Clé anonyme | Requis |
| `SUPABASE_SERVICE_KEY` | Clé service | Recommandé |

### Paramètres de chat

```javascript
// config.js
MAX_MESSAGE_LENGTH: 4000,
MAX_PARTICIPANTS_PER_GROUP: 256,
TYPING_INDICATOR_TIMEOUT: 10000,
MAX_FILE_SIZE: 10 * 1024 * 1024 // 10MB
```

## 🛠️ Test et débogage

### Vérification de santé

```bash
curl http://localhost:3001/api/health
```

### Logs détaillés

```bash
# Variables d'environnement pour plus de logs
DEBUG=socket.io* node server/index.js
```

### Test des WebSockets

```javascript
// Dans la console du navigateur
const socket = io('http://localhost:3001', {
  auth: { token: 'votre_jwt_token' }
});

socket.on('connect', () => console.log('Connecté!'));
```

## 🚨 Dépannage

### Problèmes courants

1. **Erreur de CORS**
   - Vérifiez `CLIENT_URL` dans `.env`
   - Assurez-vous que le frontend tourne sur le bon port

2. **Authentification échoue**
   - Vérifiez les clés Supabase
   - Contrôlez que l'utilisateur existe en base

3. **Socket.io ne se connecte pas**
   - Vérifiez le token JWT
   - Contrôlez les paramètres de transport

4. **Messages ne s'affichent pas**
   - Vérifiez les politiques RLS Supabase
   - Contrôlez l'appartenance aux discussions

### Logs utiles

```bash
# Backend
npm run server

# Frontend avec logs détaillés
VITE_DEBUG=true npm run dev
```

## 📚 Documentation API complète

### Codes de réponse

- `200` : Succès
- `201` : Créé avec succès  
- `400` : Données invalides
- `401` : Non authentifié
- `403` : Non autorisé
- `404` : Non trouvé
- `500` : Erreur serveur

### Format des réponses

```javascript
// Succès
{
  "message": "Message envoyé",
  "data": { /* données */ }
}

// Erreur
{
  "error": "Description de l'erreur",
  "code": "ERROR_CODE"
}
```

## 🎯 Prochaines étapes

- [ ] Upload de fichiers vers Supabase Storage
- [ ] Notifications push
- [ ] Appels vocaux/vidéo WebRTC
- [ ] Chiffrement bout en bout
- [ ] API de recherche avancée
- [ ] Webhooks pour intégrations

---

**🎉 Votre backend Elite Chat est prêt !**

Utilisez `npm run dev:full` pour démarrer l'application complète.
