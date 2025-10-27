import express from 'express';
import { authenticateUser, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Connexion avec email/mot de passe
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email et mot de passe requis'
      });
    }

    const { data, error } = await req.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({
        error: error.message
      });
    }

    res.json({
      user: data.user,
      session: data.session
    });
  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Inscription avec email/mot de passe
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, username } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Email, mot de passe et nom requis'
      });
    }

    const { data, error } = await req.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          username: username || email.split('@')[0]
        }
      }
    });

    if (error) {
      return res.status(400).json({
        error: error.message
      });
    }

    res.json({
      user: data.user,
      session: data.session,
      message: 'Compte créé avec succès'
    });
  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Déconnexion
router.post('/logout', authenticateUser, async (req, res) => {
  try {
    const { error } = await req.supabase.auth.signOut();

    if (error) {
      return res.status(400).json({
        error: error.message
      });
    }

    res.json({
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    console.error('Erreur de déconnexion:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Rafraîchir le token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token requis'
      });
    }

    const { data, error } = await req.supabase.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (error) {
      return res.status(401).json({
        error: error.message
      });
    }

    res.json({
      session: data.session
    });
  } catch (error) {
    console.error('Erreur de refresh:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Récupérer le profil de l'utilisateur connecté
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    const { data: profile, error } = await req.supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) {
      return res.status(404).json({
        error: 'Profil non trouvé'
      });
    }

    res.json({
      profile
    });
  } catch (error) {
    console.error('Erreur de récupération du profil:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Mettre à jour le profil
router.put('/profile', authenticateUser, async (req, res) => {
  try {
    const { name, username, bio, location, website, avatar_url } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (username !== undefined) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (website !== undefined) updateData.website = website;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

    const { data, error } = await req.supabase
      .from('users')
      .update(updateData)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        error: error.message
      });
    }

    res.json({
      profile: data,
      message: 'Profil mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur de mise à jour du profil:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Mettre à jour le statut en ligne
router.post('/status', authenticateUser, async (req, res) => {
  try {
    const { status, is_online } = req.body;

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (is_online !== undefined) updateData.is_online = is_online;
    updateData.last_seen = new Date().toISOString();

    const { data, error } = await req.supabase
      .from('users')
      .update(updateData)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        error: error.message
      });
    }

    res.json({
      profile: data,
      message: 'Statut mis à jour'
    });
  } catch (error) {
    console.error('Erreur de mise à jour du statut:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

export default router;
