import { useState, useRef, useMemo, useEffect } from 'react';
import Header from './Header';
import MediaDisplay from './MediaDisplay';
import ThumbnailCarousel from './ThumbnailCarousel';
import EditingTools from './EditingTools';
import MessageInput from './MessageInput';

const MediaPreviewModal = ({
  mediaList,
  recipient,
  onClose,
  onSend,
  onAddMore,
  fmessage,
  preview=true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [message, setMessage] = useState(fmessage);
  const [isEditing, setIsEditing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const thumbnailsRef = useRef(null);

  const currentMedia = useMemo(() => mediaList[currentIndex], [mediaList, currentIndex]);

  useEffect(() => {
    if (thumbnailsRef.current) {
      thumbnailsRef.current.scrollLeft = thumbnailsRef.current.scrollWidth;
    }
  }, [mediaList]);

// Dans MediaPreviewModal.js
const handleSend = () => {
  onSend({
    message: message.trim(),
    media: mediaList // Envoyer toute la liste des médias
  });
  onClose();
};

  const removeCurrentMedia = () => {
    if (mediaList.length <= 1) {
      onClose();
      return;
    }
    
    const newMediaList = [...mediaList];
    newMediaList.splice(currentIndex, 1);
    setCurrentIndex(Math.min(currentIndex, newMediaList.length - 1));
    onAddMore(newMediaList);
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-sm flex flex-col">
      <Header recipient={recipient} onClose={onClose} />
      
      <MediaDisplay 
        media={currentMedia} 
        isEditing={isEditing} 
        onEditComplete={() => setIsEditing(false)}
      />
      
      <ThumbnailCarousel
        ref={thumbnailsRef}
        mediaList={mediaList}
        currentIndex={currentIndex}
        onSelect={setCurrentIndex}
        onAddMore={onAddMore}
      />
      {preview ? (
        <>
          <EditingTools
            showOptions={showOptions}
            onToggleOptions={() => setShowOptions(!showOptions)}
            onEdit={() => setIsEditing(true)}
            onRemove={removeCurrentMedia}
          />
          
          <MessageInput
            message={message}
            onMessageChange={setMessage}
            onSend={handleSend}
            hasMedia={mediaList.length > 0}
          />
        </>
      ):(<></>)}

    </div>
  );
};

export default MediaPreviewModal;