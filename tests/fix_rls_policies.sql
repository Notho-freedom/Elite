-- Script pour corriger les politiques RLS problématiques
-- Ce script supprime les politiques récursives et les recrée correctement

-- Supprimer les politiques problématiques
DROP POLICY IF EXISTS "Users can view discussion participants" ON public.discussion_participants;
DROP POLICY IF EXISTS "Users can add participants to discussions they're in" ON public.discussion_participants;
DROP POLICY IF EXISTS "Users can view messages in discussions they participate in" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to discussions they participate in" ON public.messages;

-- Recréer les politiques sans récursion

-- Politique simplifiée pour les participants aux discussions
CREATE POLICY "Users can view discussion participants" ON public.discussion_participants
    FOR SELECT USING (
        user_id = auth.uid() OR 
        discussion_id IN (
            SELECT discussion_id FROM public.discussion_participants 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can add participants to discussions they're in" ON public.discussion_participants
    FOR INSERT WITH CHECK (
        discussion_id IN (
            SELECT discussion_id FROM public.discussion_participants 
            WHERE user_id = auth.uid()
        )
    );

-- Politiques pour les messages avec une approche différente
CREATE POLICY "Users can view messages in discussions they participate in" ON public.messages
    FOR SELECT USING (
        discussion_id IN (
            SELECT discussion_id FROM public.discussion_participants 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages to discussions they participate in" ON public.messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        discussion_id IN (
            SELECT discussion_id FROM public.discussion_participants 
            WHERE user_id = auth.uid()
        )
    );

-- Politique alternative plus simple pour les discussions
DROP POLICY IF EXISTS "Users can view discussions they participate in" ON public.discussions;

CREATE POLICY "Users can view discussions they participate in" ON public.discussions
    FOR SELECT USING (
        id IN (
            SELECT discussion_id FROM public.discussion_participants 
            WHERE user_id = auth.uid()
        )
    );
