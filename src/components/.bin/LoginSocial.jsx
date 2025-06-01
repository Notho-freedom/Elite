import { useTheme } from '../Context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaGithub, FaDiscord, FaTwitter,
  FaApple, FaMicrosoft, FaLinkedin,
  FaFacebookF
} from 'react-icons/fa';
import { SiAuth0 } from 'react-icons/si';
import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { FcGoogle } from 'react-icons/fc';

const PROVIDERS = [
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
    name: 'Facebook', 
    icon: <FaFacebookF className="text-xl sm:text-2xl" />, 
    bg: 'bg-blue-600', 
    hover: 'hover:bg-blue-700', 
    text: 'text-white' 
  }
];

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
    className="h-5 w-5 border-2 border-t-transparent border-amber-400 rounded-full"
  />
);

const AuthProviderButton = ({ 
  provider, 
  loadingProvider, 
  onClick,
  theme 
}) => {
  const { name, icon, bg, hover, text } = provider;
  const isLoading = loadingProvider === name.toLowerCase();

  return (
    <motion.button
      key={name}
      variants={itemVariants}
      whileHover={!isLoading && { 
        scale: 1.05,
        boxShadow: "0 4px 12px rgba(212, 175, 55, 0.3)"
      }}
      whileTap={!isLoading && { scale: 0.98 }}
      onClick={() => !isLoading && onClick(name.toLowerCase())}
      disabled={isLoading}
      aria-label={`Se connecter avec ${name}`}
      aria-busy={isLoading}
      className={clsx(
        "flex items-center justify-center",
        "p-3 sm:p-4 rounded-xl",
        "transition-all duration-200 ease-in-out",
        "border",
        isLoading 
          ? "cursor-not-allowed opacity-80" 
          : "cursor-pointer hover:opacity-90",
        bg, hover, text,
        theme.borderColor,
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
            <span className="hidden sm:inline font-medium text-sm whitespace-nowrap">
              {name}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

const GoldenParticle = ({ id }) => {
  const duration = 10 + Math.random() * 15;
  const delay = Math.random() * 8;
  const size = 2 + Math.random() * 3;
  const startX = Math.random() * 100;
  const startY = Math.random() * 100;
  
  const colors = [
    "bg-amber-300", 
    "bg-yellow-400", 
    "bg-amber-200", 
    "bg-yellow-300"
  ];

  return (
    <motion.div
      key={id}
      initial={{
        opacity: 0,
        scale: 0,
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
        rotate: 0
      }}
      animate={{
        opacity: [0, 0.8, 0],
        scale: [0, 1.5, 0],
        x: [startX, startX + (Math.random() * 40 - 20), startX + (Math.random() * 60 - 30)],
        y: [startY, startY + (Math.random() * 40 - 20), startY + (Math.random() * 60 - 30)],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut",
        delay: delay,
        times: [0, 0.5, 1]
      }}
      className={clsx(
        "absolute rounded-full",
        colors[id % 4],
        "blur-[1px]",
        "z-0"
      )}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        left: `${startX}%`,
        top: `${startY}%`,
        boxShadow: `0 0 ${size*2}px ${size/2}px rgba(245, 158, 11, 0.3)`
      }}
    />
  );
};

const SocialLogin = ({ setIsLogin, setActiveTab }) => {
  const { theme } = useTheme();
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
      "relative min-h-screen flex items-center justify-center p-4 sm:p-6 font-serif",
      theme.bgColor
    )}>
      {/* Logo avec effet doré */}
      <motion.div 
        className='top-[2vh] absolute fixed-top'
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.img 
          src='/logoo.png' 
          alt="Logo"
          className="filter drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]"
          whileHover={{ scale: 1.05 }}
        />
      </motion.div>

      {/* Particules dorées */}
      {[...Array(24)].map((_, i) => (
        <GoldenParticle key={i} id={i} />
      ))}

      {/* Contenu principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-2xl z-30 mt-[vh]"
      >
        <div className="pt-[5vh] px-4 sm:px-6">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="text-center mb-[3vh]"
          >
            <div className="flex items-center justify-center">
              <motion.span 
                className={clsx(
                  "text-[4vh] font-bold tracking-wider",
                  "bg-clip-text text-transparent",
                  "bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500",
                  "font-playfair"
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                E
              </motion.span>
              <motion.span 
                className={clsx(
                  "text-[4vh] tracking-wider",
                  theme.textColor,
                  "font-playfair font-normal"
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                LITE
              </motion.span>
            </div>
            <motion.p 
              className={clsx(
                "text-sm sm:text-base max-w-md mx-auto font-montserrat font-normal", 
                theme.textColor
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
            className="grid grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
          >
            {PROVIDERS.map((provider) => (
              <AuthProviderButton
                key={provider.name}
                provider={provider}
                loadingProvider={loadingProvider}
                onClick={handleAuth}
                theme={theme}
              />
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-10 text-center border-t pt-6"
            style={{ borderColor: theme.borderColor.replace('border-', '') }}
          >
            <p className={clsx(
              "text-xs sm:text-sm max-w-md mx-auto font-montserrat",
              theme.textColor
            )}>
              By continuing, you agree to our{' '}
              <a href="#" className={clsx(
                theme.goldText,
                "hover:text-amber-400 hover:underline font-medium"
              )}>Terms</a> and{' '}
              <a href="#" className={clsx(
                theme.goldText,
                "hover:text-amber-400 hover:underline font-medium"
              )}>Privacy Policy</a>.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SocialLogin;