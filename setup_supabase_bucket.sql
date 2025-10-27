-- =====================================================
-- Configuration Supabase Storage pour Elite Chat
-- À exécuter dans l'éditeur SQL de Supabase
-- =====================================================

-- 1. Créer le bucket pour les médias de chat
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-media',
  'chat-media', 
  true,
  52428800, -- 50MB par fichier
  ARRAY[
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'application/pdf',
    'text/plain'
  ]
);

-- 2. Politique pour permettre la lecture publique des médias
CREATE POLICY "Public Access for Chat Media" ON storage.objects
FOR SELECT USING (bucket_id = 'chat-media');

-- 3. Politique pour permettre l'upload aux utilisateurs authentifiés
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'chat-media' 
  AND auth.uid() IS NOT NULL
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Politique pour permettre la suppression de ses propres fichiers
CREATE POLICY "Users can delete own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'chat-media'
  AND auth.uid() IS NOT NULL
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. Politique pour permettre la mise à jour de ses propres fichiers
CREATE POLICY "Users can update own files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'chat-media'
  AND auth.uid() IS NOT NULL
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 6. Vérification que le bucket est créé
SELECT * FROM storage.buckets WHERE id = 'chat-media';

-- 7. Vérification des politiques
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
