import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, FiZoomIn, FiZoomOut, FiRotateCw, FiDownload, 
  FiShare2, FiChevronLeft, FiChevronRight, FiMaximize2,
  FiMinimize2, FiVolume2, FiVolumeX, FiPlay, FiPause
} from 'react-icons/fi';
import { BsHeart, BsHeartFill } from 'react-icons/bs';

const MediaViewer = ({ 
  isOpen, 
  onClose, 
  media = [], 
  initialIndex = 0, 
  theme,
  onAction = () => {} 
}) => {
  // États
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  // Refs
  const mediaRef = useRef(null);
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const currentMedia = media[currentIndex];
  const isVideo = currentMedia?.type?.startsWith('video');
  const isImage = currentMedia?.type?.startsWith('image');

  // Réinitialiser les valeurs quand on change de média
  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    setIsPlaying(false);
  }, [currentIndex]);

  // Gestion du fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Gestion des touches clavier
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case '0':
          resetView();
          break;
        case 'r':
          handleRotate();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case ' ':
          if (isVideo) {
            e.preventDefault();
            togglePlayPause();
          }
          break;
        case 'm':
          if (isVideo) {
            toggleMute();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, currentIndex, isVideo, isPlaying]);

  // Auto-hide des contrôles
  useEffect(() => {
    const resetControlsTimeout = () => {
      clearTimeout(controlsTimeoutRef.current);
      setShowControls(true);
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    const handleMouseMove = () => resetControlsTimeout();
    
    if (isOpen) {
      resetControlsTimeout();
      document.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      clearTimeout(controlsTimeoutRef.current);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isOpen]);

  // Navigation
  const handleNext = useCallback(() => {
    if (currentIndex < media.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, media.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  // Contrôles de zoom
  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.1));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  
  const resetView = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  // Contrôles vidéo
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Fullscreen
  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        await containerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Erreur fullscreen:', error);
    }
  };

  // Gestion du drag
  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = useCallback((e) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart, zoom]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove]);

  // Actions
  const handleDownload = async () => {
    try {
      const response = await fetch(currentMedia.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `media-${Date.now()}.${currentMedia.type.split('/')[1]}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      onAction('download', currentMedia);
    } catch (error) {
      console.error('Erreur téléchargement:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Média partagé',
          url: currentMedia.url
        });
        onAction('share', currentMedia);
      } catch (error) {
        console.error('Erreur partage:', error);
      }
    } else {
      // Fallback - copier l'URL
      navigator.clipboard.writeText(currentMedia.url);
      onAction('copy', currentMedia);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    onAction('favorite', { ...currentMedia, isFavorite: !isFavorite });
  };

  if (!isOpen || !currentMedia) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`
          fixed inset-0 z-50 bg-black/95 backdrop-blur-sm
          flex items-center justify-center
          ${isFullscreen ? 'cursor-none' : ''}
        `}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {/* Overlay de contrôles */}
        <AnimatePresence>
          {(showControls || !isFullscreen) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none"
            >
              {/* Header avec contrôles */}
              <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent pointer-events-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={onClose}
                      className="p-2 text-white hover:text-gray-300 transition-colors"
                    >
                      <FiX size={24} />
                    </button>
                    <div className="text-white font-medium">
                      {currentIndex + 1} / {media.length}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleFavorite}
                      className={`p-2 transition-colors ${
                        isFavorite ? 'text-red-500' : 'text-white hover:text-red-400'
                      }`}
                    >
                      {isFavorite ? <BsHeartFill size={20} /> : <BsHeart size={20} />}
                    </button>
                    
                    <button
                      onClick={handleShare}
                      className="p-2 text-white hover:text-gray-300 transition-colors"
                    >
                      <FiShare2 size={20} />
                    </button>
                    
                    <button
                      onClick={handleDownload}
                      className="p-2 text-white hover:text-gray-300 transition-colors"
                    >
                      <FiDownload size={20} />
                    </button>
                    
                    <button
                      onClick={toggleFullscreen}
                      className="p-2 text-white hover:text-gray-300 transition-colors"
                    >
                      {isFullscreen ? <FiMinimize2 size={20} /> : <FiMaximize2 size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation gauche/droite */}
              {media.length > 1 && (
                <>
                  <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className={`
                      absolute left-4 top-1/2 transform -translate-y-1/2
                      p-3 text-white bg-black/30 rounded-full
                      hover:bg-black/50 transition-all pointer-events-auto
                      ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <FiChevronLeft size={24} />
                  </button>
                  
                  <button
                    onClick={handleNext}
                    disabled={currentIndex === media.length - 1}
                    className={`
                      absolute right-4 top-1/2 transform -translate-y-1/2
                      p-3 text-white bg-black/30 rounded-full
                      hover:bg-black/50 transition-all pointer-events-auto
                      ${currentIndex === media.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <FiChevronRight size={24} />
                  </button>
                </>
              )}

              {/* Contrôles bas pour images */}
              {isImage && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent pointer-events-auto">
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={handleZoomOut}
                      className="p-2 text-white hover:text-gray-300 transition-colors"
                    >
                      <FiZoomOut size={20} />
                    </button>
                    
                    <span className="text-white font-mono text-sm min-w-[60px] text-center">
                      {Math.round(zoom * 100)}%
                    </span>
                    
                    <button
                      onClick={handleZoomIn}
                      className="p-2 text-white hover:text-gray-300 transition-colors"
                    >
                      <FiZoomIn size={20} />
                    </button>
                    
                    <button
                      onClick={handleRotate}
                      className="p-2 text-white hover:text-gray-300 transition-colors"
                    >
                      <FiRotateCw size={20} />
                    </button>
                    
                    <button
                      onClick={resetView}
                      className="px-3 py-1 text-white text-sm bg-white/20 rounded hover:bg-white/30 transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}

              {/* Contrôles vidéo */}
              {isVideo && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent pointer-events-auto">
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={togglePlayPause}
                      className="p-2 text-white hover:text-gray-300 transition-colors"
                    >
                      {isPlaying ? <FiPause size={24} /> : <FiPlay size={24} />}
                    </button>
                    
                    <button
                      onClick={toggleMute}
                      className="p-2 text-white hover:text-gray-300 transition-colors"
                    >
                      {isMuted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contenu principal */}
        <div className="w-full h-full flex items-center justify-center">
          {isImage ? (
            <img
              ref={mediaRef}
              src={currentMedia.url}
              alt="Media"
              className={`
                max-w-full max-h-full object-contain
                ${zoom > 1 ? 'cursor-move' : 'cursor-zoom-in'}
                ${isDragging ? 'cursor-grabbing' : ''}
              `}
              style={{
                transform: `
                  scale(${zoom}) 
                  rotate(${rotation}deg) 
                  translate(${position.x / zoom}px, ${position.y / zoom}px)
                `,
                transition: isDragging ? 'none' : 'transform 0.2s ease-out'
              }}
              onMouseDown={handleMouseDown}
              onClick={(e) => {
                if (zoom === 1) {
                  e.stopPropagation();
                  handleZoomIn();
                }
              }}
              draggable={false}
            />
          ) : (
            <video
              ref={videoRef}
              src={currentMedia.url}
              className="max-w-full max-h-full object-contain"
              controls={!isFullscreen || showControls}
              muted={isMuted}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onLoadedData={() => {
                if (videoRef.current) {
                  videoRef.current.muted = isMuted;
                }
              }}
            />
          )}
        </div>

        {/* Miniatures en bas */}
        {media.length > 1 && (showControls || !isFullscreen) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-20 left-0 right-0 pointer-events-auto"
          >
            <div className="flex justify-center gap-2 p-4 overflow-x-auto">
              {media.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`
                    flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden
                    border-2 transition-all
                    ${index === currentIndex 
                      ? 'border-white scale-110' 
                      : 'border-white/30 hover:border-white/60'
                    }
                  `}
                >
                  {item.type?.startsWith('image') ? (
                    <img
                      src={item.url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      muted
                    />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default MediaViewer;