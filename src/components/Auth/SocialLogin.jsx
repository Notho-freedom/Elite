import { useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { GoldenParticles } from '../Particles/GoldenParticles';
import { AuthProviders } from './Providers';
import { TABS, useApp } from '../Context/AppContext';
import { useAuth } from '../Context/AuthContext';

export const SocialLogin = () => {
  const { switchTab, theme } = useApp();
  const { signInWithOAuth, loading, error } = useAuth();
  const [loadingProvider, setLoadingProvider] = useState(null);

  const handleAuth = async (provider) => {
    try {
      setLoadingProvider(provider);
      console.log(`🔐 Auth with: ${provider}`);

      const result = await signInWithOAuth(provider);
      
      if (result.success) {
        console.log('✅ Connexion réussie avec', provider);
        switchTab(TABS.CHATS);
      } else {
        console.error('❌ Erreur de connexion:', result.error);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la connexion:', error);
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className={clsx(
      "relative min-h-screen flex items-center justify-center p-4 sm:p-6 font-serif",
      theme.bgColor
    )}>
      <Logo />
      <GoldenParticles />
      
      <MainContent 
        theme={theme} 
        loadingProvider={loadingProvider} 
        onAuth={handleAuth}
        error={error}
        loading={loading}
      />
    </div>
  );
};

const Logo = () => (
  <motion.div 
    className='top-[3vh] absolute fixed-top'
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
  >
    <motion.img 
      src='/logoo.png' 
      alt="Logo"
      className="w-[28vh] filter drop-shadow-[0_0_4px_rgba(212,175,55,0.6)]"
      whileHover={{ scale: 1.05 }}
    />
  </motion.div>
);

const MainContent = ({ theme, loadingProvider, onAuth, error, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="relative w-full max-w-2xl z-30"
  >
    <Header theme={theme} />
    <div className="pt-[2vh] px-4 sm:px-6">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
        >
          {error}
        </motion.div>
      )}
      <AuthProviders loadingProvider={loadingProvider} onAuth={onAuth} />
      <Footer theme={theme} />
    </div>
  </motion.div>
);

const Header = ({ theme }) => (
  <motion.div
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
    className="text-center mb-[2vh]"
  >
    <div className="text-[5vh] flex items-center justify-center mt-[25vh]">
      <motion.span 
        className={clsx(
          "font-bold tracking-wider",
          "bg-clip-text text-transparent",
          "bg-gradient-to-r from-amber-400 via-amber-400 to-yellow-500",
          "font-playfair drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]"
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        E
      </motion.span>
      <motion.span 
        className={clsx(
          " tracking-wider",
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
        " text-xs md:text-sm max-w-md mx-auto font-montserrat font-normal mt-[5vh]", 
        theme.textColor
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      Sign in to unlock your premium experience
    </motion.p>
  </motion.div>
);

const Footer = ({ theme }) => (
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
);