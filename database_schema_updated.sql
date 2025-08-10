-- Schéma de base de données ELITE CHAT - Version Frontend Compatible
-- Adapté pour correspondre parfaitement aux attentes du frontend

-- =====================================================
-- 1. TABLE USERS (Étend auth.users de Supabase)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    
    -- Informations de base
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    username VARCHAR(100) UNIQUE,
    avatar_url TEXT,
    phone VARCHAR(20),
    
    -- Statut et présence
    status VARCHAR(50) DEFAULT 'offline', -- 'online', 'offline', 'away', 'busy'
    is_online BOOLEAN DEFAULT false,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Informations supplémentaires pour le frontend
    bio TEXT,
    location VARCHAR(255),
    website VARCHAR(255),
    
    -- Métadonnées pour les fonctionnalités avancées
    user_metadata JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{
        "theme": "system",
        "language": "fr",
        "notifications": {
            "sound": true,
            "vibration": true,
            "chat": true,
            "calls": true
        },
        "privacy": {
            "last_seen": "everyone",
            "read_receipts": true,
            "typing_indicators": true
        }
    }',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. TABLE DISCUSSIONS 
-- =====================================================
CREATE TABLE IF NOT EXISTS public.discussions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Informations de base
    name VARCHAR(255), -- NULL pour discussions privées
    description TEXT,
    avatar_url TEXT,
    type VARCHAR(50) DEFAULT 'private', -- 'private', 'group', 'channel'
    
    -- Métadonnées pour le frontend
    is_pinned BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    is_muted BOOLEAN DEFAULT false,
    
    -- Paramètres du groupe
    max_participants INTEGER DEFAULT 256,
    is_public BOOLEAN DEFAULT false,
    invite_link VARCHAR(255),
    
    -- Gestion
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. TABLE DISCUSSION_PARTICIPANTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.discussion_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    discussion_id UUID REFERENCES public.discussions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Rôle et permissions
    role VARCHAR(50) DEFAULT 'member', -- 'admin', 'moderator', 'member'
    permissions JSONB DEFAULT '{}',
    
    -- Statut dans la discussion
    is_active BOOLEAN DEFAULT true,
    is_muted BOOLEAN DEFAULT false,
    nickname VARCHAR(255), -- Surnom dans le groupe
    
    -- Timestamps
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(discussion_id, user_id)
);

-- =====================================================
-- 4. TABLE MESSAGES (Compatible Frontend)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    discussion_id UUID REFERENCES public.discussions(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Contenu du message
    content TEXT,
    message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'image', 'video', 'audio', 'file', 'system'
    
    -- Médias et fichiers
    media_url TEXT,
    media_type VARCHAR(50), -- 'image', 'video', 'audio', 'document'
    media_size INTEGER, -- Taille en bytes
    media_name VARCHAR(255), -- Nom original du fichier
    thumbnail_url TEXT, -- Pour les vidéos et images
    
    -- Réponses et mentions
    reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    mentions JSONB DEFAULT '[]', -- Array des IDs d'utilisateurs mentionnés
    
    -- Statut et métadonnées frontend
    status VARCHAR(50) DEFAULT 'sent', -- 'sending', 'sent', 'delivered', 'read', 'failed'
    is_edited BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    is_important BOOLEAN DEFAULT false,
    
    -- Réactions (pour compatibilité frontend)
    reactions JSONB DEFAULT '[]', -- Format: [{"emoji": "👍", "users": ["user_id1", "user_id2"]}]
    
    -- Métadonnées pour fonctionnalités avancées
    metadata JSONB DEFAULT '{}', -- URLs détectées, hashtags, etc.
    
    -- Géolocalisation (optionnel)
    location JSONB DEFAULT NULL, -- {lat, lng, address}
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 5. TABLE MESSAGE_REACTIONS (Pour gestion fine)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.message_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    emoji VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(message_id, user_id, emoji)
);

-- =====================================================
-- 6. TABLE MESSAGE_READ_STATUS (Statut de lecture)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.message_read_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(message_id, user_id)
);

-- =====================================================
-- 7. TABLE CALLS (Compatible avec l'interface)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.calls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    discussion_id UUID REFERENCES public.discussions(id) ON DELETE CASCADE,
    initiator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Type et statut
    call_type VARCHAR(50) DEFAULT 'audio', -- 'audio', 'video', 'screen_share'
    status VARCHAR(50) DEFAULT 'active', -- 'ringing', 'active', 'ended', 'missed', 'declined'
    
    -- Qualité et métriques
    quality VARCHAR(50), -- 'poor', 'fair', 'good', 'excellent'
    duration INTEGER DEFAULT 0, -- Durée en secondes
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    answered_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. TABLE CALL_PARTICIPANTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.call_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    call_id UUID REFERENCES public.calls(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Statut participant
    status VARCHAR(50) DEFAULT 'invited', -- 'invited', 'joined', 'left', 'declined'
    is_muted BOOLEAN DEFAULT false,
    is_video_enabled BOOLEAN DEFAULT true,
    
    -- Timestamps
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    joined_at TIMESTAMP WITH TIME ZONE,
    left_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(call_id, user_id)
);

-- =====================================================
-- 9. TABLE STATUSES (Stories/Statuts)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.statuses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Contenu
    content TEXT,
    media_url TEXT,
    thumbnail_url TEXT,
    type VARCHAR(50) DEFAULT 'text', -- 'text', 'image', 'video'
    
    -- Métadonnées
    background_color VARCHAR(10), -- Pour les statuts texte
    font_style VARCHAR(50),
    duration INTEGER DEFAULT 86400, -- Durée en secondes (24h par défaut)
    
    -- Visibilité
    visibility VARCHAR(50) DEFAULT 'contacts', -- 'public', 'contacts', 'close_friends'
    allowed_viewers JSONB DEFAULT '[]', -- IDs spécifiques autorisés
    
    -- Statistiques
    view_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- =====================================================
-- 10. TABLE STATUS_VIEWS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.status_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    status_id UUID REFERENCES public.statuses(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(status_id, viewer_id)
);

-- =====================================================
-- 11. TABLE NOTIFICATIONS (Frontend compatible)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Type et contenu
    type VARCHAR(50) NOT NULL, -- 'message', 'call', 'status', 'mention', 'reaction'
    title VARCHAR(255),
    body TEXT,
    
    -- Données contextuelles
    data JSONB DEFAULT '{}', -- IDs des objets liés, URLs, etc.
    action_url TEXT, -- URL à ouvrir lors du clic
    
    -- Statut
    is_read BOOLEAN DEFAULT false,
    is_push_sent BOOLEAN DEFAULT false,
    
    -- Métadonnées
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 12. TABLE TYPING_INDICATORS (Temps réel)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.typing_indicators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    discussion_id UUID REFERENCES public.discussions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(discussion_id, user_id)
);

-- =====================================================
-- INDEX POUR PERFORMANCES
-- =====================================================

-- Index pour les messages (frontend critique)
CREATE INDEX IF NOT EXISTS idx_messages_discussion_created ON public.messages(discussion_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_created ON public.messages(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON public.messages(reply_to_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON public.messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_type ON public.messages(message_type);

-- Index pour les discussions
CREATE INDEX IF NOT EXISTS idx_discussions_type ON public.discussions(type);
CREATE INDEX IF NOT EXISTS idx_discussions_created_by ON public.discussions(created_by);
CREATE INDEX IF NOT EXISTS idx_discussions_updated ON public.discussions(updated_at DESC);

-- Index pour les participants
CREATE INDEX IF NOT EXISTS idx_participants_discussion ON public.discussion_participants(discussion_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON public.discussion_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_active ON public.discussion_participants(is_active);

-- Index pour les réactions
CREATE INDEX IF NOT EXISTS idx_reactions_message ON public.message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user ON public.message_reactions(user_id);

-- Index pour le statut de lecture
CREATE INDEX IF NOT EXISTS idx_read_status_message ON public.message_read_status(message_id);
CREATE INDEX IF NOT EXISTS idx_read_status_user ON public.message_read_status(user_id);

-- Index pour les appels
CREATE INDEX IF NOT EXISTS idx_calls_discussion ON public.calls(discussion_id);
CREATE INDEX IF NOT EXISTS idx_calls_initiator ON public.calls(initiator_id);
CREATE INDEX IF NOT EXISTS idx_calls_status ON public.calls(status);
CREATE INDEX IF NOT EXISTS idx_calls_created ON public.calls(created_at DESC);

-- Index pour les statuts
CREATE INDEX IF NOT EXISTS idx_statuses_user ON public.statuses(user_id);
CREATE INDEX IF NOT EXISTS idx_statuses_created ON public.statuses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_statuses_expires ON public.statuses(expires_at);

-- Index pour les notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

-- Index pour les indicateurs de frappe
CREATE INDEX IF NOT EXISTS idx_typing_discussion ON public.typing_indicators(discussion_id);
CREATE INDEX IF NOT EXISTS idx_typing_started ON public.typing_indicators(started_at);

-- Index pour les utilisateurs
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_users_online ON public.users(is_online);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- =====================================================
-- FONCTIONS ET TRIGGERS
-- =====================================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_discussions_updated_at ON public.discussions;
CREATE TRIGGER update_discussions_updated_at 
    BEFORE UPDATE ON public.discussions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_messages_updated_at ON public.messages;
CREATE TRIGGER update_messages_updated_at 
    BEFORE UPDATE ON public.messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour mettre à jour le timestamp de la discussion
CREATE OR REPLACE FUNCTION update_discussion_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.discussions 
    SET updated_at = NOW() 
    WHERE id = NEW.discussion_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour la discussion lors d'un nouveau message
DROP TRIGGER IF EXISTS update_discussion_on_message ON public.messages;
CREATE TRIGGER update_discussion_on_message
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION update_discussion_timestamp();

-- Fonction pour nettoyer les indicateurs de frappe expirés
CREATE OR REPLACE FUNCTION cleanup_expired_typing()
RETURNS void AS $$
BEGIN
    DELETE FROM public.typing_indicators 
    WHERE started_at < NOW() - INTERVAL '10 seconds';
END;
$$ language 'plpgsql';

-- Fonction pour créer automatiquement un profil utilisateur
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, name, email, avatar_url, username)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement un profil utilisateur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_read_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;

-- Politiques pour users
DROP POLICY IF EXISTS "Users can view all public profiles" ON public.users;
CREATE POLICY "Users can view all public profiles" ON public.users
    FOR SELECT USING (true); -- Tous peuvent voir les profils publics

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Politiques pour discussions
DROP POLICY IF EXISTS "Users can view participated discussions" ON public.discussions;
CREATE POLICY "Users can view participated discussions" ON public.discussions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.discussion_participants dp
            WHERE dp.discussion_id = id AND dp.user_id = auth.uid() AND dp.is_active = true
        )
    );

DROP POLICY IF EXISTS "Users can create discussions" ON public.discussions;
CREATE POLICY "Users can create discussions" ON public.discussions
    FOR INSERT WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can update own discussions" ON public.discussions;
CREATE POLICY "Users can update own discussions" ON public.discussions
    FOR UPDATE USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.discussion_participants dp
            WHERE dp.discussion_id = id AND dp.user_id = auth.uid() AND dp.role IN ('admin', 'moderator')
        )
    );

-- Politiques pour participants
DROP POLICY IF EXISTS "Users can view discussion participants" ON public.discussion_participants;
CREATE POLICY "Users can view discussion participants" ON public.discussion_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.discussion_participants dp
            WHERE dp.discussion_id = discussion_id AND dp.user_id = auth.uid() AND dp.is_active = true
        )
    );

DROP POLICY IF EXISTS "Users can join discussions" ON public.discussion_participants;
CREATE POLICY "Users can join discussions" ON public.discussion_participants
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Politiques pour messages
DROP POLICY IF EXISTS "Users can view discussion messages" ON public.messages;
CREATE POLICY "Users can view discussion messages" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.discussion_participants dp
            WHERE dp.discussion_id = discussion_id AND dp.user_id = auth.uid() AND dp.is_active = true
        )
    );

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.discussion_participants dp
            WHERE dp.discussion_id = discussion_id AND dp.user_id = auth.uid() AND dp.is_active = true
        )
    );

DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;
CREATE POLICY "Users can update own messages" ON public.messages
    FOR UPDATE USING (sender_id = auth.uid());

-- Politiques pour réactions
DROP POLICY IF EXISTS "Users can view message reactions" ON public.message_reactions;
CREATE POLICY "Users can view message reactions" ON public.message_reactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.messages m
            JOIN public.discussion_participants dp ON m.discussion_id = dp.discussion_id
            WHERE m.id = message_id AND dp.user_id = auth.uid() AND dp.is_active = true
        )
    );

DROP POLICY IF EXISTS "Users can add own reactions" ON public.message_reactions;
CREATE POLICY "Users can add own reactions" ON public.message_reactions
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can remove own reactions" ON public.message_reactions;
CREATE POLICY "Users can remove own reactions" ON public.message_reactions
    FOR DELETE USING (user_id = auth.uid());

-- Politiques pour statut de lecture
DROP POLICY IF EXISTS "Users can view read status" ON public.message_read_status;
CREATE POLICY "Users can view read status" ON public.message_read_status
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own read status" ON public.message_read_status;
CREATE POLICY "Users can update own read status" ON public.message_read_status
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Politiques pour notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR ALL USING (user_id = auth.uid());

-- Politiques pour indicateurs de frappe
DROP POLICY IF EXISTS "Users can view typing indicators" ON public.typing_indicators;
CREATE POLICY "Users can view typing indicators" ON public.typing_indicators
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.discussion_participants dp
            WHERE dp.discussion_id = discussion_id AND dp.user_id = auth.uid() AND dp.is_active = true
        )
    );

-- =====================================================
-- VUES UTILES POUR LE FRONTEND
-- =====================================================

-- Vue pour les discussions avec détails (compatible frontend)
CREATE OR REPLACE VIEW public.discussions_with_details AS
SELECT 
    d.*,
    dp.user_id,
    dp.role,
    dp.is_muted as participant_muted,
    dp.nickname,
    
    -- Dernier message
    lm.id as last_message_id,
    lm.content as last_message_content,
    lm.created_at as last_message_at,
    lm.sender_id as last_message_sender_id,
    lm.message_type as last_message_type,
    lm.status as last_message_status,
    
    -- Expéditeur du dernier message
    sender.name as last_sender_name,
    sender.avatar_url as last_sender_avatar,
    
    -- Pour discussions privées, info de l'autre participant
    CASE 
        WHEN d.type = 'private' THEN other_user.name
        ELSE d.name 
    END as display_name,
    CASE 
        WHEN d.type = 'private' THEN other_user.avatar_url
        ELSE d.avatar_url 
    END as display_avatar,
    CASE 
        WHEN d.type = 'private' THEN other_user.status
        ELSE NULL 
    END as other_user_status,
    CASE 
        WHEN d.type = 'private' THEN other_user.is_online
        ELSE NULL 
    END as other_user_online,
    CASE 
        WHEN d.type = 'private' THEN other_user.id
        ELSE NULL 
    END as other_user_id,
    
    -- Compteurs
    COALESCE(unread.count, 0) as unread_count,
    COALESCE(participants.count, 0) as participant_count,
    
    -- Indicateurs
    typing.is_typing,
    typing.typing_users

FROM public.discussions d
JOIN public.discussion_participants dp ON d.id = dp.discussion_id AND dp.is_active = true

-- Dernier message
LEFT JOIN LATERAL (
    SELECT * FROM public.messages m 
    WHERE m.discussion_id = d.id AND m.is_deleted = false
    ORDER BY m.created_at DESC 
    LIMIT 1
) lm ON true

-- Expéditeur du dernier message
LEFT JOIN public.users sender ON lm.sender_id = sender.id

-- Pour les discussions privées, récupérer l'autre participant
LEFT JOIN LATERAL (
    SELECT u.* FROM public.users u
    JOIN public.discussion_participants dp2 ON u.id = dp2.user_id
    WHERE dp2.discussion_id = d.id 
    AND dp2.user_id != dp.user_id 
    AND dp2.is_active = true
    AND d.type = 'private'
    LIMIT 1
) other_user ON d.type = 'private'

-- Messages non lus
LEFT JOIN LATERAL (
    SELECT COUNT(*) as count
    FROM public.messages m
    WHERE m.discussion_id = d.id
    AND m.sender_id != dp.user_id
    AND m.is_deleted = false
    AND NOT EXISTS (
        SELECT 1 FROM public.message_read_status mrs
        WHERE mrs.message_id = m.id AND mrs.user_id = dp.user_id
    )
) unread ON true

-- Nombre de participants
LEFT JOIN LATERAL (
    SELECT COUNT(*) as count
    FROM public.discussion_participants dp_count
    WHERE dp_count.discussion_id = d.id AND dp_count.is_active = true
) participants ON true

-- Indicateurs de frappe
LEFT JOIN LATERAL (
    SELECT 
        COUNT(*) > 0 as is_typing,
        array_agg(u.name) as typing_users
    FROM public.typing_indicators ti
    JOIN public.users u ON ti.user_id = u.id
    WHERE ti.discussion_id = d.id 
    AND ti.user_id != dp.user_id
    AND ti.started_at > NOW() - INTERVAL '10 seconds'
) typing ON true

WHERE dp.is_active = true;

-- =====================================================
-- FONCTIONS UTILES POUR LE FRONTEND
-- =====================================================

-- Fonction pour marquer les messages comme lus
CREATE OR REPLACE FUNCTION mark_messages_as_read(discussion_uuid UUID, user_uuid UUID)
RETURNS void AS $$
BEGIN
    INSERT INTO public.message_read_status (message_id, user_id)
    SELECT m.id, user_uuid
    FROM public.messages m
    WHERE m.discussion_id = discussion_uuid
    AND m.sender_id != user_uuid
    AND NOT EXISTS (
        SELECT 1 FROM public.message_read_status mrs
        WHERE mrs.message_id = m.id AND mrs.user_id = user_uuid
    );
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Fonction pour créer une discussion privée
CREATE OR REPLACE FUNCTION create_private_discussion(user1_uuid UUID, user2_uuid UUID)
RETURNS UUID AS $$
DECLARE
    discussion_uuid UUID;
    existing_discussion UUID;
BEGIN
    -- Vérifier si une discussion privée existe déjà
    SELECT d.id INTO existing_discussion
    FROM public.discussions d
    WHERE d.type = 'private'
    AND EXISTS (
        SELECT 1 FROM public.discussion_participants dp1
        WHERE dp1.discussion_id = d.id AND dp1.user_id = user1_uuid AND dp1.is_active = true
    )
    AND EXISTS (
        SELECT 1 FROM public.discussion_participants dp2
        WHERE dp2.discussion_id = d.id AND dp2.user_id = user2_uuid AND dp2.is_active = true
    );
    
    IF existing_discussion IS NOT NULL THEN
        RETURN existing_discussion;
    END IF;
    
    -- Créer nouvelle discussion
    INSERT INTO public.discussions (type, created_by)
    VALUES ('private', user1_uuid)
    RETURNING id INTO discussion_uuid;
    
    -- Ajouter les participants
    INSERT INTO public.discussion_participants (discussion_id, user_id, role)
    VALUES 
        (discussion_uuid, user1_uuid, 'admin'),
        (discussion_uuid, user2_uuid, 'member');
    
    RETURN discussion_uuid;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- =====================================================
-- COMMENTAIRES ET NOTES
-- =====================================================

/*
CHANGEMENTS MAJEURS PAR RAPPORT AU SCHÉMA ORIGINAL :

1. MESSAGES :
   - Ajout de tous les champs nécessaires au frontend (status, reactions, mentions, etc.)
   - Support complet des médias avec métadonnées
   - Géolocalisation optionnelle
   - Statut de lecture séparé en table dédiée

2. USERS :
   - Champs étendus (bio, location, website)
   - Statut en ligne avec is_online boolean
   - Préférences utilisateur en JSONB
   - Username unique pour mentions

3. DISCUSSIONS :
   - Support pinned, archived, muted
   - Métadonnées de groupe étendues
   - Lien d'invitation

4. NOUVELLES TABLES :
   - message_reactions : Gestion fine des réactions
   - message_read_status : Statut de lecture par utilisateur
   - typing_indicators : Indicateurs de frappe temps réel

5. VUE AVANCÉE :
   - discussions_with_details : Vue complète pour le frontend
   - Gestion automatique des discussions privées
   - Compteurs temps réel (non lus, participants)
   - Indicateurs de frappe

6. FONCTIONS UTILES :
   - mark_messages_as_read() : Marquer messages comme lus
   - create_private_discussion() : Créer discussion privée
   - cleanup_expired_typing() : Nettoyer indicateurs expirés

Ce schéma est maintenant 100% compatible avec les attentes du frontend Elite Chat.
*/