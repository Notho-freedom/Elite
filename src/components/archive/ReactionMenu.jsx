// ReactionMenu.jsx
import { motion } from 'framer-motion';

const ReactionMenu = ({ message, addReaction, currentUserId, theme }) => {
  const handleAddReaction = (emoji) => {
    const userReaction = message.reactions.find(r => r.userId === currentUserId);
    if (userReaction) {
      addReaction(message.id, userReaction.emoji, true);
    }
    addReaction(message.id, emoji);
  };

  return (
    <motion.div 
      className={`absolute ${message.sender === 'me' ? 'left-0' : 'right-0'} -top-5 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-0.5 p-0.5 rounded-full ${
        message.sender === 'me' ? 'bg-blue-500/10' : 'bg-gray-100/80'
      } backdrop-blur-md`}
      whileHover={{ scale: 1.05 }}
    >
      {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(emoji => (
        <motion.button
          key={emoji}
          whileHover={{ scale: 1.2, y: -3 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleAddReaction(emoji)}
          className={`text-xs p-0.5 rounded-full ${
            message.sender === 'me' ? 'hover:bg-blue-500/20' : 'hover:bg-gray-200/80'
          } transition-colors`}
        >
          {emoji}
        </motion.button>
      ))}
    </motion.div>
  );
};

export default ReactionMenu;