import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Historique par conversation (stocké dans un Map)
const chatHistories = new Map();
const conversationContexts = new Map();

// Types de réponses intelligentes
const RESPONSE_TYPES = {
  GREETING: 'greeting',
  QUESTION: 'question',
  COMPLIMENT: 'compliment',
  CASUAL: 'casual',
  EMOTIONAL: 'emotional',
  TECHNICAL: 'technical',
  MEDIA_COMMENT: 'media_comment',
  EMOJI_RESPONSE: 'emoji_response'
};

// Base de données de réponses contextuelles
const SMART_RESPONSES = {
  [RESPONSE_TYPES.GREETING]: [
    "Salut ! Comment ça va aujourd'hui ?",
    "Hey ! Quoi de neuf ?",
    "Hello ! Tu vas bien ?",
    "Coucou ! Comment s'est passée ta journée ?",
    "Yo ! Qu'est-ce que tu fais ?",
    "Salut mon pote ! Ça roule ?"
  ],
  [RESPONSE_TYPES.QUESTION]: [
    "Bonne question ! Laisse-moi réfléchir...",
    "Hmm, intéressant comme point de vue 🤔",
    "Je vois ce que tu veux dire, c'est vrai que...",
    "Tu as raison de te poser cette question !",
    "Ça c'est une colle ! 😅"
  ],
  [RESPONSE_TYPES.COMPLIMENT]: [
    "Merci, c'est gentil ! 😊",
    "Tu es trop sympa !",
    "Ça me fait plaisir d'entendre ça !",
    "Merci beaucoup ! 🥰",
    "Tu es adorable !"
  ],
  [RESPONSE_TYPES.CASUAL]: [
    "Ah ouais, carrément !",
    "Je suis d'accord avec toi !",
    "Exactement ce que je pensais !",
    "Tu lis dans mes pensées ! 😄",
    "On est sur la même longueur d'onde !"
  ],
  [RESPONSE_TYPES.EMOTIONAL]: [
    "Je comprends ce que tu ressens...",
    "C'est normal d'être comme ça parfois",
    "Je suis là si tu veux en parler 💙",
    "Prends soin de toi !",
    "Tu peux compter sur moi !"
  ],
  [RESPONSE_TYPES.MEDIA_COMMENT]: [
    "Belle photo ! 📸",
    "J'adore ce que tu partages !",
    "Trop cool ! 🔥",
    "Magnifique ! ✨",
    "Incroyable ! 🤩"
  ],
  [RESPONSE_TYPES.EMOJI_RESPONSE]: [
    "😊", "😄", "🤔", "👍", "🔥", "💯", "😅", "🥰", "😍", "🤗"
  ]
};

// Détection intelligente du type de message
function detectMessageType(message, context = {}) {
  const text = message.toLowerCase();
  
  // Salutations
  if (/^(salut|hello|hey|coucou|bonjour|bonsoir|yo)/i.test(text)) {
    return RESPONSE_TYPES.GREETING;
  }
  
  // Questions
  if (text.includes('?') || /^(pourquoi|comment|quand|où|qui|que|quoi|est-ce)/i.test(text)) {
    return RESPONSE_TYPES.QUESTION;
  }
  
  // Compliments
  if (/(merci|sympa|cool|génial|super|parfait|excellent|bravo)/i.test(text)) {
    return RESPONSE_TYPES.COMPLIMENT;
  }
  
  // États émotionnels
  if (/(triste|fatigue|content|heureux|énervé|stressé|déprimé)/i.test(text)) {
    return RESPONSE_TYPES.EMOTIONAL;
  }
  
  // Commentaires sur médias
  if (context.hasMedia) {
    return RESPONSE_TYPES.MEDIA_COMMENT;
  }
  
  // Emojis seuls ou messages très courts
  if (text.length <= 3 || /^[\p{Emoji}\s]+$/u.test(text)) {
    return RESPONSE_TYPES.EMOJI_RESPONSE;
  }
  
  return RESPONSE_TYPES.CASUAL;
}

// Génération de réponses intelligentes
function generateSmartResponse(messageType, context = {}) {
  const responses = SMART_RESPONSES[messageType] || SMART_RESPONSES[RESPONSE_TYPES.CASUAL];
  const baseResponse = responses[Math.floor(Math.random() * responses.length)];
  
  // Personnalisation selon le contexte
  if (context.timeOfDay) {
    if (context.timeOfDay === 'morning' && messageType === RESPONSE_TYPES.GREETING) {
      return Math.random() > 0.5 ? "Bonjour ! Bien dormi ?" : baseResponse;
    }
    if (context.timeOfDay === 'evening' && messageType === RESPONSE_TYPES.GREETING) {
      return Math.random() > 0.5 ? "Bonsoir ! Comment s'est passée ta journée ?" : baseResponse;
    }
  }
  
  if (context.userName && Math.random() > 0.7) {
    return baseResponse.replace(/!$/, ` ${context.userName} !`);
  }
  
  return baseResponse;
}

// Fonction principale améliorée
export async function askGroq(userInput, activeChat) {
  try {
    // Analyse du contexte
    const context = {
      timeOfDay: getTimeOfDay(),
      userName: activeChat?.name?.split(' ')[0],
      hasMedia: false, // TODO: Détecter si le message contient des médias
      conversationLength: chatHistories.get(activeChat.id)?.length || 0
    };
    
    // Mise à jour du contexte de conversation
    updateConversationContext(activeChat.id, userInput, context);
    
    // 40% de chance d'utiliser une réponse rapide intelligente
    if (Math.random() < 0.4) {
      const messageType = detectMessageType(userInput, context);
      return generateSmartResponse(messageType, context);
    }
    
    // Initialiser l'historique si nouveau chat
    if (!chatHistories.has(activeChat.id)) {
      const systemPrompt = generateEnhancedSystemPrompt(activeChat, context);
      chatHistories.set(activeChat.id, [
        {
          role: 'system',
          content: systemPrompt
        },
      ]);
    }

    const history = chatHistories.get(activeChat.id);

    // Ajouter le message utilisateur avec contexte
    const contextualMessage = enhanceMessageWithContext(userInput, context);
    history.push({ role: 'user', content: contextualMessage });

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: history,
      temperature: 0.8,
      max_tokens: 150,
      top_p: 0.9,
    });

    const assistantMessage = response.choices[0]?.message?.content || generateSmartResponse(RESPONSE_TYPES.CASUAL, context);

    // Ajouter la réponse et garder un historique limité
    history.push({ role: 'assistant', content: assistantMessage });
    if (history.length > 12) {
      history.splice(1, 2);
    }

    return assistantMessage;
  } catch (error) {
    console.error('Erreur lors de la requête IA Groq:', error);
    
    // Fallback avec réponse intelligente
    const messageType = detectMessageType(userInput);
    return generateSmartResponse(messageType, { userName: activeChat?.name?.split(' ')[0] });
  }
}

// Génération de prompt système amélioré
function generateEnhancedSystemPrompt(activeChat, context) {
  const basePrompt = `Tu es ${activeChat.name}, une personne réelle qui discute sur Elite Chat.`;

  const personalityTraits = [];
  
  // Personnalité basée sur l'heure
  if (context.timeOfDay === 'morning') {
    personalityTraits.push("Tu es matinal(e) et énergique le matin");
  } else if (context.timeOfDay === 'evening') {
    personalityTraits.push("Tu es plus détendu(e) le soir");
  } else if (context.timeOfDay === 'night') {
    personalityTraits.push("Tu es un couche-tard qui aime les discussions nocturnes");
  }

  // Basé sur l'état en ligne
  if (activeChat.isOnline) {
    personalityTraits.push("Tu es très réactif(ve) et disponible");
  } else {
    personalityTraits.push("Tu réponds parfois avec un petit délai");
  }

  // Style de communication basé sur le nom
  const nameLength = activeChat.name?.length || 0;
  if (nameLength > 12) {
    personalityTraits.push("Tu utilises un langage plutôt soutenu");
  } else {
    personalityTraits.push("Tu utilises un langage décontracté avec des emojis");
  }

  // Traits de personnalité aléatoires
  const randomTraits = [
    "Tu adores la technologie et les innovations",
    "Tu es passionné(e) par les voyages",
    "Tu aimes partager des anecdotes intéressantes",
    "Tu es très curieux(se) et poses souvent des questions",
    "Tu as un bon sens de l'humour",
    "Tu es empathique et à l'écoute",
    "Tu adores découvrir de nouvelles choses",
    "Tu es créatif(ve) et imaginatif(ve)"
  ];
  
  personalityTraits.push(randomTraits[Math.floor(Math.random() * randomTraits.length)]);

  return `${basePrompt} ${personalityTraits.join('. ')}.
  
INSTRUCTIONS IMPORTANTES:
- Réponds de manière naturelle et spontanée
- Utilise des emojis avec modération (1-2 par message max)
- Varie tes réponses et évite la répétition
- Reste dans le personnage de ${activeChat.name}
- Garde un ton amical et accessible
- Réponds en français naturel
- Ne dépasse jamais 2-3 phrases par réponse
- Montre de l'intérêt pour ce que dit l'utilisateur`;
}

// Amélioration du message avec contexte
function enhanceMessageWithContext(message, context) {
  let enhancedMessage = message;
  
  if (context.timeOfDay) {
    enhancedMessage += ` [Contexte: ${context.timeOfDay}]`;
  }
  
  if (context.conversationLength > 10) {
    enhancedMessage += ` [Conversation longue]`;
  }
  
  return enhancedMessage;
}

// Mise à jour du contexte de conversation
function updateConversationContext(chatId, message, context) {
  if (!conversationContexts.has(chatId)) {
    conversationContexts.set(chatId, {
      topics: [],
      mood: 'neutral',
      lastMessageTime: Date.now()
    });
  }
  
  const chatContext = conversationContexts.get(chatId);
  chatContext.lastMessageTime = Date.now();
  
  // Analyser les sujets
  const topics = extractTopics(message);
  chatContext.topics = [...new Set([...chatContext.topics, ...topics])].slice(-5);
  
  conversationContexts.set(chatId, chatContext);
}

// Extraction de sujets
function extractTopics(message) {
  const text = message.toLowerCase();
  const topics = [];
  
  // Sujets courants
  const topicKeywords = {
    'travail': ['travail', 'bureau', 'job', 'boulot', 'collègue'],
    'weekend': ['weekend', 'samedi', 'dimanche', 'repos'],
    'nourriture': ['manger', 'restaurant', 'cuisine', 'plat', 'repas'],
    'sport': ['sport', 'foot', 'basket', 'tennis', 'course'],
    'musique': ['musique', 'concert', 'chanson', 'artiste', 'album'],
    'film': ['film', 'cinéma', 'série', 'netflix', 'acteur'],
    'voyage': ['voyage', 'vacances', 'plage', 'montagne', 'pays']
  };
  
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      topics.push(topic);
    }
  }
  
  return topics;
}

// Détection de l'heure
function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

// Export des fonctions utilitaires
export { detectMessageType, generateSmartResponse, RESPONSE_TYPES };