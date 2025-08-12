import { useTheme } from "./ThemeContext";

export const themeConfig = {
    // Thème par défaut
    default: 'light',
    
    // Définition des thèmes
    themes: {
      light: {
        colors: {
          primary: {
            bg: 'bg-blue-600',
            text: 'text-blue-600',
            border: 'border-blue-600'
          },
          background: 'bg-white',
          text: 'text-gray-800',
          secondaryText: 'text-gray-500',
          border: 'border-gray-200',
          headerBg: 'bg-gray-50',
          inputBg: 'bg-gray-100',
          hoverBg: 'hover:bg-gray-50',
          cardBg: 'bg-white',
          emptyStateText: 'text-gray-500',
          icon: 'text-gray-500'
        },
        sizes: {
          callHistoryWidth: 'w-96',
          borderRadius: 'rounded-lg'
        },
        effects: {
          shadow: 'shadow',
          transition: 'transition-all duration-200'
        }
      },
      dark: {
        colors: {
          primary: {
            bg: 'bg-blue-500',
            text: 'text-blue-400',
            border: 'border-blue-400'
          },
          background: 'bg-gray-900',
          text: 'text-gray-100',
          secondaryText: 'text-gray-300',
          border: 'border-gray-700',
          headerBg: 'bg-gray-800',
          inputBg: 'bg-gray-700',
          hoverBg: 'hover:bg-gray-700',
          cardBg: 'bg-gray-800',
          emptyStateText: 'text-gray-400',
          icon: 'text-gray-300'
        },
        sizes: {
          callHistoryWidth: 'w-96',
          borderRadius: 'rounded-lg'
        },
        effects: {
          shadow: 'shadow-lg',
          transition: 'transition-all duration-200'
        }
      },
      // Vous pouvez ajouter d'autres thèmes comme :
      midnight: {
        colors: {
          primary: {
            bg: 'bg-indigo-700',
            text: 'text-indigo-300',
            border: 'border-indigo-500'
          },
          background: 'bg-gray-950',
          text: 'text-gray-100',
          secondaryText: 'text-gray-400',
          border: 'border-gray-800',
          headerBg: 'bg-gray-900',
          inputBg: 'bg-gray-800',
          hoverBg: 'hover:bg-gray-800',
          cardBg: 'bg-gray-900',
          emptyStateText: 'text-gray-500',
          icon: 'text-indigo-300'
        },
        sizes: {
          callHistoryWidth: 'w-96',
          borderRadius: 'rounded-lg'
        },
        effects: {
          shadow: 'shadow-xl shadow-indigo-900/20',
          transition: 'transition-all duration-300'
        }
      }
    },
  
    // Classes communes qui ne changent pas entre les thèmes
    baseStyles: {
      focus: 'focus:outline-none focus:ring-2 focus:ring-opacity-50',
      disabled: 'opacity-50 cursor-not-allowed'
    }
  };
  
  // Helper function pour accéder aux styles du thème
  export const getThemeStyles = (themeName) => {
    const theme = themeConfig.themes[themeName] || themeConfig.themes[themeConfig.default];
    return {
      ...theme,
      baseStyles: themeConfig.baseStyles,
      // Méthodes utilitaires
      getColor: (colorKey) => theme.colors[colorKey] || '',
      getSize: (sizeKey) => theme.sizes[sizeKey] || '',
      getEffect: (effectKey) => theme.effects[effectKey] || ''
    };
  };
  
  // Hook personnalisé pour utiliser le thème
  export const useThemeStyles = () => {
    const { theme } = useTheme(); // Utilise le contexte de thème existant
    return getThemeStyles(theme);
  };