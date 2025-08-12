#!/usr/bin/env node

import { healthCheck } from './src/lib/api.js';

console.log('🧪 Test de connexion au backend Elite Chat\n');

async function testBackend() {
  try {
    console.log('📡 Test de l\'API de santé...');
    const health = await healthCheck();
    
    if (health.status === 'ok') {
      console.log('✅ Backend accessible :', health.data.message);
      console.log('⏰ Timestamp :', health.data.timestamp);
      return true;
    } else {
      console.log('❌ Backend inaccessible :', health.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur de connexion :', error.message);
    console.log('\n💡 Assurez-vous que le backend est démarré avec :');
    console.log('   npm run server');
    console.log('   ou');
    console.log('   npm run dev:full');
    return false;
  }
}

// Tests supplémentaires si la santé passe
async function runAdditionalTests() {
  console.log('\n🔍 Tests supplémentaires...');
  
  // Test des endpoints non authentifiés
  try {
    const response = await fetch('http://localhost:3001/api/users/status/online');
    if (response.ok) {
      console.log('✅ Endpoint utilisateurs en ligne accessible');
    } else {
      console.log('⚠️  Endpoint utilisateurs en ligne retourne :', response.status);
    }
  } catch (error) {
    console.log('❌ Erreur test endpoint utilisateurs :', error.message);
  }

  // Test Socket.io
  try {
    const { io } = await import('socket.io-client');
    const socket = io('http://localhost:3001', {
      timeout: 5000,
      forceNew: true
    });

    socket.on('connect', () => {
      console.log('✅ Socket.io connecté');
      socket.disconnect();
    });

    socket.on('connect_error', (error) => {
      console.log('⚠️  Socket.io :', error.message);
      socket.disconnect();
    });

  } catch (error) {
    console.log('❌ Erreur test Socket.io :', error.message);
  }
}

// Main
(async () => {
  const backendOK = await testBackend();
  
  if (backendOK) {
    await runAdditionalTests();
    console.log('\n🎉 Tests terminés avec succès !');
    console.log('\n📋 Prochaines étapes :');
    console.log('   1. Configurez vos variables d\'environnement (.env)');
    console.log('   2. Appliquez le schéma de base de données Supabase');
    console.log('   3. Testez l\'authentification dans l\'app');
  } else {
    console.log('\n🚨 Le backend n\'est pas accessible.');
    console.log('\n🔧 Actions à faire :');
    console.log('   1. Démarrez le backend : npm run server');
    console.log('   2. Vérifiez le port 3001');
    console.log('   3. Consultez les logs d\'erreur');
    process.exit(1);
  }
})();
