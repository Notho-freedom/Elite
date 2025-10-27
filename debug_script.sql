-- Script de debug pour vérifier la base de données Elite Chat
-- À exécuter dans le SQL Editor de Supabase

-- 1. Vérifier que la table users publique est peuplée
SELECT 
    'Users dans table publique' as info,
    COUNT(*) as count,
    array_agg(name) as names
FROM public.users;

-- 2. Vérifier que la vue discussions_with_details existe
SELECT 'Vue discussions_with_details existe' as info,
       COUNT(*) as count
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name = 'discussions_with_details';

-- 3. Vérifier les discussions existantes
SELECT 
    'Discussions existantes' as info,
    COUNT(*) as count
FROM public.discussions;

-- 4. Vérifier les participants
SELECT 
    'Participants' as info,
    COUNT(*) as count
FROM public.discussion_participants;

-- 5. Tester la vue discussions_with_details
SELECT 
    id,
    display_name,
    display_avatar,
    type,
    unread_count,
    other_user_online,
    created_at
FROM public.discussions_with_details
LIMIT 5;

-- 6. Vérifier la fonction create_private_discussion
SELECT 'Fonction create_private_discussion existe' as info,
       COUNT(*) as count
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'create_private_discussion';

-- 7. Vérifier les utilisateurs authentifiés récemment
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
