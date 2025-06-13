import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import MainView from './components/MainView';
import MainTopbar from './components/MainTopbar';
import clsx from 'clsx';
import { useApp } from './components/Context/AppContext';

const App = () => {
  const { theme, loading, isLogin } = useApp();

  return (
    <div className={`relative w-full h-screen overflow-hidden ${theme.bgColor}`}>
      <AnimatePresence>
        {loading ? (
          <LoadingScreen theme={theme} />
        ) : (
          <div className="flex w-full h-full">
            {isLogin && (
              <>
                <MainTopbar
                  appName="ELITE"
                  theme={theme}
                  onSettings={() => console.log("Open settings")}
                  onUser={() => console.log("Open profile")}
                  onAI={() => console.log("Summon SkyOS AI")}
                />
                <Sidebar />
              </>
            )}

            <main className="flex-1 overflow-hidden">
              <MainView />
            </main>
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
