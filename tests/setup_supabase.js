#!/usr/bin/env node

/**
 * Script d'installation automatique pour Supabase
 * Ce script aide à configurer Supabase pour l'application ELITE
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Configuration automatique de Supabase pour ELITE\n');

// Vérifier si le fichier .env existe
function checkEnvFile() {
  const envPath = path.join(__dirname, '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('📝 Création du fichier .env...');
    
    const envContent = `# Configuration Supabase
# Remplacez ces valeurs par vos vraies données Supabase
VITE_SUPABASE_URL=votre_url_supabase_ici
VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase_ici

# Exemple :
# VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Fichier .env créé');
    console.log('⚠️  N\'oubliez pas de remplacer les valeurs par vos vraies données Supabase !');
  } else {
    console.log('✅ Fichier .env existe déjà');
  }
}

// Vérifier les fichiers SQL
function checkSqlFiles() {
  const files = ['database_schema.sql', 'test_data.sql'];
  
  console.log('\n📋 Vérification des fichiers SQL...');
  
  files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} existe`);
    } else {
      console.log(`❌ ${file} manquant`);
    }
  });
}

// Afficher les instructions
function showInstructions() {
  console.log('\n📖 Instructions de configuration :\n');
  
  console.log('1. 🏗️  Créer un projet Supabase :');
  console.log('   - Allez sur https://supabase.com');
  console.log('   - Créez un nouveau projet');
  console.log('   - Notez l\'URL et la clé anon\n');
  
  console.log('2. 🔧 Configurer les variables d\'environnement :');
  console.log('   - Ouvrez le fichier .env');
  console.log('   - Remplacez les valeurs par vos vraies données Supabase\n');
  
  console.log('3. 🗄️  Créer les tables :');
  console.log('   - Allez dans votre projet Supabase');
  console.log('   - Cliquez sur "SQL Editor"');
  console.log('   - Copiez et exécutez le contenu de database_schema.sql\n');
  
  console.log('4. 📊 Insérer les données de test :');
  console.log('   - Dans le SQL Editor, copiez et exécutez test_data.sql\n');
  
  console.log('5. 🔐 Configurer l\'authentification :');
  console.log('   - Dans Supabase, allez dans "Authentication" > "Settings"');
  console.log('   - Configurez les providers souhaités\n');
  
  console.log('6. 🧪 Tester la configuration :');
  console.log('   - Lancez l\'application : npm run dev');
  console.log('   - Ouvrez la console (F12)');
  console.log('   - Exécutez : window.testSupabase()\n');
}

// Vérifier les dépendances
function checkDependencies() {
  console.log('📦 Vérification des dépendances...');
  
  const packageJsonPath = path.join(__dirname, 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = packageJson.dependencies || {};
    
    const requiredDeps = ['@supabase/supabase-js'];
    const missingDeps = requiredDeps.filter(dep => !dependencies[dep]);
    
    if (missingDeps.length > 0) {
      console.log('⚠️  Dépendances manquantes :', missingDeps.join(', '));
      console.log('   Exécutez : npm install @supabase/supabase-js');
    } else {
      console.log('✅ Toutes les dépendances sont installées');
    }
  } else {
    console.log('❌ package.json non trouvé');
  }
}

// Fonction principale
function main() {
  console.log('🔍 Vérification de l\'environnement...\n');
  
  checkEnvFile();
  checkSqlFiles();
  checkDependencies();
  showInstructions();
  
  console.log('🎉 Configuration terminée !');
  console.log('\n📚 Documentation complète : SUPABASE_SETUP.md');
  console.log('🧪 Script de test : test_supabase.js');
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as setupSupabase };