import express from 'express';
import multer from 'multer';
import { authenticateUser } from '../middleware/auth.js';
import { transformMessage } from '../supabase.js';
import { config } from '../config.js';

const router = express.Router();

// Configuration multer pour l'upload de fichiers
const upload = multer({
  limits: {
    fileSize: config.MAX_FILE_SIZE
  },
  fileFilter: (req, file, cb) => {
    if (config.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'));
    }
  }
});

// Récupérer les messages d'une discussion
router.get('/:discussionId', authenticateUser, async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { limit = 50, offset = 0, before_id } = req.query;

    // Vérifier que l'utilisateur est participant
    const { data: participant } = await req.supabase
      .from('discussion_participants')
      .select('*')
      .eq('discussion_id', discussionId)
      .eq('user_id', req.user.id)
      .eq('is_active', true)
      .single();

    if (!participant) {
      return res.status(403).json({
        error: 'Accès non autorisé à cette discussion'
      });
    }

    let query = req.supabase
      .from('messages')
      .select(`
        *,
        sender:users(id, name, avatar_url),
        reply_to:reply_to_id(id, content, sender:users(name))
      `)
      .eq('discussion_id', discussionId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false }); // Plus récents en premier pour la pagination

    if (before_id) {
      // Pagination par ID pour un meilleur contrôle
      const { data: beforeMessage } = await req.supabase
        .from('messages')
        .select('created_at')
        .eq('id', before_id)
        .single();

      if (beforeMessage) {
        query = query.lt('created_at', beforeMessage.created_at);
      }
    }

    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Erreur récupération messages:', error);
      return res.status(500).json({
        error: 'Erreur lors de la récupération des messages'
      });
    }

    // Transformer et inverser l'ordre pour avoir les plus anciens en premier
    const transformedMessages = data
      .reverse()
      .map(message => transformMessage(message, req.user.id));

    res.json({
      messages: transformedMessages,
      hasMore: data.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Erreur messages:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Envoyer un message
router.post('/:discussionId', authenticateUser, upload.single('file'), async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { content, message_type = 'text', reply_to_id } = req.body;

    // Vérifier que l'utilisateur est participant
    const { data: participant } = await req.supabase
      .from('discussion_participants')
      .select('*')
      .eq('discussion_id', discussionId)
      .eq('user_id', req.user.id)
      .eq('is_active', true)
      .single();

    if (!participant) {
      return res.status(403).json({
        error: 'Accès non autorisé à cette discussion'
      });
    }

    // Validation du contenu
    if (!content && !req.file) {
      return res.status(400).json({
        error: 'Contenu ou fichier requis'
      });
    }

    if (content && content.length > config.MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        error: `Message trop long (max ${config.MAX_MESSAGE_LENGTH} caractères)`
      });
    }

    // Préparer les données du message
    const messageData = {
      discussion_id: discussionId,
      sender_id: req.user.id,
      content: content || '',
      message_type,
      reply_to_id: reply_to_id || null
    };

    // Gérer l'upload de fichier si présent
    if (req.file) {
      // TODO: Implémenter l'upload vers Supabase Storage
      // Pour l'instant, on simule avec un placeholder
      messageData.media_url = `placeholder_url_${Date.now()}`;
      messageData.media_type = req.file.mimetype.split('/')[0]; // image, video, audio
      messageData.media_size = req.file.size;
      messageData.media_name = req.file.originalname;
      messageData.message_type = messageData.media_type;
    }

    // Insérer le message
    const { data, error } = await req.supabase
      .from('messages')
      .insert(messageData)
      .select(`
        *,
        sender:users(id, name, avatar_url),
        reply_to:reply_to_id(id, content, sender:users(name))
      `)
      .single();

    if (error) {
      console.error('Erreur création message:', error);
      return res.status(400).json({
        error: error.message
      });
    }

    // Mettre à jour le timestamp de la discussion
    await req.supabase
      .from('discussions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', discussionId);

    // Transformer le message pour le frontend
    const transformedMessage = transformMessage(data, req.user.id);

    res.status(201).json({
      message: transformedMessage
    });
  } catch (error) {
    console.error('Erreur envoi message:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Modifier un message
router.put('/:messageId', authenticateUser, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    if (!content || content.length > config.MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        error: 'Contenu invalide'
      });
    }

    // Vérifier que l'utilisateur est l'expéditeur
    const { data: message } = await req.supabase
      .from('messages')
      .select('sender_id, discussion_id')
      .eq('id', messageId)
      .single();

    if (!message || message.sender_id !== req.user.id) {
      return res.status(403).json({
        error: 'Accès non autorisé'
      });
    }

    const { data, error } = await req.supabase
      .from('messages')
      .update({ 
        content,
        is_edited: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .select(`
        *,
        sender:users(id, name, avatar_url),
        reply_to:reply_to_id(id, content, sender:users(name))
      `)
      .single();

    if (error) {
      return res.status(400).json({
        error: error.message
      });
    }

    res.json({
      message: transformMessage(data, req.user.id)
    });
  } catch (error) {
    console.error('Erreur modification message:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Supprimer un message
router.delete('/:messageId', authenticateUser, async (req, res) => {
  try {
    const { messageId } = req.params;

    // Vérifier que l'utilisateur est l'expéditeur ou admin
    const { data: message } = await req.supabase
      .from('messages')
      .select(`
        sender_id, 
        discussion_id,
        discussions!inner(
          discussion_participants!inner(user_id, role)
        )
      `)
      .eq('id', messageId)
      .eq('discussions.discussion_participants.user_id', req.user.id)
      .single();

    if (!message) {
      return res.status(404).json({
        error: 'Message non trouvé'
      });
    }

    const isOwner = message.sender_id === req.user.id;
    const isAdmin = message.discussions.discussion_participants.some(
      p => p.user_id === req.user.id && ['admin', 'moderator'].includes(p.role)
    );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: 'Accès non autorisé'
      });
    }

    const { error } = await req.supabase
      .from('messages')
      .update({ 
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        content: '' // Vider le contenu
      })
      .eq('id', messageId);

    if (error) {
      return res.status(400).json({
        error: error.message
      });
    }

    res.json({
      message: 'Message supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression message:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Ajouter une réaction
router.post('/:messageId/reactions', authenticateUser, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({
        error: 'Emoji requis'
      });
    }

    // Vérifier l'accès au message
    const { data: messageCheck } = await req.supabase
      .from('messages')
      .select(`
        discussion_id,
        discussions!inner(
          discussion_participants!inner(user_id)
        )
      `)
      .eq('id', messageId)
      .eq('discussions.discussion_participants.user_id', req.user.id)
      .single();

    if (!messageCheck) {
      return res.status(403).json({
        error: 'Accès non autorisé'
      });
    }

    const { data, error } = await req.supabase
      .from('message_reactions')
      .upsert({
        message_id: messageId,
        user_id: req.user.id,
        emoji
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        error: error.message
      });
    }

    res.json({
      reaction: data,
      message: 'Réaction ajoutée'
    });
  } catch (error) {
    console.error('Erreur ajout réaction:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Supprimer une réaction
router.delete('/:messageId/reactions/:emoji', authenticateUser, async (req, res) => {
  try {
    const { messageId, emoji } = req.params;

    const { error } = await req.supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', req.user.id)
      .eq('emoji', decodeURIComponent(emoji));

    if (error) {
      return res.status(400).json({
        error: error.message
      });
    }

    res.json({
      message: 'Réaction supprimée'
    });
  } catch (error) {
    console.error('Erreur suppression réaction:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Marquer les messages comme lus
router.post('/:discussionId/read', authenticateUser, async (req, res) => {
  try {
    const { discussionId } = req.params;

    // Utiliser la fonction de base de données pour marquer comme lu
    const { error } = await req.supabase
      .rpc('mark_messages_as_read', {
        discussion_uuid: discussionId,
        user_uuid: req.user.id
      });

    if (error) {
      return res.status(400).json({
        error: error.message
      });
    }

    res.json({
      message: 'Messages marqués comme lus'
    });
  } catch (error) {
    console.error('Erreur marquage lecture:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

export default router;
