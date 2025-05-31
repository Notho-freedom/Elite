import { useTheme } from './ThemeContext';
import { motion } from 'framer-motion';
import {
  FaGithub, FaDiscord, FaTwitter,
  FaApple, FaMicrosoft, FaLinkedin
} from 'react-icons/fa';
import { SiAuth0 } from 'react-icons/si';
import { useMemo } from 'react';
import clsx from 'clsx';
import { FcGoogle } from 'react-icons/fc';
import { useMediaQuery } from 'react-responsive';

const getProviders = () => ([
  { name: 'Google', icon: <FcGoogle />, bg: 'bg-white', hover: 'hover:bg-gray-100', text: '' },
  { name: 'GitHub', icon: <FaGithub />, bg: 'bg-gray-800', hover: 'hover:bg-gray-700', text: 'text-white' },
  { name: 'Discord', icon: <FaDiscord />, bg: 'bg-indigo-600', hover: 'hover:bg-indigo-700', text: 'text-white' },
  { name: 'Twitter', icon: <FaTwitter />, bg: 'bg-sky-500', hover: 'hover:bg-sky-600', text: 'text-white' },
  { name: 'Apple', icon: <FaApple />, bg: 'bg-gray-100', hover: 'hover:bg-gray-200', text: 'text-black' },
  { name: 'Microsoft', icon: <FaMicrosoft />, bg: 'bg-gray-100', hover: 'hover:bg-gray-200', text: 'text-blue-600' },
  { name: 'LinkedIn', icon: <FaLinkedin />, bg: 'bg-blue-600', hover: 'hover:bg-blue-700', text: 'text-white' },
  { name: 'Auth0', icon: <SiAuth0 />, bg: 'bg-orange-50', hover: 'hover:bg-orange-100', text: 'text-orange-700' },
]);

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 12 } }
};

const SocialLogin = () => {
  const { theme } = useTheme();
  const providers = useMemo(getProviders, []);
  const isDesktop = useMediaQuery({ minWidth: 924 });

  const handleAuth = (provider) => {
    console.log(`🔐 Auth with: ${provider}`);
    // OAuth implementation here
  };

  const haloSize = isDesktop ? 'w-[20rem] h-[20rem]' : 'w-20vw h-20vw'; // Adjusted size for halo
  const svgSize = isDesktop ? 'w-[15rem] h-[15rem]' : 'w-32 h-32'; // Adjusted size for logo

  return (
    <div className={clsx("relative min-h-screen flex items-center justify-center p-6", theme.bgColor)}>

      {/* Logo and Halo positioned in the bottom right corner */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 150, damping: 15 }}
        className={clsx(
          "absolute top-[2%] transform -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center",
          haloSize,
          "bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 shadow-[0_0_30px_10px_rgba(139,92,246,0.6)]",
          "z-10"
        )}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="absolute inset-0 rounded-full border-4 border-white/30"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="absolute inset-0 rounded-full border-2 border-white/20"
        />
        <div className="rounded-full flex items-center justify-center shadow-lg w-full h-full z-20">
          <svg className={clsx(svgSize, "text-white drop-shadow-lg")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
            />
          </svg>
        </div>
        <div
          aria-hidden="true"
          className={clsx(
            "absolute -top-20 left-1/2 transform -translate-x-1/2 rounded-full pointer-events-none",
            haloSize,
            "bg-gradient-to-tr from-purple-400 via-pink-500 to-pink-400 opacity-40",
            "filter blur-[80px] saturate-150"
          )}
          style={{ zIndex: 0 }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-7xl z-30"
      >
        <div className="pt-32 pb-12 px-6 sm:px-10 lg:px-20">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="text-center mb-6"
          >
            <h2 className={clsx("text-4xl font-bold tracking-widest drop-shadow-lg", theme.textColor)}>
              ELITE
            </h2>
            <p className={clsx("text-base sm:text-lg mt-2", theme.secondaryText)}>
              Sign in to unlock your premium experience
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {providers.map(({ name, icon, bg, hover, text }) => (
              <motion.button
                key={name}
                variants={itemVariants}
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleAuth(name.toLowerCase())}
                className={clsx(
                  "flex flex-col sm:flex-row items-center justify-center py-3 px-4 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-lg border border-transparent",
                  bg, hover, text
                )}
              >
                <span className="text-2xl sm:mr-2">{icon}</span>
                <span className={clsx("hidden sm:inline text-sm font-semibold", text)}>
                  {name}
                </span>
              </motion.button>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-10 text-center border-t border-gray-300 dark:border-gray-700 pt-6"
          >
            <p className={clsx("text-xs sm:text-sm", theme.secondaryText)}>
              By continuing, you agree to our{' '}
              <a href="#" className={clsx(theme.baccentText, "hover:underline")}>Terms</a> and{' '}
              <a href="#" className={clsx(theme.baccentText, "hover:underline")}>Privacy Policy</a>.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SocialLogin;
