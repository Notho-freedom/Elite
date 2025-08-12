import express from 'express';
import { authenticateUser } from '../middleware/auth.js';
import { transformDiscussion } from '../supabase.js';

const router = express.Router();

// Récupérer toutes les discussions de l'utilisateur
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('discussions_with_details')
      .select('*')
      .eq('user_id', req.user.id)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Erreur récupération discussions:', error);
      return res.status(500).json({
        error: 'Erreur lors de la récupération des discussions'
      });
    }

    // Transformer les données pour le frontend
    const transformedDiscussions = data.map(discussion => 
      transformDiscussion(discussion, req.user.id)
    );

    res.json({
      discussions: transformedDiscussions
    });
  } catch (error) {
    console.error('Erreur discussions:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Récupérer une discussion spécifique
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que l'utilisateur est participant
    const { data: participant } = await req.supabase
      .from('discussion_participants')
      .select('*')
      .eq('discussion_id', id)
      .eq('user_id', req.user.id)
      .eq('is_active', true)
      .single();

    if (!participant) {
      return res.status(403).json({
        error: 'Accès non autorisé à cette discussion'
      });
    }

    const { data, error } = await req.supabase
      .from('discussions')
      .select(`
        *,
        participants:discussion_participants(
          user_id,
          role,
          is_muted,
          nickname,
          users(id, name, avatar_url, status, is_online)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        error: 'Discussion non trouvée'
      });
    }

    const transformedDiscussion = transformDiscussion(data, req.user.id);

    res.json({
      discussion: transformedDiscussion
    });
  } catch (error) {
    console.error('Erreur récupération discussion:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Créer une nouvelle discussion
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { name, description, type = 'private', participant_ids = [] } = req.body;

    // Validation
    if (type === 'group' && !name) {
      return res.status(400).json({
        error: 'Le nom est requis pour les groupes'
      });
    }

    if (participant_ids.length === 0) {
      return res.status(400).json({
        error: 'Au moins un participant est requis'
      });
    }

    // Pour les discussions privées, vérifier qu'il n'y a qu'un seul autre participant
    if (type === 'private' && participant_ids.length !== 1) {
      return res.status(400).json({
        error: 'Les discussions privées ne peuvent avoir qu\'un seul autre participant'
      });
    }

    // Vérifier si une discussion privée existe déjà
    if (type === 'private') {
      const { data: existingDiscussion } = await req.supabase
        .rpc('create_private_discussion', {
          user1_uuid: req.user.id,
          user2_uuid: participant_ids[0]
        });

      if (existingDiscussion) {
        const { data: discussion } = await req.supabase
          .from('discussions')
          .select(`
            *,
            participants:discussion_participants(
              user_id,
              role,
              users(id, name, avatar_url, status)
            )
          `)
          .eq('id', existingDiscussion)
          .single();

        return res.json({
          discussion: transformDiscussion(discussion, req.user.id),
          message: 'Discussion existante trouvée'
        });
      }
    }

    // Créer la nouvelle discussion
    const { data: discussion, error: discussionError } = await req.supabase
      .from('discussions')
      .insert({
        name,
        description,
        type,
        created_by: req.user.id
      })
      .select()
      .single();

    if (discussionError) {
      return res.status(400).json({
        error: discussionError.message
      });
    }

    // Ajouter les participants
    const participants = [
      { discussion_id: discussion.id, user_id: req.user.id, role: 'admin' },
      ...participant_ids.map(userId => ({
        discussion_id: discussion.id,
        user_id: userId,
        role: 'member'
      }))
    ];

    const { error: participantsError } = await req.supabase
      .from('discussion_participants')
      .insert(participants);

    if (participantsError) {
      // Nettoyer la discussion créée en cas d'erreur
      await req.supabase
        .from('discussions')
        .delete()
        .eq('id', discussion.id);

      return res.status(400).json({
        error: participantsError.message
      });
    }

    // Récupérer la discussion complète
    const { data: completeDiscussion } = await req.supabase
      .from('discussions')
      .select(`
        *,
        participants:discussion_participants(
          user_id,
          role,
          users(id, name, avatar_url, status)
        )
      `)
      .eq('id', discussion.id)
      .single();

    res.status(201).json({
      discussion: transformDiscussion(completeDiscussion, req.user.id),
      message: 'Discussion créée avec succès'
    });
  } catch (error) {
    console.error('Erreur création discussion:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Mettre à jour une discussion
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, avatar_url, is_pinned, is_archived, is_muted } = req.body;

    // Vérifier les permissions
    const { data: participant } = await req.supabase
      .from('discussion_participants')
      .select('role')
      .eq('discussion_id', id)
      .eq('user_id', req.user.id)
      .single();

    if (!participant) {
      return res.status(403).json({
        error: 'Accès non autorisé'
      });
    }

    // Seuls les admins/modérateurs peuvent modifier certains champs
    const updateData = {};
    
    if (participant.role === 'admin' || participant.role === 'moderator') {
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
    }

    // Tous les participants peuvent modifier ces paramètres personnels
    if (is_pinned !== undefined) updateData.is_pinned = is_pinned;
    if (is_archived !== undefined) updateData.is_archived = is_archived;
    if (is_muted !== undefined) updateData.is_muted = is_muted;

    const { data, error } = await req.supabase
      .from('discussions')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        participants:discussion_participants(
          user_id,
          role,
          users(id, name, avatar_url, status)
        )
      `)
      .single();

    if (error) {
      return res.status(400).json({
        error: error.message
      });
    }

    res.json({
      discussion: transformDiscussion(data, req.user.id),
      message: 'Discussion mise à jour'
    });
  } catch (error) {
    console.error('Erreur mise à jour discussion:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Quitter une discussion
router.post('/:id/leave', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await req.supabase
      .from('discussion_participants')
      .update({ 
        is_active: false,
        left_at: new Date().toISOString()
      })
      .eq('discussion_id', id)
      .eq('user_id', req.user.id);

    if (error) {
      return res.status(400).json({
        error: error.message
      });
    }

    res.json({
      message: 'Discussion quittée avec succès'
    });
  } catch (error) {
    console.error('Erreur quitter discussion:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Ajouter un participant
router.post('/:id/participants', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, role = 'member' } = req.body;

    // Vérifier les permissions (admin/moderator requis)
    const { data: currentParticipant } = await req.supabase
      .from('discussion_participants')
      .select('role')
      .eq('discussion_id', id)
      .eq('user_id', req.user.id)
      .single();

    if (!currentParticipant || !['admin', 'moderator'].includes(currentParticipant.role)) {
      return res.status(403).json({
        error: 'Permissions insuffisantes'
      });
    }

    const { data, error } = await req.supabase
      .from('discussion_participants')
      .insert({
        discussion_id: id,
        user_id,
        role
      })
      .select(`
        *,
        users(id, name, avatar_url, status)
      `)
      .single();

    if (error) {
      return res.status(400).json({
        error: error.message
      });
    }

    res.json({
      participant: data,
      message: 'Participant ajouté avec succès'
    });
  } catch (error) {
    console.error('Erreur ajout participant:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Supprimer un participant
router.delete('/:id/participants/:user_id', authenticateUser, async (req, res) => {
  try {
    const { id, user_id } = req.params;

    // Vérifier les permissions
    const { data: currentParticipant } = await req.supabase
      .from('discussion_participants')
      .select('role')
      .eq('discussion_id', id)
      .eq('user_id', req.user.id)
      .single();

    if (!currentParticipant || !['admin', 'moderator'].includes(currentParticipant.role)) {
      return res.status(403).json({
        error: 'Permissions insuffisantes'
      });
    }

    const { error } = await req.supabase
      .from('discussion_participants')
      .update({ 
        is_active: false,
        left_at: new Date().toISOString()
      })
      .eq('discussion_id', id)
      .eq('user_id', user_id);

    if (error) {
      return res.status(400).json({
        error: error.message
      });
    }

    res.json({
      message: 'Participant retiré avec succès'
    });
  } catch (error) {
    console.error('Erreur retrait participant:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

export default router;
