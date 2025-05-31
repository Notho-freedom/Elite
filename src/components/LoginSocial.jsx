import { useTheme } from './ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaGithub, FaDiscord, FaTwitter,
  FaApple, FaMicrosoft, FaLinkedin,
  FaFacebook,
  FaFacebookF
} from 'react-icons/fa';
import { SiAuth0 } from 'react-icons/si';
import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { FcGoogle } from 'react-icons/fc';
import AnimatedHaloLogo from './AnimatedHaloLogo';

const getProviders = () => ([
  { 
    name: 'Google', 
    icon: <FcGoogle className="text-xl sm:text-2xl" />, 
    bg: 'bg-gray-200', 
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
    bg: 'bg-gray-200', 
    hover: 'hover:bg-gray-200', 
    text: 'text-black' 
  },
  { 
    name: 'Microsoft', 
    icon: <FaMicrosoft className="text-xl sm:text-2xl" />, 
    bg: 'bg-gray-200', 
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
    bg: 'bg-orange-200', 
    hover: 'hover:bg-orange-100', 
    text: 'text-orange-700' 
  },
  { 
    name: 'FaceBook', 
    icon: <FaFacebookF className="text-xl sm:text-2xl" />, 
    bg: 'bg-blue-600', 
    hover: 'hover:bg-blue-700', 
    text: 'text-white' 
  }
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
    <AnimatedHaloLogo />
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
            "absolute top-[7vh] transform -translate-x-1/2 rounded-full pointer-events-none",
            "w-[25vh] h-[25vh]",
            "bg-gradient-to-tr from-purple-500 via-pink-500 to-rose-500",
            "filter blur-[70px] sm:blur-[90px] saturate-200",
            "z-0"
          )}
        />
  {/* Floating particles */}
  {[...Array(16)].map((_, i) => (
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
        className="relative w-full max-w-2xl z-30 mt-[20vh]"
      >
        <div className="pt-[5vh] px-4 sm:px-6">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="text-center mb-[3vh]"
          >
            <motion.h2 
              className={clsx(
                "text-[6vh] font-bold tracking-wider",
                "bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500",
                "mb-[1vh]",
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              ELITE
            </motion.h2>
            <motion.p 
              className={clsx(
                "text-sm sm:text-base max-w-md mx-auto",
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
            className="grid grid-cols-3 gap-[1.5vh] sm:gap-[4vh]"
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
                    "p-[2vh] rounded-xl",
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
                theme.baccentText, 
                "hover:underline font-medium"
              )}>Terms</a> and{' '}
              <a href="#" className={clsx(
                theme.baccentText, 
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