import { FiPaperclip, FiMic } from 'react-icons/fi';
import { BsEmojiSmile, BsSendFill } from 'react-icons/bs';

const ChatInputControls = ({
  theme,
  showEmojiPicker,
  setShowEmojiPicker,
  fileInputRef,
  inputValue,
  previewMedia,
  handleSubmit
}) => {
  return (
    <form onSubmit={handleSubmit} className="flex items-center">
      <button 
        type="button" 
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        className={`p-2 lg:p-3 rounded-full ${theme.hoverBg} mr-2`}
        aria-label="Emoji picker"
      >
        <BsEmojiSmile className={theme.textColor} />
      </button>

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
        className={`flex-1 py-2 px-4 rounded-full ${theme.inputBg} focus:outline-none`}
        placeholder="Type a message..."
        onFocus={() => setShowEmojiPicker(false)}
      />

      <button 
        type={inputValue.trim() || previewMedia.length > 0 ? 'submit' : 'button'} 
        className={`p-2 rounded-full ml-2 ${theme.accentBg} ${theme.accentText} ${theme.accentShadow}`}
        aria-label={inputValue.trim() ? 'Send message' : 'Start recording'}
      >
        {inputValue.trim() || previewMedia.length > 0 ? (
          <BsSendFill className={theme.textColor} />
        ) : (
          <FiMic className={theme.textColor} />
        )}
      </button>
    </form>
  );
};

export default ChatInputControls;