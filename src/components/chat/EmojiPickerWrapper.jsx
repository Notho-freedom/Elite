import EmojiPicker from 'emoji-picker-react';

const EmojiPickerWrapper = ({ 
  showEmojiPicker, 
  onEmojiClick, 
  theme 
}) => {
  if (!showEmojiPicker) return null;

  return (
    <div className="absolute bottom-16 left-4 z-10">
      <EmojiPicker 
        onEmojiClick={onEmojiClick}
        width={300}
        height={400}
        skinTonesDisabled
        previewConfig={{ showPreview: false }}
        theme={theme.mode === 'dark' ? 'dark' : 'light'}
      />
    </div>
  );
};

export default EmojiPickerWrapper;