import { BsCheck2All } from 'react-icons/bs';
import clsx from 'clsx';
import MediaDisplay from './MediaDisplay';
import { useMemo } from 'react';
import LinkPreview from './LinkPreview';

const MessageBubble = ({ message, theme, currentUserId, openMediaViewer }) => {
  const isSingleEmoji = useMemo(() => 
    message.text?.match(/^\p{Emoji}$/u) && !message.media?.length,
    [message.text, message.media]
  );
  
  const isSingleMedia = useMemo(() => 
    message.media?.length === 1 && !message.text,
    [message.media, message.text]
  );

  const detectedLinks = useMemo(() => {
    if (!message.text) return [];
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return message.text.match(urlRegex) || [];
  }, [message.text]);

  const formatText = useMemo(() => {
    if (!message.text) return null;
    
    return message.text.split(/(https?:\/\/[^\s]+)/g).map((part, index) => (
      detectedLinks.includes(part) ? (
        <div key={index} className="w-full my-1 overflow-hidden rounded-lg">
          <LinkPreview url={part} theme={theme} sender={message.sender} />
        </div>
      ) : (
        <span 
          key={index} 
          className="whitespace-pre-wrap break-words inline"
          style={{ lineHeight: '1.4' }}
        >
          {part}
        </span>
      )
    ));
  }, [message.text, detectedLinks, theme, message.sender]);

  return (
    <div className={clsx(
      'relative',
      isSingleEmoji 
        ? 'bg-transparent text-5xl p-0' 
        : isSingleMedia
          ? 'p-0 rounded-xl overflow-hidden max-w-[320px]'
          : [
              'px-3 py-2 rounded-2xl max-w-[40vw]',
              message.sender === 'me'
                ? `${theme.accentBg} ${theme.textColor} rounded-br-none shadow-md shadow-blue-500/20`
                : `${theme.messageBg} rounded-bl-none ${theme.textColor} shadow-md shadow-gray-400/20 backdrop-blur-sm`
            ]
    )}>
      {/* Triangle de la bulle */}
      {!isSingleEmoji && !isSingleMedia && (
        <div className={clsx(
          'absolute top-0 w-3 h-3',
          message.sender === 'me'
            ? `${theme.accentBg} right-0 -mr-3 clip-path-triangle-right`
            : `left-0 -ml-3 ${theme.accentBg} clip-path-triangle-left`
        )} style={{
          filter: message.sender === 'me' ? 'none' : 'drop-shadow(-2px 0px 2px rgba(0,0,0,0.05))'
        }} />
      )}

      {/* Contenu du message */}
      <div className={clsx(
        'overflow-hidden',
        isSingleMedia ? '' : 'w-full'
      )}>
        {!isSingleMedia && message.text && (
          <div className="text-sm leading-relaxed break-words">
            {formatText}
          </div>
        )}

        {/* Médias */}
        {message.media?.length > 0 && (
          <MediaDisplay 
            media={message.media} 
            isSingleMedia={isSingleMedia}
            openMediaViewer={openMediaViewer}
          />
        )}
      </div>

      {/* Métadonnées */}
      {!isSingleEmoji && (
        <div className={clsx(
          'text-[11px] flex items-center justify-end space-x-1',
          message.sender === 'me' ? 'text-blue-100' : theme.secondaryText,
          !isSingleMedia ? 'mt-1' : 'absolute bottom-1 right-1 bg-black/60 px-1 rounded'
        )}>
          <span>{message.time}</span>
          {message.sender === 'me' && (
            <BsCheck2All className={clsx(
              "text-xs",
              message.isRead ? "text-blue-300" : "opacity-70"
            )} />
          )}
        </div>
      )}
    </div>
  );
};

export default MessageBubble;