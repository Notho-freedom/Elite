import express from 'express';
import { authenticateUser, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Rechercher des utilisateurs
router.get('/search', authenticateUser, async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        error: 'Terme de recherche trop court (minimum 2 caractères)'
      });
    }

    const { data, error } = await req.supabase
      .from('users')
      .select('id, name, username, avatar_url, status, is_online')
      .or(`name.ilike.%${q}%,username.ilike.%${q}%,email.ilike.%${q}%`)
      .neq('id', req.user.id) // Exclure l'utilisateur actuel
      .limit(parseInt(limit));

    if (error) {
      return res.status(500).json({
        error: 'Erreur lors de la recherche'
      });
    }

    res.json({
      users: data
    });
  } catch (error) {
    console.error('Erreur recherche utilisateurs:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Récupérer tous les utilisateurs (pour suggestions)
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { limit = 50, status } = req.query;

    let query = req.supabase
      .from('users')
      .select('id, name, username, avatar_url, status, is_online, last_seen')
      .neq('id', req.user.id)
      .order('name');

    if (status) {
      query = query.eq('status', status);
    }

    query = query.limit(parseInt(limit));

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({
        error: 'Erreur lors de la récupération des utilisateurs'
      });
    }

    res.json({
      users: data
    });
  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Récupérer un utilisateur spécifique
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await req.supabase
      .from('users')
      .select('id, name, username, avatar_url, bio, location, website, status, is_online, last_seen, created_at')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      });
    }

    res.json({
      user: data
    });
  } catch (error) {
    console.error('Erreur récupération utilisateur:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Récupérer les contacts/amis de l'utilisateur
router.get('/me/contacts', authenticateUser, async (req, res) => {
  try {
    // Récupérer les utilisateurs avec qui l'utilisateur a des discussions
    const { data, error } = await req.supabase
      .from('discussion_participants')
      .select(`
        discussions!inner(
          id,
          type,
          discussion_participants!inner(
            user_id,
            users!inner(id, name, username, avatar_url, status, is_online, last_seen)
          )
        )
      `)
      .eq('user_id', req.user.id)
      .eq('is_active', true);

    if (error) {
      return res.status(500).json({
        error: 'Erreur lors de la récupération des contacts'
      });
    }

    // Extraire les utilisateurs uniques
    const contacts = new Map();
    
    data.forEach(participant => {
      participant.discussions.discussion_participants.forEach(p => {
        if (p.user_id !== req.user.id) {
          contacts.set(p.user_id, p.users);
        }
      });
    });

    const uniqueContacts = Array.from(contacts.values());

    res.json({
      contacts: uniqueContacts
    });
  } catch (error) {
    console.error('Erreur récupération contacts:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Récupérer les utilisateurs en ligne
router.get('/status/online', optionalAuth, async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('users')
      .select('id, name, username, avatar_url, status, last_seen')
      .eq('is_online', true)
      .order('last_seen', { ascending: false });

    if (error) {
      return res.status(500).json({
        error: 'Erreur lors de la récupération des utilisateurs en ligne'
      });
    }

    res.json({
      onlineUsers: data
    });
  } catch (error) {
    console.error('Erreur récupération utilisateurs en ligne:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Bloquer un utilisateur
router.post('/:id/block', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({
        error: 'Vous ne pouvez pas vous bloquer vous-même'
      });
    }

    // TODO: Implémenter la table de blocage
    // Pour l'instant, on simule
    res.json({
      message: 'Utilisateur bloqué (fonctionnalité à implémenter)'
    });
  } catch (error) {
    console.error('Erreur blocage utilisateur:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Débloquer un utilisateur
router.delete('/:id/block', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Implémenter la table de blocage
    // Pour l'instant, on simule
    res.json({
      message: 'Utilisateur débloqué (fonctionnalité à implémenter)'
    });
  } catch (error) {
    console.error('Erreur déblocage utilisateur:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Signaler un utilisateur
router.post('/:id/report', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, details } = req.body;

    if (!reason) {
      return res.status(400).json({
        error: 'Raison du signalement requise'
      });
    }

    // TODO: Implémenter la table de signalements
    // Pour l'instant, on simule
    console.log(`Signalement utilisateur ${id} par ${req.user.id}: ${reason}`);

    res.json({
      message: 'Signalement enregistré (fonctionnalité à implémenter)'
    });
  } catch (error) {
    console.error('Erreur signalement utilisateur:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

export default router;
