import { BsEmojiSmile, BsSendFill } from 'react-icons/bs';

// Dans MessageInput.js
const MessageInput = ({ message, onMessageChange, onSend, hasMedia }) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSend();
    }
  };

  return (
    <div className="p-4 bg-black/50">
      <div className="flex items-center space-x-2">
        <button 
          className="p-2 text-gray-400 hover:text-white rounded-full"
          aria-label="Émojis"
        >
          <BsEmojiSmile size={20} />
        </button>
        <input
          type="text"
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ajouter une légende..."
          className="flex-1 py-2 px-4 bg-black/30 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          aria-label="Légende du média"
        />
        <button
          onClick={onSend}
          disabled={!message.trim() && !hasMedia}
          className={`p-2 rounded-full transition-colors ${
            (message.trim() || hasMedia)
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
          aria-label="Envoyer"
        >
          <BsSendFill size={20} />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;