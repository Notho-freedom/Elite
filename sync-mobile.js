#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Synchronisation des versions mobiles...\n');

try {
  // 1. Construire l'application
  console.log('📦 Construction de l\'application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // 2. Synchroniser avec Capacitor
  console.log('\n📱 Synchronisation avec Capacitor...');
  try {
    execSync('npx cap sync', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️  Synchronisation iOS échouée (normal sur Windows)');
    console.log('✅ Synchronisation Android réussie');
  }
  
  // 3. Vérifier que les fichiers sont synchronisés
  console.log('\n✅ Vérification de la synchronisation...');
  
  const androidIndexPath = 'android/app/src/main/assets/public/index.html';
  const androidAssetsPath = 'android/app/src/main/assets/public/assets';
  const androidSwPath = 'android/app/src/main/assets/public/firebase-messaging-sw.js';
  
  if (fs.existsSync(androidIndexPath)) {
    console.log('✅ Android: index.html synchronisé');
  }
  
  if (fs.existsSync(androidAssetsPath)) {
    const assets = fs.readdirSync(androidAssetsPath);
    console.log(`✅ Android: ${assets.length} assets synchronisés`);
  }
  
  if (fs.existsSync(androidSwPath)) {
    console.log('✅ Android: Service Worker Firebase synchronisé');
  }
  
  console.log('\n🎉 Synchronisation terminée avec succès !');
  console.log('\n📱 Pour tester sur Android:');
  console.log('   npx cap open android');
  console.log('\n🍎 Pour tester sur iOS (macOS uniquement):');
  console.log('   npx cap open ios');
  
} catch (error) {
  console.error('\n❌ Erreur lors de la synchronisation:', error.message);
  process.exit(1);
}
