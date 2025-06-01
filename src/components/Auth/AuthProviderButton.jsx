import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { Spinner } from '../UI/Spinner';
import { useTheme } from '../Context/ThemeContext';

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring", 
      stiffness: 120, 
      damping: 12 
    } 
  }
};

export const AuthProviderButton = ({ provider, isLoading, onClick }) => {
  const { name, icon, bg, hover, text } = provider;
  const {theme} = useTheme();

  return (
    <motion.button
      variants={itemVariants}
      whileHover={!isLoading && { 
        scale: 1.05,
      }}
      whileTap={!isLoading && { scale: 0.98 }}
      onClick={() => !isLoading && onClick()}
      disabled={isLoading}
      aria-label={`Se connecter avec ${name}`}
      aria-busy={isLoading}
      className={clsx(
        "flex items-center justify-center",
        "p-3 sm:p-4 rounded-xl",
        "transition-all duration-200 ease-in-out",
        isLoading 
          ? "cursor-not-allowed opacity-80" 
          : "cursor-pointer hover:opacity-90",
        bg, hover, text, 
        `border ${theme.borderColor}`,
        "font-medium"
      )}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center w-full"
          >
            <Spinner />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center w-full"
          >
            <span className="mr-2">{icon}</span>
            <span className="inline font-medium text-sm whitespace-nowrap">
              {name}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};