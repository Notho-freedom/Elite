import { initSupabase } from '../supabase.js';

const supabase = initSupabase();

// Middleware d'authentification pour les routes Express
export async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Token d\'authentification manquant',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.substring(7); // Retirer "Bearer "
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ 
        error: 'Token d\'authentification invalide',
        code: 'INVALID_TOKEN'
      });
    }

    // Récupérer les informations complètes de l'utilisateur
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    req.user = user;
    req.profile = profile;
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur',
      code: 'AUTH_ERROR'
    });
  }
}

// Middleware d'authentification pour Socket.io
export async function authenticateSocket(socket, next) {
  try {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    
    if (!token) {
      return next(new Error('Token d\'authentification manquant'));
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return next(new Error('Token d\'authentification invalide'));
    }

    // Récupérer les informations complètes de l'utilisateur
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    socket.user = user;
    socket.profile = profile;
    
    // Joindre l'utilisateur à une room personnelle
    socket.join(`user:${user.id}`);
    
    next();
  } catch (error) {
    console.error('Erreur d\'authentification Socket:', error);
    next(new Error('Erreur d\'authentification'));
  }
}

// Middleware optionnel pour les routes publiques
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (!error && user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        req.user = user;
        req.profile = profile;
      }
    }
    
    next();
  } catch (error) {
    console.error('Erreur d\'authentification optionnelle:', error);
    next(); // Continuer même en cas d'erreur
  }
}
