# 🚨 GUIDE DEBUG URGENT - Elite Chat

## Problème : Aucune discussion visible

### 🎯 **ÉTAPES DE DIAGNOSTIC**

#### **1. Vérifier votre base de données Supabase**

Allez dans votre **Dashboard Supabase > SQL Editor** et exécutez ce script :

```sql
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

-- 4. Vérifier les utilisateurs authentifiés récemment
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
```

#### **2. Si la table users est VIDE :**

L'utilisateur authentifié n'est pas copié dans la table publique. Exécutez :

```sql
-- Copier manuellement l'utilisateur actuel
INSERT INTO public.users (id, name, email, username, avatar_url)
SELECT 
    id,
    COALESCE(raw_user_meta_data->>'full_name', email),
    email,
    COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)),
    raw_user_meta_data->>'avatar_url'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);
```

#### **3. Si la vue discussions_with_details n'existe PAS :**

Exécutez tout le contenu du fichier `tests/database_schema.sql` dans SQL Editor.

#### **4. Créer des données de test :**

```sql
-- Créer un utilisateur de test (remplacez YOUR_USER_ID par votre ID)
INSERT INTO public.users (id, name, email, username, avatar_url, is_online)
VALUES (
    gen_random_uuid(),
    'Utilisateur Test',
    'test@example.com',
    'test_user',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    true
);

-- Créer une discussion de test avec l'utilisateur de test
SELECT create_private_discussion(
    'YOUR_USER_ID'::uuid,  -- Remplacez par votre ID
    (SELECT id FROM public.users WHERE email = 'test@example.com')
);
```

#### **5. Vérifier les logs dans la console du navigateur :**

Ouvrez F12 > Console et recherchez :
- `🔍 Chargement des discussions pour l'utilisateur:`
- `✅ Discussions chargées:`
- `❌ Erreur`

### 🔧 **SOLUTIONS RAPIDES**

#### **Si vous voyez "Mode démonstration" :**
- ✅ **Votre User ID s'affiche** = Authentification OK
- ❌ **User ID manquant** = Problème d'authentification

#### **Si vous voyez "0 discussions" :**
1. Créez des données de test avec le script ci-dessus
2. Ou utilisez le bouton "Nouveau" pour créer une discussion

#### **Si le bouton "Nouveau" ne fonctionne pas :**
1. Vérifiez que d'autres utilisateurs existent dans la table `users`
2. Vérifiez les logs de la console pour les erreurs

### 📋 **CHECKLIST RAPIDE**

- [ ] Utilisateur copié dans `public.users`
- [ ] Vue `discussions_with_details` existe  
- [ ] Fonction `create_private_discussion` existe
- [ ] RLS activé et politiques créées
- [ ] Au moins 2 utilisateurs dans la table pour tester

### 🆘 **EN CAS D'URGENCE**

Si rien ne fonctionne, exécutez **TOUT** le fichier `tests/database_schema.sql` dans SQL Editor de Supabase. Cela recréera complètement la structure de la base de données.

---

**Suivez ces étapes dans l'ordre et rapportez-moi ce que vous trouvez ! 📊**
