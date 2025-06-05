import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { FiPaperclip, FiMic } from 'react-icons/fi';
import { BsEmojiSmile, BsSendFill } from 'react-icons/bs';
import MediaPreviewModal from './Input/MediaPreview';
import LinkPreview from './LinkPreview';

const ChatInput = memo(({ 
  inputValue, 
  setInputValue, 
  handleSend, 
  setShowEmojiPicker, 
  theme,
  recipient 
}) => {
  // Refs
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const formRef = useRef(null);
  
  // States
  const [previewMedia, setPreviewMedia] = useState([]);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [detectedUrl, setDetectedUrl] = useState(null);
  const [isComposing, setIsComposing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

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
  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const mediaPreviews = files.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image') ? 'image' : 'video',
      file,
      id: Math.random().toString(36).substring(2, 9)
    }));

    setPreviewMedia(prev => [...prev, ...mediaPreviews]);
    setShowMediaModal(true);
    e.target.value = '';
  }, []);

  const resetTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '36px';
    }
  }, []);

  // Gestion de la soumission
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    if (previewMedia.length > 0) {
      setShowMediaModal(true);
      return;
    }
    
    const trimmedValue = inputValue.trim();
    if (trimmedValue) {
      handleSend(e, {
        message: trimmedValue,
        media: []
      });
      setInputValue('');
      setDetectedUrl(null);
      resetTextareaHeight();
    }
  }, [inputValue, previewMedia, handleSend, setInputValue, resetTextareaHeight]);

  // Gestion de l'envoi des médias
  const handleMediaSend = useCallback(({ message, media }) => {
    handleSend(
      { preventDefault: () => {} },
      { 
        message: message || inputValue.trim(),
        media: media || previewMedia 
      }
    );
    setPreviewMedia([]);
    setInputValue('');
    setShowMediaModal(false);
    setDetectedUrl(null);
    resetTextareaHeight();
  }, [inputValue, previewMedia, handleSend, setInputValue, resetTextareaHeight]);

  // Détection d'URL avec debounce
  useEffect(() => {
    if (isComposing) return;
    
    const detectUrl = () => {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urls = inputValue.match(urlRegex);
      
      if (urls?.length > 0) {
        try {
          new URL(urls[urls.length - 1]);
          setDetectedUrl(urls[urls.length - 1]);
        } catch {
          setDetectedUrl(null);
        }
      } else {
        setDetectedUrl(null);
      }
    };

    const debouncedDetection = debounce(detectUrl, 300);
    debouncedDetection();

    return () => debouncedDetection.cancel();
  }, [inputValue, isComposing]);

  // Gestion des touches
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  }, [isComposing]);

  // Nettoyage des URLs créées
  useEffect(() => {
    return () => {
      previewMedia.forEach(media => URL.revokeObjectURL(media.url));
    };
  }, [previewMedia]);

  // Calcul du nombre de lignes pour le style
  const lineCount = textareaRef.current 
    ? Math.floor(textareaRef.current.scrollHeight / parseInt(getComputedStyle(textareaRef.current).lineHeight))
    : 1;

  return (
    <div className="relative">
      {showMediaModal && (
        <MediaPreviewModal
          mediaList={previewMedia}
          recipient={recipient}
          onClose={() => setShowMediaModal(false)}
          onSend={handleMediaSend}
          fmessage={inputValue}
        />
      )}

      {detectedUrl && (
        <div className="mb-1 p-1 bg-transparent absolute bottom-full left-2 right-2">
          <LinkPreview url={detectedUrl} sender="me" compact={true} />
        </div>
      )}

      <form 
        ref={formRef}
        onSubmit={handleSubmit} 
        className="flex items-center gap-1"
      >
        <button 
          type="button" 
          onClick={() => setShowEmojiPicker(prev => !prev)}
          className={`
            p-1.5 rounded-full text-lg
            ${theme.buttonSecondary}
            transition-colors duration-200
          `}
          aria-label="Emoji picker"
        >
          <BsEmojiSmile />
        </button>

        <input
          type="file"
          accept="image/*,video/*"
          multiple
          hidden
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        <button 
          type="button" 
          className={`
            p-1.5 rounded-full text-lg
            ${theme.buttonSecondary}
            transition-colors duration-200
          `}
          aria-label="Attach file"
          onClick={() => fileInputRef.current.click()}
        >
          <FiPaperclip />
        </button>

        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            flex-1 py-1.5 px-3
            ${lineCount === 1 ? 'rounded-full' : 'rounded-2xl'}
            ${theme.inputBg}
            ${theme.textColor}
            focus:outline-none resize-none
            max-h-[120px] overflow-y-auto
            text-sm
            transition-all duration-200
          `}
          placeholder="Message..."
          rows={1}
          style={{ minHeight: '36px' }}
        />

        <button 
          type={inputValue.trim() || previewMedia.length > 0 ? 'submit' : 'button'} 
          className={`
            p-1.5 rounded-full text-lg
            ${theme.accentBg} ${theme.accentText}
            transition-colors duration-200
            flex-shrink-0
          `}
          aria-label={inputValue.trim() || previewMedia.length > 0 ? 'Send message' : 'Start recording'}
        >
          {inputValue.trim() || previewMedia.length > 0 ? <BsSendFill /> : <FiMic />}
        </button>
      </form>
    </div>
  );
});

function debounce(func, wait) {
  let timeout;
  const debounced = (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
  debounced.cancel = () => clearTimeout(timeout);
  return debounced;
}

export default ChatInput;