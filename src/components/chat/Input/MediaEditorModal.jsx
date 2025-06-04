import { FiX } from 'react-icons/fi';

const MediaEditorModal = ({ media, onClose }) => {
  if (!media) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3>Éditer le média</h3>
          <button onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>
        
        {media.type === 'image' ? (
          <img 
            src={media.url} 
            className="max-h-96 w-full object-contain mb-4"
          />
        ) : (
          <video controls className="max-h-96 w-full mb-4">
            <source src={media.url} />
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
            onClick={onClose} 
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Appliquer
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaEditorModal;