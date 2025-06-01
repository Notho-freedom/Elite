import React from 'react';
import { FaVideo, FaMicrophone, FaDesktop, FaTimes, FaThLarge, FaPlusCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useTheme } from './Context/ThemeContext';

const AnimatedIconButton = ({
  active,
  activeColor,
  inactiveColor,
  onClick,
  label,
  children,
}) => {
  const { theme } = useTheme();
  
  return (
    <motion.button
      aria-label={label}
      aria-pressed={active}
      title={label}
      type="button"
      onClick={onClick}
      className={`rounded-full p-2 w-9 h-9 flex items-center justify-center cursor-pointer
        ${active ? `${activeColor} text-white shadow-lg` : `${inactiveColor} ${theme.textColor}`}`}
      whileHover={{ scale: 1.15, boxShadow: `0 0 8px ${theme.hoverBg.replace('hover:', '')}` }}
      whileTap={{ scale: 0.9 }}
      animate={active ? { 
        scale: [1, 1.15, 1], 
        boxShadow: `0 0 12px ${activeColor}` 
      } : {}}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.button>
  );
};

const AnimatedInput = ({ value, onChange, placeholder }) => {
  const { theme } = useTheme();
  
  return (
    <motion.input
      key={value}
      className={`${theme.inputBg} rounded-md px-4 py-2 text-sm placeholder-gray-500 focus:outline-none w-full`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      initial={{ boxShadow: '0 0 0px rgba(0,0,0,0)' }}
      animate={{ boxShadow: `0 0 8px ${theme.hoverBg.replace('hover:', '')}` }}
      transition={{ duration: 0.4 }}
    />
  );
};

const CallPanel = ({ 
  activeCall, 
  isSilenced, 
  setIsSilenced,
  shareLink,
  setShareLink,
  toggleMute,
  toggleVideo,
  toggleScreenShare,
  endCall
}) => {
  const { theme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col ${theme.bgColor} p-6 ${theme.w} h-screen border-l border-r ${theme.borderColor}`}
    >
      <div className="flex flex-col h-full justify-between">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <FaVideo className={`${theme.textColor} text-xl`} />
            <div className="text-left">
              <p className={`${theme.textColor} font-semibold`}>FaceTime</p>
              <p className={`${theme.secondaryText} text-xs`}>
                Conversation with {activeCall.name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center rounded-full bg-[#4caf50] text-black font-semibold w-10 h-10">
              <img 
                src={activeCall.avatar} 
                className="rounded-full border-2 w-10 h-10"
                style={{ borderColor: theme.borderColor.replace('border-', '') }}
                alt={`${activeCall.name}'s avatar`}
              />
            </div>
            <div className="text-left">
              <p className={`font-bold ${theme.textColor}`}>
                Maybe: <span className="font-semibold">{activeCall.name}</span>
              </p>
              <p className={`${theme.secondaryText} flex items-center space-x-1`}>
                <FaVideo className="text-xs" />
                <span>{activeCall.status}</span>
              </p>
            </div>
          </div>
          
          <button className={`flex items-center space-x-3 ${theme.secondaryText} ${theme.hoverBg} p-2 rounded-md`}>
            <div className={`flex items-center justify-center rounded-full border ${theme.borderColor} w-8 h-8`}>
              <FaPlusCircle className="text-xs" />
            </div>
            <span className="text-sm">Add People</span>
          </button>
          
          <AnimatedInput
            placeholder="Share Link"
            value={shareLink}
            onChange={(e) => setShareLink(e.target.value)}
          />
          
          <label className={`flex items-center space-x-3 ${theme.secondaryText} text-xs p-2 rounded-md ${theme.hoverBg}`}>
            <input
              type="checkbox"
              checked={isSilenced}
              onChange={() => setIsSilenced(!isSilenced)}
              className={`w-4 h-4 rounded-sm ${theme.inputBg} border ${theme.borderColor}`}
            />
            <span>Silence Join Requests</span>
          </label>
        </div>
        
        <div className="flex space-x-4 justify-center">
          <AnimatedIconButton
            inactiveColor={theme.headerBg}
            activeColor={theme.hoverBg.replace('hover:', '')}
            onClick={() => {}}
            label="Grid view"
          >
            <FaThLarge className="text-sm" />
          </AnimatedIconButton>

          <AnimatedIconButton
            active={activeCall.isMuted}
            activeColor="#e04c4c"
            inactiveColor={theme.headerBg}
            onClick={toggleMute}
            label="Mute microphone"
          >
            <FaMicrophone className="text-sm" />
          </AnimatedIconButton>

          <AnimatedIconButton
            active={!activeCall.isVideoOn}
            activeColor="#e04c4c"
            inactiveColor={theme.headerBg}
            onClick={toggleVideo}
            label="Turn off camera"
          >
            <FaVideo className="text-sm" />
          </AnimatedIconButton>

          <AnimatedIconButton
            active={activeCall.isScreenSharing}
            activeColor="#0a84ff"
            inactiveColor={theme.headerBg}
            onClick={toggleScreenShare}
            label="Screen share"
          >
            <FaDesktop className="text-sm" />
          </AnimatedIconButton>

          <motion.button
            aria-label="End call"
            className="bg-[#e04c4c] text-white rounded-full p-2 w-9 h-9 flex items-center justify-center cursor-pointer"
            onClick={endCall}
            whileHover={{ 
              scale: 1.1, 
              boxShadow: '0 0 12px rgba(224, 76, 76, 0.9)' 
            }}
            whileTap={{ scale: 0.9 }}
          >
            <FaTimes className="text-sm" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default CallPanel;