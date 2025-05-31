// MessageReactions.jsx
import { motion } from 'framer-motion';
import clsx from 'clsx';

const MessageReactions = ({ message, currentUserId, theme }) => {
  const userReaction = message.reactions.find(r => r.userId === currentUserId);
  const otherReactions = message.reactions.filter(r => r.userId !== currentUserId);
  const allReactions = userReaction ? [userReaction, ...otherReactions] : otherReactions;
  const isSingleMedia = message.media?.length === 1 && !message.text;

  if (allReactions.length === 0) return null;

  return (
    <div className={`flex justify-${
      message.sender === 'me' ? 'end' : 'start'
    } mt-1 w-full ${
      isSingleMedia ? 'absolute bottom-0 translate-y-full' : ''
    }`}>
      <div className="flex space-x-1">
        {allReactions.map((reaction, idx) => (
          <motion.div 
            key={`${reaction.userId}-${idx}`}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className={`text-xs px-1.5 py-0.5 rounded-full ${
              reaction.userId === currentUserId 
                ? message.sender === 'me' 
                  ? 'bg-blue-600/90' 
                  : 'bg-gray-300/90'
                : message.sender === 'me' 
                  ? 'bg-blue-600/50' 
                  : 'bg-gray-200/80'
            } border ${
              message.sender === 'me' ? 'border-blue-700/50' : theme.borderColor
            } shadow-sm backdrop-blur-sm`}
          >
            {reaction.emoji}
            {reaction.count > 1 && (
              <span className="ml-1 text-[10px]">
                {reaction.count}
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MessageReactions;