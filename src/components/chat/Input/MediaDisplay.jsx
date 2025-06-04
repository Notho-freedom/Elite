import { Suspense } from 'react';
import { FiPlay } from 'react-icons/fi';
import MediaEditorModal from './MediaEditorModal';

const MediaDisplay = ({ media, isEditing, onEditComplete }) => (
  <div className="flex-1 flex items-center justify-center relative overflow-hidden">
    {isEditing ? (
      <Suspense fallback={<div className="text-white">Chargement de l'éditeur...</div>}>
        <MediaEditorModal 
          media={media} 
          onSave={onEditComplete}
          onCancel={onEditComplete}
        />
      </Suspense>
    ) : (
      <div className="relative w-full h-full flex items-center justify-center">
        {media?.type === 'image' ? (
          <img 
            src={media?.url} 
            alt="Preview" 
            className="max-h-[70vh] max-w-full object-contain"
            draggable="false"
          />
        ) : (
          <video 
            src={media?.url} 
            controls
            className="max-h-[70vh] max-w-full"
            controlsList="nodownload"
          >
            Votre navigateur ne supporte pas les vidéos HTML5
          </video>
        )}
      </div>
    )}
  </div>
);

export default MediaDisplay;