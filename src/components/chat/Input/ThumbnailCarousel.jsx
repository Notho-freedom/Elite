import { forwardRef, useRef } from 'react';
import { FiPlus, FiPlay } from 'react-icons/fi';

const ThumbnailCarousel = forwardRef(({ mediaList, currentIndex, onSelect, onAddMore }, ref) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onAddMore(files);
    }
  };

  return (
    <div className="p-4 bg-black/30 relative">
      <div 
        ref={ref}
        className="flex space-x-2 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollBehavior: 'smooth' }}
      >
        {mediaList.map((media, index) => (
          <div 
            key={`${media.id || index}_${media.url}`} 
            onClick={() => onSelect(index)}
            className={`relative flex-shrink-0 h-20 w-20 rounded-md cursor-pointer border-2 transition-all ${
              currentIndex === index ? 'border-blue-500 scale-105' : 'border-transparent'
            }`}
          >
            {media.type === 'image' ? (
              <img 
                src={media.url} 
                alt="Thumbnail" 
                className="h-full w-full object-cover rounded-md"
                loading="lazy"
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
        
        <div className="flex-shrink-0 h-20 w-20 flex items-center justify-center">
          <button 
            onClick={() => fileInputRef.current.click()}
            className="h-full w-full rounded-md border-2 border-dashed border-gray-500 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Ajouter des médias"
          >
            <FiPlus size={24} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,video/*,.gif" 
            multiple 
            className="hidden" 
          />
        </div>
      </div>
    </div>
  );
});

export default ThumbnailCarousel;