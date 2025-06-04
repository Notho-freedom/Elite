// theme.js
const light = {
  w: '',
  bgColor: 'bg-white',
  textColor: 'text-gray-900',
  secondaryText: 'text-gray-600',
  borderColor: 'border-gray-200',
  hoverBg: 'hover:bg-gray-50',
  headerBg: 'bg-white',
  inputBg: 'bg-gray-50 text-gray-900',
  emptyStateText: 'text-gray-500',
  searchHover: 'hover:bg-gray-100',
  filterHover: 'hover:text-gray-700',
  clearAllText: 'text-red-500 hover:text-red-700',
  successText: 'text-green-600',
  missedText: 'text-red-600',
  
  // Couleurs dorées
  accentText: 'text-white',
  accentColor: 'amber-600',
  accentBg: 'bg-gradient-to-r from-amber-500 to-yellow-500',
  accentShadow: 'shadow-[0_0_15px_rgba(212,175,55,0.5)]',
  focusRing: 'focus:ring-amber-400',
  baccentText: 'text-amber-600',
  bfilterHover: 'hover:bg-amber-50 hover:text-amber-700',
  
  // Nouveaux éléments pour la palette noir/blanc/or
  goldText: 'text-amber-600',
  goldBg: 'bg-amber-500',
  goldBorder: 'border-amber-400',
  darkText: 'text-gray-900',
  darkBg: 'bg-gray-900',
  lightText: 'text-white',
  lightBg: 'bg-white',
  
  messageBg: 'bg-white',
  buttonPrimary: 'bg-gray-900 text-white hover:bg-gray-800',
  buttonSecondary: 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50',
  buttonGold: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600'
};

const dark = {
  w: '',
  bgColor: 'bg-gray-900',
  textColor: 'text-gray-100',
  secondaryText: 'text-gray-400',
  borderColor: 'border-gray-700',
  hoverBg: 'hover:bg-gray-800',
  headerBg: 'bg-gray-900',
  inputBg: 'bg-gray-800 text-white',
  emptyStateText: 'text-gray-500',
  searchHover: 'hover:bg-gray-700',
  filterHover: 'hover:text-gray-300',
  clearAllText: 'text-red-400 hover:text-red-300',
  successText: 'text-green-400',
  missedText: 'text-red-400',
  
  // Couleurs dorées
  accentText: 'text-white',
  accentColor: 'amber-500',
  accentBg: 'bg-gradient-to-r from-amber-600 to-yellow-500',
  accentShadow: 'shadow-[0_0_15px_rgba(245,158,11,0.6)]',
  focusRing: 'focus:ring-amber-500',
  baccentText: 'text-amber-400',
  bfilterHover: 'hover:bg-gray-800 hover:text-amber-300',
  
  // Nouveaux éléments pour la palette noir/blanc/or
  goldText: 'text-amber-400',
  goldBg: 'bg-amber-600',
  goldBorder: 'border-amber-500',
  darkText: 'text-gray-100',
  vdarkText: 'text-gray-900',
  darkBg: 'bg-gray-800',
  lightText: 'text-gray-900',
  lightBg: 'bg-gray-100',
  
  messageBg: 'bg-gray-800',
  buttonPrimary: 'bg-amber-600 text-white hover:bg-amber-700',
  buttonSecondary: 'bg-gray-800 text-white border border-gray-700 hover:bg-gray-700',
  buttonGold: 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white hover:from-amber-700 hover:to-yellow-700'
};

export const theme = { light, dark };