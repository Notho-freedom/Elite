import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import useFetchDiscussions from './components/hooks/useFetchDiscussions';
import MainView from './components/MainView';
import { useTheme } from './components/Context/ThemeContext';
import clsx from 'clsx';
import MainTopbar from './components/MainTopbar';

const App = () => {
  const { theme } = useTheme();
  const { discussions, loading, error, fetchRandomUsers, sortedDiscussions } = useFetchDiscussions();

  const [activeCall, setActiveCall] = useState(null);
  const [activeTab, setActiveTab] = useState('login');
  const [activeChat, setActiveChat] = useState(null);
  const [isLogin, setIsLogin] = useState(false);

  // Gestion des appels
  const callHandlers = {
    toggleMute: () => setActiveCall(prev => ({ ...prev, isMuted: !prev.isMuted })),
    toggleVideo: () => setActiveCall(prev => ({ ...prev, isVideoOn: !prev.isVideoOn })),
    endCall: () => setActiveCall(null),
  };


  useEffect(() => {
    fetchRandomUsers();
  }, [fetchRandomUsers]);

  return (
    <div className={`relative w-full h-screen overflow-hidden ${theme.bgColor}`}>
      <AnimatePresence>
        {loading ? (
          <LoadingScreen theme={theme} />
        ) : (
          <div className="flex w-full h-full">
            {/* Sidebar conditionnelle */}
            {isLogin && (

              <>
              <MainTopbar
                appName="ELITE"
                theme={theme}
                onSettings={() => console.log("Open settings")}
                onUser={() => console.log("Open profile")}
                onAI={() => console.log("Summon SkyOS AI")}
              />



              <Sidebar 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                activeChat={activeChat}
                setActiveChat={setActiveChat}
                isLogin={isLogin}
              />

          </>
            )}

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden">
              <MainView
                activeChat={activeChat}
                setActiveChat={setActiveChat}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                sortedDiscussions={sortedDiscussions}
                activeCall={activeCall}
                setActiveCall={setActiveCall}
                setIsLogin={setIsLogin}
                isLogin={isLogin}
                callHandlers={callHandlers}
              />
            </main>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LoadingScreen = ({theme}) => (
  <motion.div
    className={clsx("flex items-center justify-center h-screen",theme.bgColor)}
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