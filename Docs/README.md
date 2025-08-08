# ELITE - Application de Messagerie Moderne

Une application de messagerie moderne construite avec React, Vite et Supabase, offrant une expérience utilisateur fluide et des fonctionnalités avancées.

## 🚀 Fonctionnalités

- **💬 Messagerie en temps réel** avec Supabase
- **📞 Appels audio/vidéo** intégrés
- **📱 Interface responsive** pour desktop et mobile
- **🌙 Thème sombre/clair** automatique
- **🔔 Notifications** push
- **📸 Fonctionnalités natives** (caméra, géolocalisation)
- **🎨 Interface moderne** avec animations fluides
- **🔒 Authentification sécurisée** avec OAuth

## 🛠️ Technologies

- **Frontend** : React 19, Vite, Framer Motion
- **Backend** : Supabase (PostgreSQL, Auth, Realtime)
- **Mobile** : Capacitor (Android/iOS)
- **Styling** : Tailwind CSS
- **Icons** : React Icons, Lucide React

## 📦 Installation

### Prérequis

- Node.js 18+ 
- npm ou yarn
- Compte Supabase (gratuit)

### 1. Cloner le projet

```bash
git clone <repository-url>
cd elite
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer Supabase

```bash
# Configuration automatique
npm run setup:supabase

# Ou manuellement :
# 1. Créer un projet sur https://supabase.com
# 2. Copier .env.example vers .env
# 3. Remplir les variables d'environnement
# 4. Exécuter database_schema.sql dans Supabase
```

### 4. Lancer l'application

```bash
npm run dev
```

## 🔧 Configuration Supabase

### Configuration rapide

1. **Créer un projet Supabase**
   - Allez sur [supabase.com](https://supabase.com)
   - Créez un nouveau projet
   - Notez l'URL et la clé anon

2. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env
   # Éditez .env avec vos données Supabase
   ```

3. **Créer les tables**
   - Dans Supabase, allez dans "SQL Editor"
   - Exécutez le contenu de `database_schema.sql`

4. **Insérer les données de test**
   - Exécutez le contenu de `test_data.sql`

5. **Tester la configuration**
   ```bash
   npm run test:supabase
   ```

### Documentation complète

Voir [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) pour la documentation complète.

## 📱 Déploiement Mobile

### Android

```bash
npm run cap:build
npm run cap:android
```

### iOS

```bash
npm run cap:build
npm run cap:ios
```

## 🧪 Tests

### Test de la configuration Supabase

```bash
# Dans le terminal
npm run test:supabase

# Dans le navigateur (console)
window.testSupabase()
```

## 📁 Structure du projet

```
elite/
├── src/
│   ├── components/          # Composants React
│   │   ├── Context/        # Contextes (App, Auth, Theme)
│   │   ├── chat/           # Composants de chat
│   │   └── ...
│   ├── lib/                # Utilitaires
│   │   └── supabase.js     # Configuration Supabase
│   └── ...
├── database_schema.sql      # Schéma de base de données
├── test_data.sql           # Données de test
├── test_supabase.js        # Script de test
└── SUPABASE_SETUP.md       # Guide de configuration
```

## 🔒 Sécurité

- **Row Level Security (RLS)** activé sur toutes les tables
- **Authentification OAuth** sécurisée
- **Chiffrement de bout en bout** pour les messages
- **Validation des données** côté client et serveur

## 🚨 Dépannage

### Erreur de connexion Supabase

1. Vérifiez les variables d'environnement dans `.env`
2. Vérifiez que le projet Supabase est actif
3. Exécutez `npm run test:supabase`

### Erreur de build

```bash
npm install
npm run build
```

### Problèmes de mobile

```bash
npm run cap:sync
npm run cap:build
```

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

- **Documentation** : [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- **Issues** : Créez une issue sur GitHub
- **Discussions** : Utilisez les discussions GitHub

## 🎯 Roadmap

- [ ] Appels vidéo en temps réel
- [ ] Partage de fichiers
- [ ] Statuts/stories
- [ ] Notifications push
- [ ] Chiffrement de bout en bout
- [ ] Support multi-langues
- [ ] Thèmes personnalisables
- [ ] Intégration IA

---

**ELITE** - Une expérience de messagerie moderne et élégante ✨
