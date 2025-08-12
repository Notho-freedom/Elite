#!/usr/bin/env node

// Test simple du backend sans dépendances frontend
import fetch from 'node-fetch';

console.log('🧪 Test de connexion au backend Elite Chat\n');

async function testBackendHealth() {
  try {
    console.log('📡 Test de l\'API de santé...');
    const response = await fetch('http://localhost:3001/api/health');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend accessible :', data.message);
      console.log('⏰ Timestamp :', data.timestamp);
      return true;
    } else {
      console.log('❌ Backend retourne erreur :', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur de connexion :', error.message);
    console.log('\n💡 Assurez-vous que le backend est démarré avec :');
    console.log('   cd server && node index.js');
    return false;
  }
}

async function testSupabaseConnection() {
  try {
    console.log('\n🔗 Test de connexion Supabase...');
    const response = await fetch('http://localhost:3001/api/users/status/online');
    
    if (response.ok) {
      console.log('✅ Connexion Supabase fonctionnelle');
      return true;
    } else if (response.status === 401) {
      console.log('✅ Endpoint protégé fonctionne (401 attendu sans auth)');
      return true;
    } else {
      console.log('⚠️  Réponse inattendue :', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur test Supabase :', error.message);
    return false;
  }
}

// Main
(async () => {
  const healthOK = await testBackendHealth();
  
  if (healthOK) {
    const supabaseOK = await testSupabaseConnection();
    
    if (supabaseOK) {
      console.log('\n🎉 Tous les tests passent !');
      console.log('\n📋 Prochaines étapes :');
      console.log('   1. ✅ Backend fonctionnel');
      console.log('   2. 🔧 Appliquez le correctif RLS dans Supabase');
      console.log('   3. 🚀 Testez l\'intégration frontend');
    } else {
      console.log('\n⚠️  Backend accessible mais problème Supabase');
    }
  } else {
    console.log('\n🚨 Backend non accessible');
    process.exit(1);
  }
})();
