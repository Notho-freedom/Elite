import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMic, FiMicOff, FiPlay, FiPause, FiTrash2, 
  FiSend, FiSquare, FiVolume2, FiVolumeX 
} from 'react-icons/fi';
import { BsSignal } from 'react-icons/bs';

const VoiceRecorder = ({ 
  onSend, 
  onCancel, 
  theme, 
  isVisible = false,
  maxDuration = 300 // 5 minutes en secondes
}) => {
  // États
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [waveformData, setWaveformData] = useState([]);

  // Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioElementRef = useRef(null);
  const animationFrameRef = useRef(null);
  const timerRef = useRef(null);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);

  // Nettoyage
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioUrl]);

  // Gestion du timer
  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setDuration(prev => {
        if (prev >= maxDuration) {
          stopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  }, [maxDuration]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Analyse audio pour la visualisation
  const setupAudioAnalysis = useCallback((stream) => {
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateWaveform = () => {
        if (analyserRef.current && isRecording) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          setWaveformData(prev => [...prev.slice(-50), average / 255].slice(0, 51));
          animationFrameRef.current = requestAnimationFrame(updateWaveform);
        }
      };

      updateWaveform();
    } catch (error) {
      console.error('Erreur analyse audio:', error);
    }
  }, [isRecording]);

  // Démarrer l'enregistrement
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        
        // Créer URL pour la lecture
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Arrêter le stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100); // Enregistrer par chunks de 100ms
      setIsRecording(true);
      setDuration(0);
      setWaveformData([]);
      
      startTimer();
      setupAudioAnalysis(stream);

    } catch (error) {
      console.error('Erreur enregistrement:', error);
      alert('Impossible d\'accéder au microphone. Vérifiez les permissions.');
    }
  }, [startTimer, setupAudioAnalysis]);

  // Arrêter l'enregistrement
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      stopTimer();
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  }, [isRecording, stopTimer]);

  // Pause/Resume enregistrement
  const togglePauseRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        startTimer();
        setIsPaused(false);
      } else {
        mediaRecorderRef.current.pause();
        stopTimer();
        setIsPaused(true);
      }
    }
  }, [isPaused, startTimer, stopTimer]);

  // Lecture audio
  const togglePlayback = useCallback(() => {
    if (audioElementRef.current) {
      if (isPlaying) {
        audioElementRef.current.pause();
        setIsPlaying(false);
      } else {
        audioElementRef.current.play();
        setIsPlaying(true);
      }
    }
  }, [isPlaying]);

  // Supprimer l'enregistrement
  const deleteRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setWaveformData([]);
    setIsPlaying(false);
    onCancel?.();
  }, [audioUrl, onCancel]);

  // Envoyer l'enregistrement
  const sendRecording = useCallback(() => {
    if (audioBlob && onSend) {
      onSend({
        type: 'voice',
        blob: audioBlob,
        duration,
        size: audioBlob.size
      });
      deleteRecording();
    }
  }, [audioBlob, duration, onSend, deleteRecording]);

  // Formatage du temps
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Visualisation des ondes
  const renderWaveform = () => {
    return (
      <div className="flex items-center justify-center gap-1 h-8">
        {waveformData.map((height, index) => (
          <motion.div
            key={index}
            className="bg-current opacity-60"
            style={{
              width: '2px',
              height: `${Math.max(2, height * 32)}px`,
            }}
            animate={{
              height: `${Math.max(2, height * 32)}px`,
              opacity: isRecording ? 0.8 : 0.4
            }}
            transition={{ duration: 0.1 }}
          />
        ))}
        {waveformData.length === 0 && (
          <div className="flex items-center gap-1">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-1 h-1 bg-current opacity-30 rounded-full"
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={`
          ${theme.bgColor} ${theme.borderColor} 
          border rounded-lg p-4 mx-4 mb-2 shadow-lg
        `}
      >
        {/* Audio element pour la lecture */}
        {audioUrl && (
          <audio
            ref={audioElementRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            volume={isMuted ? 0 : volume}
          />
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${isRecording ? 'bg-red-500' : theme.accentBg}`}>
              {isRecording ? (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <FiMic className="text-white" size={16} />
                </motion.div>
              ) : (
                <FiMic className={theme.accentText} size={16} />
              )}
            </div>
            <div className={theme.textColor}>
              <div className="font-medium">
                {isRecording ? 'Enregistrement...' : audioBlob ? 'Message vocal' : 'Prêt à enregistrer'}
              </div>
              <div className="text-sm opacity-70">
                {formatTime(duration)} {maxDuration && `/ ${formatTime(maxDuration)}`}
              </div>
            </div>
          </div>

          {/* Contrôles de volume */}
          {audioBlob && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-full ${theme.buttonSecondary}`}
              >
                {isMuted ? <FiVolumeX size={16} /> : <FiVolume2 size={16} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-16"
              />
            </div>
          )}
        </div>

        {/* Visualisation */}
        <div className={`${theme.textColor} mb-3`}>
          {renderWaveform()}
        </div>

        {/* Contrôles principaux */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!audioBlob ? (
              // Contrôles d'enregistrement
              <>
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg
                      ${theme.accentBg} ${theme.accentText}
                      hover:opacity-90 transition-opacity
                    `}
                  >
                    <FiMic size={16} />
                    Enregistrer
                  </button>
                ) : (
                  <>
                    <button
                      onClick={togglePauseRecording}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg
                        ${theme.buttonSecondary}
                        hover:opacity-90 transition-opacity
                      `}
                    >
                      {isPaused ? <FiMic size={16} /> : <FiMicOff size={16} />}
                      {isPaused ? 'Reprendre' : 'Pause'}
                    </button>
                    
                    <button
                      onClick={stopRecording}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      <FiSquare size={16} />
                      Arrêter
                    </button>
                  </>
                )}
              </>
            ) : (
              // Contrôles de lecture
              <>
                <button
                  onClick={togglePlayback}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg
                    ${theme.buttonSecondary}
                    hover:opacity-90 transition-opacity
                  `}
                >
                  {isPlaying ? <FiPause size={16} /> : <FiPlay size={16} />}
                  {isPlaying ? 'Pause' : 'Écouter'}
                </button>
                
                <button
                  onClick={deleteRecording}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  <FiTrash2 size={16} />
                  Supprimer
                </button>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className={`px-3 py-2 rounded-lg ${theme.buttonSecondary}`}
            >
              Annuler
            </button>
            
            {audioBlob && (
              <button
                onClick={sendRecording}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg
                  ${theme.accentBg} ${theme.accentText}
                  hover:opacity-90 transition-opacity
                `}
              >
                <FiSend size={16} />
                Envoyer
              </button>
            )}
          </div>
        </div>

        {/* Indicateur de progress */}
        {maxDuration && (
          <div className="mt-3">
            <div className={`w-full h-1 ${theme.borderColor} rounded-full overflow-hidden`}>
              <motion.div
                className={`h-full ${isRecording ? 'bg-red-500' : theme.accentBg}`}
                initial={{ width: 0 }}
                animate={{ width: `${(duration / maxDuration) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default VoiceRecorder;
