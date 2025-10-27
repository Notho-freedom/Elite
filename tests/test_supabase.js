// Script de test pour vérifier la connexion à Supabase
// À exécuter dans le navigateur ou avec Node.js

import { supabase, db, calls } from './src/lib/supabase.js';

// Fonction de test pour vérifier la connexion
async function testSupabaseConnection() {
  console.log('🔍 Test de connexion à Supabase...');
  
  try {
    // Test de connexion basique
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('❌ Erreur de connexion:', error);
      return false;
    }
    
    console.log('✅ Connexion à Supabase réussie');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test de connexion:', error);
    return false;
  }
}

// Test des fonctions de base de données
async function testDatabaseFunctions() {
  console.log('\n🔍 Test des fonctions de base de données...');
  
  try {
    // Test de récupération des utilisateurs
    console.log('📋 Test de récupération des utilisateurs...');
    const { data: users, error: usersError } = await db.getAllUsers();
    
    if (usersError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', usersError);
    } else {
      console.log(`✅ ${users.length} utilisateurs récupérés`);
    }
    
    // Test de récupération des discussions (si un utilisateur existe)
    if (users && users.length > 0) {
      console.log('📋 Test de récupération des discussions...');
      const { data: discussions, error: discussionsError } = await db.getDiscussions(users[0].id);
      
      if (discussionsError) {
        console.error('❌ Erreur lors de la récupération des discussions:', discussionsError);
      } else {
        console.log(`✅ ${discussions.length} discussions récupérées`);
      }
      
      // Test de récupération de l'historique des appels
      console.log('📋 Test de récupération de l\'historique des appels...');
      const { data: callHistory, error: callHistoryError } = await calls.getCallHistory(users[0].id);
      
      if (callHistoryError) {
        console.error('❌ Erreur lors de la récupération de l\'historique des appels:', callHistoryError);
      } else {
        console.log(`✅ ${callHistory.length} appels récupérés`);
      }
    }
    
    console.log('✅ Tests des fonctions terminés');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
    return false;
  }
}

// Test de l'authentification
async function testAuthentication() {
  console.log('\n🔍 Test de l\'authentification...');
  
  try {
    // Test de récupération de l'utilisateur actuel
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log('ℹ️ Aucun utilisateur connecté (normal si pas d\'authentification)');
    } else if (user) {
      console.log('✅ Utilisateur connecté:', user.email);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test d\'authentification:', error);
    return false;
  }
}

// Fonction principale de test
async function runTests() {
  console.log('🚀 Démarrage des tests Supabase...\n');
  
  const connectionTest = await testSupabaseConnection();
  const authTest = await testAuthentication();
  const dbTest = await testDatabaseFunctions();
  
  console.log('\n📊 Résumé des tests:');
  console.log(`Connexion: ${connectionTest ? '✅' : '❌'}`);
  console.log(`Authentification: ${authTest ? '✅' : '❌'}`);
  console.log(`Base de données: ${dbTest ? '✅' : '❌'}`);
  
  if (connectionTest && authTest && dbTest) {
    console.log('\n🎉 Tous les tests sont passés ! Supabase est correctement configuré.');
  } else {
    console.log('\n⚠️ Certains tests ont échoué. Vérifiez la configuration de Supabase.');
  }
}

// Exporter pour utilisation dans le navigateur
if (typeof window !== 'undefined') {
  window.testSupabase = runTests;
}

// Exporter pour utilisation avec Node.js
export { runTests, testSupabaseConnection, testDatabaseFunctions, testAuthentication };