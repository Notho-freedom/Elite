import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import useFetchDiscussions from './components/hooks/useFetchDiscussions';
import MainView from './components/MainView';
import { useTheme } from './components/Context/ThemeContext';

const Spinner = () => (
  <motion.div
    className="flex items-center justify-center h-screen bg-gray-900 text-white"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="border-4 border-t-transparent border-white rounded-full w-12 h-12"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
    />
  </motion.div>
);

const App = () => {
  const { theme } = useTheme();
  const {
    discussions,
    loading,
    error,
    fetchRandomUsers,
    sortedDiscussions,
  } = useFetchDiscussions();

  const [activeCall, setActiveCall] = useState({
    name: '', avatar: '', status: 'FaceTime Video',
    isMuted: false, isVideoOn: true, isScreenSharing: false,
  });

  const [showPopup, setShowPopup] = useState(true);
  const [activeTab, setActiveTab] = useState('login');
  const [activeChat, setActiveChat] = useState(null);
  const [isSilenced, setIsSilenced] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    fetchRandomUsers();
  }, [fetchRandomUsers]);

  const toggleMute = () => setActiveCall(prev => ({ ...prev, isMuted: !prev.isMuted }));
  const toggleVideo = () => setActiveCall(prev => ({ ...prev, isVideoOn: !prev.isVideoOn }));
  const toggleScreenShare = () => setActiveCall(prev => ({ ...prev, isScreenSharing: !prev.isScreenSharing }));
  const endCall = () => console.log('Call ended');

  return (
    <div className={`relative w-full h-screen overflow-hidden ${theme.bgColor}`}>
      <AnimatePresence mode="wait">
        {loading ? (
          <Spinner key="spinner" />
        ) : error ? (
          <motion.div
            key="error"
            className="flex items-center justify-center h-screen bg-gray-900 text-red-500"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            Error: {error}
          </motion.div>
        ) : (
          <motion.div
            key="app"
            className="flex w-full h-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >

          {
            isLogin? (
              <motion.div
                className="hidden md:flex md:flex-col md:flex-0 "
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Sidebar
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  activeChat={activeChat}
                  setActiveChat={setActiveChat}
                />
              </motion.div>
            ):(
              <></>
            )
          }

            <motion.div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeChat?.name || activeCall?.name || activeTab}`}
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1}}
                  exit={{ opacity: 1}}
                  transition={{ duration: 0.1 }}
                  className="w-full h-full"
                >
                  <MainView
                    activeChat={activeChat}
                    setActiveChat={setActiveChat}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    sortedDiscussions={sortedDiscussions}
                    activeCall={activeCall}
                    isSilenced={isSilenced}
                    setIsSilenced={setIsSilenced}
                    shareLink={shareLink}
                    setShareLink={setShareLink}
                    toggleMute={toggleMute}
                    toggleVideo={toggleVideo}
                    toggleScreenShare={toggleScreenShare}
                    endCall={endCall}
                    showPopup={showPopup}
                    setShowPopup={setShowPopup}
                    setActiveCall={setActiveCall}
                    setIsLogin={setIsLogin}
                    isLogin={isLogin}
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
