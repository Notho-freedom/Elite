import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Historique par conversation (stocké dans un Map)
const chatHistories = new Map();

export async function askGroq(userInput, activeChat) {
  try {
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
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: history,
      temperature: 0.7,
      max_tokens: 1024,
    });

    const assistantMessage = response.choices[0]?.message?.content || 'Aucune réponse générée.';

    // Ajouter la réponse et garder un historique limité
    history.push({ role: 'assistant', content: assistantMessage });
    if (history.length > 10) {
      history.splice(1, 2); // Conserve le prompt système mais retire les premiers messages
    }

    return assistantMessage;
  } catch (error) {
    console.error('Erreur lors de la requête IA Groq:', error);
    throw new Error('Erreur IA: impossible de traiter la requête');
  }
}

function generateSystemPrompt(activeChat) {
  const basePrompt = `Tu es une IA conversationnelle intégrée dans Elite. 
  Tu réponds au nom de ${activeChat.name}.`;

  const personalityTraits = [];
  
  // Basé sur l'état en ligne
  if (activeChat.isOnline) {
    personalityTraits.push("Tu es disponible et réactive");
  } else {
    personalityTraits.push("Tu réponds parfois avec un léger délai");
  }

  // Basé sur l'activité
  if (activeChat.actu) {
    personalityTraits.push("Tu es passionné(e) par l'actualité et les tendances");
  }

  // Basé sur le temps de réponse
  const responseTime = new Date() - new Date(activeChat.time);
  if (responseTime > 86400000) { // 24h
    personalityTraits.push("Tu t'excuses pour le retard dans tes réponses");
  }

  // Style de communication
  const nameLength = activeChat.name.length;
  if (nameLength > 15) {
    personalityTraits.push("Tu utilises un langage assez formel");
  } else {
    personalityTraits.push("Tu utilises un langage décontracté");
  }

  // Statut de lecture
  if (!activeChat.isRead) {
    personalityTraits.push("Tu fais parfois référence aux messages non lus");
  }

  // Basé sur l'avatar (genre présumé)
  const avatarClues = {
    female: activeChat.avatar.includes('women') || activeChat.name.endsWith('a'),
    male: activeChat.avatar.includes('men') || activeChat.name.endsWith('o')
  };

  if (avatarClues.female) {
    personalityTraits.push("Tu as une voix féminine et chaleureuse");
  } else if (avatarClues.male) {
    personalityTraits.push("Tu as une voix masculine et posée");
  }

  // Basé sur l'heure du dernier message
  const hour = new Date(activeChat.time).getHours();
  if (hour < 5 || hour > 22) {
    personalityTraits.push("Tu sembles être un couche-tard");
  } else if (hour < 12) {
    personalityTraits.push("Tu es du matin et énergique");
  }


  return `${basePrompt} ${personalityTraits.join('. ')}. 
  Ton style de réponse doit refléter ces caractéristiques. 
  Sois naturel(le), amical(e) et concis(e).`;
}