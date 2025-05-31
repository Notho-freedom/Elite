// MediaDisplay.jsx
import { motion } from 'framer-motion';
import clsx from 'clsx';

const MediaDisplay = ({ media, isSingleMedia, openMediaViewer }) => {
  const displayedMedia = media.slice(0, 4);
  const extraMediaCount = media.length > 4 ? media.length - 4 : 0;
  const isSingleImage = isSingleMedia && displayedMedia[0]?.type === 'image';
  const isSingleVideo = isSingleMedia && displayedMedia[0]?.type === 'video';

  return (
    <div className={clsx(
      isSingleMedia ? '' : 'mt-1',
      {
        'w-[280px] h-[280px]': isSingleImage,
        'w-[280px]': isSingleVideo,
        'grid gap-1': !isSingleMedia,
        'grid-cols-1': !isSingleMedia && displayedMedia.length === 1,
        'grid-cols-2': !isSingleMedia && (displayedMedia.length === 2 || displayedMedia.length >= 3),
        'grid-rows-2': !isSingleMedia && displayedMedia.length >= 3
      }
    )}>
      {displayedMedia.map((item, idx) => (
        <MediaItem 
          key={idx}
          item={item}
          idx={idx}
          displayedMedia={displayedMedia}
          isSingleMedia={isSingleMedia}
          openMediaViewer={openMediaViewer}
        />
      ))}

      {extraMediaCount > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-2 right-2 bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-medium cursor-pointer"
          onClick={() => openMediaViewer(3)}
        >
          +{extraMediaCount}
        </motion.div>
      )}
    </div>
  );
};

const MediaItem = ({ item, idx, displayedMedia, isSingleMedia, openMediaViewer }) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    className={clsx(
      'relative rounded-lg overflow-hidden cursor-pointer',
      {
        'row-span-2 h-full': displayedMedia.length === 3 && idx === 0,
        'max-w-[280px]': displayedMedia.length === 1 && !isSingleMedia,
        'h-full': isSingleMedia && item.type === 'video'
      }
    )}
    style={{
      aspectRatio: item.type === 'video' ? '16/9' : 
                  (isSingleMedia && item.type === 'image') ? '1/1' : '1/1'
    }}
    onClick={() => openMediaViewer(idx)}
  >
    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors duration-200 z-10" />
    
    {item.type === 'image' ? (
      <img 
        src={item.url} 
        alt="Media" 
        className="w-full h-full object-cover"
        loading="lazy"
      />
    ) : (
      <div className="relative w-full h-full">
        <video 
          className="w-full h-full object-cover"
          disablePictureInPicture
          preload="metadata"
        >
          <source src={item.url} type="video/mp4" />
        </video>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/40 rounded-full p-2">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.8L16 10l-9.7 7.2V2.8z"/>
            </svg>
          </div>
        </div>
      </div>
    )}
  </motion.div>
);

export default MediaDisplay;