-- Schéma de base de données pour l'application ELITE
-- Tables principales pour les discussions, messages, utilisateurs et appels

-- Table des utilisateurs (étend la table auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    status VARCHAR(50) DEFAULT 'offline',
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des discussions
CREATE TABLE IF NOT EXISTS public.discussions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255),
    type VARCHAR(50) DEFAULT 'private', -- 'private', 'group'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des participants aux discussions
CREATE TABLE IF NOT EXISTS public.discussion_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    discussion_id UUID REFERENCES public.discussions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member', -- 'admin', 'member'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(discussion_id, user_id)
);

-- Table des messages
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    discussion_id UUID REFERENCES public.discussions(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'image', 'video', 'audio', 'file'
    media_url TEXT,
    reply_to_id UUID REFERENCES public.messages(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des appels
CREATE TABLE IF NOT EXISTS public.calls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    discussion_id UUID REFERENCES public.discussions(id) ON DELETE CASCADE,
    initiator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    call_type VARCHAR(50) DEFAULT 'audio', -- 'audio', 'video'
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'ended', 'missed'
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration INTEGER DEFAULT 0, -- en secondes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des participants aux appels
CREATE TABLE IF NOT EXISTS public.call_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    call_id UUID REFERENCES public.calls(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(call_id, user_id)
);

-- Table des statuts (stories)
CREATE TABLE IF NOT EXISTS public.statuses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT,
    media_url TEXT,
    type VARCHAR(50) DEFAULT 'text', -- 'text', 'image', 'video'
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des vues de statuts
CREATE TABLE IF NOT EXISTS public.status_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    status_id UUID REFERENCES public.statuses(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(status_id, viewer_id)
);

-- Table des notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'message', 'call', 'status', 'mention'
    title VARCHAR(255),
    body TEXT,
    data JSONB,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_messages_discussion_id ON public.messages(discussion_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_discussion_participants_discussion_id ON public.discussion_participants(discussion_id);
CREATE INDEX IF NOT EXISTS idx_discussion_participants_user_id ON public.discussion_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_calls_discussion_id ON public.calls(discussion_id);
CREATE INDEX IF NOT EXISTS idx_calls_initiator_id ON public.calls(initiator_id);
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON public.calls(created_at);

CREATE INDEX IF NOT EXISTS idx_statuses_user_id ON public.statuses(user_id);
CREATE INDEX IF NOT EXISTS idx_statuses_created_at ON public.statuses(created_at);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- Fonctions pour les triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discussions_updated_at BEFORE UPDATE ON public.discussions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour créer automatiquement un profil utilisateur
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement un profil utilisateur
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Politiques RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Politiques pour les utilisateurs
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Politiques pour les discussions
CREATE POLICY "Users can view discussions they participate in" ON public.discussions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.discussion_participants
            WHERE discussion_id = id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create discussions" ON public.discussions
    FOR INSERT WITH CHECK (true);

-- Politiques pour les participants aux discussions
CREATE POLICY "Users can view discussion participants" ON public.discussion_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.discussion_participants dp
            WHERE dp.discussion_id = discussion_id AND dp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can add participants to discussions they're in" ON public.discussion_participants
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.discussion_participants dp
            WHERE dp.discussion_id = discussion_id AND dp.user_id = auth.uid()
        )
    );

-- Politiques pour les messages
CREATE POLICY "Users can view messages in discussions they participate in" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.discussion_participants dp
            WHERE dp.discussion_id = discussion_id AND dp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages to discussions they participate in" ON public.messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.discussion_participants dp
            WHERE dp.discussion_id = discussion_id AND dp.user_id = auth.uid()
        )
    );

-- Politiques pour les appels
CREATE POLICY "Users can view calls they participated in" ON public.calls
    FOR SELECT USING (
        initiator_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.call_participants cp
            WHERE cp.call_id = id AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create calls" ON public.calls
    FOR INSERT WITH CHECK (initiator_id = auth.uid());

-- Politiques pour les statuts
CREATE POLICY "Users can view all statuses" ON public.statuses
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own statuses" ON public.statuses
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own statuses" ON public.statuses
    FOR DELETE USING (user_id = auth.uid());

-- Politiques pour les notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Données de test (optionnel)
INSERT INTO public.users (id, name, avatar_url, status) VALUES
    ('00000000-0000-0000-0000-000000000001', 'John Doe', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 'online'),
    ('00000000-0000-0000-0000-000000000002', 'Jane Smith', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', 'online'),
    ('00000000-0000-0000-0000-000000000003', 'Bob Johnson', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 'offline')
ON CONFLICT (id) DO NOTHING;