// 🧪 Utilitaire pour tester les réactions en ajoutant des réactions factices
// À supprimer une fois l'intégration complète avec Supabase

/**
 * Ajoute des réactions de test aux messages pour démonstration
 */
export function addTestReactionsToMessages(messages, currentUserId) {
  if (!messages || !Array.isArray(messages)) return messages;

  return messages.map((message, index) => {
    // Ajouter des réactions de test à quelques messages
    const shouldHaveReactions = index % 3 === 0; // Un message sur 3
    
    if (!shouldHaveReactions) return message;

    // Générer des réactions de test variées
    const testReactions = generateTestReactions(message.id, currentUserId, index);
    
    return {
      ...message,
      reactions: testReactions
    };
  });
}

/**
 * Génère des réactions de test pour un message
 */
function generateTestReactions(messageId, currentUserId, index) {
  const allReactions = [
    { emoji: '👍', probability: 0.7 },
    { emoji: '❤️', probability: 0.4 },
    { emoji: '😂', probability: 0.3 },
    { emoji: '😮', probability: 0.2 },
    { emoji: '😢', probability: 0.1 },
    { emoji: '😡', probability: 0.05 }
  ];

  const reactions = [];
  const reactionUsers = [
    'user-test-1',
    'user-test-2', 
    'user-test-3',
    currentUserId // L'utilisateur actuel
  ];

  allReactions.forEach(({ emoji, probability }) => {
    // Décider si cette réaction doit être présente
    const shouldAdd = Math.random() < probability;
    if (!shouldAdd) return;

    // Choisir aléatoirement qui a réagi
    const reactedUsers = reactionUsers.filter(() => Math.random() < 0.5);
    
    // S'assurer qu'au moins une personne a réagi
    if (reactedUsers.length === 0) {
      reactedUsers.push(reactionUsers[Math.floor(Math.random() * reactionUsers.length)]);
    }

    // Créer les réactions individuelles pour chaque utilisateur
    reactedUsers.forEach(userId => {
      reactions.push({
        emoji,
        userId,
        user_id: userId,
        created_at: new Date(Date.now() - Math.random() * 86400000).toISOString()
      });
    });
  });

  return reactions;
}

/**
 * Ajoute une réaction spécifique à un message (pour les tests)
 */
export function addTestReaction(messageId, emoji, userId) {
  return {
    emoji,
    userId,
    user_id: userId,
    created_at: new Date().toISOString()
  };
}

/**
 * Messages avec réactions pré-configurées pour la démo
 */
export const sampleMessagesWithReactions = [
  {
    id: 'demo-msg-1',
    content: 'Salut ! Comment ça va ?',
    senderId: 'user-demo-1',
    reactions: [
      { emoji: '👍', userId: 'user-demo-2', user_id: 'user-demo-2', created_at: new Date().toISOString() },
      { emoji: '❤️', userId: 'current-user', user_id: 'current-user', created_at: new Date().toISOString() }
    ]
  },
  {
    id: 'demo-msg-2', 
    content: 'Très bien merci ! Et toi ?',
    senderId: 'current-user',
    reactions: [
      { emoji: '👍', userId: 'user-demo-1', user_id: 'user-demo-1', created_at: new Date().toISOString() },
      { emoji: '👍', userId: 'user-demo-2', user_id: 'user-demo-2', created_at: new Date().toISOString() },
      { emoji: '😂', userId: 'user-demo-3', user_id: 'user-demo-3', created_at: new Date().toISOString() }
    ]
  },
  {
    id: 'demo-msg-3',
    content: 'Super ! On se voit bientôt ?',
    senderId: 'user-demo-1',
    reactions: [
      { emoji: '🎉', userId: 'current-user', user_id: 'current-user', created_at: new Date().toISOString() },
      { emoji: '👍', userId: 'user-demo-2', user_id: 'user-demo-2', created_at: new Date().toISOString() },
      { emoji: '❤️', userId: 'user-demo-3', user_id: 'user-demo-3', created_at: new Date().toISOString() },
      { emoji: '😮', userId: 'user-demo-4', user_id: 'user-demo-4', created_at: new Date().toISOString() }
    ]
  }
];

export default {
  addTestReactionsToMessages,
  addTestReaction,
  sampleMessagesWithReactions
};
