# Elite - Application de Messagerie

Une application de messagerie moderne construite avec React et Firebase, offrant une expérience utilisateur premium avec des fonctionnalités avancées.

## 🚀 Fonctionnalités

### 🔐 Authentification
- Connexion avec Google, GitHub, Twitter, Facebook, Apple
- Authentification par email/mot de passe
- Gestion des profils utilisateurs
- Déconnexion sécurisée

### 💬 Messagerie en Temps Réel
- Conversations privées
- Messages texte, images, vidéos, audio
- Indicateurs de lecture
- Réactions aux messages
- Recherche de messages
- Historique des conversations

### 📱 Notifications Push
- Notifications en temps réel
- Notifications d'appels
- Notifications de statut
- Actions rapides sur les notifications

### 🎨 Interface Utilisateur
- Design moderne et responsive
- Thèmes sombre/clair
- Animations fluides avec Framer Motion
- Support mobile et desktop
- Interface adaptative

### 📁 Gestion des Médias
- Upload d'images et vidéos
- Compression automatique
- Prévisualisation des médias
- Stockage sécurisé Firebase

## 🛠️ Technologies

### Frontend
- **React 18** - Framework principal
- **Vite** - Build tool et dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Icons** - Icônes

### Backend Firebase
- **Firebase Auth** - Authentification
- **Firestore** - Base de données temps réel
- **Firebase Storage** - Stockage de fichiers
- **Firebase Messaging** - Notifications push
- **Firebase Analytics** - Analytics

### Autres
- **Groq SDK** - IA conversationnelle
- **use-sound** - Gestion audio
- **emoji-picker-react** - Sélecteur d'emojis

## 📦 Installation

### Prérequis
- Node.js 18+
- npm ou yarn
- Compte Firebase

### 1. Cloner le projet
```bash
git clone <repository-url>
cd elite
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration Firebase

#### Créer un projet Firebase
1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Créez un nouveau projet
3. Activez les services suivants :
   - Authentication
   - Firestore Database
   - Storage
   - Cloud Messaging
   - Analytics

#### Configurer l'authentification
1. Dans Firebase Console > Authentication > Sign-in method
2. Activez les providers souhaités (Google, GitHub, etc.)
3. Configurez les domaines autorisés

#### Configurer Firestore
1. Dans Firebase Console > Firestore Database
2. Créez une base de données en mode production
3. Configurez les règles de sécurité

#### Configurer Storage
1. Dans Firebase Console > Storage
2. Initialisez le bucket de stockage
3. Configurez les règles de sécurité

#### Configurer Cloud Messaging
1. Dans Firebase Console > Cloud Messaging
2. Générez une clé VAPID
3. Remplacez `VOTRE_CLE_VAPID_ICI` dans `src/firebase/messaging.js`

### 4. Variables d'environnement
Créez un fichier `.env.local` :
```env
VITE_API_KEY=votre_clé_api_groq
```

### 5. Lancer l'application
```bash
npm run dev
```

## 🏗️ Architecture

### Structure des dossiers
```
src/
├── components/          # Composants React
│   ├── Auth/           # Authentification
│   ├── chat/           # Interface de chat
│   ├── Context/        # Contextes React
│   └── UI/             # Composants UI réutilisables
├── firebase/           # Services Firebase
│   ├── config.js       # Configuration Firebase
│   ├── auth.js         # Service d'authentification
│   ├── database.js     # Service de base de données
│   ├── storage.js      # Service de stockage
│   ├── messaging.js    # Service de notifications
│   └── index.js        # Exports des services
├── hooks/              # Hooks personnalisés
└── assets/             # Ressources statiques
```

### Services Firebase

#### Authentification (`auth.js`)
- Gestion des providers OAuth
- Création de comptes
- Gestion des sessions
- Profils utilisateurs

#### Base de données (`database.js`)
- Conversations en temps réel
- Messages et réactions
- Statuts de présence
- Notifications

#### Stockage (`storage.js`)
- Upload de médias
- Gestion des fichiers
- Compression automatique
- URLs sécurisées

#### Notifications (`messaging.js`)
- Notifications push
- Notifications locales
- Actions de notification
- Gestion des permissions

## 🔧 Configuration

### Règles Firestore
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Utilisateurs
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Conversations
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
    }
    
    // Messages
    match /messages/{messageId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in get(/databases/$(database)/documents/conversations/$(resource.data.conversationId)).data.participants;
    }
    
    // Notifications
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

### Règles Storage
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Images de chat
    match /chat-images/{conversationId}/{fileName} {
      allow read, write: if request.auth != null;
    }
    
    // Vidéos de chat
    match /chat-videos/{conversationId}/{fileName} {
      allow read, write: if request.auth != null;
    }
    
    // Avatars utilisateurs
    match /user-avatars/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🚀 Déploiement

### Build de production
```bash
npm run build
```

### Déploiement Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 📱 Fonctionnalités Avancées

### IA Conversationnelle
- Intégration Groq pour des réponses intelligentes
- Personnalisation basée sur le profil utilisateur
- Réponses contextuelles

### Présence en Temps Réel
- Statuts en ligne/hors ligne
- Indicateurs de frappe
- Dernière connexion

### Gestion des Médias
- Upload multiple
- Prévisualisation
- Compression automatique
- Support de nombreux formats

## 🔒 Sécurité

- Authentification Firebase sécurisée
- Règles Firestore strictes
- Validation côté client et serveur
- Chiffrement des données sensibles
- Protection CSRF

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Consultez la documentation Firebase
- Contactez l'équipe de développement

## 🔄 Mises à Jour

### v1.0.0
- Intégration Firebase complète
- Authentification multi-providers
- Messagerie temps réel
- Notifications push
- Interface responsive
- Gestion des médias
