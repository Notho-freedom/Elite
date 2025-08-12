# Composants Archivés

Ce dossier contient les composants qui ont été identifiés comme non utilisés dans le flux principal de l'application ELITE.

## Composants Archivés

### Composants de Discussion (Remplacés par Enhanced)
- `DiscussionList.jsx` - Remplacé par EliteDiscussionList
- `DiscussionItem.jsx` - Remplacé par EnhancedDiscussionItem

### Composants de Chat (Remplacés par Enhanced)
- `ChatPage.jsx` - Remplacé par EnhancedChatPage
- `ChatInput.jsx` - Remplacé par EnhancedChatInput
- `MessageBubble.jsx` - Remplacé par EnhancedMessageBubble
- `ChatSync.jsx` - Fonctionnalité intégrée ailleurs
- `ChatSettings.jsx` - Non utilisé dans l'interface actuelle
- `Notif.jsx` - Système de notification remplacé
- `MessageReactions.jsx` - Fonctionnalité non implémentée
- `ReactionMenu.jsx` - Fonctionnalité non implémentée
- `renderEmoji.jsx` - Remplacé par LottieEmoji

### Composants UI (Non Utilisés)
- `WarBanner.jsx` - Bannière de guerre non utilisée
- `GameOfThronesBanner.jsx` - Bannière GoT non utilisée

### Composants de Profil (Non Utilisés)
- `DesktopProfile.jsx` - Remplacé par EnhancedProfile

### Composants de Développement (.bin)
- `themeStyles.jsx` - Styles de thème de développement
- `AnimatedHaloLogo.jsx` - Logo animé de test
- `LoginSocial.jsx` - Composant de connexion sociale de test
- `MediaPreviewList.jsx` - Liste de prévisualisation de test

## Composants Restaurés (Suite aux Erreurs)

Les composants suivants ont été restaurés car ils étaient encore importés dans l'application :

### Composants Restaurés le 12 Août 2025
- `theme.jsx` → Restauré (utilisé par ThemeContext)
- `CallHistory.jsx` → Restauré (utilisé par MainView)
- `Entry.jsx` → Restauré (utilisé par MainView)
- `loading.jsx` → Restauré (utilisé par MainView)
- `NativeFeatures.jsx` → Restauré (utilisé par MainView)
- `Logo.jsx` → Restauré (utilisé par Entry.jsx et Loading.jsx)

## Raison de l'Archivage

Ces composants ont été archivés car :
1. Ils ont été remplacés par des versions Enhanced plus avancées
2. Ils ne sont pas utilisés dans le flux principal de l'application
3. Ils sont des composants de développement ou de test
4. Ils implémentent des fonctionnalités non encore utilisées

## Réutilisation

Si vous avez besoin de réutiliser l'un de ces composants :
1. Vérifiez d'abord s'il existe une version Enhanced équivalente
2. Testez le composant dans le contexte actuel
3. Mettez à jour les imports et dépendances si nécessaire
4. Déplacez le composant du dossier archive vers le dossier approprié

## Structure Actuelle

L'application utilise maintenant principalement :
- Composants Enhanced pour les fonctionnalités avancées
- Context API pour la gestion d'état
- Composants Elite pour les fonctionnalités spécifiques
- Hooks personnalisés pour la logique métier
