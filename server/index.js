import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { config } from './config.js';
import { initSupabase } from './supabase.js';
import authRoutes from './routes/auth.js';
import discussionRoutes from './routes/discussions.js';
import messageRoutes from './routes/messages.js';
import userRoutes from './routes/users.js';
import { initSocketHandlers } from './socket/handlers.js';
import { authenticateSocket } from './middleware/auth.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Configuration CORS
app.use(cors({
  origin: config.CLIENT_URL,
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialisation de Supabase
const supabase = initSupabase();

// Middleware pour ajouter supabase à req
app.use((req, res, next) => {
  req.supabase = supabase;
  next();
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Elite Chat Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Gestion des connexions Socket.io
io.use(authenticateSocket);
io.on('connection', (socket) => {
  console.log(`✅ Utilisateur connecté: ${socket.user?.name || socket.user?.id}`);
  
  // Initialiser les gestionnaires d'événements
  initSocketHandlers(socket, io, supabase);
  
  socket.on('disconnect', () => {
    console.log(`❌ Utilisateur déconnecté: ${socket.user?.name || socket.user?.id}`);
  });
});

// Démarrage du serveur
const PORT = config.PORT || 3001;
server.listen(PORT, () => {
  console.log(`
🚀 Elite Chat Backend démarré!
📡 Serveur: http://localhost:${PORT}
🔗 Socket.io: Actif
📊 API: http://localhost:${PORT}/api/health
🎯 Environnement: ${config.NODE_ENV}
  `);
});

export { app, server, io };
