import { useRef, useState } from 'react';
import { FiPaperclip, FiMic, FiX, FiEdit2 } from 'react-icons/fi';
import { BsEmojiSmile, BsSendFill } from 'react-icons/bs';

const ChatInput = ({ 
  inputValue, 
  setInputValue, 
  handleSend, 
  setShowEmojiPicker, 
  theme 
}) => {
  const fileInputRef = useRef(null);
  const [previewMedia, setPreviewMedia] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const mediaPreviews = files.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image') ? 'image' : 'video',
      file
    }));
    setPreviewMedia(prev => [...prev, ...mediaPreviews]);
  };

  const removeMedia = (index) => {
    const newMedia = [...previewMedia];
    URL.revokeObjectURL(newMedia[index].url);
    newMedia.splice(index, 1);
    setPreviewMedia(newMedia);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (previewMedia.length > 0 || inputValue.trim()) {
      handleSend(e, previewMedia);
      setPreviewMedia([]);
      setInputValue('');
    }
  };

  return (
    <div className="relative">
      {/* Aperçu des médias */}
      {previewMedia.length > 0 && (
        <div className="relative mb-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="flex overflow-x-auto space-x-2 pb-2">
            {previewMedia.map((media, index) => (
              <div key={index} className="relative flex-shrink-0">
                {media.type === 'image' ? (
                  <img 
                    src={media.url} 
                    alt="Preview" 
                    className="h-32 w-32 object-cover rounded-lg border"
                  />
                ) : (
                  <video className="h-32 w-32 object-cover rounded-lg border" controls>
                    <source src={media.url} type="video/mp4" />
                  </video>
                )}
                <div className="absolute top-1 right-1 flex space-x-1">
                  <button 
                    onClick={() => setEditingIndex(index)}
                    className="p-1 bg-white/80 rounded-full"
                  >
                    <FiEdit2 size={14} />
                  </button>
                  <button 
                    onClick={() => removeMedia(index)}
                    className="p-1 bg-white/80 rounded-full"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
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

      {/* Modale d'édition */}
      {editingIndex !== null && previewMedia[editingIndex] && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3>Éditer le média</h3>
              <button onClick={() => setEditingIndex(null)}>
                <FiX size={24} />
              </button>
            </div>
            
            {previewMedia[editingIndex].type === 'image' ? (
              <img 
                src={previewMedia[editingIndex].url} 
                className="max-h-96 w-full object-contain mb-4"
              />
            ) : (
              <video controls className="max-h-96 w-full mb-4">
                <source src={previewMedia[editingIndex].url} />
              </video>
            )}
            
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-gray-200 rounded">
                Recadrer
              </button>
              <button className="px-4 py-2 bg-gray-200 rounded">
                Filtres
              </button>
              <button 
                onClick={() => setEditingIndex(null)} 
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInput;
