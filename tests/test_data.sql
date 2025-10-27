-- Données de test pour l'application ELITE
-- À exécuter après avoir créé les tables

-- Insérer des utilisateurs de test (si pas déjà fait)
INSERT INTO public.users (id, name, avatar_url, status) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Alice Martin', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', 'online'),
    ('22222222-2222-2222-2222-222222222222', 'Bob Wilson', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 'online'),
    ('33333333-3333-3333-3333-333333333333', 'Charlie Brown', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 'offline'),
    ('44444444-4444-4444-4444-444444444444', 'Diana Prince', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', 'online'),
    ('55555555-5555-5555-5555-555555555555', 'Eve Johnson', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', 'online')
ON CONFLICT (id) DO NOTHING;

-- Créer des discussions de test
INSERT INTO public.discussions (id, name, type) VALUES
    ('d1111111-1111-1111-1111-111111111111', 'Discussion privée Alice-Bob', 'private'),
    ('d2222222-2222-2222-2222-222222222222', 'Groupe de travail', 'group'),
    ('d3333333-3333-3333-3333-333333333333', 'Discussion privée Alice-Charlie', 'private'),
    ('d4444444-4444-4444-4444-444444444444', 'Équipe projet', 'group')
ON CONFLICT (id) DO NOTHING;

-- Ajouter des participants aux discussions
INSERT INTO public.discussion_participants (discussion_id, user_id, role) VALUES
    -- Discussion Alice-Bob
    ('d1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'member'),
    ('d1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'member'),
    
    -- Groupe de travail
    ('d2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'admin'),
    ('d2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'member'),
    ('d2222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'member'),
    ('d2222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'member'),
    
    -- Discussion Alice-Charlie
    ('d3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'member'),
    ('d3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'member'),
    
    -- Équipe projet
    ('d4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'admin'),
    ('d4444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'member'),
    ('d4444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 'member')
ON CONFLICT (discussion_id, user_id) DO NOTHING;

-- Insérer des messages de test
INSERT INTO public.messages (discussion_id, sender_id, content, message_type, created_at) VALUES
    -- Messages dans la discussion Alice-Bob
    ('d1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Salut Bob ! Comment ça va ?', 'text', NOW() - INTERVAL '2 hours'),
    ('d1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Salut Alice ! Ça va bien, merci ! Et toi ?', 'text', NOW() - INTERVAL '1 hour 55 minutes'),
    ('d1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Très bien ! Tu as fini le rapport ?', 'text', NOW() - INTERVAL '1 hour 30 minutes'),
    ('d1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Oui, je l\'ai envoyé hier soir', 'text', NOW() - INTERVAL '1 hour'),
    
    -- Messages dans le groupe de travail
    ('d2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Bonjour à tous ! Réunion à 14h aujourd\'hui', 'text', NOW() - INTERVAL '3 hours'),
    ('d2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'D\'accord, je serai là', 'text', NOW() - INTERVAL '2 hours 45 minutes'),
    ('d2222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'Moi aussi !', 'text', NOW() - INTERVAL '2 hours 30 minutes'),
    ('d2222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'Je ne pourrai pas, désolé', 'text', NOW() - INTERVAL '2 hours'),
    
    -- Messages dans la discussion Alice-Charlie
    ('d3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Charlie, tu as reçu le document ?', 'text', NOW() - INTERVAL '4 hours'),
    ('d3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Oui, merci !', 'text', NOW() - INTERVAL '3 hours 30 minutes'),
    
    -- Messages dans l'équipe projet
    ('d4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Nouveau sprint démarré !', 'text', NOW() - INTERVAL '1 day'),
    ('d4444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Parfait, je commence par le module auth', 'text', NOW() - INTERVAL '23 hours'),
    ('d4444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 'Je m\'occupe du frontend', 'text', NOW() - INTERVAL '22 hours')
ON CONFLICT DO NOTHING;

-- Insérer des appels de test
INSERT INTO public.calls (discussion_id, initiator_id, call_type, status, started_at, ended_at, duration) VALUES
    ('d1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'audio', 'ended', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '5 minutes', 300),
    ('d2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'video', 'ended', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '15 minutes', 900),
    ('d1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'audio', 'missed', NOW() - INTERVAL '3 hours', NULL, 0)
ON CONFLICT DO NOTHING;

-- Insérer des participants aux appels
INSERT INTO public.call_participants (call_id, user_id, joined_at, left_at) VALUES
    ((SELECT id FROM public.calls WHERE discussion_id = 'd1111111-1111-1111-1111-111111111111' AND initiator_id = '11111111-1111-1111-1111-111111111111' LIMIT 1), '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '5 minutes'),
    ((SELECT id FROM public.calls WHERE discussion_id = 'd1111111-1111-1111-1111-111111111111' AND initiator_id = '11111111-1111-1111-1111-111111111111' LIMIT 1), '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '1 day' + INTERVAL '30 seconds', NOW() - INTERVAL '1 day' + INTERVAL '5 minutes'),
    
    ((SELECT id FROM public.calls WHERE discussion_id = 'd2222222-2222-2222-2222-222222222222' LIMIT 1), '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '15 minutes'),
    ((SELECT id FROM public.calls WHERE discussion_id = 'd2222222-2222-2222-2222-222222222222' LIMIT 1), '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '2 days' + INTERVAL '1 minute', NOW() - INTERVAL '2 days' + INTERVAL '15 minutes'),
    ((SELECT id FROM public.calls WHERE discussion_id = 'd2222222-2222-2222-2222-222222222222' LIMIT 1), '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '2 days' + INTERVAL '2 minutes', NOW() - INTERVAL '2 days' + INTERVAL '15 minutes')
ON CONFLICT DO NOTHING;

-- Insérer des statuts de test
INSERT INTO public.statuses (user_id, content, type, expires_at) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Belle journée aujourd\'hui ! ☀️', 'text', NOW() + INTERVAL '24 hours'),
    ('22222222-2222-2222-2222-222222222222', 'Au bureau, travail en cours... 💼', 'text', NOW() + INTERVAL '24 hours'),
    ('44444444-4444-4444-4444-444444444444', 'Café du matin ☕', 'text', NOW() + INTERVAL '24 hours')
ON CONFLICT DO NOTHING;

-- Insérer des vues de statuts
INSERT INTO public.status_views (status_id, viewer_id) VALUES
    ((SELECT id FROM public.statuses WHERE user_id = '11111111-1111-1111-1111-111111111111' LIMIT 1), '22222222-2222-2222-2222-222222222222'),
    ((SELECT id FROM public.statuses WHERE user_id = '11111111-1111-1111-1111-111111111111' LIMIT 1), '44444444-4444-4444-4444-444444444444'),
    ((SELECT id FROM public.statuses WHERE user_id = '22222222-2222-2222-2222-222222222222' LIMIT 1), '11111111-1111-1111-1111-111111111111'),
    ((SELECT id FROM public.statuses WHERE user_id = '44444444-4444-4444-4444-444444444444' LIMIT 1), '11111111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;

-- Insérer des notifications de test
INSERT INTO public.notifications (user_id, type, title, body, data) VALUES
    ('11111111-1111-1111-1111-111111111111', 'message', 'Nouveau message', 'Bob a envoyé un message', '{"discussion_id": "d1111111-1111-1111-1111-111111111111"}'),
    ('22222222-2222-2222-2222-222222222222', 'call', 'Appel manqué', 'Alice a essayé de vous appeler', '{"call_id": "c1111111-1111-1111-1111-111111111111"}'),
    ('44444444-4444-4444-4444-444444444444', 'status', 'Nouveau statut', 'Alice a publié un nouveau statut', '{"status_id": "s1111111-1111-1111-1111-111111111111"}')
ON CONFLICT DO NOTHING;