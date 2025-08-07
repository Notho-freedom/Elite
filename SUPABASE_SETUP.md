# Configuration Supabase pour l'application ELITE

Ce guide vous explique comment configurer Supabase pour l'application ELITE.

## 📋 Prérequis

1. Un compte Supabase (gratuit sur [supabase.com](https://supabase.com))
2. Un projet Supabase créé
3. Les variables d'environnement configurées

## 🚀 Étapes de configuration

### 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez l'URL et la clé anon (vous en aurez besoin pour les variables d'environnement)

### 2. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet avec :

```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase
```

### 3. Créer les tables dans Supabase

1. Allez dans votre projet Supabase
2. Cliquez sur "SQL Editor" dans le menu de gauche
3. Copiez et exécutez le contenu du fichier `database_schema.sql`

### 4. Insérer les données de test

1. Dans le SQL Editor, copiez et exécutez le contenu du fichier `test_data.sql`
2. Cela créera des utilisateurs et des discussions de test

### 5. Configurer l'authentification

1. Dans votre projet Supabase, allez dans "Authentication" > "Settings"
2. Configurez les providers que vous souhaitez utiliser (Google, GitHub, etc.)
3. Ajoutez votre domaine dans "Site URL" pour la production

### 6. Configurer le stockage (optionnel)

Si vous voulez stocker des fichiers (images, vidéos) :

1. Allez dans "Storage" dans le menu de gauche
2. Créez un bucket appelé "media"
3. Configurez les politiques RLS pour ce bucket

## 🔧 Test de la configuration

### Dans le navigateur

1. Ouvrez la console de développement (F12)
2. Exécutez : `window.testSupabase()`

### Dans le code

```javascript
import { runTests } from './test_supabase.js';

// Exécuter les tests
runTests().then(results => {
  console.log('Tests terminés');
});
```

## 📊 Structure de la base de données

### Tables principales

- **users** : Profils des utilisateurs
- **discussions** : Conversations (privées ou groupes)
- **discussion_participants** : Participants aux discussions
- **messages** : Messages dans les discussions
- **calls** : Historique des appels
- **call_participants** : Participants aux appels
- **statuses** : Statuts/stories des utilisateurs
- **status_views** : Vues des statuts
- **notifications** : Notifications des utilisateurs

### Relations

```
users (1) ←→ (N) discussion_participants (N) ←→ (1) discussions
discussions (1) ←→ (N) messages
discussions (1) ←→ (N) calls
users (1) ←→ (N) statuses
users (1) ←→ (N) notifications
```

## 🔒 Sécurité (RLS)

Toutes les tables ont des politiques RLS (Row Level Security) configurées :

- Les utilisateurs ne peuvent voir que leurs propres données
- Les discussions ne sont visibles que par les participants
- Les messages ne sont visibles que par les participants de la discussion

## 🚨 Dépannage

### Erreur de connexion

1. Vérifiez que les variables d'environnement sont correctes
2. Vérifiez que l'URL et la clé anon sont valides
3. Vérifiez que le projet Supabase est actif

### Erreur de permissions

1. Vérifiez que les politiques RLS sont correctement configurées
2. Vérifiez que l'utilisateur est authentifié
3. Vérifiez que l'utilisateur a les bonnes permissions

### Erreur de tables manquantes

1. Exécutez le script `database_schema.sql` dans l'ordre
2. Vérifiez que toutes les tables ont été créées
3. Vérifiez que les triggers et fonctions ont été créés

## 📝 Notes importantes

- Les données de test sont optionnelles mais recommandées pour le développement
- Les politiques RLS sont strictes par défaut pour la sécurité
- Les triggers automatiques mettent à jour les timestamps
- Les UUIDs sont utilisés pour tous les IDs

## 🔄 Mise à jour

Pour mettre à jour le schéma :

1. Sauvegardez vos données importantes
2. Exécutez les nouveaux scripts SQL
3. Testez la configuration avec `test_supabase.js`

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs dans la console du navigateur
2. Vérifiez les logs dans le dashboard Supabase
3. Consultez la documentation Supabase
4. Créez une issue sur le repository du projet