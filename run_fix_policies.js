/**
 * Script pour exécuter la correction des politiques RLS
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Configuration Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://oxazzejsmratrlzvrdfq.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_KEY) {
    console.error('❌ ERREUR: VITE_SUPABASE_ANON_KEY manquante');
    console.log('📝 Pour exécuter ce script automatiquement, ajoutez votre clé dans les variables d\'environnement');
    console.log('📝 Sinon, exécutez manuellement le contenu de fix_rls_policies.sql dans Supabase SQL Editor');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
    console.log('🔧 Correction des politiques RLS...');
    console.log('=====================================');
    console.log('');
    
    try {
        // Lire le script de correction
        const fixScript = fs.readFileSync('fix_rls_policies.sql', 'utf8');
        
        console.log('📁 Script de correction trouvé:');
        console.log('- Suppression des politiques récursives');
        console.log('- Recréation avec une logique corrigée');
        console.log('');
        
        console.log('⚠️  Note: Ce script nécessite une clé service pour être exécuté automatiquement.');
        console.log('📝 Veuillez exécuter manuellement le contenu de "fix_rls_policies.sql" dans Supabase SQL Editor');
        console.log('');
        console.log('🔗 Instructions:');
        console.log('1. Ouvrez votre projet Supabase');
        console.log('2. Allez dans SQL Editor');
        console.log('3. Copiez le contenu de fix_rls_policies.sql');
        console.log('4. Exécutez la requête');
        console.log('5. Actualisez votre application');
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

main().catch(console.error);
