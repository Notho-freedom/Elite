# Guide de Configuration Elite Chat

## Variables d'environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

### Configuration obligatoire

```env
# Supabase - OBLIGATOIRE
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon-supabase
```

Pour obtenir ces valeurs :
1. Connectez-vous à [Supabase](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans Settings > API
4. Copiez l'URL et la clé anon

### Configuration optionnelle

```env
# Application
VITE_APP_URL=http://localhost:5173
VITE_API_URL=https://votre-projet.supabase.co

# WebRTC pour les appels
VITE_TURN_SERVER=turn:turn.example.com:3478
VITE_TURN_USERNAME=username
VITE_TURN_PASSWORD=password

# Activation des fonctionnalités
VITE_ENABLE_CALLS=true
VITE_ENABLE_STATUS=true
VITE_ENABLE_REACTIONS=true
VITE_ENABLE_TYPING=true
VITE_ENABLE_PRESENCE=true
VITE_ENABLE_ENCRYPTION=false
VITE_ENABLE_PAYMENTS=false

# Développement
VITE_USE_MOCK_DATA=false
VITE_API_DELAY=0

# CDN pour les médias
VITE_CDN_URL=https://votre-cdn.com

# Push notifications
VITE_VAPID_PUBLIC_KEY=votre-cle-publique-vapid
```

## Configuration Supabase

### 1. Base de données

Exécutez le schéma SQL :
```bash
# Connectez-vous à votre projet Supabase
# Allez dans SQL Editor
# Collez et exécutez le contenu de tests/database_schema_updated.sql
```

### 2. Authentification

Dans Authentication > Providers :
- Email : Activé par défaut
- Google : Ajoutez votre OAuth client ID et secret
- GitHub : Ajoutez votre OAuth App ID et secret

### 3. Stockage

Créez les buckets suivants dans Storage :

```sql
-- Créer les buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('images', 'images', true),
  ('videos', 'videos', true),
  ('audio', 'audio', true),
  ('documents', 'documents', true),
  ('thumbnails', 'thumbnails', true),
  ('avatars', 'avatars', true),
  ('status-media', 'status-media', true);
```

### 4. Politiques de stockage

```sql
-- Politique pour upload d'images
CREATE POLICY "Users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id IN ('images', 'thumbnails', 'avatars', 'status-media') AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Politique pour lecture publique
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (
    bucket_id IN ('images', 'videos', 'audio', 'thumbnails', 'avatars')
  );

-- Politique pour suppression
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

### 5. Fonctions Edge (optionnel)

Pour les notifications push et autres fonctionnalités avancées :

```typescript
// supabase/functions/send-notification/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  // Logique de notification
})
```

## Configuration locale

### 1. Installation des dépendances

```bash
npm install
```

### 2. Lancement en développement

```bash
npm run dev
```

### 3. Build pour production

```bash
npm run build
```

## Configuration mobile (Capacitor)

### 1. Synchronisation

```bash
npm run cap:sync
```

### 2. Configuration Android

Dans `android/app/src/main/AndroidManifest.xml` :
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
```

### 3. Configuration iOS

Dans `ios/App/App/Info.plist` :
```xml
<key>NSCameraUsageDescription</key>
<string>Pour prendre des photos et passer des appels vidéo</string>
<key>NSMicrophoneUsageDescription</key>
<string>Pour envoyer des messages vocaux et passer des appels</string>
```

## Sécurité

### 1. Variables sensibles

Ne jamais commiter :
- `.env`
- Clés API
- Secrets OAuth
- Certificats

### 2. CORS

Dans Supabase Dashboard > Settings > API :
- Ajoutez vos domaines autorisés

### 3. Rate limiting

Configurez dans Supabase :
```sql
-- Exemple de fonction pour limiter les requêtes
CREATE OR REPLACE FUNCTION check_rate_limit(user_id UUID, action TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Logique de rate limiting
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Monitoring

### 1. Logs Supabase

Dashboard > Logs pour voir :
- Requêtes API
- Erreurs
- Performance

### 2. Métriques personnalisées

```javascript
// Tracking des performances
window.addEventListener('load', () => {
  const perfData = window.performance.timing;
  const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
  console.log('Page load time:', pageLoadTime);
});
```

## Dépannage

### Erreurs courantes

1. **"Missing Supabase environment variables"**
   - Vérifiez que `.env` existe
   - Redémarrez le serveur de développement

2. **"Permission denied"**
   - Vérifiez les politiques RLS
   - Assurez-vous que l'utilisateur est authentifié

3. **"CORS error"**
   - Ajoutez votre domaine dans Supabase
   - Vérifiez les headers

4. **"Connection timeout"**
   - Vérifiez votre connexion internet
   - Vérifiez l'URL Supabase

### Debug mode

```javascript
// Activer les logs détaillés
localStorage.setItem('debug', 'elite:*');
```

## Support

Pour toute question :
1. Consultez la documentation Supabase
2. Vérifiez les logs d'erreur
3. Testez en environnement local d'abord
