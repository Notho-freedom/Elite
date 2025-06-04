import React, { useState, useRef, useMemo, useCallback, Suspense } from 'react';
import { FiX, FiPlus, FiEdit3, FiTrash2, FiCrop, FiFilter, FiPlay } from 'react-icons/fi';
import { BsEmojiSmile, BsSendFill } from 'react-icons/bs';
import { RiImageEditLine } from 'react-icons/ri';
import MediaEditorModal from './MediaEditorModal'; // Composant lazy-loaded

const MediaPreviewModal = ({
  mediaList,
  recipient,
  onClose,
  onSend,
  onAddMore,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);

  const currentMedia = useMemo(() => mediaList[currentIndex], [mediaList, currentIndex]);
  
  const handleSend = useCallback(() => {
    onSend({
      media: mediaList,
      message: message.trim(),
    });
    onClose();
  }, [mediaList, message, onSend, onClose]);

  const handleAddMore = useCallback(() => {
    fileInputRef.current.click();
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    onAddMore(files);
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-sm flex flex-col">

      {/* Media Display Area */}
      <div className="flex-1 flex items-center justify-center relative mt-15">
        {isEditing ? (
          <Suspense fallback={<div className="text-white">Chargement de l'éditeur...</div>}>
            <MediaEditorModal 
              media={currentMedia} 
              onSave={() => {
                setIsEditing(false);
              }}
              onCancel={() => setIsEditing(false)}
            />
          </Suspense>
        ) : (
          <div className="relative max-w-full top-[9vh] max-h-[70vh]">
            {currentMedia?.type === 'image' ? (
              <img 
                src={currentMedia?.url} 
                alt="Preview" 
                className="max-h-[60vh] max-w-full object-contain"
              />
            ) : (
              <video 
                src={currentMedia?.url} 
                controls
                className="max-h-[60vh] max-w-full"
              />
            )}
          </div>
        )}
      </div>

      {/* Thumbnail Carousel */}
      <div className="p-4 bg-black/30 overflow-x-auto items-center justify-center">
        <div className="hidden flex space-x-2 overflow-x-auto items-center justify-center fixed">
          <button 
            onClick={handleAddMore}
            className="h-16 w-16 rounded-md border-2 border-dashed border-gray-500 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white"
          >
            <FiPlus size={20} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,video/*" 
            multiple 
            className="hidden" 
          />
        </div>

        <div className="flex space-x-2 overflow-x-auto items-center justify-center">
          <button 
            onClick={handleAddMore}
            className="flex flex-shrink-0 h-16 w-16 rounded-md border-2 border-dashed border-gray-500 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white"
          >
            <FiPlus size={20} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,video/*" 
            multiple 
            className="hidden" 
          />
            {mediaList.map((media, index) => (
                <div 
                key={index} 
                onClick={() => setCurrentIndex(index)}
                className={`relative flex-shrink-0 h-16 w-16 rounded-md cursor-pointer border-2 ${currentIndex === index ? 'border-blue-500' : 'border-transparent'}`}
                >
                {media.type === 'image' ? (
                    <img 
                    src={media.url} 
                    alt="Thumbnail" 
                    className="h-full w-full object-cover rounded-md"
                    />
                ) : (
                    <div className="relative h-full w-full">
                    <video className="h-full w-full object-cover rounded-md">
                        <source src={media.url} />
                    </video>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <FiPlay className="text-white" />
                    </div>
                    </div>
                )}
                {index === currentIndex && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                )}
                </div>
            ))}
        </div>
      </div>

      {/* Editing Tools */}
      <div className="flex justify-center flex-col absolute top-[30vh] space-x-4 p-3 bg-black/50">
        <button 
          onClick={() => setIsEditing(true)}
          className="p-2 ml-4 rounded-full hover:bg-white/10 text-white"
          title="Éditer"
        >
          <RiImageEditLine size={20} />
        </button>
        <button className="p-2 ml-4 rounded-full hover:bg-white/10 text-white" title="Recadrer">
          <FiCrop size={20} />
        </button>
        <button className="p-2 ml-4 rounded-full hover:bg-white/10 text-white" title="Filtres">
          <FiFilter size={20} />
        </button>
        <button 
          onClick={() => {
            // Logique de suppression du média actuel
          }}
          className="p-2 ml-4 rounded-full hover:bg-red-500/20 text-red-500"
          title="Supprimer"
        >
          <FiTrash2 size={20} />
        </button>
      </div>

      {/* Message Input */}
      <div className="p-4 bg-black/50">
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-white">
            <BsEmojiSmile size={20} />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ajouter une légende..."
            className="flex-1 py-2 px-4 bg-black/30 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={mediaList.length === 0}
            className={`p-2 rounded-full ${mediaList.length > 0 ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-400'}`}
          >
            <BsSendFill size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Optimisations supplémentaires
export default React.memo(MediaPreviewModal, (prevProps, nextProps) => {
  return (
    prevProps.mediaList === nextProps.mediaList &&
    prevProps.recipient === nextProps.recipient &&
    prevProps.onClose === nextProps.onClose &&
    prevProps.onSend === nextProps.onSend
  );
});