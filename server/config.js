import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3001,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  
  // Configuration Supabase
  SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
  
  // Configuration Upload
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'audio/mp3', 'audio/wav'],
  
  // Configuration Chat
  MAX_MESSAGE_LENGTH: 4000,
  MAX_PARTICIPANTS_PER_GROUP: 256,
  TYPING_INDICATOR_TIMEOUT: 10000, // 10 secondes
};

// Utiliser les variables de l'environnement du projet
if (!config.SUPABASE_URL && !config.SUPABASE_ANON_KEY) {
  // Charger depuis le fichier .env du projet parent
  config.SUPABASE_URL = 'https://oxazzejsmratrlzvrdfq.supabase.co';
  config.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94YXp6ZWpzbXJhdHJsenZyZGZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MjY2MTIsImV4cCI6MjA3MDEwMjYxMn0.Gsh1qd6lBBvZCtWPd1gNHsCW1XMbgbVx2ePCGVLoCHk';
}

// Validation des variables d'environnement critiques
if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

console.log('✅ Configuration chargée');
