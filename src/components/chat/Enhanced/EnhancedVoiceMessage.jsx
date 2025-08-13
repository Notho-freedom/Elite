import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineMicrophone, 
  HiOutlineStop, 
  HiOutlinePlay, 
  HiOutlinePause,
  HiOutlineTrash
} from 'react-icons/hi2';
import { 
  HiOutlineDownload
} from 'react-icons/hi';
import { BsMicFill, BsMicMuteFill, BsSpeaker } from 'react-icons/bs';

const EnhancedVoiceMessage = ({ 
  message, 
  theme, 
  isCurrentUser, 
  onSendVoice,
  onDelete,
  onDownload,
  isRecording = false,
  onStartRecording,
  onStopRecording,
  onCancelRecording
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const audioLevelIntervalRef = useRef(null);

  // Gestion de l'audio
  useEffect(() => {
    if (audioRef.current && message?.audio_url) {
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current.duration);
      });
      
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current.currentTime);
      });
      
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('loadedmetadata', () => {});
        audioRef.current.removeEventListener('timeupdate', () => {});
        audioRef.current.removeEventListener('ended', () => {});
      }
    };
  }, [message?.audio_url]);

  // Gestion de l'enregistrement
  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 0.1);
      }, 100);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        setRecordingTime(0);
      }
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isRecording]);

  // Gestion du niveau audio pendant l'enregistrement
  useEffect(() => {
    if (isRecording && mediaRecorderRef.current) {
      audioLevelIntervalRef.current = setInterval(() => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average / 255);
        }
      }, 50);
    } else {
      if (audioLevelIntervalRef.current) {
        clearInterval(audioLevelIntervalRef.current);
        setAudioLevel(0);
      }
    }

    return () => {
      if (audioLevelIntervalRef.current) {
        clearInterval(audioLevelIntervalRef.current);
      }
    };
  }, [isRecording]);

  // Démarrer l'enregistrement
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Configuration de l'analyseur audio
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      // Configuration du MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        onSendVoice?.(blob, url);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      onStartRecording?.();
      
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
    }
  };

  // Arrêter l'enregistrement
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      onStopRecording?.();
    }
  };

  // Annuler l'enregistrement
  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      onCancelRecording?.();
    }
  };

  // Contrôles de lecture
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        setIsPaused(true);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
        setIsPaused(false);
      }
    }
  };

  // Formater le temps
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculer la progression
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Rendu de l'enregistrement en cours
  if (isRecording) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl"
      >
        {/* En-tête d'enregistrement */}
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="p-2 bg-red-500 rounded-full"
          >
            <BsMicFill className="w-4 h-4 text-white" />
          </motion.div>
          <div>
            <div className="font-medium text-red-800">Enregistrement en cours...</div>
            <div className="text-sm text-red-600">{formatTime(recordingTime)}</div>
          </div>
        </div>

        {/* Visualisation du niveau audio */}
        <div className="flex items-center gap-1 mb-4">
          {Array.from({ length: 20 }, (_, i) => (
            <motion.div
              key={i}
              animate={{
                height: [4, Math.max(4, 20 * audioLevel * (1 - Math.abs(i - 10) / 10))]
              }}
              transition={{ duration: 0.1 }}
              className="w-1 bg-red-400 rounded-full"
            />
          ))}
        </div>

        {/* Contrôles d'enregistrement */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={stopRecording}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <HiOutlineStop className="w-4 h-4" />
            Arrêter
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={cancelRecording}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <HiOutlineTrash className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // Rendu du message vocal
  if (message?.audio_url) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`relative p-4 rounded-xl ${
          isCurrentUser 
            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200' 
            : 'bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200'
        }`}
      >
        {/* En-tête du message vocal */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-full ${
            isCurrentUser ? 'bg-blue-500' : 'bg-gray-500'
          }`}>
            <BsSpeaker className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className={`font-medium ${
              isCurrentUser ? 'text-blue-800' : 'text-gray-800'
            }`}>
              Message vocal
            </div>
            <div className="text-sm text-gray-600">
              {formatTime(duration)}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            {onDownload && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDownload(message)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                title="Télécharger"
              >
                <HiOutlineDownload className="w-4 h-4" />
              </motion.button>
            )}
            
            {onDelete && isCurrentUser && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(message)}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                title="Supprimer"
              >
                <HiOutlineTrash className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mb-4">
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                isCurrentUser ? 'bg-blue-500' : 'bg-gray-500'
              }`}
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Contrôles de lecture */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={togglePlayPause}
            className={`p-3 rounded-full ${
              isCurrentUser ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500 hover:bg-gray-600'
            } text-white transition-colors`}
          >
            {isPlaying ? (
              <HiOutlinePause className="w-5 h-5" />
            ) : (
              <HiOutlinePlay className="w-5 h-5" />
            )}
          </motion.button>
          
          <div className="flex-1">
            <div className={`text-sm ${
              isCurrentUser ? 'text-blue-700' : 'text-gray-700'
            }`}>
              {isPlaying ? 'Lecture en cours...' : isPaused ? 'En pause' : 'Cliquez pour écouter'}
            </div>
          </div>
        </div>

        {/* Audio caché */}
        <audio
          ref={audioRef}
          src={message.audio_url}
          preload="metadata"
        />
      </motion.div>
    );
  }

  // Rendu du bouton d'enregistrement
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-500 rounded-full">
          <HiOutlineMicrophone className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-medium text-green-800">Enregistrer un message vocal</div>
          <div className="text-sm text-green-600">Cliquez pour commencer l'enregistrement</div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startRecording}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <BsMicFill className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default EnhancedVoiceMessage;
