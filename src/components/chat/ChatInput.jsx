import { useState, useRef, useEffect } from 'react';
import { FiPaperclip, FiMic, FiX, FiEdit2 } from 'react-icons/fi';
import { BsEmojiSmile, BsSendFill } from 'react-icons/bs';
import MediaPreviewModal from './Input/MediaPreview';
import LinkPreview from './LinkPreview'; // Importez votre composant LinkPreview

const ChatInput = ({ 
  inputValue, 
  setInputValue, 
  handleSend, 
  setShowEmojiPicker, 
  theme,
  recipient 
}) => {
  const fileInputRef = useRef(null);
  const [previewMedia, setPreviewMedia] = useState([]);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [detectedUrl, setDetectedUrl] = useState(null);
  const [isComposing, setIsComposing] = useState(false); // Pour gérer les IME

  // Détection des URLs dans le texte
  useEffect(() => {
    if (isComposing) return; // Ne pas détecter pendant la composition IME
    
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = inputValue.match(urlRegex);
    
    if (urls && urls.length > 0) {
      // Prendre la dernière URL détectée
      const lastUrl = urls[urls.length - 1];
      
      // Vérifier que c'est une URL valide
      try {
        new URL(lastUrl);
        setDetectedUrl(lastUrl);
      } catch {
        setDetectedUrl(null);
      }
    } else {
      setDetectedUrl(null);
    }
  }, [inputValue, isComposing]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const mediaPreviews = files.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image') ? 'image' : 'video',
      file,
      id: Math.random().toString(36).substring(2, 9)
    }));
    setPreviewMedia(prev => [...prev, ...mediaPreviews]);
    setShowMediaModal(true);
  };

  const handleSubmit = (e, message = '') => {
    e.preventDefault();
    
    // Si on a des médias en preview, ouvrir la modal
    if (previewMedia.length > 0) {
      setShowMediaModal(true);
      return;
    }
    
    // Sinon envoyer directement
    handleSend(e, {
      message: inputValue.trim() || message,
      media: []
    });
    setInputValue('');
    setDetectedUrl(null); // Reset la prévisualisation après envoi
  };

  const handleMediaSend = ({ message, media }) => {
    handleSend(
      { preventDefault: () => {} }, // mock event
      { 
        message: message || inputValue.trim(),
        media: media || previewMedia 
      }
    );
    setPreviewMedia([]);
    setInputValue('');
    setShowMediaModal(false);
    setDetectedUrl(null); // Reset la prévisualisation après envoi
  };

  const handleAddMoreMedia = (files) => {
    const mediaPreviews = files.map(file => ({
      url: file.url || URL.createObjectURL(file),
      type: file.type?.startsWith('image') ? 'image' : 'video',
      file,
      id: Math.random().toString(36).substring(2, 9)
    }));
    setPreviewMedia(prev => [...prev, ...mediaPreviews]);
  };

  // Gestion des événements de composition IME (pour les langues asiatiques)
  const handleCompositionStart = () => setIsComposing(true);
  const handleCompositionEnd = () => setIsComposing(false);

  return (
    <div className="relative">
      {showMediaModal && (
        <MediaPreviewModal
          mediaList={previewMedia}
          recipient={recipient}
          onClose={() => setShowMediaModal(false)}
          onSend={handleMediaSend}
          onAddMore={handleAddMoreMedia}
          fmessage={inputValue}
        />
      )}

      {/* Afficher la prévisualisation du lien si détecté */}
      {detectedUrl && (
        <div className="mb-2 p-2 bg-trensparent absolute bottom-[3vh] left-1/4 w-1/2">
          <LinkPreview url={detectedUrl} sender="me" compact={true} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center">
        {/* Emoji picker */}
        <button 
          type="button" 
          onClick={() => setShowEmojiPicker(prev => !prev)}
          className={`p-2 lg:p-3 rounded-full ${theme.hoverBg} mr-2`}
          aria-label="Emoji picker"
        >
          <BsEmojiSmile className={theme.textColor} />
        </button>

        {/* Input caché pour fichiers */}
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        {/* Bouton pièce jointe */}
        <button 
          type="button" 
          className={`p-2 rounded-full ${theme.hoverBg} mr-2`}
          aria-label="Attach file"
          onClick={() => fileInputRef.current.click()}
        >
          <FiPaperclip className={theme.textColor} />
        </button>

        {/* Champ texte */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          className={`flex-1 py-2 px-4 rounded-full ${theme.inputBg} focus:outline-none`}
          placeholder="Type a message..."
          onFocus={() => setShowEmojiPicker(false)}
        />

        {/* Envoi / micro */}
        <button 
          type={inputValue.trim() || previewMedia.length > 0 ? 'submit' : 'button'} 
          className={`p-2 rounded-full ml-2 ${theme.accentBg} ${theme.accentText} ${theme.accentShadow}`}
          aria-label={inputValue.trim() ? 'Send message' : 'Start recording'}
        >
          {inputValue.trim() || previewMedia.length > 0 ? (
            <BsSendFill className={theme.textColor} />
          ) : (
            <FiMic className={theme.textColor} />
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatInput;