import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, FiX, FiFilter, FiCalendar, FiUser, 
  FiImage, FiMic, FiFile, FiChevronDown, FiChevronUp,
  FiArrowUp, FiArrowDown
} from 'react-icons/fi';
import { BsEmojiSmile } from 'react-icons/bs';

const ChatSearch = ({ 
  searchQuery, 
  setSearchQuery, 
  theme, 
  onClose,
  messages = [],
  onResultClick = () => {},
  onNavigate = () => {}
}) => {
  // États
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    sender: 'all', // 'all', 'me', 'them'
    messageType: 'all', // 'all', 'text', 'image', 'video', 'voice', 'file'
    dateRange: 'all', // 'all', 'today', 'yesterday', 'week', 'month'
    hasMedia: false,
    hasLinks: false,
    isEdited: false,
    isFavorite: false
  });
  const [searchResults, setSearchResults] = useState([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);

  // Refs
  const searchInputRef = useRef(null);
  const resultsRef = useRef(null);

  // Auto-focus sur l'input
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Effectuer la recherche
  const performSearch = useCallback((query, currentFilters) => {
    if (!query.trim()) {
      setSearchResults([]);
      setCurrentResultIndex(-1);
      return;
    }

    setIsSearching(true);
    
    // Simulation d'un délai de recherche
    setTimeout(() => {
      const filteredMessages = messages.filter(message => {
        // Filtre par contenu
        const matchesQuery = message.text?.toLowerCase().includes(query.toLowerCase()) ||
                           message.sender?.toLowerCase().includes(query.toLowerCase());

        if (!matchesQuery) return false;

        // Filtre par expéditeur
        if (currentFilters.sender !== 'all') {
          if (currentFilters.sender === 'me' && message.sender !== 'me') return false;
          if (currentFilters.sender === 'them' && message.sender === 'me') return false;
        }

        // Filtre par type de message
        if (currentFilters.messageType !== 'all') {
          if (currentFilters.messageType === 'text' && message.media?.length > 0) return false;
          if (currentFilters.messageType === 'image' && !message.media?.some(m => m.type?.startsWith('image'))) return false;
          if (currentFilters.messageType === 'video' && !message.media?.some(m => m.type?.startsWith('video'))) return false;
          if (currentFilters.messageType === 'voice' && !message.media?.some(m => m.type === 'voice')) return false;
          if (currentFilters.messageType === 'file' && !message.media?.some(m => m.type === 'file')) return false;
        }

        // Filtre par date
        if (currentFilters.dateRange !== 'all') {
          const messageDate = new Date(message.timestamp || message.time);
          const now = new Date();
          const dayMs = 24 * 60 * 60 * 1000;

          switch (currentFilters.dateRange) {
            case 'today':
              if (now - messageDate > dayMs) return false;
              break;
            case 'yesterday':
              if (now - messageDate > 2 * dayMs || now - messageDate < dayMs) return false;
              break;
            case 'week':
              if (now - messageDate > 7 * dayMs) return false;
              break;
            case 'month':
              if (now - messageDate > 30 * dayMs) return false;
              break;
          }
        }

        // Filtres additionnels
        if (currentFilters.hasMedia && (!message.media || message.media.length === 0)) return false;
        if (currentFilters.hasLinks && !message.text?.includes('http')) return false;
        if (currentFilters.isEdited && !message.isEdited) return false;
        if (currentFilters.isFavorite && !message.isFavorite) return false;

        return true;
      });

      setSearchResults(filteredMessages);
      setCurrentResultIndex(filteredMessages.length > 0 ? 0 : -1);
      setIsSearching(false);
    }, 200);
  }, [messages]);

  // Recherche avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery, filters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters, performSearch]);

  // Navigation dans les résultats
  const navigateResults = useCallback((direction) => {
    if (searchResults.length === 0) return;

    let newIndex;
    if (direction === 'next') {
      newIndex = currentResultIndex < searchResults.length - 1 ? currentResultIndex + 1 : 0;
    } else {
      newIndex = currentResultIndex > 0 ? currentResultIndex - 1 : searchResults.length - 1;
    }

    setCurrentResultIndex(newIndex);
    const result = searchResults[newIndex];
    onNavigate(result, newIndex);
  }, [searchResults, currentResultIndex, onNavigate]);

  // Gestion des touches
  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'Enter':
        if (searchResults.length > 0 && currentResultIndex >= 0) {
          onResultClick(searchResults[currentResultIndex]);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        navigateResults('next');
        break;
      case 'ArrowUp':
        e.preventDefault();
        navigateResults('prev');
        break;
    }
  }, [onClose, searchResults, currentResultIndex, onResultClick, navigateResults]);

  // Mise à jour des filtres
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      sender: 'all',
      messageType: 'all',
      dateRange: 'all',
      hasMedia: false,
      hasLinks: false,
      isEdited: false,
      isFavorite: false
    });
  };

  // Compter les filtres actifs
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (typeof value === 'boolean') return value;
    return value !== 'all';
  }).length;

  // Formater les résultats
  const formatResultText = (text, query) => {
    if (!text || !query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-300 text-black px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`${theme.headerBg} border-b ${theme.borderColor} p-4`}
    >
      {/* Barre de recherche principale */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 relative">
          <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme.secondaryText}`} size={16} />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher dans la conversation..."
            className={`
              w-full pl-10 pr-4 py-2 rounded-full
              ${theme.inputBg} ${theme.textColor}
              focus:outline-none focus:ring-2 focus:ring-blue-500
              text-sm
            `}
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent opacity-50" />
            </div>
          )}
        </div>

        {/* Bouton filtres */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`
            relative p-2 rounded-full transition-colors
            ${showFilters ? theme.accentBg : theme.buttonSecondary}
            ${activeFiltersCount > 0 ? 'ring-2 ring-blue-500' : ''}
          `}
        >
          <FiFilter size={16} />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Navigation des résultats */}
        {searchResults.length > 0 && (
          <div className="flex items-center gap-1">
            <span className={`text-sm ${theme.secondaryText} px-2`}>
              {currentResultIndex + 1} / {searchResults.length}
            </span>
            <button
              onClick={() => navigateResults('prev')}
              className={`p-1 rounded ${theme.buttonSecondary}`}
            >
              <FiArrowUp size={14} />
            </button>
            <button
              onClick={() => navigateResults('next')}
              className={`p-1 rounded ${theme.buttonSecondary}`}
            >
              <FiArrowDown size={14} />
            </button>
          </div>
        )}

        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className={`p-2 rounded-full ${theme.buttonSecondary}`}
        >
          <FiX size={16} />
        </button>
      </div>

      {/* Panneau de filtres */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className={`p-3 rounded-lg ${theme.messageBg} space-y-3`}>
              {/* Première ligne de filtres */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Filtre expéditeur */}
                <div>
                  <label className={`block text-xs font-medium ${theme.secondaryText} mb-1`}>
                    Expéditeur
                  </label>
                  <select
                    value={filters.sender}
                    onChange={(e) => updateFilter('sender', e.target.value)}
                    className={`w-full p-2 rounded ${theme.inputBg} ${theme.textColor} text-sm`}
                  >
                    <option value="all">Tous</option>
                    <option value="me">Moi</option>
                    <option value="them">Autres</option>
                  </select>
                </div>

                {/* Filtre type de message */}
                <div>
                  <label className={`block text-xs font-medium ${theme.secondaryText} mb-1`}>
                    Type de message
                  </label>
                  <select
                    value={filters.messageType}
                    onChange={(e) => updateFilter('messageType', e.target.value)}
                    className={`w-full p-2 rounded ${theme.inputBg} ${theme.textColor} text-sm`}
                  >
                    <option value="all">Tous</option>
                    <option value="text">Texte</option>
                    <option value="image">Images</option>
                    <option value="video">Vidéos</option>
                    <option value="voice">Messages vocaux</option>
                    <option value="file">Fichiers</option>
                  </select>
                </div>

                {/* Filtre date */}
                <div>
                  <label className={`block text-xs font-medium ${theme.secondaryText} mb-1`}>
                    Période
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => updateFilter('dateRange', e.target.value)}
                    className={`w-full p-2 rounded ${theme.inputBg} ${theme.textColor} text-sm`}
                  >
                    <option value="all">Toutes</option>
                    <option value="today">Aujourd'hui</option>
                    <option value="yesterday">Hier</option>
                    <option value="week">Cette semaine</option>
                    <option value="month">Ce mois</option>
                  </select>
                </div>
              </div>

              {/* Filtres booléens */}
              <div className="flex flex-wrap gap-3">
                {[
                  { key: 'hasMedia', label: 'Avec médias', icon: FiImage },
                  { key: 'hasLinks', label: 'Avec liens', icon: FiFile },
                  { key: 'isEdited', label: 'Modifiés', icon: FiUser },
                  { key: 'isFavorite', label: 'Favoris', icon: BsEmojiSmile }
                ].map(({ key, label, icon: Icon }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters[key]}
                      onChange={(e) => updateFilter(key, e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Icon size={14} className={theme.secondaryText} />
                    <span className={`text-sm ${theme.textColor}`}>{label}</span>
                  </label>
                ))}
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={resetFilters}
                  className={`text-sm ${theme.secondaryText} hover:${theme.textColor}`}
                >
                  Réinitialiser
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className={`px-3 py-1 text-sm rounded ${theme.accentBg} ${theme.accentText}`}
                >
                  Appliquer
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Résultats de recherche */}
      {searchQuery && searchResults.length === 0 && !isSearching && (
        <div className={`text-center py-4 ${theme.secondaryText}`}>
          <div className="text-4xl mb-2">🔍</div>
          <p>Aucun résultat trouvé</p>
          <p className="text-xs mt-1">Essayez d'autres mots-clés ou ajustez les filtres</p>
        </div>
      )}

      {/* Raccourcis clavier */}
      <div className={`mt-2 text-xs ${theme.secondaryText} flex justify-center gap-4`}>
        <span>↑↓ Naviguer</span>
        <span>↵ Sélectionner</span>
        <span>Esc Fermer</span>
      </div>
    </motion.div>
  );
};

export default ChatSearch;