/**
 * Script pour configurer automatiquement la base de données Supabase
 * Ce script créera toutes les tables nécessaires pour l'application ELITE
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Charger les variables d'environnement
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://oxazzejsmratrlzvrdfq.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_KEY) {
    console.error('❌ ERREUR: VITE_SUPABASE_ANON_KEY manquante dans les variables d\'environnement');
    console.log('📝 Ajoutez votre clé Supabase anon dans les variables d\'environnement ou dans le fichier .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testConnection() {
    console.log('🔄 Test de connexion à Supabase...');
    
    try {
        const { data, error } = await supabase.from('users').select('count').limit(1);
        
        if (error && error.code === 'PGRST116') {
            console.log('⚠️  La table "users" n\'existe pas encore. C\'est normal pour une première configuration.');
            return true;
        } else if (error && error.code === 'PGRST205') {
            console.log('⚠️  Les tables n\'existent pas encore. Elles doivent être créées.');
            return true;
        } else if (error) {
            console.error('❌ Erreur de connexion:', error);
            return false;
        } else {
            console.log('✅ Connexion réussie ! Les tables existent déjà.');
            return true;
        }
    } catch (error) {
        console.error('❌ Erreur de connexion:', error.message);
        return false;
    }
}

async function createTables() {
    console.log('🔄 Création des tables...');
    
    try {
        // Lire le schéma SQL
        const schema = fs.readFileSync('database_schema.sql', 'utf8');
        
        // Exécuter le schéma (Note: Cette approche nécessite une clé service, pas anon)
        console.log('📝 Schéma SQL prêt. Veuillez l\'exécuter manuellement dans Supabase.');
        console.log('');
        console.log('🔗 Instructions:');
        console.log('1. Ouvrez votre projet Supabase dans le navigateur');
        console.log('2. Allez dans "SQL Editor" dans le menu de gauche');
        console.log('3. Créez une nouvelle requête');
        console.log('4. Copiez le contenu du fichier "database_schema.sql"');
        console.log('5. Exécutez la requête');
        console.log('');
        console.log('📁 Le fichier "database_schema.sql" contient tout le schéma nécessaire.');
        
        return true;
    } catch (error) {
        console.error('❌ Erreur lors de la création des tables:', error.message);
        return false;
    }
}

async function insertTestData() {
    console.log('🔄 Insertion des données de test...');
    
    try {
        // Créer quelques utilisateurs de test si pas d'utilisateur existant
        const { data: existingUsers } = await supabase.from('users').select('id').limit(1);
        
        if (!existingUsers || existingUsers.length === 0) {
            console.log('📝 Pas d\'utilisateurs trouvés. Les données de test sont incluses dans database_schema.sql');
        } else {
            console.log('✅ Des utilisateurs existent déjà dans la base de données.');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Erreur lors de l\'insertion des données de test:', error.message);
        return false;
    }
}

async function main() {
    console.log('🚀 Configuration de la base de données ELITE');
    console.log('==========================================');
    console.log('');
    
    // Test de connexion
    const connected = await testConnection();
    if (!connected) {
        console.log('❌ Impossible de se connecter à Supabase. Vérifiez vos variables d\'environnement.');
        return;
    }
    
    console.log('');
    
    // Création des tables
    await createTables();
    
    console.log('');
    console.log('✅ Configuration terminée !');
    console.log('');
    console.log('🔄 Après avoir exécuté le schéma SQL dans Supabase:');
    console.log('1. Actualisez votre application');
    console.log('2. Les erreurs de table manquante devraient disparaître');
    console.log('3. Vous pourrez créer des discussions et envoyer des messages');
}

// Vérifier si le script est exécuté directement
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { testConnection, createTables, insertTestData };
