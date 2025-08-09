import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiDownload } from 'react-icons/fi';

const VoiceMessage = ({ 
  audioUrl, 
  duration = 0, 
  isOwn = false, 
  theme,
  size = 'normal', // 'small', 'normal', 'large'
  onDownload,
  className = '' 
}) => {
  // États
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [waveformData, setWaveformData] = useState([]);

  // Refs
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  // Initialisation
  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      
      const handleLoadedData = () => {
        setIsLoaded(true);
        generateWaveform();
      };

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      const handleError = (e) => {
        console.error('Erreur audio:', e);
        setIsLoaded(false);
      };

      audio.addEventListener('loadeddata', handleLoadedData);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);

      return () => {
        audio.removeEventListener('loadeddata', handleLoadedData);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
      };
    }
  }, [audioUrl]);

  // Génération de données de waveform simulées
  const generateWaveform = () => {
    // Simulation de données de waveform basées sur la durée
    const samples = Math.min(50, Math.max(20, duration * 2));
    const data = Array.from({ length: samples }, () => Math.random() * 0.8 + 0.2);
    setWaveformData(data);
  };

  // Contrôles de lecture
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(error => {
          console.error('Erreur lecture:', error);
        });
      }
    }
  };

  const handleProgressClick = (e) => {
    if (audioRef.current && progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const newTime = (clickX / width) * duration;
      
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = `message-vocal-${Date.now()}.webm`;
      link.click();
    }
  };

  // Formatage du temps
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Tailles responsives
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'p-2 max-w-[200px]',
          button: 'w-8 h-8',
          icon: 12,
          waveform: 'h-6',
          text: 'text-xs'
        };
      case 'large':
        return {
          container: 'p-4 max-w-[350px]',
          button: 'w-12 h-12',
          icon: 20,
          waveform: 'h-10',
          text: 'text-sm'
        };
      default:
        return {
          container: 'p-3 max-w-[280px]',
          button: 'w-10 h-10',
          icon: 16,
          waveform: 'h-8',
          text: 'text-sm'
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`
      ${isOwn ? theme.accentBg : theme.messageBg} 
      ${theme.textColor} rounded-2xl ${sizeClasses.container} 
      ${className}
    `}>
      {/* Audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        volume={isMuted ? 0 : volume}
      />

      <div className="flex items-center gap-3">
        {/* Bouton play/pause */}
        <button
          onClick={togglePlayPause}
          disabled={!isLoaded}
          className={`
            ${sizeClasses.button} rounded-full flex items-center justify-center
            ${isOwn ? 'bg-white/20 hover:bg-white/30' : `${theme.accentBg} hover:opacity-90`}
            ${!isLoaded ? 'opacity-50 cursor-not-allowed' : 'transition-all'}
            ${isPlaying ? 'animate-pulse' : ''}
          `}
        >
          {!isLoaded ? (
            <div className="animate-spin rounded-full border-2 border-current border-t-transparent w-4 h-4" />
          ) : isPlaying ? (
            <FiPause size={sizeClasses.icon} />
          ) : (
            <FiPlay size={sizeClasses.icon} />
          )}
        </button>

        {/* Waveform et progress */}
        <div className="flex-1 min-w-0">
          {/* Waveform visuelle */}
          <div
            ref={progressRef}
            className={`${sizeClasses.waveform} mb-1 cursor-pointer flex items-center gap-0.5 overflow-hidden`}
            onClick={handleProgressClick}
          >
            {waveformData.map((height, index) => {
              const isActive = (index / waveformData.length) * 100 <= progress;
              return (
                <motion.div
                  key={index}
                  className={`
                    w-1 rounded-full transition-all duration-200
                    ${isActive 
                      ? isOwn ? 'bg-white' : theme.accentBg.replace('bg-', 'bg-')
                      : 'bg-current opacity-30'
                    }
                  `}
                  style={{ height: `${height * 100}%` }}
                  whileHover={{ scaleY: 1.2 }}
                />
              );
            })}
          </div>

          {/* Temps */}
          <div className={`flex justify-between ${sizeClasses.text} opacity-70`}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Contrôles additionnels */}
        <div className="flex items-center gap-1">
          {/* Bouton volume */}
          <button
            onClick={toggleMute}
            className={`
              p-1.5 rounded-full opacity-70 hover:opacity-100 transition-opacity
              ${isOwn ? 'hover:bg-white/20' : 'hover:bg-black/10'}
            `}
          >
            {isMuted ? (
              <FiVolumeX size={sizeClasses.icon - 2} />
            ) : (
              <FiVolume2 size={sizeClasses.icon - 2} />
            )}
          </button>

          {/* Bouton téléchargement */}
          <button
            onClick={handleDownload}
            className={`
              p-1.5 rounded-full opacity-70 hover:opacity-100 transition-opacity
              ${isOwn ? 'hover:bg-white/20' : 'hover:bg-black/10'}
            `}
          >
            <FiDownload size={sizeClasses.icon - 2} />
          </button>
        </div>
      </div>

      {/* Indicateur de statut */}
      {!isLoaded && (
        <div className={`mt-2 ${sizeClasses.text} opacity-60 flex items-center gap-1`}>
          <div className="w-1 h-1 bg-current rounded-full animate-pulse" />
          Chargement...
        </div>
      )}
    </div>
  );
};

export default VoiceMessage;