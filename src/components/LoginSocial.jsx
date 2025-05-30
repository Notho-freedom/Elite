import { useTheme } from './ThemeContext';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import {
  FaGithub, FaDiscord, FaTwitter, FaApple,
  FaMicrosoft, FaLinkedin
} from 'react-icons/fa';
import { SiAuth0 } from 'react-icons/si';
import clsx from 'clsx';

const getProviders = () => ([
  { name: 'Google', icon: <FcGoogle />, bg: 'bg-white', hoverBg: 'hover:bg-gray-50', text: 'text-black' },
  { name: 'GitHub', icon: <FaGithub />, bg: 'bg-gray-900', hoverBg: 'hover:bg-gray-800', text: 'text-white' },
  { name: 'Discord', icon: <FaDiscord />, bg: 'bg-indigo-600', hoverBg: 'hover:bg-indigo-700', text: 'text-white' },
  { name: 'Twitter', icon: <FaTwitter />, bg: 'bg-sky-500', hoverBg: 'hover:bg-sky-600', text: 'text-white' },
  { name: 'Apple', icon: <FaApple />, bg: 'bg-gray-100', hoverBg: 'hover:bg-gray-200', text: 'text-black' },
  { name: 'Microsoft', icon: <FaMicrosoft />, bg: 'bg-gray-100', hoverBg: 'hover:bg-gray-200', text: 'text-blue-600' },
  { name: 'LinkedIn', icon: <FaLinkedin />, bg: 'bg-blue-600', hoverBg: 'hover:bg-blue-700', text: 'text-white' },
  { name: 'Auth0', icon: <SiAuth0 />, bg: 'bg-gray-100', hoverBg: 'hover:bg-gray-200', text: 'text-red-800' }
]);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.25 } }
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 120, damping: 12 } }
};

const SocialLogin = () => {
  const { theme, mode } = useTheme();

  const authenticate = (provider) => {
    console.log(`Authenticating with ${provider}`);
    // Logique OAuth ici
  };

  const providers = getProviders(mode, theme.textColor);

  return (
    <div className={`min-h-screen flex items-center justify-center ${theme.bgColor} p-6`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Halo animé */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 150, damping: 15 }}
          className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-72 h-72 rounded-full flex items-center justify-center bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 shadow-[0_0_30px_10px_rgba(139,92,246,0.6)]"
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
          <div className="w-72 h-72 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-64 h-64 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
              />
            </svg>
          </div>
        </motion.div>

        <div className="pt-28 pb-10 px-8 sm:px-12">
          <motion.div
            initial={{ y: -15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 100 }}
            className="text-center mb-6"
          >
            <h2 className={`text-4xl font-extrabold tracking-widest ${theme.textColor} drop-shadow-md`} style={{ letterSpacing: "0.25em" }}>
              ELITE
            </h2>
            <p className={`text-lg font-light ${theme.secondaryText}`}>Sign in to unlock your premium experience</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-4 gap-5 sm:grid-cols-2 sm:gap-6"
          >
            {providers.map((provider) => (
              <motion.button
                key={provider.name}
                variants={itemVariants}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => authenticate(provider.name.toLowerCase())}
                title={`Login with ${provider.name}`}
                className={clsx(
                  "flex flex-col sm:flex-row items-center justify-center p-4 sm:py-3 sm:px-5 rounded-2xl border border-transparent transition-shadow duration-300 shadow-md hover:shadow-lg",
                  provider.bg,
                  provider.hoverBg,
                  provider.text,
                )}
              >
                <span className="text-2xl sm:mr-4">{provider.icon}</span>
                <span className={clsx("hidden sm:inline text-base font-semibold mt-2 sm:mt-0", provider.text)}>
                  {provider.name}
                </span>
              </motion.button>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-10 pt-6 border-t border-gray-300 dark:border-gray-700 text-center"
          >
            <p className={`text-xs sm:text-sm ${theme.secondaryText} select-none`}>
              By continuing, you agree to our{' '}
              <a href="#" className={`${theme.baccentText} hover:underline`}>Terms</a> and{' '}
              <a href="#" className={`${theme.baccentText} hover:underline`}>Privacy Policy</a>.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SocialLogin;
