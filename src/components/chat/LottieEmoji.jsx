import { Player } from '@lottiefiles/react-lottie-player';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

// Cache local avec expiration pour éviter des requêtes répétées
const emojiCache = new Map();
const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 heures

// Liste de sources possibles pour les animations Lottie
const LOTTIE_SOURCES = [
  'https://assets8.lottiefiles.com/packages/',
  'https://assets9.lottiefiles.com/packages/',
  'https://assets.lottiefiles.com/render/',
  'https://lottie.host/',
];

// Proxy options similar to the LinkPreview component
const PROXIES = [
  "https://cors-anywhere.herokuapp.com/",
  "https://api.allorigins.win/raw?url=",
  "https://thingproxy.freeboard.io/fetch/",
];

const LottieEmoji = ({ 
  emoji, 
  size = 48,
  fallback = null,
  autoplay = true,
  loop = true,
  hoverPlay = false,
  speed = 1,
  backgroundColor = 'transparent'
}) => {
  const [animationData, setAnimationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWithProxy = useCallback(async (url) => {
    for (const proxy of PROXIES) {
      try {
        const proxyUrl = proxy + encodeURIComponent(url);
        const response = await axios.get(proxyUrl, {
          timeout: 5000,
          responseType: 'json'
        });
        return response.data;
      } catch (err) {
        console.warn(`Proxy ${proxy} failed: ${err.message}`);
      }
    }
    return null;
  }, []);

  const fetchEmojiAnimation = useCallback(async () => {
    // Vérifier le cache d'abord
    const cached = emojiCache.get(emoji);
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRATION_MS) {
      setAnimationData(cached.data);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Convertir l'emoji en code point hexadécimal
      const codePoint = emoji.codePointAt(0).toString(16).padStart(4, '0');
      
      // Essayer différents formats de noms de fichiers courants
      const possibleFiles = [
        `lf20_${codePoint}.json`,
        `lf30_${codePoint}.json`,
        `emoji_${codePoint}.json`,
        `emoji-${codePoint}.json`,
        `${codePoint}.json`
      ];

      let animationFound = null;

      // Essayer chaque source possible
      for (const source of LOTTIE_SOURCES) {
        for (const file of possibleFiles) {
          const url = `${source}${file}`;
          
          try {
            // Essayer d'abord une requête HEAD pour vérifier l'existence
            const headResponse = await fetch(url, { method: 'HEAD' });
            
            if (headResponse.ok) {
              // Si le HEAD réussit, récupérer les données
              const data = await fetchWithProxy(url) || await axios.get(url).then(res => res.data);
              
              if (data) {
                animationFound = { data, url };
                break;
              }
            }
          } catch (err) {
            console.warn(`Failed to fetch ${url}:`, err.message);
          }
        }
        if (animationFound) break;
      }

      if (animationFound) {
        // Mettre en cache avec timestamp
        emojiCache.set(emoji, {
          data: animationFound.data,
          timestamp: Date.now()
        });
        setAnimationData(animationFound.data);
      } else {
        setError('Animation not found');
      }
    } catch (error) {
      console.error("Error fetching emoji animation:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [emoji, fetchWithProxy]);

  useEffect(() => {
    let isMounted = true;
    
    if (emoji) {
      fetchEmojiAnimation().then(() => {
        if (!isMounted) return;
      });
    }

    return () => {
      isMounted = false;
    };
  }, [emoji, fetchEmojiAnimation]);

  if (loading) {
    return (
      <div style={{ 
        width: size, 
        height: size, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor
      }}>
        {fallback || <span>...</span>}
      </div>
    );
  }

  if (error || !animationData) {
    return (
      <div style={{ 
        width: size, 
        height: size, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor
      }}>
        {fallback || <span>{emoji}</span>}
      </div>
    );
  }

  return (
    <div style={{ backgroundColor, borderRadius: '50%' }}>
      <Player
        autoplay={autoplay}
        loop={loop}
        hover={hoverPlay}
        speed={speed}
        src={animationData}
        style={{ 
          height: size, 
          width: size,
          cursor: hoverPlay ? 'pointer' : 'default'
        }}
      />
    </div>
  );
};

export default LottieEmoji;