// utils/renderEmoji.js
import twemoji from 'twemoji';

export const renderEmoji = (text) => {
  return {
    __html: twemoji.parse(text, {
      folder: 'svg',
      ext: '.svg',
      base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/',
      attributes: () => ({ draggable: 'false', class: 'inline h-[1em] align-middle' })
    }),
  };
};
