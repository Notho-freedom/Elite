import { useTheme } from './ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaGithub, FaDiscord, FaTwitter,
  FaApple, FaMicrosoft, FaLinkedin
} from 'react-icons/fa';
import { SiAuth0 } from 'react-icons/si';
import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { FcGoogle } from 'react-icons/fc';

const getProviders = () => ([
  { 
    name: 'Google', 
    icon: <FcGoogle className="text-xl sm:text-2xl" />, 
    bg: 'bg-white', 
    hover: 'hover:bg-gray-100', 
    text: '' 
  },
  { 
    name: 'GitHub', 
    icon: <FaGithub className="text-xl sm:text-2xl" />, 
    bg: 'bg-gray-800', 
    hover: 'hover:bg-gray-700', 
    text: 'text-white' 
  },
  { 
    name: 'Discord', 
    icon: <FaDiscord className="text-xl sm:text-2xl" />, 
    bg: 'bg-indigo-600', 
    hover: 'hover:bg-indigo-700', 
    text: 'text-white' 
  },
  { 
    name: 'Twitter', 
    icon: <FaTwitter className="text-xl sm:text-2xl" />, 
    bg: 'bg-sky-500', 
    hover: 'hover:bg-sky-600', 
    text: 'text-white' 
  },
  { 
    name: 'Apple', 
    icon: <FaApple className="text-xl sm:text-2xl" />, 
    bg: 'bg-gray-100', 
    hover: 'hover:bg-gray-200', 
    text: 'text-black' 
  },
  { 
    name: 'Microsoft', 
    icon: <FaMicrosoft className="text-xl sm:text-2xl" />, 
    bg: 'bg-gray-100', 
    hover: 'hover:bg-gray-200', 
    text: 'text-blue-600' 
  },
  { 
    name: 'LinkedIn', 
    icon: <FaLinkedin className="text-xl sm:text-2xl" />, 
    bg: 'bg-blue-600', 
    hover: 'hover:bg-blue-700', 
    text: 'text-white' 
  },
  { 
    name: 'Auth0', 
    icon: <SiAuth0 className="text-xl sm:text-2xl" />, 
    bg: 'bg-orange-50', 
    hover: 'hover:bg-orange-100', 
    text: 'text-orange-700' 
  },
]);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    }
  }
};

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

const Spinner = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ 
      repeat: Infinity, 
      duration: 0.8, 
      ease: "linear" 
    }}
    className="h-5 w-5 border-2 border-t-transparent border-white rounded-full"
  />
);

const SocialLogin = ({ setIsLogin, setActiveTab }) => {
  const { theme } = useTheme();
  const providers = useMemo(getProviders, []);
  const [loadingProvider, setLoadingProvider] = useState(null);

  const handleAuth = async (provider) => {
    setLoadingProvider(provider);
    console.log(`🔐 Auth with: ${provider}`);
    
    // Simulate async auth process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setLoadingProvider(null);
    setIsLogin(true);
    setActiveTab('chats');
  };

  return (
    <div className={clsx(
      "relative min-h-screen flex items-center justify-center p-4 sm:p-6",
      theme.bgColor
    )}>
      {/* Animated Logo and Halo */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          boxShadow: "0 0 7px 7px rgba(139, 92, 246, 0.6)"
        }}
        transition={{ 
          type: "spring", 
          stiffness: 150, 
          damping: 15,
          boxShadow: {
            duration: 2,
            repeat: Infinity,
            repeatType: "mirror"
          }
        }}
        className={clsx(
          "absolute top-[2%] sm:top-[10%] transform -translate-x-1/2",
          "rounded-full flex items-center justify-center",
          "w-[25vh] h-[25vh]",
          "bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600",
          "z-10",
          "ring-4 ring-purple-400/30"
        )}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ 
            repeat: Infinity, 
            duration: 20, 
            ease: "linear" 
          }}
          className="absolute inset-0 rounded-full border-4 border-white/30"
        />


        <motion.div
          animate={{ rotate: -360 }}
          transition={{ 
            repeat: Infinity, 
            duration: 25, 
            ease: "linear" 
          }}
          className="absolute inset-0 rounded-full border-2 border-white/20"
        />
        <div className="rounded-full flex items-center justify-center w-full h-full z-20">
          <svg 
            className="w-full h-full text-white drop-shadow-lg" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2}
              d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
            />
          </svg>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ 
            opacity: [0.3, 0.5, 0.3],
            scale: [0.9, 1.1, 0.9]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={clsx(
            "absolute -top-20 transform -translate-x-1/2 rounded-full pointer-events-none",
            "w-[25vh] h-[25vh]",
            "bg-gradient-to-tr from-purple-500 via-pink-500 to-rose-500",
            "filter blur-[70px] sm:blur-[90px] saturate-200",
            "z-0"
          )}
        />
      </motion.div>

  {/* Floating particles */}
  {[...Array(8)].map((_, i) => (
    <motion.div
      key={i}
      initial={{
        opacity: 0,
        scale: 0,
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50
      }}
      animate={{
        opacity: [0, 0.6, 0],
        scale: [0, 1, 0],
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100
      }}
      transition={{
        duration: Math.random() * 10 + 10,
        repeat: Infinity,
        repeatType: "reverse",
        delay: Math.random() * 5
      }}
      className={clsx(
        "absolute rounded-full",
        i % 3 === 0 ? "bg-purple-400" : 
        i % 3 === 1 ? "bg-pink-400" : "bg-indigo-400",
        "w-2 h-2 sm:w-3 sm:h-3",
        "blur-[1px]"
      )}
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`
      }}
    />
  ))}
      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-2xl z-30 mt-[27%]"
      >
        <div className="pt-12 pb-8 sm:pt-16 sm:pb-12 px-4 sm:px-6">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="text-center mb-8"
          >
            <motion.h2 
              className={clsx(
                "text-[6vh] font-bold tracking-wider",
                "bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500",
                "mb-3"
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              ELITE
            </motion.h2>
            <motion.p 
              className={clsx(
                "text-sm sm:text-base mt-2 max-w-md mx-auto",
                theme.secondaryText
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Sign in to unlock your premium experience
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-clos-4 gap-3 sm:gap-4"
          >
            {providers.map(({ name, icon, bg, hover, text }) => {
              const isLoading = loadingProvider === name.toLowerCase();
              return (
                <motion.button
                  key={name}
                  variants={itemVariants}
                  whileHover={{ 
                    scale: isLoading ? 1 : 1.05,
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                  }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  onClick={() => handleAuth(name.toLowerCase())}
                  disabled={loadingProvider !== null}
                  className={clsx(
                    "flex items-center justify-center",
                    "p-2 rounded-xl",
                    "transition-all duration-200",
                    "border border-opacity-20",
                    isLoading ? "cursor-not-allowed" : "cursor-pointer",
                    bg, hover, text,
                    theme.borderColor
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
                        <span className="hidden sm:inline font-medium text-sm">
                          {name}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-10 text-center border-t pt-6"
          >
            <p className={clsx(
              "text-xs sm:text-sm max-w-md mx-auto",
              theme.secondaryText
            )}>
              By continuing, you agree to our{' '}
              <a href="#" className={clsx(
                theme.accentText, 
                "hover:underline font-medium"
              )}>Terms</a> and{' '}
              <a href="#" className={clsx(
                theme.accentText, 
                "hover:underline font-medium"
              )}>Privacy Policy</a>.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SocialLogin;