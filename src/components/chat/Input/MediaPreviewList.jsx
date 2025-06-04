import MediaPreview from './MediaPreview';

const MediaPreviewList = ({ mediaList, onRemoveMedia, onEditMedia, recipient }) => {
  if (mediaList.length === 0) return null;

  return (
    <div className="relative mb-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <div className="flex overflow-x-auto space-x-2 pb-2">
        {mediaList.map((media, index) => (
          <MediaPreview
            key={index}
            media={media}
            index={index}
            onRemove={onRemoveMedia}
            onEdit={onEditMedia}
            recipient={recipient}
          />
        ))}
      </div>
    </div>
  );
};

export default MediaPreviewList;