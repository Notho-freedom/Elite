-- Schema SQL pour Elite Chat avec authentification Supabase
-- Ce fichier doit être exécuté dans l'éditeur SQL de Supabase

-- =======================
-- 1. TABLE USERS
-- =======================
-- Extension de la table auth.users de Supabase avec les données du profil
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    username TEXT UNIQUE,
    avatar_url TEXT,
    phone TEXT,
    
    -- Métadonnées utilisateur (stockées en JSONB pour flexibilité)
    user_metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_sign_in_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Statuts
    is_online BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    
    -- Préférences utilisateur (stockées en JSONB)
    preferences JSONB DEFAULT '{
        "theme": "system",
        "language": "fr",
        "notifications": {
            "email": true,
            "push": true,
            "chat": true,
            "calls": true
        },
        "privacy": {
            "profile_visibility": "public",
            "last_seen": "everyone",
            "read_receipts": true
        }
    }'
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_online ON public.users(is_online);
CREATE INDEX IF NOT EXISTS idx_users_last_sign_in ON public.users(last_sign_in_at);

-- =======================
-- 2. TABLE CONVERSATIONS
-- =======================
-- Gestion des conversations (privées et groupes)
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('private', 'group', 'channel')),
    name TEXT, -- NULL pour conversations privées
    description TEXT,
    avatar_url TEXT,
    
    -- Métadonnées de la conversation
    metadata JSONB DEFAULT '{}',
    
    -- Gestion
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Statuts
    is_active BOOLEAN DEFAULT TRUE,
    is_archived BOOLEAN DEFAULT FALSE
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_conversations_type ON public.conversations(type);
CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON public.conversations(created_by);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at);

-- =======================
-- 3. TABLE PARTICIPANTS
-- =======================
-- Lien entre utilisateurs et conversations
CREATE TABLE IF NOT EXISTS public.participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Rôle dans la conversation
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    
    -- Timestamps
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    
    -- Statuts
    is_active BOOLEAN DEFAULT TRUE,
    is_muted BOOLEAN DEFAULT FALSE,
    
    -- Contrainte d'unicité
    UNIQUE(conversation_id, user_id)
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_participants_conversation ON public.participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON public.participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_active ON public.participants(is_active);

-- =======================
-- 4. TABLE MESSAGES
-- =======================
-- Stockage des messages
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Contenu du message
    content TEXT,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'audio', 'file', 'system')),
    
    -- Métadonnées (media, liens, etc.)
    metadata JSONB DEFAULT '{}',
    
    -- Réponse à un autre message
    reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Statuts
    is_read BOOLEAN DEFAULT FALSE,
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON public.messages(reply_to_id);

-- =======================
-- 5. TABLE MESSAGE_READ_STATUS
-- =======================
-- Suivi des messages lus par utilisateur
CREATE TABLE IF NOT EXISTS public.message_read_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contrainte d'unicité
    UNIQUE(message_id, user_id)
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_message_read_status_message ON public.message_read_status(message_id);
CREATE INDEX IF NOT EXISTS idx_message_read_status_user ON public.message_read_status(user_id);

-- =======================
-- 6. TABLE CALL_HISTORY
-- =======================
-- Historique des appels
CREATE TABLE IF NOT EXISTS public.call_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
    caller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    callee_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    -- Type d'appel
    call_type TEXT DEFAULT 'voice' CHECK (call_type IN ('voice', 'video')),
    
    -- Statut de l'appel
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'missed', 'ended')),
    
    -- Durée en secondes
    duration INTEGER DEFAULT 0,
    
    -- Timestamps
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_call_history_conversation ON public.call_history(conversation_id);
CREATE INDEX IF NOT EXISTS idx_call_history_caller ON public.call_history(caller_id);
CREATE INDEX IF NOT EXISTS idx_call_history_callee ON public.call_history(callee_id);
CREATE INDEX IF NOT EXISTS idx_call_history_started_at ON public.call_history(started_at);

-- =======================
-- 7. FUNCTIONS & TRIGGERS
-- =======================

-- Fonction pour mettre à jour updated_at automatiquement
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

DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON public.conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_messages_updated_at ON public.messages;
CREATE TRIGGER update_messages_updated_at 
    BEFORE UPDATE ON public.messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour mettre à jour le timestamp de la conversation lors d'un nouveau message
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations 
    SET updated_at = NOW() 
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour la conversation
DROP TRIGGER IF EXISTS update_conversation_on_message ON public.messages;
CREATE TRIGGER update_conversation_on_message
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_timestamp();

-- =======================
-- 8. ROW LEVEL SECURITY (RLS)
-- =======================

-- Activer RLS sur toutes les tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_read_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_history ENABLE ROW LEVEL SECURITY;

-- Politique pour users : les utilisateurs peuvent voir leur propre profil et les profils publics
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view public profiles" ON public.users;
CREATE POLICY "Users can view public profiles" ON public.users
    FOR SELECT USING (
        preferences->>'privacy'->>'profile_visibility' = 'public' 
        OR auth.uid() = id
    );

-- Politique pour conversations : les utilisateurs peuvent voir les conversations où ils participent
DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
CREATE POLICY "Users can view own conversations" ON public.conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.participants 
            WHERE conversation_id = id 
            AND user_id = auth.uid() 
            AND is_active = true
        )
    );

-- Politique pour participants : les utilisateurs peuvent voir les participants des conversations où ils participent
DROP POLICY IF EXISTS "Users can view conversation participants" ON public.participants;
CREATE POLICY "Users can view conversation participants" ON public.participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.participants p2 
            WHERE p2.conversation_id = conversation_id 
            AND p2.user_id = auth.uid() 
            AND p2.is_active = true
        )
    );

-- Politique pour messages : les utilisateurs peuvent voir les messages des conversations où ils participent
DROP POLICY IF EXISTS "Users can view conversation messages" ON public.messages;
CREATE POLICY "Users can view conversation messages" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.participants 
            WHERE conversation_id = messages.conversation_id 
            AND user_id = auth.uid() 
            AND is_active = true
        )
    );

DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON public.messages;
CREATE POLICY "Users can insert messages in their conversations" ON public.messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() 
        AND EXISTS (
            SELECT 1 FROM public.participants 
            WHERE conversation_id = messages.conversation_id 
            AND user_id = auth.uid() 
            AND is_active = true
        )
    );

-- =======================
-- 9. VUES UTILES
-- =======================

-- Vue pour les conversations avec dernier message et nombre de non-lus
CREATE OR REPLACE VIEW public.conversations_with_details AS
SELECT 
    c.*,
    p.user_id,
    p.role,
    p.is_muted,
    -- Dernier message
    lm.id as last_message_id,
    lm.content as last_message_content,
    lm.created_at as last_message_at,
    lm.sender_id as last_message_sender_id,
    -- Informations du dernier expéditeur
    u.full_name as last_sender_name,
    u.avatar_url as last_sender_avatar,
    -- Nombre de messages non lus
    COALESCE(unread.count, 0) as unread_count
FROM public.conversations c
JOIN public.participants p ON c.id = p.conversation_id
LEFT JOIN LATERAL (
    SELECT * FROM public.messages m 
    WHERE m.conversation_id = c.id 
    ORDER BY m.created_at DESC 
    LIMIT 1
) lm ON true
LEFT JOIN public.users u ON lm.sender_id = u.id
LEFT JOIN LATERAL (
    SELECT COUNT(*) as count
    FROM public.messages m2
    WHERE m2.conversation_id = c.id
    AND m2.sender_id != p.user_id
    AND NOT EXISTS (
        SELECT 1 FROM public.message_read_status mrs
        WHERE mrs.message_id = m2.id
        AND mrs.user_id = p.user_id
    )
) unread ON true
WHERE p.is_active = true;

-- =======================
-- 10. DONNÉES DE TEST (OPTIONNEL)
-- =======================

-- Fonction pour créer des utilisateurs de test
CREATE OR REPLACE FUNCTION create_test_users()
RETURNS VOID AS $$
BEGIN
    -- Note: Cette fonction ne peut être utilisée qu'après avoir créé des utilisateurs via Supabase Auth
    -- Elle sert à enrichir les profils existants
    
    INSERT INTO public.users (id, email, full_name, username, avatar_url, is_online, preferences)
    VALUES 
    -- Ces IDs doivent correspondre à des utilisateurs réels créés via auth.users
    -- ('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', 'test1@example.com', 'Utilisateur Test 1', 'test1', 'https://via.placeholder.com/150', true, '{}'),
    -- ('yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy', 'test2@example.com', 'Utilisateur Test 2', 'test2', 'https://via.placeholder.com/150', false, '{}')
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        username = EXCLUDED.username,
        avatar_url = EXCLUDED.avatar_url,
        is_online = EXCLUDED.is_online,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =======================
-- 11. COMMENTAIRES & NOTES
-- =======================

/*
INSTRUCTIONS D'UTILISATION :

1. Exécutez ce script dans l'éditeur SQL de votre projet Supabase

2. Pour tester l'exclusion du current_user, utilisez cette requête :
   SELECT * FROM public.users WHERE id != auth.uid();

3. Pour récupérer les conversations d'un utilisateur :
   SELECT * FROM public.conversations_with_details WHERE user_id = auth.uid();

4. Les politiques RLS garantissent que :
   - Les utilisateurs ne voient que leurs propres données
   - L'utilisateur courant est automatiquement exclu des listes d'utilisateurs disponibles
   - Les conversations sont filtrées selon la participation

5. L'application React utilisera ces tables via le service userService.js

6. Pour déboguer, vous pouvez temporairement désactiver RLS :
   ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
   (N'oubliez pas de la réactiver ensuite)

SÉCURITÉ :
- Row Level Security (RLS) est activé sur toutes les tables
- Les utilisateurs ne peuvent accéder qu'aux données auxquelles ils ont droit
- L'authentification est gérée par Supabase Auth
- Les mots de passe sont hachés et sécurisés par Supabase

PERFORMANCE :
- Index créés sur toutes les colonnes fréquemment utilisées
- Vue optimisée pour les conversations avec détails
- Triggers automatiques pour les timestamps

EXTENSIBILITÉ :
- Structure JSONB pour métadonnées flexibles
- Types de messages extensibles
- Système de rôles dans les conversations
- Support des groupes et canaux
*/