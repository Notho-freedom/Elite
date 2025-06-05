import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Spinner } from './../UI/Spinner';

const EMOJI_API_BASE = 'https://emojiapi.dev/api/v1';
const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 heures
const MAX_CACHE_SIZE = 100;

// Liste de proxies CORS fiables
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://thingproxy.freeboard.io/fetch/',
  'https://cors-anywhere.herokuapp.com/'
];

// Cache pour les emojis
const emojiCache = new Map();

const cleanCache = () => {
  if (emojiCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(emojiCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    entries.slice(0, Math.floor(MAX_CACHE_SIZE / 2)).forEach(([key]) => {
      emojiCache.delete(key);
    });
  }
};

const EmojiImage = ({ 
  emoji, 
  size = 100,
  format = 'webp',
  fallback = null,
  className = '',
  style = {},
  onLoad,
  onError
}) => {
  const [imgUrl, setImgUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const emojiCode = useMemo(() => {
    if (!emoji) return null;
    // Convertit l'emoji en son code point (support des emojis combinés)
    return [...emoji].map(c => c.codePointAt(0).toString(16)).join('-');
  }, [emoji]);

  const fetchWithProxy = async (url) => {
    // Essayer d'abord sans proxy
    try {
      const response = await fetch(url, { mode: 'no-cors' });
      if (response.ok || response.type === 'opaque') {
        return url; // Si la réponse est opaque (CORS) mais réussie
      }
    } catch (e) {
      console.debug('Direct fetch failed, trying proxies...');
    }

    // Essayer chaque proxy
    for (const proxy of CORS_PROXIES) {
      try {
        const proxyUrl = proxy + encodeURIComponent(url);
        const response = await fetch(proxyUrl, { 
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        });
        
        if (response.ok) {
          // Pour les proxies qui retournent l'image directement
          if (response.headers.get('content-type')?.startsWith('image/')) {
            return URL.createObjectURL(await response.blob());
          }
          // Pour les proxies qui retournent une réponse JSON
          const data = await response.json();
          return data.contents || url;
        }
      } catch (err) {
        console.debug(`Proxy ${proxy} failed:`, err.message);
      }
    }
    return null;
  };

  const fetchEmoji = useCallback(async () => {
    if (!emojiCode) {
      setLoading(false);
      return;
    }

    // Vérifier le cache
    const cacheKey = `${emojiCode}-${size}-${format}`;
    const cached = emojiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRATION_MS) {
      setImgUrl(cached.url);
      setLoading(false);
      if (onLoad) onLoad();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const directUrl = `${EMOJI_API_BASE}/${emojiCode}/${size}.${format}`;
      const url = await fetchWithProxy(directUrl);
      
      if (url) {
        cleanCache();
        emojiCache.set(cacheKey, {
          url,
          timestamp: Date.now()
        });
        
        setImgUrl(url);
        if (onLoad) onLoad();
      } else {
        throw new Error('Emoji non trouvé ou erreur de chargement');
      }
    } catch (err) {
      console.error("Erreur de chargement de l'emoji:", err);
      setError(err.message);
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  }, [emojiCode, size, format, onLoad, onError]);

  useEffect(() => {
    fetchEmoji();
  }, [fetchEmoji]);

  // Nettoyer les URLs créées avec createObjectURL
  useEffect(() => {
    return () => {
      if (imgUrl && imgUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imgUrl);
      }
    };
  }, [imgUrl]);

  const containerStyle = useMemo(() => ({
    width: size,
    height: size,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style
  }), [size, style]);

  if (loading) {
    return (
      <div style={containerStyle} className={className}>
        {fallback || <Spinner />}
      </div>
    );
  }

  if (error || !imgUrl) {
    return (
      <div style={containerStyle} className={className}>
        {fallback || <span style={{ fontSize: size * 0.6 }}>{emoji || '❌'}</span>}
      </div>
    );
  }

  return (
    <div style={containerStyle} className={className}>
      <img 
        src={imgUrl} 
        alt={emoji} 
        style={{ 
          width: '100%', 
          height: '100%',
          objectFit: 'contain'
        }}
        onError={(e) => {
          setError('Failed to load image');
          if (onError) onError(new Error('Image load error'));
          e.target.style.display = 'none';
        }}
      />
    </div>
  );
};

export default React.memo(EmojiImage);