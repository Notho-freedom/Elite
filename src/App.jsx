import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import MainView from './components/MainView';
import MainTopbar from './components/MainTopbar';
import clsx from 'clsx';
import { useApp } from './components/Context/AppContext';
import { useAuth } from './components/Context/AuthContext';

const App = () => {
  const { theme, loading, authLoading, isAuthenticated } = useApp();
  const { user } = useAuth();

  // Afficher l'écran de chargement seulement pendant l'initialisation de l'auth
  // et pas pendant le chargement des données
  const shouldShowLoading = authLoading;

  return (
    <div className={`relative w-full h-screen overflow-hidden ${theme.bgColor}`}>
      <AnimatePresence>
        {shouldShowLoading ? (
          <LoadingScreen theme={theme} />
        ) : (
          <div className="flex w-full h-full">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              {isAuthenticated && user && (
                <MainTopbar
                  appName="ELITE"
                  theme={theme}
                  onSettings={() => console.log("Open settings")}
                  onUser={() => console.log("Open profile")}
                  onAI={() => console.log("Summon SkyOS AI")}
                />
              )}
              <main className="flex-1 overflow-hidden">
                <MainView />
              </main>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LoadingScreen = ({ theme }) => (
  <motion.div
    className={clsx("flex items-center justify-center h-screen", theme.bgColor)}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="border-4 border-amber-400 rounded-full w-12 h-12"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1 }}
    />
  </motion.div>
);

export default App;
