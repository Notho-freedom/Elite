import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiImage, FiVideo, FiDownload, FiHeart, FiShare2, FiPlay } from 'react-icons/fi';

const MediaGallery = ({ userId }) => {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [filter, setFilter] = useState('all');

  // Données simulées de la galerie
  const mediaItems = [
    {
      id: 1,
      type: 'image',
      url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=400&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=200&h=200&fit=crop',
      title: 'Interface Design Elite Chat',
      likes: 142,
      date: '2024-12-15'
    },
    {
      id: 2,
      type: 'video',
      url: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=400&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=200&h=200&fit=crop',
      title: 'Démo fonctionnalités chat',
      duration: '2:45',
      likes: 89,
      date: '2024-12-10'
    },
    {
      id: 3,
      type: 'image',
      url: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=400&h=400&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=200&h=200&fit=crop',
      title: 'Mockup mobile Elite',
      likes: 256,
      date: '2024-12-08'
    },
    {
      id: 4,
      type: 'image',
      url: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=400&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=200&h=200&fit=crop',
      title: 'Architecture système',
      likes: 78,
      date: '2024-12-05'
    },
    {
      id: 5,
      type: 'video',
      url: 'https://images.unsplash.com/photo-1572177812156-58036aae439c?w=400&h=400&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1572177812156-58036aae439c?w=200&h=200&fit=crop',
      title: 'Tutoriel IA intégrée',
      duration: '4:12',
      likes: 198,
      date: '2024-12-01'
    },
    {
      id: 6,
      type: 'image',
      url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=400&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=200&fit=crop',
      title: 'Palette de couleurs',
      likes: 167,
      date: '2024-11-28'
    }
  ];

  const filteredMedia = mediaItems.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const filters = [
    { id: 'all', label: 'Tout', count: mediaItems.length },
    { id: 'image', label: 'Photos', count: mediaItems.filter(item => item.type === 'image').length },
    { id: 'video', label: 'Vidéos', count: mediaItems.filter(item => item.type === 'video').length }
  ];

  const MediaCard = ({ item }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setSelectedMedia(item)}
      className="relative aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer group"
    >
      <img
        src={item.thumbnail}
        alt={item.title}
        className="w-full h-full object-cover"
      />
      
      {/* Overlay au survol */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
        {item.type === 'video' ? (
          <FiPlay className="text-white text-2xl" />
        ) : (
          <FiImage className="text-white text-2xl" />
        )}
      </div>

      {/* Badge type de média */}
      <div className="absolute top-2 left-2">
        {item.type === 'video' && (
          <div className="bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <FiVideo size={12} />
            {item.duration}
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="absolute bottom-2 right-2">
        <div className="bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
          <FiHeart size={12} />
          {item.likes}
        </div>
      </div>
    </motion.div>
  );

  const MediaViewer = ({ media, onClose }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="max-w-4xl max-h-full w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">{media.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{media.date}</p>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <FiHeart size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <FiShare2 size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <FiDownload size={20} />
              </motion.button>
            </div>
          </div>
        </div>
        
        <div className="relative max-h-96 overflow-hidden">
          <img
            src={media.url}
            alt={media.title}
            className="w-full h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {media.type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-black/70 text-white p-4 rounded-full"
              >
                <FiPlay size={24} />
              </motion.button>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <FiHeart size={14} />
                {media.likes} j'aime
              </span>
              <span>{media.type === 'video' ? 'Vidéo' : 'Image'}</span>
            </div>
            <span>{media.date}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="flex gap-2">
        {filters.map(filterItem => (
          <motion.button
            key={filterItem.id}
            onClick={() => setFilter(filterItem.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === filterItem.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {filterItem.label} ({filterItem.count})
          </motion.button>
        ))}
      </div>

      {/* Grille de médias */}
      {filteredMedia.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredMedia.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📷</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucun média
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Aucun {filter === 'image' ? 'photo' : filter === 'video' ? 'vidéo' : 'média'} n'a été partagé.
          </p>
        </div>
      )}

      {/* Statistiques */}
      {mediaItems.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            Galerie
          </h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-500">{mediaItems.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Médias</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500">
                {mediaItems.reduce((sum, item) => sum + item.likes, 0)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">J'aime</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-500">
                {Math.round(mediaItems.reduce((sum, item) => sum + item.likes, 0) / mediaItems.length)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Moy. / média</p>
            </div>
          </div>
        </div>
      )}

      {/* Visualiseur de média */}
      <AnimatePresence>
        {selectedMedia && (
          <MediaViewer
            media={selectedMedia}
            onClose={() => setSelectedMedia(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MediaGallery;
