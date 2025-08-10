import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Historique par conversation (stocké dans un Map)
const chatHistories = new Map();

// Cache des réponses pour éviter les répétitions
const responseCache = new Map();

// Système de détection d'intention
const INTENT_PATTERNS = {
  GREETING: /^(salut|hello|bonjour|hey|hi|coucou)\s*!*\s*$/i,
  QUESTION: /\?/,
  EMOJI_ONLY: /^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]+$/u,
  THANK_YOU: /^(merci|thanks|thx|thank you)\s*!*\s*$/i,
  GOODBYE: /^(au revoir|bye|goodbye|à bientôt|ciao)\s*!*\s*$/i,
  URGENT: /(!{2,}|urgent|important|aide|help)/i,
  MEDIA_SHARE: /^(regarde|voici|check|look)/i
};

// Réponses prédéfinies pour les intents simples
const QUICK_RESPONSES = {
  GREETING: [
    "Salut ! Comment ça va ?",
    "Hey ! Quoi de neuf ?",
    "Bonjour ! Belle journée non ?",
    "Coucou ! Tu vas bien ?",
    "Hello ! Ça roule ?"
  ],
  THANK_YOU: [
    "De rien ! 😊",
    "Avec plaisir !",
    "Pas de souci !",
    "C'est naturel ! ✨",
    "Toujours là pour toi !"
  ],
  GOODBYE: [
    "À bientôt ! 👋",
    "Bye ! Passe une bonne journée !",
    "Ciao ! À plus !",
    "Au revoir ! Prends soin de toi !",
    "À la prochaine ! 😊"
  ],
  EMOJI_ONLY: [
    "😄",
    "😊💕",
    "✨",
    "👍",
    "😘"
  ]
};

export async function askGroq(userInput, activeChat) {
  try {
    // Détection d'intention rapide
    const intent = detectIntent(userInput);
    
    // Réponses rapides pour les intents simples
    if (intent && QUICK_RESPONSES[intent]) {
      const responses = QUICK_RESPONSES[intent];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      // Ajouter de la variabilité même pour les réponses rapides
      if (Math.random() > 0.7) {
        return await generateContextualResponse(userInput, activeChat, intent);
      }
      
      return randomResponse;
    }

    // Vérifier le cache pour éviter les répétitions
    const cacheKey = `${activeChat.id}-${userInput.toLowerCase().trim()}`;
    if (responseCache.has(cacheKey)) {
      const cachedResponse = responseCache.get(cacheKey);
      // Utiliser le cache seulement 30% du temps pour garder de la variabilité
      if (Math.random() < 0.3) {
        return cachedResponse;
      }
    }

    // Initialiser l'historique si nouveau chat
    if (!chatHistories.has(activeChat.id)) {
      const systemPrompt = generateSystemPrompt(activeChat);
      chatHistories.set(activeChat.id, [
        {
          role: 'system',
          content: systemPrompt
        },
      ]);
    }

    const history = chatHistories.get(activeChat.id);

    // Ajouter le message utilisateur
    history.push({ role: 'user', content: userInput });

    const response = await groq.chat.completions.create({
      model: 'meta-llama/llama-3.3-70b-versatile',
      messages: history,
      temperature: 0.8,
      max_tokens: 1024,
      top_p: 0.9,
    });

    const assistantMessage = response.choices[0]?.message?.content || 'Aucune réponse générée.';

    // Ajouter la réponse et garder un historique limité
    history.push({ role: 'assistant', content: assistantMessage });
    if (history.length > 12) {
      history.splice(1, 2); // Conserve le prompt système mais retire les premiers messages
    }

    // Mettre en cache la réponse
    responseCache.set(cacheKey, assistantMessage);
    
    // Nettoyer le cache périodiquement
    if (responseCache.size > 100) {
      const oldestKeys = Array.from(responseCache.keys()).slice(0, 20);
      oldestKeys.forEach(key => responseCache.delete(key));
    }

    return assistantMessage;
  } catch (error) {
    console.error('Erreur lors de la requête IA Groq:', error);
    
    // Système de fallback avec réponses intelligentes
    return generateFallbackResponse(userInput, activeChat, error);
  }
}

function detectIntent(userInput) {
  const text = userInput.trim();
  
  for (const [intent, pattern] of Object.entries(INTENT_PATTERNS)) {
    if (pattern.test(text)) {
      return intent;
    }
  }
  
  return null;
}

async function generateContextualResponse(userInput, activeChat, intent) {
  // Génération de réponse contextuelle même pour les intents simples
  const timeOfDay = new Date().getHours();
  const isWeekend = [0, 6].includes(new Date().getDay());
  
  if (intent === 'GREETING') {
    if (timeOfDay < 12) {
      return `Bon matin ${activeChat.name} ! ☀️ Prêt(e) pour cette journée ?`;
    } else if (timeOfDay < 18) {
      return `Salut ${activeChat.name} ! L'après-midi se passe bien ?`;
    } else {
      return `Bonsoir ${activeChat.name} ! Comment s'est passée ta journée ?`;
    }
  }
  
  // Fallback aux réponses standards
  const responses = QUICK_RESPONSES[intent];
  return responses[Math.floor(Math.random() * responses.length)];
}

function generateFallbackResponse(userInput, activeChat, error) {
  const fallbackResponses = [
    "Je réfléchis encore... 🤔 Peux-tu reformuler ?",
    "Hmm, je n'ai pas bien saisi. Tu peux répéter autrement ?",
    "Oups, j'ai eu un petit bug ! 😅 Dis-moi ça différemment ?",
    "Je suis un peu dans les nuages là... ☁️ Explique-moi encore !",
    "Petit problème technique ! 🔧 Reformule ta question ?",
    "Je dois me reconcentrer ! 🎯 Redis-moi ça ?",
    "Connexion un peu lente... ⚡ Peux-tu réessayer ?"
  ];
  
  // Réponse contextuelle basée sur l'erreur
  if (error.message.includes('rate limit')) {
    return "Wow, on discute beaucoup ! 🚀 Laisse-moi une seconde pour suivre !";
  }
  
  if (error.message.includes('network')) {
    return "Ma connexion fait des siennes... 📶 Réessaye dans un instant !";
  }
  
  // Réponse basée sur le contenu du message
  if (userInput.length > 200) {
    return "Waouh, quel pavé ! 📝 Peux-tu résumer ta pensée ?";
  }
  
  if (INTENT_PATTERNS.QUESTION.test(userInput)) {
    return "Excellente question ! 🤓 Mais j'ai besoin d'un moment pour y réfléchir...";
  }
  
  return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
}

function generateSystemPrompt(activeChat) {
  const basePrompt = `Tu es une IA conversationnelle intégrée dans Elite Chat. 
  Tu réponds au nom de ${activeChat.name}. Tu es en mode DÉMO, donc sois engageant et montres les capacités de l'app.`;

  const personalityTraits = [];
  const contextualInfo = [];
  
  // Informations temporelles
  const now = new Date();
  const timeOfDay = now.getHours();
  const isWeekend = [0, 6].includes(now.getDay());
  const season = getSeason(now);
  
  contextualInfo.push(`Il est ${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`);
  contextualInfo.push(`Nous sommes ${isWeekend ? 'en weekend' : 'en semaine'}`);
  contextualInfo.push(`C'est la saison: ${season}`);
  
  // Basé sur l'état en ligne
  if (activeChat.isOnline) {
    personalityTraits.push("Tu es disponible et réactive, tu réponds rapidement");
  } else {
    personalityTraits.push("Tu réponds parfois avec un léger délai, tu n'es pas toujours en ligne");
  }

  // Basé sur l'activité
  if (activeChat.actu) {
    personalityTraits.push("Tu es passionné(e) par l'actualité et les tendances du moment");
  }

  // Basé sur le temps de réponse
  const responseTime = new Date() - new Date(activeChat.time);
  if (responseTime > 86400000) { // 24h
    personalityTraits.push("Tu t'excuses parfois pour le retard dans tes réponses");
  }

  // Style de communication basé sur l'heure
  if (timeOfDay < 6 || timeOfDay > 22) {
    personalityTraits.push("Tu es plutôt noctambule, avec un ton décontracté");
  } else if (timeOfDay < 12) {
    personalityTraits.push("Tu es matinal(e) et énergique le matin");
  } else if (timeOfDay < 18) {
    personalityTraits.push("Tu as un ton professionnel mais amical l'après-midi");
  } else {
    personalityTraits.push("Tu es relaxé(e) et chaleureux(se) en soirée");
  }

  // Basé sur le nom et l'avatar
  const nameLength = activeChat.name.length;
  if (nameLength > 15) {
    personalityTraits.push("Tu utilises un langage assez formel et poli");
  } else {
    personalityTraits.push("Tu utilises un langage décontracté et des emojis");
  }

  // Statut de lecture
  if (!activeChat.isRead) {
    personalityTraits.push("Tu fais parfois référence aux messages non lus avec humour");
  }

  // Basé sur l'avatar (genre présumé)
  const avatarClues = {
    female: activeChat.avatar?.includes('women') || activeChat.name.endsWith('a') || activeChat.name.endsWith('e'),
    male: activeChat.avatar?.includes('men') || activeChat.name.endsWith('o') || activeChat.name.endsWith('r')
  };

  if (avatarClues.female) {
    personalityTraits.push("Tu as une personnalité féminine, chaleureuse et empathique");
  } else if (avatarClues.male) {
    personalityTraits.push("Tu as une personnalité masculine, directe mais bienveillante");
  } else {
    personalityTraits.push("Tu as une personnalité neutre et adaptable");
  }

  // Spécificités démo
  personalityTraits.push("Tu mentionnes parfois les fonctionnalités cool d'Elite Chat");
  personalityTraits.push("Tu es curieux(se) et poses des questions pour engager la conversation");

  return `${basePrompt}

CONTEXTE: ${contextualInfo.join(', ')}.

PERSONNALITÉ: ${personalityTraits.join('. ')}.

DIRECTIVES:
- Sois naturel(le), amical(e) et concis(e) (max 2-3 phrases)
- Utilise des emojis de façon naturelle (1-2 par message max)
- Adapte ton ton à l'heure et au contexte
- Montre de l'intérêt pour l'utilisateur
- En mode démo, n'hésite pas à mentionner subtilement les features cool de l'app
- Évite les réponses trop génériques, sois authentique
- Si la conversation devient répétitive, propose un nouveau sujet`;
}

function getSeason(date) {
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return 'printemps';
  if (month >= 5 && month <= 7) return 'été';
  if (month >= 8 && month <= 10) return 'automne';
  return 'hiver';
}

// Fonction utilitaire pour nettoyer l'historique
export function clearChatHistory(chatId) {
  if (chatHistories.has(chatId)) {
    chatHistories.delete(chatId);
  }
  
  // Nettoyer le cache pour ce chat
  for (const [key] of responseCache.entries()) {
    if (key.startsWith(`${chatId}-`)) {
      responseCache.delete(key);
    }
  }
}

// Fonction pour obtenir des statistiques d'usage
export function getAIStats() {
  return {
    activeChats: chatHistories.size,
    cachedResponses: responseCache.size,
    memoryUsage: `${Math.round((chatHistories.size * 10 + responseCache.size * 2) / 1024)} KB`
  };
}