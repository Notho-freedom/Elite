import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlinePlay, 
  HiOutlinePause, 
  HiOutlineDownload,
  HiOutlineEye,
} from 'react-icons/hi';  // on revient à hi stable et complet

import { 
  BsFileEarmark, 
  BsFileEarmarkText, 
  BsFileEarmarkImage, 
  BsFileEarmarkMusic
  // BsFileEarmarkVideo n'existe pas dans react-icons/bs
} from 'react-icons/bs';
import { FaVideo } from 'react-icons/fa';



const EnhancedMediaDisplay = ({ 
  media, 
  theme, 
  onMediaClick, 
  onDownload,
  maxPreview = 4,
  showDownload = true 
}) => {
  const [hoveredMedia, setHoveredMedia] = useState(null);
  const [audioStates, setAudioStates] = useState({});

  if (!media || media.length === 0) return null;

  // Grouper les médias par type
  const mediaGroups = {
    images: media.filter(m => m.type?.startsWith('image')),
    videos: media.filter(m => m.type?.startsWith('video')),
    audios: media.filter(m => m.type?.startsWith('audio')),
    documents: media.filter(m => m.type?.startsWith('application') || m.type?.startsWith('text'))
  };

  // Fonction pour obtenir l'icône selon le type de fichier
  const getFileIcon = (type, name) => {
    if (type?.startsWith('image')) return BsFileEarmarkImage;
    if (type?.startsWith('video')) return FaVideo;
    if (type?.startsWith('audio')) return BsFileEarmarkMusic;
    if (type?.startsWith('text')) return BsFileEarmarkText;
    return BsFileEarmark;
  };

  // Fonction pour formater la taille du fichier
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Fonction pour gérer l'audio
  const toggleAudio = (mediaId) => {
    setAudioStates(prev => ({
      ...prev,
      [mediaId]: !prev[mediaId]
    }));
  };

  // Rendu d'une image
  const renderImage = (item, index) => (
    <motion.div
      key={item.id || index}
      className="relative group cursor-pointer overflow-hidden rounded-lg"
      whileHover={{ scale: 1.02 }}
      onMouseEnter={() => setHoveredMedia(item.id || index)}
      onMouseLeave={() => setHoveredMedia(null)}
      onClick={() => onMediaClick?.(item, index)}
    >
      <img
        src={item.url || item.media_url}
        alt={item.name || `Image ${index + 1}`}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      
      {/* Overlay au survol */}
      <AnimatePresence>
        {hoveredMedia === (item.id || index) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 flex items-center justify-center"
          >
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onMediaClick?.(item, index);
                }}
              >
                <HiOutlineEye className="w-4 h-4" />
              </motion.button>
              {showDownload && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload?.(item);
                  }}
                >
                  <HiOutlineDownload className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badge de type */}
      <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs text-white">
        {item.type?.split('/')[1]?.toUpperCase() || 'IMG'}
      </div>
    </motion.div>
  );

  // Rendu d'une vidéo
  const renderVideo = (item, index) => (
    <motion.div
      key={item.id || index}
      className="relative group cursor-pointer overflow-hidden rounded-lg"
      whileHover={{ scale: 1.02 }}
      onMouseEnter={() => setHoveredMedia(item.id || index)}
      onMouseLeave={() => setHoveredMedia(null)}
      onClick={() => onMediaClick?.(item, index)}
    >
      <video
        src={item.url || item.media_url}
        className="w-full h-full object-cover"
        muted
        loop
        onMouseEnter={(e) => e.target.play()}
        onMouseLeave={(e) => e.target.pause()}
      />
      
      {/* Overlay au survol */}
      <AnimatePresence>
        {hoveredMedia === (item.id || index) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 flex items-center justify-center"
          >
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onMediaClick?.(item, index);
                }}
              >
                <HiOutlinePlay className="w-4 h-4" />
              </motion.button>
              {showDownload && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload?.(item);
                  }}
                >
                  <HiOutlineDownload className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badge de type */}
      <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs text-white">
        {item.type?.split('/')[1]?.toUpperCase() || 'VID'}
      </div>
    </motion.div>
  );

  // Rendu d'un audio
  const renderAudio = (item, index) => (
    <motion.div
      key={item.id || index}
      className="relative group cursor-pointer overflow-hidden rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 p-4"
      whileHover={{ scale: 1.02 }}
      onClick={() => onMediaClick?.(item, index)}
    >
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/20 rounded-full">
            <BsFileEarmarkMusic className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <div className="font-medium text-gray-800 truncate max-w-[120px]">
              {item.name || `Audio ${index + 1}`}
            </div>
            <div className="text-sm text-gray-600">
              {formatFileSize(item.size || 0)}
            </div>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 bg-purple-500 rounded-full text-white hover:bg-purple-600 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            toggleAudio(item.id || index);
          }}
        >
          {audioStates[item.id || index] ? (
            <HiOutlinePause className="w-4 h-4" />
          ) : (
            <HiOutlinePlay className="w-4 h-4" />
          )}
        </motion.button>
      </div>
    </motion.div>
  );

  // Rendu d'un document
  const renderDocument = (item, index) => {
    const FileIcon = getFileIcon(item.type, item.name);
    
    return (
      <motion.div
        key={item.id || index}
        className="relative group cursor-pointer overflow-hidden rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 p-4"
        whileHover={{ scale: 1.02 }}
        onClick={() => onMediaClick?.(item, index)}
      >
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-full">
              <FileIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-gray-800 truncate max-w-[120px]">
                {item.name || `Document ${index + 1}`}
              </div>
              <div className="text-sm text-gray-600">
                {formatFileSize(item.size || 0)}
              </div>
            </div>
          </div>
          
          {showDownload && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 bg-blue-500 rounded-full text-white hover:bg-blue-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onDownload?.(item);
              }}
            >
              <HiOutlineDownload className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  };

  // Rendu principal avec grille adaptative
  const renderMediaGrid = (mediaList, renderFunction, title) => {
    if (mediaList.length === 0) return null;

    const displayMedia = mediaList.slice(0, maxPreview);
    const remainingCount = mediaList.length - maxPreview;

    return (
      <div className="space-y-3">
        {title && (
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-700">{title}</h4>
            <span className="text-sm text-gray-500">({mediaList.length})</span>
          </div>
        )}
        
        <div className={`grid gap-3 ${
          displayMedia.length === 1 ? 'grid-cols-1' :
          displayMedia.length === 2 ? 'grid-cols-2' :
          displayMedia.length === 3 ? 'grid-cols-3' :
          'grid-cols-2 sm:grid-cols-4'
        }`}>
          {displayMedia.map((item, index) => renderFunction(item, index))}
          
          {/* Indicateur de médias supplémentaires */}
          {remainingCount > 0 && (
            <motion.div
              className="relative group cursor-pointer overflow-hidden rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 p-4 flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              onClick={() => onMediaClick?.(mediaList, 0)}
            >
              <div className="text-center">
                <div className="text-2xl text-gray-600 mb-1">+{remainingCount}</div>
                <div className="text-sm text-gray-500">Plus de médias</div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Images */}
      {renderMediaGrid(mediaGroups.images, renderImage, 'Images')}
      
      {/* Vidéos */}
      {renderMediaGrid(mediaGroups.videos, renderVideo, 'Vidéos')}
      
      {/* Audios */}
      {renderMediaGrid(mediaGroups.audios, renderAudio, 'Audios')}
      
      {/* Documents */}
      {renderMediaGrid(mediaGroups.documents, renderDocument, 'Documents')}
    </div>
  );
};

export default EnhancedMediaDisplay;
