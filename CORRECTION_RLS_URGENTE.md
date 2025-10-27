# 🚨 Correction Urgente - Récursion RLS Supabase

## ⚡ Problème
```
infinite recursion detected in policy for relation "discussion_participants"
```

## 🎯 Solution Rapide (2 minutes)

### Étape 1: Aller dans Supabase Dashboard
1. Ouvrez https://supabase.com/dashboard
2. Allez dans votre projet `oxazzejsmratrlzvrdfq`
3. Cliquez sur **Database** dans le menu de gauche
4. Cliquez sur **Policies** dans le sous-menu

### Étape 2: Supprimer les politiques problématiques

Trouvez et **SUPPRIMEZ** ces politiques (cliquez sur les 3 points → Delete) :

#### Sur la table `discussions` :
- ❌ `Users can view participated discussions`

#### Sur la table `discussion_participants` :
- ❌ `Users can view discussion participants`

#### Sur la table `messages` :
- ❌ `Users can view discussion messages`

### Étape 3: Créer les nouvelles politiques

Cliquez sur **New Policy** pour chaque table :

#### Pour `discussions` :
```sql
-- Nom: Enable read for discussion participants
-- Policy: SELECT
-- Target roles: authenticated

id IN (
  SELECT DISTINCT dp.discussion_id 
  FROM public.discussion_participants dp 
  WHERE dp.user_id = auth.uid() 
  AND dp.is_active = true
)
```

#### Pour `discussion_participants` :
```sql
-- Nom: Enable read participants for discussion members  
-- Policy: SELECT
-- Target roles: authenticated

discussion_id IN (
  SELECT DISTINCT dp2.discussion_id 
  FROM public.discussion_participants dp2 
  WHERE dp2.user_id = auth.uid() 
  AND dp2.is_active = true
)
```

#### Pour `messages` :
```sql
-- Nom: Enable read messages for discussion participants
-- Policy: SELECT  
-- Target roles: authenticated

discussion_id IN (
  SELECT DISTINCT dp.discussion_id 
  FROM public.discussion_participants dp 
  WHERE dp.user_id = auth.uid() 
  AND dp.is_active = true
)
```

## ✅ Test
Après avoir appliqué ces changements :
1. Rafraîchissez votre application
2. L'erreur de récursion devrait disparaître
3. Les discussions devraient se charger normalement

## 🚀 Alternative rapide (mode contournement)

Si vous voulez tester le backend immédiatement sans corriger RLS :

1. **Désactivez temporairement RLS** dans Supabase :
   ```sql
   ALTER TABLE public.discussions DISABLE ROW LEVEL SECURITY;
   ALTER TABLE public.discussion_participants DISABLE ROW LEVEL SECURITY;
   ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
   ```

2. **Testez votre application** 

3. **Réactivez RLS avec les bonnes politiques** :
   ```sql
   ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.discussion_participants ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
   ```

---

**⏱️ Temps estimé : 2-5 minutes**  
**🎯 Résultat : Backend Elite Chat pleinement fonctionnel**
