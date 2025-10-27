import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPaperclip, FiMic, FiCamera, FiMapPin, FiFile, FiImage 
} from 'react-icons/fi';
import { 
  BsEmojiSmile, BsSendFill, BsRecordCircle, BsStopCircle 
} from 'react-icons/bs';
import { FaPlus, FaTimes, FaEdit } from 'react-icons/fa';
import MediaPreviewModal from '../Input/MediaPreview';
import LinkPreview from '../LinkPreview';
import ReplyPreview from './ReplyPreview';
import EmojiPickerWrapper from '../EmojiPickerWrapper';
import EnhancedVoiceMessage from './EnhancedVoiceMessage';
import { useAuth } from '../../Context/AuthContext';
import { useApp } from '../../Context/AppContext';
import { supabase } from '../../../lib/supabase';

const EnhancedChatInput = memo(({ 
  inputValue, 
  setInputValue, 
  handleSend, 
  theme,
  recipient,
  replyingTo,
  onCancelReply,
  editingMessage,
  onCancelEdit
}) => {
  // Refs
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const formRef = useRef(null);
  const voiceRecorderRef = useRef(null);
  
  // States
  const [previewMedia, setPreviewMedia] = useState([]);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [detectedUrl, setDetectedUrl] = useState(null);
  const [isComposing, setIsComposing] = useState(false);
  const [isFocused, setIsFocused] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [voiceMessage, setVoiceMessage] = useState(null);
  
  // Pour les typing indicators
  const { user } = useAuth();
  const { activeChat } = useApp();
  const typingTimeoutRef = useRef(null);

  // Calcul de la hauteur de la textarea
  const resizeTextarea = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '36px';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, []);

  // Auto-resize de la textarea avec debounce
  useEffect(() => {
    const debouncedResize = debounce(resizeTextarea, 50);
    debouncedResize();
    return () => debouncedResize.cancel();
  }, [inputValue, resizeTextarea]);

  // Gestion des fichiers
  const handleFileChange = useCallback((e, type = 'media') => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const mediaPreviews = files.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image') ? 'image' : 
            file.type.startsWith('video') ? 'video' : 'file',
      file,
      name: file.name,
      size: file.size,
      id: Math.random().toString(36).substring(2, 9)
    }));

    setPreviewMedia(prev => [...prev, ...mediaPreviews]);
    setShowMediaModal(true);
    setShowAttachMenu(false);
    e.target.value = '';
  }, []);

  const resetTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '36px';
    }
  }, []);

  // Gestion des messages vocaux
  const handleStartRecording = useCallback(() => {
    setIsRecording(true);
    setRecordingTime(0);
  }, []);

  const handleStopRecording = useCallback(() => {
    setIsRecording(false);
  }, []);

  const handleCancelRecording = useCallback(() => {
    setIsRecording(false);
    setRecordingTime(0);
    setVoiceMessage(null);
  }, []);

  const handleSendVoice = useCallback((blob, url) => {
    setVoiceMessage({ blob, url });
    setIsRecording(false);
    setRecordingTime(0);
    
    // Envoyer le message vocal
    if (handleSend) {
      const voiceData = {
        type: 'voice',
        audio: blob,
        audio_url: url,
        duration: recordingTime
      };
      handleSend(voiceData);
    }
  }, [handleSend, recordingTime]);

  // Gestion de la soumission
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    if (previewMedia.length > 0) {
      setShowMediaModal(true);
      return;
    }
    
    const trimmedValue = inputValue.trim();
    if (trimmedValue || previewMedia.length > 0) {
      handleSend(e, {
        message: trimmedValue,
        media: previewMedia,
        replyTo: replyingTo,
        editId: editingMessage?.id
      });
      
      setInputValue('');
      setDetectedUrl(null);
      resetTextareaHeight();
      
      if (replyingTo && onCancelReply) onCancelReply();
      if (editingMessage && onCancelEdit) onCancelEdit();
    }
  }, [inputValue, previewMedia, handleSend, setInputValue, resetTextareaHeight, replyingTo, editingMessage, onCancelReply, onCancelEdit]);

  // Enregistrement vocal
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      voiceRecorderRef.current = new MediaRecorder(stream);
      
      const chunks = [];
      voiceRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
      voiceRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(blob);
        
        setPreviewMedia([{
          url: audioUrl,
          type: 'audio',
          file: new File([blob], 'voice-message.wav', { type: 'audio/wav' }),
          duration: recordingTime,
          id: Math.random().toString(36).substring(2, 9)
        }]);
        setShowMediaModal(true);
      };
      
      voiceRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Timer
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      voiceRecorderRef.current.timer = timer;
      
    } catch (err) {
      console.error('Erreur accès microphone:', err);
    }
  }, [recordingTime]);

  const stopRecording = useCallback(() => {
    if (voiceRecorderRef.current) {
      voiceRecorderRef.current.stop();
      clearInterval(voiceRecorderRef.current.timer);
      voiceRecorderRef.current.stream?.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  }, []);

  // Menu d'attachement
  const attachmentOptions = [
    {
      icon: <FiImage />,
      label: 'Photos et vidéos',
      color: 'text-purple-500',
      action: () => {
        fileInputRef.current.accept = 'image/*,video/*';
        fileInputRef.current.click();
      }
    },
    {
      icon: <FiCamera />,
      label: 'Caméra',
      color: 'text-blue-500',
      action: () => {
        // TODO: Ouvrir caméra
        console.log('Ouvrir caméra');
      }
    },
    {
      icon: <FiFile />,
      label: 'Document',
      color: 'text-orange-500',
      action: () => {
        fileInputRef.current.accept = '.pdf,.doc,.docx,.txt,.zip,.rar';
        fileInputRef.current.click();
      }
    },
    {
      icon: <FiMapPin />,
      label: 'Position',
      color: 'text-red-500',
      action: () => {
        // TODO: Partager position
        console.log('Partager position');
      }
    }
  ];

  // Gestion des emojis
  const handleEmojiClick = useCallback((emojiData) => {
    const emoji = emojiData.emoji;
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = inputValue.slice(0, start) + emoji + inputValue.slice(end);
      setInputValue(newValue);
      
      // Remettre le focus et la position du curseur
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    }
    setShowEmojiPicker(false);
  }, [inputValue, setInputValue]);

  // Calcul du nombre de lignes pour le style
  const lineCount = textareaRef.current 
    ? Math.floor(textareaRef.current.scrollHeight / parseInt(getComputedStyle(textareaRef.current).lineHeight))
    : 1;

  // Gestion des typing indicators
  const handleTypingIndicator = useCallback((value) => {
    if (!user?.id || !activeChat?.id) return;

    // Si l'utilisateur tape quelque chose
    if (value.trim()) {
      // Envoyer l'événement "typing start" seulement s'il n'y a pas déjà un timeout actif
      if (!typingTimeoutRef.current) {
        insertTypingIndicator();
      }

      // Nettoyer le timeout précédent
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Définir un nouveau timeout pour arrêter le typing après 2 secondes d'inactivité
      typingTimeoutRef.current = setTimeout(() => {
        handleStopTyping();
      }, 2000);
    } else {
      // Si le champ est vide, arrêter immédiatement
      handleStopTyping();
    }
  }, [user?.id, activeChat?.id]);

  const insertTypingIndicator = async () => {
    try {
      const { error } = await supabase
        .from('typing_indicators')
        .upsert({
          discussion_id: activeChat.id,
          user_id: user.id,
          started_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erreur ajout typing indicator:', error);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du typing indicator:', error);
    }
  };

  const handleStopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (user?.id && activeChat?.id) {
      removeTypingIndicator();
    }
  }, [user?.id, activeChat?.id]);

  const removeTypingIndicator = async () => {
    try {
      const { error } = await supabase
        .from('typing_indicators')
        .delete()
        .eq('discussion_id', activeChat.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erreur suppression typing indicator:', error);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du typing indicator:', error);
    }
  };

  // Nettoyer les typing indicators quand on quitte le composant
  useEffect(() => {
    return () => {
      handleStopTyping();
    };
  }, [handleStopTyping]);

  // Nettoyer les typing indicators quand on change de discussion
  useEffect(() => {
    // Nettoyer les anciens indicators quand on change de discussion
    handleStopTyping();
  }, [activeChat?.id, handleStopTyping]);

  const hasContent = inputValue.trim() || previewMedia.length > 0;

  return (
    <div className="relative">
      {/* Modal de prévisualisation des médias */}
      {showMediaModal && (
        <MediaPreviewModal
          mediaList={previewMedia}
          recipient={recipient}
          onClose={() => setShowMediaModal(false)}
          onSend={(data) => {
            handleSend({ preventDefault: () => {} }, {
              ...data,
              replyTo: replyingTo,
              editId: editingMessage?.id
            });
            setPreviewMedia([]);
            setShowMediaModal(false);
            if (replyingTo && onCancelReply) onCancelReply();
            if (editingMessage && onCancelEdit) onCancelEdit();
          }}
          fmessage={inputValue}
        />
      )}

      {/* Picker d'emojis */}
      <EmojiPickerWrapper
        showEmojiPicker={showEmojiPicker}
        onEmojiClick={handleEmojiClick}
      />

      {/* Prévisualisation de réponse */}
      <AnimatePresence>
        {replyingTo && (
          <ReplyPreview 
            replyingTo={replyingTo}
            theme={theme}
            onClose={onCancelReply}
          />
        )}
      </AnimatePresence>

      {/* Mode édition */}
      <AnimatePresence>
        {editingMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`
              ${theme.headerBg} border-t ${theme.borderColor} 
              px-4 py-3 flex items-center gap-3
            `}
          >
            <div className="text-orange-500">
              <FaEdit className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className={`text-sm font-medium ${theme.textColor}`}>
                Modification du message
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onCancelEdit}
              className={`p-1 rounded-full ${theme.hoverBg}`}
            >
              <FaTimes className="w-3 h-3" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prévisualisation des liens */}
      {detectedUrl && (
        <div className="mb-1 p-1 bg-transparent absolute bottom-full left-2 right-2">
          <LinkPreview url={detectedUrl} sender="me" compact={true} />
        </div>
      )}

      {/* Zone d'input principale */}
      <div className={`${theme.headerBg} border-t ${theme.borderColor} p-4`}>
        {/* Enregistrement vocal actif */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mb-4 flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
            >
              <div className="flex items-center gap-2 text-red-500">
                <BsRecordCircle className="w-4 h-4 animate-pulse" />
                <span className="text-sm font-medium">
                  Enregistrement... {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={stopRecording}
                className="ml-auto p-2 bg-red-500 text-white rounded-full"
              >
                <BsStopCircle className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input principal */}
        <form 
          ref={formRef}
          onSubmit={handleSubmit} 
          className="flex items-end gap-2"
        >
          {/* Bouton emoji */}
          <motion.button 
            type="button" 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`
              p-2 rounded-full text-lg
              ${theme.buttonSecondary}
              transition-colors duration-200
            `}
            aria-label="Emoji picker"
          >
            <BsEmojiSmile />
          </motion.button>

          {/* Bouton attachement avec menu */}
          <div className="relative">
            <motion.button 
              type="button" 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className={`
                p-2 rounded-full text-lg
                ${theme.buttonSecondary}
                transition-colors duration-200
              `}
              aria-label="Attach files"
            >
              <FaPlus className={`transition-transform ${showAttachMenu ? 'rotate-45' : ''}`} />
            </motion.button>

            {/* Menu d'attachement */}
            <AnimatePresence>
              {showAttachMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className={`
                    absolute bottom-full mb-2 left-0 min-w-[200px]
                    ${theme.bgColor} rounded-lg shadow-xl border ${theme.borderColor}
                    py-2 z-50
                  `}
                >
                  {attachmentOptions.map((option, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                      onClick={option.action}
                      className={`
                        w-full px-4 py-3 flex items-center gap-3 text-left
                        hover:${theme.hoverBg} transition-colors
                      `}
                    >
                      <span className={`text-lg ${option.color}`}>
                        {option.icon}
                      </span>
                      <span className={theme.textColor}>{option.label}</span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input caché pour les fichiers */}
          <input
            type="file"
            multiple
            hidden
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          {/* Composant de message vocal */}
          <AnimatePresence>
            {isRecording && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3"
              >
                <EnhancedVoiceMessage
                  isRecording={isRecording}
                  onStartRecording={handleStartRecording}
                  onStopRecording={handleStopRecording}
                  onCancelRecording={handleCancelRecording}
                  onSendVoice={handleSendVoice}
                  theme={theme}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Zone de texte */}
          <textarea
            ref={textareaRef}
            value={inputValue}
            autoFocus={isFocused}
            spellCheck
            autoComplete='on'
            autoCorrect='on'
            autoCapitalize='on'
            onChange={(e) => {
              setInputValue(e.target.value);
              handleTypingIndicator(e.target.value);
            }}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
                e.preventDefault();
                formRef.current?.requestSubmit();
              }
            }}
            onFocus={() => {
              setIsFocused(true);
              setShowEmojiPicker(false);
              setShowAttachMenu(false);
            }}
            onBlur={() => {
              handleStopTyping();
            }}
            className={`
              flex-1 py-2 px-4
              ${lineCount === 1 ? 'rounded-full' : 'rounded-2xl'}
              ${theme.inputBg}
              ${theme.textColor}
              focus:outline-none resize-none
              max-h-[120px] overflow-y-auto
              text-sm
              transition-all duration-200
              placeholder:${theme.secondaryText}
            `}
            placeholder={
              editingMessage ? "Modifier le message..." : 
              replyingTo ? "Répondre..." : 
              "Tapez votre message..."
            }
            rows={1}
            style={{ minHeight: '40px' }}
          />

          {/* Bouton d'envoi ou d'enregistrement */}
          <motion.button 
            type={hasContent ? 'submit' : 'button'} 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={hasContent ? undefined : handleStartRecording}
            className={`
              p-2 rounded-full text-lg
              ${theme.accentBg} ${theme.accentText}
              transition-colors duration-200
              flex-shrink-0
            `}
            aria-label={hasContent ? 'Envoyer le message' : 'Enregistrer un message vocal'}
          >
            {hasContent ? <BsSendFill /> : <FiMic />}
          </motion.button>
        </form>
      </div>
    </div>
  );
});

// Helper function
function debounce(func, wait) {
  let timeout;
  const debounced = (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
  debounced.cancel = () => clearTimeout(timeout);
  return debounced;
}

export default EnhancedChatInput;
