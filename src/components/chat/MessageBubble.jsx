import { BsCheck2All } from 'react-icons/bs';
import clsx from 'clsx';
import MediaDisplay from './MediaDisplay';
import VoiceMessage from './VoiceMessage';
import { useMemo } from 'react';
import LinkPreview from './LinkPreview';
import { motion } from 'framer-motion';
import LottieEmoji from './LottieEmoji';


const MessageBubble = ({ message, theme, openMediaViewer, onAction = () => {} }) => {
  const isSingleEmoji = useMemo(() => 
    message.text?.match(/^\p{Emoji}$/u) && !message.media?.length,
    [message.text, message.media]
  );
  
  const isSingleMedia = useMemo(() => 
    message.media?.length === 1 && !message.text,
    [message.media, message.text]
  );

  const hasVoiceMessage = useMemo(() => 
    message.media?.some(m => m.type === 'voice'),
    [message.media]
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

  // Séparer les médias vocaux et non-vocaux
  const voiceMessages = useMemo(() => 
    message.media?.filter(m => m.type === 'voice') || [],
    [message.media]
  );

  const otherMedia = useMemo(() => 
    message.media?.filter(m => m.type !== 'voice') || [],
    [message.media]
  );

  const isOwnMessage = message.sender === 'me';

  return (
    <div className={clsx(
      'relative',
      isSingleEmoji 
        ? 'bg-transparent text-[80px] sm:text-[100px] leading-none p-0 flex items-center justify-center' 
        : hasVoiceMessage && !message.text && otherMedia.length === 0
          ? 'p-0 rounded-xl overflow-hidden max-w-[320px]'
          : isSingleMedia
            ? 'p-0 rounded-xl overflow-hidden max-w-[320px]'
            : [
                'px-3 py-2 rounded-2xl',
                message.sender === 'me'
                  ? `${theme.accentBg} ${theme.textColor} ${theme.accentShadow} rounded-br-none shadow-md`
                  : `${theme.messageBg} rounded-bl-none ${theme.textColor} shadow-md shadow-gray-400/20 backdrop-blur-sm`
              ]
    )}>
      {/* Triangle de la bulle - seulement pour les messages non-emoji et non-voice-seuls */}
      {!isSingleEmoji && !(hasVoiceMessage && !message.text && otherMedia.length === 0) && (
        <div className={clsx(
          'absolute top-0 w-3 h-3',
          message.sender === 'me'
            ? `${theme.accentBg} right-0 -mr-3 clip-path-triangle-right`
            : `left-0 -ml-3 ${theme.bgColor} clip-path-triangle-left`
        )} style={{
          filter: message.sender === 'me' ? 'none' : 'drop-shadow(-2px 0px 2px rgba(0,0,0,0.05))'
        }} />
      )}

      {/* Contenu du message */}
      <div className={clsx(
        'overflow-hidden',
        isSingleMedia || (hasVoiceMessage && !message.text && otherMedia.length === 0) ? '' : 'w-full'
      )}>
        
        {/* Messages vocaux */}
        {voiceMessages.length > 0 && (
          <div className="space-y-2 mb-2">
            {voiceMessages.map((voice, index) => (
              <VoiceMessage
                key={`voice-${index}`}
                audioUrl={voice.url}
                duration={voice.duration || 0}
                isOwn={isOwnMessage}
                theme={theme}
                onDownload={() => onAction?.('download', { ...message, media: [voice] })}
                className={clsx(
                  hasVoiceMessage && !message.text && otherMedia.length === 0 ? 'rounded-2xl' : ''
                )}
              />
            ))}
          </div>
        )}

        {/* Texte du message (si présent) */}
        {!isSingleMedia && message.text && (
          isSingleEmoji ? (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="text-[80px] sm:text-[100px] p-4 leading-none flex justify-center items-center"
            >
              <LottieEmoji emoji={message.text} size={64} />
            </motion.div>
          ) : (
            <div className="text-sm leading-relaxed break-words w-auto">
              {formatText}
            </div>
          )
        )}

        {/* Médias non-vocaux (toujours rendus, même si isSingleMedia est vrai) */}
        {otherMedia.length > 0 && (
          <div className={message.text ? 'mt-2' : ''}>
            <MediaDisplay 
              media={otherMedia} 
              isSingleMedia={isSingleMedia && voiceMessages.length === 0}
              openMediaViewer={openMediaViewer}
            />
          </div>
        )}

        {/* Indicateur d'édition */}
        {message.isEdited && (
          <div className={`text-xs opacity-60 mt-1 ${theme.secondaryText}`}>
            modifié
          </div>
        )}

        {/* Réactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {message.reactions.map((reaction, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`
                  flex items-center gap-1 px-2 py-1 rounded-full text-xs
                  ${isOwnMessage ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'}
                  cursor-pointer hover:scale-110 transition-transform
                `}
                onClick={() => onAction?.('reaction', { ...message, reaction: reaction.emoji })}
              >
                <span>{reaction.emoji}</span>
                <span className="font-medium">{reaction.count}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Métadonnées */}
      <div className={clsx(
        'text-[11px] flex items-center justify-end space-x-1',
        message.sender === 'me' ? 'text-blue-100' : theme.secondaryText,
        !isSingleMedia && !hasVoiceMessage ? 
          isSingleEmoji ? 'absolute bottom-1 right-1 bg-black/60 px-1 rounded' : 'mt-1' 
          : 'absolute bottom-1 right-1 bg-black/60 px-1 rounded'
      )}>
        <span>{message.time}</span>
        {message.sender === 'me' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <BsCheck2All className={clsx(
              "text-xs",
              message.isRead ? "text-blue-300" : "opacity-70"
            )} />
          </motion.div>
        )}
      </div>

      {/* Indicateurs d'état */}
      <div className="absolute -top-1 -right-1 flex gap-1">
        {message.isPinned && (
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            className="w-3 h-3 bg-yellow-500 rounded-full"
            title="Message épinglé"
          />
        )}
        {message.isFavorite && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-3 h-3 bg-red-500 rounded-full"
            title="Message favori"
          />
        )}
        {message.isLocked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-3 h-3 bg-gray-500 rounded-full"
            title="Message verrouillé"
          />
        )}
      </div>

      {/* Indicateur de statut en temps réel */}
      {message.status && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`absolute -bottom-1 right-2 text-xs ${theme.secondaryText}`}
        >
          {message.status === 'sending' && (
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-current rounded-full animate-pulse" />
              Envoi...
            </div>
          )}
          {message.status === 'sent' && !message.isRead && (
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-green-500 rounded-full" />
              Envoyé
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default MessageBubble;