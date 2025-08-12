-- =====================================================
-- SCRIPT SIMPLE: Créer le bucket chat-media
-- À exécuter dans l'éditeur SQL de Supabase
-- =====================================================

-- 1. Créer le bucket (simple)
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-media', 'chat-media', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Politique lecture publique (simplifiée)
CREATE POLICY IF NOT EXISTS "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'chat-media');

-- 3. Politique upload pour utilisateurs authentifiés (simplifiée)
CREATE POLICY IF NOT EXISTS "Authenticated upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'chat-media' 
  AND auth.uid() IS NOT NULL
);

-- 4. Vérification
SELECT 'Bucket créé avec succès' as status, * FROM storage.buckets WHERE id = 'chat-media';
