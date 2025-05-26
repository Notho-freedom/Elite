import { useState } from 'react';
import { IoCheckmarkDone, IoClose } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';

const MediaViewer = ({ media, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : media.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev < media.length - 1 ? prev + 1 : 0));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Fond flouté */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-lg"
        onClick={onClose}
      />
      
      {/* Contenu du viewer */}
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh]">
        {/* Bouton fermeture */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <IoClose size={24} />
        </button>
        
        {/* Navigation */}
        {media.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
        
        {/* Media actif */}
        <div className="flex items-center justify-center h-full">
          {media[currentIndex].type === 'image' ? (
            <motion.img
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              src={media[currentIndex].url}
              alt="Media"
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-xl"
            />
          ) : (
            <motion.video
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              controls
              autoPlay
              className="max-w-full max-h-[80vh] rounded-lg shadow-xl"
            >
              <source src={media[currentIndex].url} type="video/mp4" />
            </motion.video>
          )}
        </div>
        
        {/* Pagination */}
        {media.length > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {media.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MediaViewer;