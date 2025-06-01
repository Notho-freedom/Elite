import EmojiPicker from 'emoji-picker-react';
import { useTheme } from '../Context/ThemeContext';

const EmojiPickerWrapper = ({
  showEmojiPicker,
  onEmojiClick,
  onEmojiHover,
  onSearch,
  emojiVersion = '5.0',
  themeMode = 'auto',
  pickerWidth = 350,
  pickerHeight = 450,
  lazyLoadEmojis = true,
  skinTonesDisabled = false,
  autoFocusSearch = true,
  defaultSkinTone = 'NEUTRAL',
  categories = [
    'smileys_people',
    'animals_nature',
    'food_drink',
    'travel_places',
    'activities',
    'objects',
    'symbols',
    'flags',
  ]
}) => {
  const { mode } = useTheme(); // dark / light / auto

  if (!showEmojiPicker) return null;

  return (
    <div className="absolute bottom-16 left-4 z-50">
      <EmojiPicker
        onEmojiClick={onEmojiClick}
        onEmojiHover={onEmojiHover}
        onSearch={onSearch}

        width={pickerWidth}
        height={pickerHeight}

        emojiVersion={emojiVersion}
        lazyLoadEmojis={lazyLoadEmojis}
        skinTonesDisabled={skinTonesDisabled}
        autoFocusSearch={autoFocusSearch}
        defaultSkinTone={defaultSkinTone}

        emojiStyle="apple" // "native", "apple", "google", "twitter", "facebook"
        theme={mode || themeMode} // adapte au thème local

        categories={categories}

        previewConfig={{
          showPreview: true,
          defaultEmoji: "1f44b", // 👋
          defaultCaption: "Hey, Welcome to ELITE !",
        }}

        searchDisabled={false}
        skinTonePickerLocation="PREVIEW" // or "SEARCH", "HEADER"

        suggestedEmojisMode="recent" // or "frequent", "disabled"
      />
    </div>
  );
};

export default EmojiPickerWrapper;
