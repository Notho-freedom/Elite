import { useState, useEffect, useCallback } from 'react';
import clsx from 'clsx';
import axios from 'axios';
import { useTheme } from '../Context/ThemeContext';

const PROXIES = [
  "https://cors-anywhere.herokuapp.com/",
  "https://api.allorigins.win/raw?url=",
  "https://thingproxy.freeboard.io/fetch/",
  "https://jsonp.afeld.me/?url=",
  "https://corsproxy.io/?",
  "https://proxy.cors.sh/?url=",
  "https://www.yourproxy.io?url=",
  "https://crossorigin.me/",
  "https://api.codetabs.com/v1/proxy/?quest=",
  "https://www.microlink.io/?url=",
  "https://proxyapi.io/api/?url=",
  "https://webhook.site/",
  "https://cors.io/?",
  "https://allorigins.win/raw?url=",
  "https://api.rebrandly.com/v1/proxy?url="
];

const API_KEY = '82159ce3ac0da6bed5b7c9f9aeb7f3ce';

const LinkPreview = ({ url, sender, compact = false }) => {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const {theme} = useTheme();

  const fetchAppMetadata = useCallback(async (url) => {
    // Essayer d'abord Microlink
    try {
      const { data } = await axios.get(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
      if (data && data.data) {
        return {
          title: data.data.title || new URL(url).hostname,
          favicon: data.data.icon?.url || `https://www.google.com/s2/favicons?sz=64&domain=${new URL(url).hostname}`,
          description: data.data.description || "",
          image: data.data.image?.url || "",
          url
        };
      }
    } catch (err) {
      console.warn(`Erreur Microlink: ${err.message}`);
    }

    // Essayer les proxies en cascade
    for (const proxy of PROXIES) {
      try {
        const proxyUrl = proxy + encodeURIComponent(url);
        const response = await axios.get(proxyUrl, {
          timeout: 5000,
          headers: {
            'Accept': 'text/html',
            'User-Agent': 'Mozilla/5.0'
          }
        });

        if (response.data) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(response.data, 'text/html');

          const getMetaContent = (property) => {
            const meta = doc.querySelector(`meta[property="${property}"]`) || 
                        doc.querySelector(`meta[name="${property}"]`);
            return meta?.getAttribute('content');
          };

          return {
            title: getMetaContent('og:title') || doc.title || new URL(url).hostname,
            description: getMetaContent('og:description') || 
                        getMetaContent('description') || 
                        "",
            image: getMetaContent('og:image') || 
                  getMetaContent('twitter:image') || 
                  "",
            favicon: doc.querySelector('link[rel="icon"]')?.href || 
                    `https://www.google.com/s2/favicons?sz=64&domain=${new URL(url).hostname}`,
            url
          };
        }
      } catch (err) {
        console.warn(`Proxy ${proxy} échoué: ${err.message}`);
      }
    }

    // Fallback API mylinkpreview.net
    try {
      const { data } = await axios.get(`https://api.mylinkpreview.net/?key=${API_KEY}&q=${encodeURIComponent(url)}`);
      return {
        title: data.title || new URL(url).hostname,
        favicon: data.favicon || `https://www.google.com/s2/favicons?sz=64&domain=${new URL(url).hostname}`,
        description: data.description || "",
        image: data.image || "",
        url
      };
    } catch (err) {
      console.error("Erreur mylinkpreview.net:", err);
      return {
        title: new URL(url).hostname,
        favicon: `https://www.google.com/s2/favicons?sz=64&domain=${new URL(url).hostname}`,
        description: "",
        image: "",
        url
      };
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (!url.startsWith('http')) {
        setPreview({ title: url, url });
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const metadata = await fetchAppMetadata(url);
        if (isMounted) {
          setPreview(metadata);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setPreview({
            title: new URL(url).hostname,
            favicon: `https://www.google.com/s2/favicons?sz=64&domain=${new URL(url).hostname}`,
            url
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [url, fetchAppMetadata]);

  if (!preview) {
    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer nofollow"
        className={clsx(
          "text-blue-500 hover:underline break-all",
          sender === 'me' ? 'text-blue-200' : ''
        )}
      >
        {url}
      </a>
    );
  }

  if (compact) {
    return (
      <div className="my-1 max-w-full transition-all duration-200 hover:scale-[1.01]">
      <a 
        href={preview.url} 
        target="_blank" 
        rel="noopener noreferrer nofollow"
        className="block no-underline group"
      >
        <div className={clsx(
          "rounded-xl overflow-hidden border transition-all duration-200",
          "hover:shadow-lg hover:border-opacity-80",
          sender === 'me' 
            ? theme.accentBg
            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'
        )}>
  
          
          <div className={clsx(
            "p-3 transition-colors",
            sender === 'me' ? 'text-white' : 'text-gray-900 dark:text-white'
          )}>
            <div className="flex items-start gap-2">
              {preview.favicon && (
                <img 
                  src={preview.favicon} 
                  alt="Favicon" 
                  className="w-5 h-5 mt-0.5 flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm mb-1 truncate">
                  {preview.title}
                </h4>
                {preview.description && (
                  <p className={clsx(
                    "text-xs line-clamp-2",
                    sender === 'me' ? 'text-blue-100/80' : 'text-gray-500 dark:text-gray-400'
                  )}>
                    {preview.description}
                  </p>
                )}
              </div>
            </div>
            
            <div className={clsx(
              "text-xs mt-2 truncate flex items-center",
              sender === 'me' ? 'text-blue-200/70' : 'text-gray-400 dark:text-gray-500'
            )}>
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              {new URL(preview.url).hostname.replace('www.', '')}
            </div>
          </div>
        </div>
      </a>
    </div>
    );
  }

  return (
    <div className="my-1 max-w-full transition-all duration-200 hover:scale-[1.01]">
      <a 
        href={preview.url} 
        target="_blank" 
        rel="noopener noreferrer nofollow"
        className="block no-underline group"
      >
        <div className={clsx(
          "rounded-xl overflow-hidden border transition-all duration-200",
          "hover:shadow-lg hover:border-opacity-80",
          sender === 'me' 
            ? 'border-blue-300/30 bg-gradient-to-br from-blue-500/10 to-blue-600/10'
            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'
        )}>
          {(preview.image || preview.favicon) && (
            <div className="relative w-full h-40 bg-gray-100 dark:bg-gray-700 overflow-hidden">
              {preview.image ? (
                <>
                  <img 
                    src={preview.image} 
                    alt={preview.title} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallback = e.target.nextElementSibling;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div 
                    className="absolute inset-0 hidden items-center justify-center bg-gray-200/50 dark:bg-gray-700/50"
                  >
                    <img 
                      src={preview.favicon} 
                      alt="Favicon" 
                      className="w-16 h-16 object-contain opacity-70"
                    />
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200/50 dark:bg-gray-700/50">
                  <img 
                    src={preview.favicon} 
                    alt="Favicon" 
                    className="w-16 h-16 object-contain opacity-70"
                  />
                </div>
              )}
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-gray-800/70">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Chargement...</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className={clsx(
            "p-3 transition-colors",
            sender === 'me' ? 'text-white' : 'text-gray-900 dark:text-white'
          )}>
            <div className="flex items-start gap-2">
              {preview.favicon && (
                <img 
                  src={preview.favicon} 
                  alt="Favicon" 
                  className="w-5 h-5 mt-0.5 flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm mb-1 truncate">
                  {preview.title}
                </h4>
                {preview.description && (
                  <p className={clsx(
                    "text-xs line-clamp-2",
                    sender === 'me' ? 'text-blue-100/80' : 'text-gray-500 dark:text-gray-400'
                  )}>
                    {preview.description}
                  </p>
                )}
              </div>
            </div>
            
            <div className={clsx(
              "text-xs mt-2 truncate flex items-center",
              sender === 'me' ? 'text-blue-200/70' : 'text-gray-400 dark:text-gray-500'
            )}>
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              {new URL(preview.url).hostname.replace('www.', '')}
            </div>
          </div>
        </div>
      </a>
    </div>
  );
};

export default LinkPreview;