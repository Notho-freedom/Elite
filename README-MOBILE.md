# Application Mobile Parallele

Cette application a été encapsulée avec Capacitor pour créer des versions natives Android et iOS.

## Prérequis

### Pour Android
- **Android Studio** installé avec SDK Android
- **Java JDK 17+**
- Un appareil Android ou un émulateur configuré

### Pour iOS (macOS uniquement)
- **Xcode 15+** installé
- **CocoaPods** installé (`sudo gem install cocoapods`)
- Un appareil iOS ou un simulateur configuré

## Scripts Disponibles

```bash
# Construire l'app web et synchroniser avec les plateformes mobiles
npm run cap:build

# Synchroniser les changements sans rebuilder
npm run cap:sync

# Ouvrir Android Studio pour développement Android
npm run cap:android

# Ouvrir Xcode pour développement iOS
npm run cap:ios

# Exécuter directement sur un appareil/émulateur Android
npm run cap:run:android

# Exécuter directement sur un appareil/simulateur iOS
npm run cap:run:ios
```

## Développement

### Flux de développement recommandé

1. **Développement web** : Utilisez `npm run dev` pour le développement web normal
2. **Test mobile** : 
   ```bash
   npm run cap:build  # Construit et synchronise
   npm run cap:android  # Ouvre Android Studio
   # ou
   npm run cap:ios  # Ouvre Xcode
   ```

### Après chaque modification du code

```bash
npm run cap:build
```

Ce script va :
1. Construire l'application web (`npm run build`)
2. Synchroniser les fichiers avec les plateformes mobiles (`cap sync`)

## Configuration

### Capacitor Configuration
Le fichier `capacitor.config.ts` contient la configuration principale :
- **App ID** : `com.parallele.app`
- **App Name** : `Parallele App`
- **Web Directory** : `dist` (sortie de Vite)

### Plugins Capacitor Inclus
- **SplashScreen** : Écran de démarrage configuré avec logo et animations
- **Core plugins** : Navigation, statut de l'appareil, etc.

## Déploiement

### Android
1. Ouvrez Android Studio : `npm run cap:android`
2. Connectez un appareil Android ou lancez un émulateur
3. Cliquez sur "Run" dans Android Studio

### iOS
1. Ouvrez Xcode : `npm run cap:ios`
2. Connectez un appareil iOS ou lancez un simulateur
3. Sélectionnez votre équipe de développement
4. Cliquez sur "Run" dans Xcode

## Production

### Android (APK/AAB)
1. Dans Android Studio : Build > Generate Signed Bundle/APK
2. Suivez l'assistant pour signer votre APK

### iOS (IPA)
1. Dans Xcode : Product > Archive
2. Suivez l'assistant pour distribuer votre app

## Dépannage

### Erreurs communes

**"Could not find installation of TypeScript"**
```bash
npm install -D typescript
```

**"sync could not run--missing dist directory"**
```bash
npm run build
npm run cap:sync
```

**Problèmes de synchronisation**
```bash
npm run cap:build  # Force la reconstruction et la sync
```

## Structure des dossiers

```
├── android/          # Projet Android Studio
├── ios/              # Projet Xcode
├── src/              # Code source React
├── dist/             # Build web (généré)
├── capacitor.config.ts  # Configuration Capacitor
└── package.json      # Scripts et dépendances
```

## Plugins Capacitor Utiles

Pour ajouter plus de fonctionnalités natives, vous pouvez installer :

```bash
# Caméra
npm install @capacitor/camera

# Géolocalisation
npm install @capacitor/geolocation

# Notifications push
npm install @capacitor/push-notifications

# Stockage local
npm install @capacitor/storage

# Partage
npm install @capacitor/share
```

Après installation, n'oubliez pas de synchroniser :
```bash
npm run cap:sync
```