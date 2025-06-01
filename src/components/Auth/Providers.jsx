import { PROVIDERS } from './providersConfig';
import { AuthProviderButton } from './AuthProviderButton';
import { motion, AnimatePresence } from 'framer-motion';

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

export const AuthProviders = ({ loadingProvider, onAuth }) => (
  <motion.div
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    className="grid grid-cols-3 gap-[1.8vh] font-montserrat font-normal"
  >
    {PROVIDERS.map((provider) => (
      <AuthProviderButton
        key={provider.name}
        provider={provider}
        isLoading={loadingProvider === provider.name.toLowerCase()}
        onClick={() => onAuth(provider.name.toLowerCase())}
      />
    ))}
  </motion.div>
);