# 🚀 Configuration Rapide de la Base de Données

Votre application ne trouve pas les tables dans Supabase car elles n'ont pas encore été créées. Voici comment les créer rapidement :

## ⚡ Étapes Rapides (5 minutes)

### 1. Ouvrir Supabase Dashboard
1. Allez sur [app.supabase.com](https://app.supabase.com)
2. Connectez-vous à votre compte
3. Ouvrez votre projet (avec l'URL `oxazzejsmratrlzvrdfq.supabase.co`)

### 2. Aller dans l'Éditeur SQL
1. Dans le menu de gauche, cliquez sur **"SQL Editor"**
2. Cliquez sur **"New Query"** (ou le bouton + pour créer une nouvelle requête)

### 3. Copier et Exécuter le Schéma
1. Ouvrez le fichier `database_schema.sql` dans votre éditeur
2. **Copiez TOUT le contenu** du fichier (Ctrl+A puis Ctrl+C)
3. **Collez le contenu** dans l'éditeur SQL de Supabase (Ctrl+V)
4. Cliquez sur **"Run"** (ou appuyez sur Ctrl+Enter)

### 4. Vérifier la Création
Après l'exécution, vous devriez voir :
- ✅ Tables créées avec succès
- ✅ Index créés
- ✅ Politiques RLS configurées
- ✅ Données de test insérées

### 5. Actualiser l'Application
1. Retournez à votre application
2. Actualisez la page (F5)
3. L'erreur de table manquante devrait disparaître

## 🔧 Alternative : Variables d'Environnement

Si vous n'avez pas encore configuré votre clé Supabase, créez un fichier `.env` avec :

```env
VITE_SUPABASE_URL=https://oxazzejsmratrlzvrdfq.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_ici
```

Pour trouver votre clé anon :
1. Dans votre projet Supabase, allez dans **Settings** > **API**
2. Copiez la **"anon/public"** key

## 🎯 Ce qui sera créé

Les tables suivantes seront créées :
- `users` - Profils utilisateurs
- `discussions` - Conversations
- `discussion_participants` - Qui participe à quoi
- `messages` - Messages dans les discussions
- `calls` - Historique des appels
- `statuses` - Stories/statuts
- `notifications` - Notifications

## 🚨 En cas de problème

### Erreur de permissions
Si vous avez une erreur de permissions, assurez-vous d'être **propriétaire** du projet Supabase.

### Erreur de syntaxe SQL
1. Vérifiez que vous avez copié **tout** le contenu du fichier
2. Vérifiez qu'il n'y a pas de caractères étranges
3. Essayez de copier-coller section par section

### L'application ne se connecte toujours pas
1. Vérifiez que la clé anon est correcte dans `.env`
2. Vérifiez que l'URL du projet est correcte
3. Actualisez la page de l'application

## ✅ Test Final

Une fois terminé, votre application devrait :
- Se connecter sans erreur
- Afficher l'interface de discussion
- Permettre de créer des conversations
- Permettre d'envoyer des messages

---

💡 **Astuce** : Gardez l'onglet Supabase ouvert pour pouvoir voir les données en temps réel dans la section "Table Editor" !
