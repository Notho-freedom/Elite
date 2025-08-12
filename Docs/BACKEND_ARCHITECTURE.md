# Architecture Backend Elite Chat

## Vue d'ensemble

L'architecture backend d'Elite Chat est construite sur Supabase et suit une approche modulaire avec des services dédiés pour chaque fonctionnalité majeure.

## Structure des dossiers

```
src/
├── config/
│   └── index.js          # Configuration centralisée
├── services/
│   ├── index.js          # Point d'entrée des services
│   ├── userService.js    # Gestion des utilisateurs
│   ├── messageService.js # Gestion des messages
│   ├── chatService.js    # Service de chat principal
│   ├── discussionService.js # Gestion des discussions
│   ├── callService.js    # Appels audio/vidéo
│   ├── statusService.js  # Statuts/Stories
│   ├── notificationService.js # Notifications
│   ├── mediaService.js   # Upload et gestion des médias
│   └── realtimeService.js # Orchestration temps réel
├── utils/
│   ├── index.js          # Utilitaires généraux
│   ├── validation.js     # Validation et sanitisation
│   └── errors.js         # Gestion des erreurs
└── lib/
    └── supabase.js       # Client Supabase configuré
```

## Services principaux

### 1. UserService
Gère l'authentification et les profils utilisateurs.

**Fonctionnalités principales :**
- `upsertUserProfile()` - Créer/mettre à jour un profil
- `getUserProfile()` - Récupérer un profil
- `updateOnlineStatus()` - Gérer le statut en ligne
- `getUserDiscussions()` - Récupérer les discussions d'un utilisateur
- `createConversation()` - Créer une discussion privée
- `markMessagesAsRead()` - Marquer des messages comme lus

### 2. MessageService
Gère l'envoi, la modification et la suppression des messages.

**Fonctionnalités principales :**
- `getMessages()` - Récupérer les messages avec pagination
- `sendMessage()` - Envoyer un nouveau message
- `editMessage()` - Modifier un message existant
- `deleteMessage()` - Supprimer un message
- `addReaction()` - Ajouter une réaction
- `pinMessage()` - Épingler un message
- `searchMessages()` - Rechercher dans les messages

### 3. ChatService
Service principal orchestrant les fonctionnalités de chat.

**Fonctionnalités principales :**
- `loadMessages()` - Charger les messages avec cache
- `sendMessage()` - Envoi optimisé avec validation
- `subscribeToDiscussion()` - Abonnement temps réel
- `updateTypingIndicator()` - Indicateurs de frappe
- `markMessagesAsRead()` - Marquage de lecture en lot

### 4. DiscussionService
Gère les discussions de groupe et leurs participants.

**Fonctionnalités principales :**
- `createDiscussion()` - Créer une nouvelle discussion
- `updateDiscussion()` - Modifier les paramètres
- `addParticipant()` - Ajouter un participant
- `removeParticipant()` - Retirer un participant
- `changeParticipantRole()` - Modifier les rôles
- `generateInviteLink()` - Créer un lien d'invitation

### 5. CallService
Gère les appels audio et vidéo via WebRTC.

**Fonctionnalités principales :**
- `initiateCall()` - Démarrer un appel
- `joinCall()` - Rejoindre un appel
- `leaveCall()` - Quitter un appel
- `toggleMute()` - Activer/désactiver le micro
- `toggleVideo()` - Activer/désactiver la vidéo
- `getCallHistory()` - Historique des appels

### 6. StatusService
Gère les statuts/stories des utilisateurs.

**Fonctionnalités principales :**
- `createStatus()` - Créer un nouveau statut
- `getActiveStatuses()` - Récupérer les statuts actifs
- `markStatusAsViewed()` - Marquer comme vu
- `deleteStatus()` - Supprimer un statut
- `getStatusViewers()` - Voir qui a vu le statut

### 7. NotificationService
Gère les notifications push et in-app.

**Fonctionnalités principales :**
- `initialize()` - Initialiser et demander les permissions
- `createNotification()` - Créer une notification
- `getNotifications()` - Récupérer les notifications
- `markAsRead()` - Marquer comme lue
- `subscribeToNotifications()` - Abonnement temps réel

### 8. MediaService
Gère l'upload et l'optimisation des médias.

**Fonctionnalités principales :**
- `uploadMedia()` - Upload de fichiers
- `generateImageThumbnail()` - Créer des miniatures
- `optimizeImage()` - Optimiser les images
- `validateFile()` - Valider les fichiers
- `getFileMetadata()` - Extraire les métadonnées

### 9. RealtimeService
Orchestre toutes les fonctionnalités temps réel.

**Fonctionnalités principales :**
- `initialize()` - Initialiser les connexions
- `setupUserPresence()` - Gérer la présence
- `subscribeToDiscussion()` - Abonnements par discussion
- `broadcast()` - Diffuser des messages
- `handleReconnection()` - Gérer les reconnexions

## Schéma de base de données

Le schéma complet est défini dans `tests/database_schema_updated.sql`.

### Tables principales :
- `users` - Profils utilisateurs étendus
- `discussions` - Discussions privées et de groupe
- `discussion_participants` - Participants et rôles
- `messages` - Messages avec métadonnées riches
- `message_reactions` - Réactions aux messages
- `message_read_status` - Statut de lecture
- `calls` - Appels audio/vidéo
- `call_participants` - Participants aux appels
- `statuses` - Statuts/Stories
- `status_views` - Vues des statuts
- `notifications` - Notifications système
- `typing_indicators` - Indicateurs de frappe

### Vues utiles :
- `discussions_with_details` - Vue enrichie des discussions

### Fonctions SQL :
- `mark_messages_as_read()` - Marquer en lot
- `create_private_discussion()` - Créer ou récupérer une discussion privée
- `cleanup_expired_typing()` - Nettoyer les indicateurs expirés

## Sécurité

### Row Level Security (RLS)
Toutes les tables ont des politiques RLS activées pour garantir que :
- Les utilisateurs ne peuvent voir que leurs propres données
- Les permissions sont respectées pour les actions
- Les données sensibles sont protégées

### Validation et sanitisation
- Validation côté client avec `validation.js`
- Sanitisation HTML avec DOMPurify
- Protection contre les injections SQL et XSS
- Rate limiting pour prévenir les abus

### Authentification
- Basée sur Supabase Auth
- Support OAuth (Google, GitHub, etc.)
- Sessions persistantes avec refresh automatique
- Protection PKCE pour les flux OAuth

## Configuration

### Variables d'environnement requises :
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Variables optionnelles :
```env
VITE_TURN_SERVER=turn:turn.example.com:3478
VITE_TURN_USERNAME=username
VITE_TURN_PASSWORD=password
VITE_ENABLE_CALLS=true
VITE_ENABLE_STATUS=true
VITE_ENABLE_ENCRYPTION=false
```

## Gestion des erreurs

Système centralisé avec classes d'erreurs typées :
- `AuthError` - Erreurs d'authentification
- `ValidationError` - Erreurs de validation
- `PermissionError` - Erreurs de permissions
- `NetworkError` - Erreurs réseau
- `RateLimitError` - Limites de taux dépassées
- `MediaError` - Erreurs de médias
- `CallError` - Erreurs d'appels

## Performance

### Optimisations implémentées :
- Cache des messages en mémoire
- Pagination pour les grandes listes
- Debouncing des indicateurs de frappe
- Optimisation automatique des images
- Lazy loading des médias
- Batch des opérations de lecture

### Limites de taux :
- Messages : 100/minute
- Uploads : 10/5 minutes
- Appels : 5/heure

## Utilisation

### Initialisation :
```javascript
import { initializeServices } from './services';

// Au démarrage de l'application
await initializeServices(userId);
```

### Envoi d'un message :
```javascript
import { chatService } from './services';

const result = await chatService.sendMessage({
  discussion_id: discussionId,
  sender_id: userId,
  content: 'Hello!',
  message_type: 'text'
});
```

### Upload de média :
```javascript
import { mediaService } from './services';

const result = await mediaService.uploadMedia(
  file,
  userId,
  'message'
);
```

### Abonnement temps réel :
```javascript
import { realtimeService } from './services';

await realtimeService.subscribeToDiscussion(discussionId, {
  onNewMessage: (message) => console.log('Nouveau message:', message),
  onTypingUpdate: (typing) => console.log('Frappe:', typing)
});
```

## Tests

Les tests doivent couvrir :
- Validation des entrées
- Permissions et sécurité
- Gestion des erreurs
- Performance et limites
- Fonctionnalités temps réel

## Déploiement

1. Configurer les variables d'environnement
2. Exécuter le schéma SQL dans Supabase
3. Configurer les buckets de stockage
4. Activer les politiques RLS
5. Configurer les webhooks si nécessaire

## Maintenance

### Tâches régulières :
- Nettoyer les statuts expirés
- Purger les notifications anciennes
- Optimiser les index de base de données
- Surveiller les performances
- Mettre à jour les dépendances

### Monitoring recommandé :
- Temps de réponse des APIs
- Taux d'erreur
- Utilisation du stockage
- Connexions temps réel actives
- Performance des requêtes SQL
