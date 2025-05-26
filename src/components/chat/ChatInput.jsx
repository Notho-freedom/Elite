import { useRef } from 'react';
import { FiPaperclip, FiMic } from 'react-icons/fi';
import { BsEmojiSmile, BsSendFill } from 'react-icons/bs';

const ChatInput = ({ 
  inputValue, 
  setInputValue, 
  handleSend, 
  setShowEmojiPicker, 
  handleMediaUpload, 
  theme 
}) => {
  const fileInputRef = useRef(null);

  return (
    <form onSubmit={handleSend} className="flex items-center">
      <button 
        type="button" 
        onClick={() => setShowEmojiPicker(prev => !prev)}
        className={`p-2 rounded-full ${theme.hoverBg} mr-2`}
        aria-label="Emoji picker"
      >
        <BsEmojiSmile className={theme.textColor} />
      </button>
      
      <input
        type="file"
        accept="image/*,video/*"
        multiple
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleMediaUpload}
      />

      <button 
        type="button" 
        className={`p-2 rounded-full ${theme.hoverBg} mr-2`}
        aria-label="Attach file"
        onClick={() => fileInputRef.current.click()}
      >
        <FiPaperclip className={theme.textColor} />
      </button>
      
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className={`flex-1 py-2 px-4 rounded-full ${theme.inputBg} focus:outline-none`}
        placeholder="Type a message..."
        onFocus={() => setShowEmojiPicker(false)}
      />
      
      <button 
        type={inputValue.trim() ? 'submit' : 'button'} 
        className={`p-2 rounded-full ml-2 ${
          inputValue.trim() 
            ? `${theme.accentBg} text-white` 
            : `${theme.hoverBg} ${theme.textColor}`
        }`}
        aria-label={inputValue.trim() ? 'Send message' : 'Start recording'}
      >
        {inputValue.trim() ? (
          <BsSendFill className={theme.textColor} />
        ) : (
          <FiMic className={theme.textColor} />
        )}
      </button>
    </form>
  );
};

export default ChatInput;