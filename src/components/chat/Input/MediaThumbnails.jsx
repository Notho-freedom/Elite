import { FiX, FiEdit2 } from 'react-icons/fi';

const MediaThumbnails = ({ mediaList, onAddMore, onEdit, onRemove }) => {
  return (
    <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center space-x-2 overflow-x-auto">
        {mediaList.map((media) => (
          <div key={media.id} className="relative flex-shrink-0 group">
            {media.type === 'image' ? (
              <img
                src={media.url}
                alt="Preview"
                className="h-16 w-16 object-cover rounded-md border"
              />
            ) : (
              <div className="relative h-16 w-16">
                <video className="h-full w-full object-cover rounded-md border">
                  <source src={media.url} />
                </video>
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <PlayIcon className="text-white" />
                </div>
              </div>
            )}
            <button
              onClick={() => onRemove(media.id)}
              className="absolute -top-1 -right-1 p-0.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FiX className="text-white text-xs" />
            </button>
          </div>
        ))}
        <button
          onClick={onAddMore}
          className="h-16 w-16 flex-shrink-0 border-2 border-dashed border-gray-400 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <PlusIcon className="text-xl" />
        </button>
        {mediaList.length > 0 && (
          <button
            onClick={onEdit}
            className="ml-auto px-3 py-1 bg-blue-500 text-white rounded-full text-sm flex items-center"
          >
            <FiEdit2 className="mr-1" /> Edit
          </button>
        )}
      </div>
    </div>
  );
};

export default MediaThumbnails;