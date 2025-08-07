# 📱 Guide des Fonctionnalités Natives Capacitor

## 🎯 **Vue d'ensemble**

Votre application est maintenant équipée de fonctionnalités natives mobiles grâce aux plugins Capacitor. Voici comment les utiliser :

## 🚀 **Fonctionnalités Disponibles**

### **1. 📸 Caméra**
- **Fonction** : Prendre des photos directement depuis l'appareil
- **Utilisation** : Cliquez sur "Prendre une photo" dans l'onglet Native
- **Permissions** : L'app demandera l'autorisation d'accéder à la caméra
- **Résultat** : Photo affichée dans l'interface

### **2. 📍 Géolocalisation**
- **Fonction** : Obtenir la position GPS de l'appareil
- **Utilisation** : Cliquez sur "Obtenir ma position"
- **Permissions** : Autorisation de localisation requise
- **Résultat** : Coordonnées GPS (latitude, longitude, précision)

### **3. 💾 Stockage Local**
- **Fonction** : Sauvegarder des données localement sur l'appareil
- **Utilisation** : Cliquez sur "Sauvegarder des données"
- **Stockage** : Données persistantes entre les sessions
- **Résultat** : Données affichées et récupérables

### **4. 📤 Partage**
- **Fonction** : Partager du contenu via les apps natives
- **Utilisation** : Cliquez sur "Partager l'application"
- **Options** : WhatsApp, Email, SMS, etc.
- **Résultat** : Menu de partage natif

### **5. 🔔 Notifications Push**
- **Fonction** : Recevoir des notifications push
- **Utilisation** : Cliquez sur "Configurer les notifications"
- **Permissions** : Autorisation de notifications requise
- **Résultat** : Notifications configurées

### **6. 📱 Informations Appareil**
- **Fonction** : Obtenir les infos de l'appareil
- **Affichage** : Automatique au chargement
- **Données** : Nom, modèle, plateforme, version OS

## 🔧 **Configuration des Permissions**

### **Android (android/app/src/main/AndroidManifest.xml)**
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
```

### **iOS (ios/App/App/Info.plist)**
```xml
<key>NSCameraUsageDescription</key>
<string>Cette app utilise la caméra pour prendre des photos</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>Cette app utilise la géolocalisation pour vous localiser</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Cette app utilise la géolocalisation pour vous localiser</string>
```

## 🛠️ **Développement et Test**

### **Tester sur Android :**
```bash
# Construire et synchroniser
npm run cap:build

# Ouvrir Android Studio
npm run cap:android

# Ou exécuter directement
npm run cap:run:android
```

### **Tester sur iOS :**
```bash
# Construire et synchroniser
npm run cap:build

# Ouvrir Xcode
npm run cap:ios

# Ou exécuter directement
npm run cap:run:ios
```

## 📝 **Exemples d'Utilisation dans le Code**

### **Caméra :**
```javascript
import { Camera, CameraResultType } from '@capacitor/camera';

const takePhoto = async () => {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: true,
    resultType: CameraResultType.Uri
  });
  console.log('Photo:', image.webPath);
};
```

### **Géolocalisation :**
```javascript
import { Geolocation } from '@capacitor/geolocation';

const getLocation = async () => {
  const coordinates = await Geolocation.getCurrentPosition();
  console.log('Position:', coordinates);
};
```

### **Stockage :**
```javascript
import { Preferences } from '@capacitor/preferences';

// Sauvegarder
await Preferences.set({
  key: 'user_data',
  value: 'mes données'
});

// Récupérer
const { value } = await Preferences.get({ key: 'user_data' });
```

### **Partage :**
```javascript
import { Share } from '@capacitor/share';

await Share.share({
  title: 'Mon App',
  text: 'Découvrez cette app !',
  url: 'https://mon-app.com'
});
```

### **Notifications :**
```javascript
import { PushNotifications } from '@capacitor/push-notifications';

// Demander les permissions
const permission = await PushNotifications.requestPermissions();

if (permission.receive === 'granted') {
  // S'inscrire
  await PushNotifications.register();
  
  // Écouter les notifications
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Notification reçue:', notification);
  });
}
```

## 🔍 **Débogage**

### **Logs Android :**
```bash
# Dans Android Studio
adb logcat | grep "com.parallele.app"
```

### **Logs iOS :**
```bash
# Dans Xcode
# Console > Device Logs
```

### **Vérifier les permissions :**
```javascript
// Vérifier les permissions caméra
const permission = await Camera.checkPermissions();
console.log('Permissions caméra:', permission);

// Vérifier les permissions géolocalisation
const locationPermission = await Geolocation.checkPermissions();
console.log('Permissions géolocalisation:', locationPermission);
```

## 🚨 **Problèmes Courants**

### **"Permission denied"**
- Vérifiez que les permissions sont demandées
- Testez sur un appareil physique (pas émulateur)
- Vérifiez les paramètres de l'appareil

### **"Plugin not found"**
```bash
# Réinstaller les plugins
npm install @capacitor/camera @capacitor/geolocation
npm run cap:sync
```

### **"Function not available"**
- Vérifiez que vous testez sur mobile (pas navigateur)
- Assurez-vous que le plugin est bien synchronisé

## 📚 **Plugins Additionnels Utiles**

### **Installation :**
```bash
# Haptique (vibrations)
npm install @capacitor/haptics

# Fichiers
npm install @capacitor/filesystem

# Réseau
npm install @capacitor/network

# État de la batterie
npm install @capacitor/battery

# Écran
npm install @capacitor/screen

# Clavier
npm install @capacitor/keyboard
```

### **Synchronisation :**
```bash
npm run cap:sync
```

## 🎯 **Bonnes Pratiques**

1. **Gestion d'erreurs** : Toujours wrapper les appels natifs dans try/catch
2. **Permissions** : Vérifier les permissions avant d'utiliser les fonctionnalités
3. **Fallback** : Prévoir des alternatives pour le web
4. **Performance** : Éviter les appels fréquents aux APIs natives
5. **UX** : Indiquer clairement quand une fonctionnalité native est utilisée

## 🔄 **Workflow de Développement**

1. **Développement web** : `npm run dev`
2. **Test mobile** : `npm run cap:build && npm run cap:android`
3. **Débogage** : Utiliser les logs dans Android Studio/Xcode
4. **Déploiement** : Build via Android Studio/Xcode

Vos fonctionnalités natives sont maintenant prêtes à être utilisées ! 🚀 