#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Vérifier si le dossier node_modules du serveur existe
const serverNodeModules = join(__dirname, 'server', 'node_modules');
if (!fs.existsSync(serverNodeModules)) {
  console.log('📦 Installation des dépendances du backend...');
  
  const npmInstall = spawn('npm', ['install'], {
    cwd: join(__dirname, 'server'),
    stdio: 'inherit'
  });
  
  npmInstall.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Dépendances installées, démarrage du serveur...');
      startServer();
    } else {
      console.error('❌ Erreur installation des dépendances');
      process.exit(1);
    }
  });
} else {
  startServer();
}

function startServer() {
  console.log('🚀 Démarrage d\'Elite Chat Backend...');
  
  const server = spawn('node', ['index.js'], {
    cwd: join(__dirname, 'server'),
    stdio: 'inherit'
  });
  
  server.on('close', (code) => {
    console.log(`Backend arrêté avec le code ${code}`);
  });
  
  // Gérer l'arrêt propre
  process.on('SIGINT', () => {
    console.log('\n👋 Arrêt du backend...');
    server.kill('SIGINT');
    process.exit(0);
  });
}
