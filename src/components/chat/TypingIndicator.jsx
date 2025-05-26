import { motion } from 'framer-motion';

const TypingIndicator = ({ theme }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex justify-start mb-4"
    >
      <div className={`px-4 py-2 rounded-2xl ${theme.messageBg} rounded-bl-none ${theme.textColor}`}>
        <div className="flex space-x-1">
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;