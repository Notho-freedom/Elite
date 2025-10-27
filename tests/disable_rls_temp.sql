-- Solution temporaire : Désactiver RLS pour résoudre rapidement le problème
-- ATTENTION: Ceci est temporaire pour le développement uniquement !

-- Désactiver RLS temporairement pour tester l'application
ALTER TABLE public.discussions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.statuses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_views DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- Message d'information
SELECT 'RLS temporairement désactivé pour tous les tables. Reactivez-le après avoir testé l''application!' AS status;
