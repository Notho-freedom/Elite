import { transformMessage, transformDiscussion } from '../supabase.js';
import { config } from '../config.js';

export function initSocketHandlers(socket, io, supabase) {
  const userId = socket.user.id;

  // Joindre les discussions de l'utilisateur
  joinUserDiscussions(socket, supabase, userId);

  // Gestionnaires d'événements
  socket.on('join_discussion', (data) => handleJoinDiscussion(socket, data));
  socket.on('leave_discussion', (data) => handleLeaveDiscussion(socket, data));
  socket.on('send_message', (data) => handleSendMessage(socket, io, supabase, data));
  socket.on('typing_start', (data) => handleTypingStart(socket, supabase, data));
  socket.on('typing_stop', (data) => handleTypingStop(socket, supabase, data));
  socket.on('message_read', (data) => handleMessageRead(socket, io, supabase, data));
  socket.on('user_status', (data) => handleUserStatus(socket, io, supabase, data));
  socket.on('call_signal', (data) => handleCallSignal(socket, io, data));

  // Mettre à jour le statut en ligne
  updateUserOnlineStatus(supabase, userId, true);

  // Gérer la déconnexion
  socket.on('disconnect', () => {
    handleDisconnect(socket, supabase, userId);
  });
}

// Joindre automatiquement les discussions de l'utilisateur
async function joinUserDiscussions(socket, supabase, userId) {
  try {
    const { data: discussions } = await supabase
      .from('discussion_participants')
      .select('discussion_id')
      .eq('user_id', userId)
      .eq('is_active', true);

    discussions?.forEach(({ discussion_id }) => {
      socket.join(`discussion:${discussion_id}`);
    });

    console.log(`👥 Utilisateur ${userId} rejoint ${discussions?.length || 0} discussions`);
  } catch (error) {
    console.error('Erreur lors du join des discussions:', error);
  }
}

// Joindre une discussion spécifique
function handleJoinDiscussion(socket, { discussionId }) {
  if (!discussionId) return;
  
  socket.join(`discussion:${discussionId}`);
  console.log(`📱 ${socket.user.id} rejoint la discussion ${discussionId}`);
}

// Quitter une discussion
function handleLeaveDiscussion(socket, { discussionId }) {
  if (!discussionId) return;
  
  socket.leave(`discussion:${discussionId}`);
  console.log(`📱 ${socket.user.id} quitte la discussion ${discussionId}`);
}

// Envoyer un message en temps réel
async function handleSendMessage(socket, io, supabase, data) {
  try {
    const { discussionId, content, messageType = 'text', replyToId } = data;

    if (!discussionId || (!content && messageType === 'text')) {
      return socket.emit('error', { message: 'Données invalides' });
    }

    // Vérifier l'accès
    const { data: participant } = await supabase
      .from('discussion_participants')
      .select('*')
      .eq('discussion_id', discussionId)
      .eq('user_id', socket.user.id)
      .eq('is_active', true)
      .single();

    if (!participant) {
      return socket.emit('error', { message: 'Accès non autorisé' });
    }

    // Créer le message
    const messageData = {
      discussion_id: discussionId,
      sender_id: socket.user.id,
      content: content || '',
      message_type: messageType,
      reply_to_id: replyToId || null
    };

    const { data: message, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select(`
        *,
        sender:users(id, name, avatar_url),
        reply_to:reply_to_id(id, content, sender:users(name))
      `)
      .single();

    if (error) {
      return socket.emit('error', { message: error.message });
    }

    // Mettre à jour la discussion
    await supabase
      .from('discussions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', discussionId);

    // Transformer et diffuser le message
    const transformedMessage = transformMessage(message, socket.user.id);
    
    // Envoyer à tous les participants de la discussion
    io.to(`discussion:${discussionId}`).emit('new_message', {
      discussionId,
      message: transformedMessage
    });

    // Confirmer l'envoi à l'expéditeur
    socket.emit('message_sent', {
      tempId: data.tempId, // Pour mapper avec le message temporaire côté client
      message: transformedMessage
    });

    console.log(`💬 Message envoyé dans ${discussionId} par ${socket.user.id}`);
  } catch (error) {
    console.error('Erreur envoi message Socket:', error);
    socket.emit('error', { message: 'Erreur lors de l\'envoi du message' });
  }
}

// Gestion des indicateurs de frappe
async function handleTypingStart(socket, supabase, { discussionId }) {
  try {
    if (!discussionId) return;

    // Ajouter l'indicateur de frappe
    await supabase
      .from('typing_indicators')
      .upsert({
        discussion_id: discussionId,
        user_id: socket.user.id
      });

    // Diffuser aux autres participants
    socket.to(`discussion:${discussionId}`).emit('user_typing', {
      discussionId,
      userId: socket.user.id,
      userName: socket.user.name || socket.profile?.name,
      isTyping: true
    });

    console.log(`⌨️ ${socket.user.id} tape dans ${discussionId}`);
  } catch (error) {
    console.error('Erreur typing start:', error);
  }
}

async function handleTypingStop(socket, supabase, { discussionId }) {
  try {
    if (!discussionId) return;

    // Supprimer l'indicateur de frappe
    await supabase
      .from('typing_indicators')
      .delete()
      .eq('discussion_id', discussionId)
      .eq('user_id', socket.user.id);

    // Diffuser aux autres participants
    socket.to(`discussion:${discussionId}`).emit('user_typing', {
      discussionId,
      userId: socket.user.id,
      userName: socket.user.name || socket.profile?.name,
      isTyping: false
    });

    console.log(`⌨️ ${socket.user.id} arrête de taper dans ${discussionId}`);
  } catch (error) {
    console.error('Erreur typing stop:', error);
  }
}

// Marquer un message comme lu
async function handleMessageRead(socket, io, supabase, { discussionId, messageId }) {
  try {
    if (!discussionId || !messageId) return;

    // Marquer comme lu
    await supabase
      .from('message_read_status')
      .upsert({
        message_id: messageId,
        user_id: socket.user.id
      });

    // Diffuser aux autres participants
    socket.to(`discussion:${discussionId}`).emit('message_read', {
      discussionId,
      messageId,
      userId: socket.user.id,
      readAt: new Date().toISOString()
    });

    console.log(`👁️ Message ${messageId} lu par ${socket.user.id}`);
  } catch (error) {
    console.error('Erreur message read:', error);
  }
}

// Mise à jour du statut utilisateur
async function handleUserStatus(socket, io, supabase, { status, isOnline }) {
  try {
    const updateData = {
      last_seen: new Date().toISOString()
    };

    if (status !== undefined) updateData.status = status;
    if (isOnline !== undefined) updateData.is_online = isOnline;

    await supabase
      .from('users')
      .update(updateData)
      .eq('id', socket.user.id);

    // Diffuser le changement de statut aux contacts
    const { data: discussions } = await supabase
      .from('discussion_participants')
      .select('discussion_id')
      .eq('user_id', socket.user.id)
      .eq('is_active', true);

    discussions?.forEach(({ discussion_id }) => {
      socket.to(`discussion:${discussion_id}`).emit('user_status_changed', {
        userId: socket.user.id,
        status,
        isOnline,
        lastSeen: updateData.last_seen
      });
    });

    console.log(`📊 Statut de ${socket.user.id} mis à jour: ${status}, en ligne: ${isOnline}`);
  } catch (error) {
    console.error('Erreur user status:', error);
  }
}

// Signalisation d'appel (WebRTC)
function handleCallSignal(socket, io, { discussionId, signal, type, targetUserId }) {
  try {
    if (!discussionId || !signal || !type) return;

    if (targetUserId) {
      // Signalisation directe à un utilisateur
      io.to(`user:${targetUserId}`).emit('call_signal', {
        discussionId,
        signal,
        type,
        fromUserId: socket.user.id,
        fromUserName: socket.user.name || socket.profile?.name
      });
    } else {
      // Signalisation à tous les participants de la discussion
      socket.to(`discussion:${discussionId}`).emit('call_signal', {
        discussionId,
        signal,
        type,
        fromUserId: socket.user.id,
        fromUserName: socket.user.name || socket.profile?.name
      });
    }

    console.log(`📞 Signal d'appel ${type} de ${socket.user.id} dans ${discussionId}`);
  } catch (error) {
    console.error('Erreur call signal:', error);
  }
}

// Mettre à jour le statut en ligne
async function updateUserOnlineStatus(supabase, userId, isOnline) {
  try {
    await supabase
      .from('users')
      .update({
        is_online: isOnline,
        last_seen: new Date().toISOString()
      })
      .eq('id', userId);
  } catch (error) {
    console.error('Erreur mise à jour statut en ligne:', error);
  }
}

// Gestion de la déconnexion
async function handleDisconnect(socket, supabase, userId) {
  try {
    // Nettoyer les indicateurs de frappe
    await supabase
      .from('typing_indicators')
      .delete()
      .eq('user_id', userId);

    // Marquer comme hors ligne
    await updateUserOnlineStatus(supabase, userId, false);

    // Notifier les contacts
    const { data: discussions } = await supabase
      .from('discussion_participants')
      .select('discussion_id')
      .eq('user_id', userId)
      .eq('is_active', true);

    discussions?.forEach(({ discussion_id }) => {
      socket.to(`discussion:${discussion_id}`).emit('user_status_changed', {
        userId,
        isOnline: false,
        lastSeen: new Date().toISOString()
      });
    });

    console.log(`👋 ${userId} déconnecté`);
  } catch (error) {
    console.error('Erreur déconnexion:', error);
  }
}

// Nettoyer les indicateurs de frappe expirés (à appeler périodiquement)
export async function cleanupExpiredTyping(supabase) {
  try {
    await supabase.rpc('cleanup_expired_typing');
  } catch (error) {
    console.error('Erreur cleanup typing:', error);
  }
}

// Démarrer le nettoyage périodique
export function startPeriodicCleanup(supabase) {
  setInterval(() => {
    cleanupExpiredTyping(supabase);
  }, config.TYPING_INDICATOR_TIMEOUT);
}
