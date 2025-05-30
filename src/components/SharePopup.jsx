import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCommentAlt, FaMicrophone, FaVideo, FaDesktop, FaTimes } from 'react-icons/fa';

const buttonVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.1 },
  tap: { scale: 0.9 },
};

const SharePopup = ({ activeCall, onClose }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);

  const handleWindowSelect = () => {
    setSelectedOption('window');
    console.log('Window sharing selected');
  };

  const handleScreenSelect = () => {
    setSelectedOption('screen');
    console.log('Screen sharing selected');
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    console.log(`Microphone ${!isMuted ? 'muted' : 'unmuted'}`);
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    console.log(`Video ${!isVideoOn ? 'on' : 'off'}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="absolute top-8 right-8 rounded-lg bg-gradient-to-b from-[#d9d9d9cc] to-[#a3a3a3cc] backdrop-blur-md p-4 shadow-lg flex flex-col w-[280px] text-[11px] text-[#2a2a2a] z-20"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-popup-title"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-3">
          <img
            alt="User avatar"
            className="w-8 h-8 rounded-full object-cover"
            src={activeCall?.avatar || 'https://randomuser.me/api/portraits/women/68.jpg'}
          />
          <div>
            <p className="font-semibold text-xs">
              Maybe: <span className="font-bold">{activeCall?.name || 'Malinda'}</span>
            </p>
            <p className="text-[10px]">FaceTime Video</p>
          </div>
        </div>
        <motion.button
          aria-label="Close"
          className="bg-[#e04c4c] text-white rounded-full w-6 h-6 flex items-center justify-center font-bold hover:bg-[#c03939] transition-colors"
          onClick={onClose}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaTimes className="text-xs" />
        </motion.button>
      </div>

      {/* Quick Controls */}
      <div className="flex space-x-4 mb-3 justify-center">
        <motion.button
          className="bg-[#d9d9d9] rounded-full w-8 h-8 flex items-center justify-center hover:bg-[#c9c9c9] transition-colors"
          aria-label="Messages"
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
        >
          <FaCommentAlt className="text-sm" />
        </motion.button>

        <motion.button
          className={`rounded-full w-8 h-8 flex items-center justify-center text-white transition-opacity
            ${isMuted ? 'bg-[#e04c4c] pulse' : 'bg-[#3b82f6] hover:opacity-90'}`}
          aria-pressed={isMuted}
          aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          onClick={toggleMute}
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
        >
          <FaMicrophone className="text-sm" />
          {isMuted && (
            <span className="absolute top-0 right-0 block w-2 h-2 rounded-full bg-red-600 border-2 border-white" />
          )}
        </motion.button>

        <motion.button
          className={`rounded-full w-8 h-8 flex items-center justify-center text-white transition-opacity
            ${isVideoOn ? 'bg-[#3b82f6]' : 'bg-[#e04c4c] pulse'}`}
          aria-pressed={isVideoOn}
          aria-label={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
          onClick={toggleVideo}
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
        >
          <FaVideo className="text-sm" />
          {!isVideoOn && (
            <span className="absolute top-0 right-0 block w-2 h-2 rounded-full bg-red-600 border-2 border-white" />
          )}
        </motion.button>

        <motion.button
          className="bg-[#d9d9d9] rounded-full w-8 h-8 flex items-center justify-center hover:bg-[#c9c9c9] transition-colors"
          aria-label="Screen share"
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
        >
          <FaDesktop className="text-sm" />
        </motion.button>
      </div>

      {/* Sharing Options */}
      <p id="share-popup-title" className="font-semibold mb-2 text-center">
        Choose Window or Screen to Share
      </p>
      <p className="text-[10px] mb-3 leading-[1.3] text-center">
        Notifications will be turned off while sharing your screen. All system sounds will be shared.
      </p>

      <div className="flex space-x-4">
        <motion.button
          className={`flex-1 rounded-md py-2 text-[11px] font-semibold transition-colors ${
            selectedOption === 'window' ? 'bg-[#3b82f6] text-white' : 'bg-[#bfbfbf] hover:bg-[#afafaf]'
          }`}
          onClick={handleWindowSelect}
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          aria-pressed={selectedOption === 'window'}
        >
          Window
        </motion.button>
        <motion.button
          className={`flex-1 rounded-md py-2 text-[11px] font-semibold transition-colors ${
            selectedOption === 'screen' ? 'bg-[#3b82f6] text-white' : 'bg-[#bfbfbf] hover:bg-[#afafaf]'
          }`}
          onClick={handleScreenSelect}
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          aria-pressed={selectedOption === 'screen'}
        >
          Screen
        </motion.button>
      </div>

      {/* Status Message */}
      {selectedOption && (
        <p className="text-[10px] mt-2 text-center text-gray-600">
          {selectedOption === 'window' ? 'Preparing to share a window...' : 'Preparing to share your screen...'}
        </p>
      )}

      <style jsx>{`
        .pulse {
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(224, 76, 76, 0.7);
          }
          50% {
            box-shadow: 0 0 8px 4px rgba(224, 76, 76, 0);
          }
        }
      `}</style>
    </motion.div>
  );
};

export default SharePopup;
