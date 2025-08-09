import { motion, AnimatePresence } from 'framer-motion';
import CallHistory from "./CallHistory";
import EliteDiscussionList from './Enhanced/EliteDiscussionList';
import EnhancedChatPage from './chat/Enhanced/EnhancedChatPage';
import CallInterface from './Elite/Calls/CallInterface';
import Entry from "./Entry";
import Loading from './Loading';
import StatusInterface from './Elite/Status/StatusInterface';
import NativeFeatures from './NativeFeatures';
import GroupInterface from './Elite/Groups/GroupInterface';
import { useApp, TABS } from './Context/AppContext';
import { SocialLogin } from './Auth/SocialLogin';
import { useAuth } from './Context/AuthContext';
import FeatureNotification from './Enhanced/FeatureNotification';
import { useState, useEffect } from 'react';
import Profile from './chat/Profile';
import AvailableUsersList from './UserDiscovery/AvailableUsersList';

const MainView = () => {
  const {
    theme,
    activeTab,
    activeChat,
    isAuthenticated, 
    isMobile,
    showProfile, 
    setShowProfile
  } = useApp();
  
  const { user } = useAuth();
  const [groupInterfaceLoaded, setGroupInterfaceLoaded] = useState(false);

  // Load group interface when needed
  useEffect(() => {
    if (activeTab === TABS.GROUPS && !groupInterfaceLoaded) {
      console.log('Loading GroupInterface...');
      setGroupInterfaceLoaded(true);
    }
  }, [activeTab, groupInterfaceLoaded]);

  // Debug logging for active tab
  useEffect(() => {
    console.log('Active tab changed to:', activeTab);
  }, [activeTab]);

  // Priorité absolue aux états critiques
  if (!isAuthenticated || !user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="h-screen flex items-center justify-center"
      >
        <SocialLogin />
      </motion.div>
    );
  }
  
  
  // Profil en modale animée
  return (
    <>
      <AnimatePresence>
        {showProfile && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowProfile(false)}
          >
            <motion.div
              className={`${theme.messageBg} rounded-2xl max-w-lg w-full mx-4 p-6 shadow-2xl border ${theme.borderColor}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
            >
              <Profile />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layout Desktop vs Mobile */}
      { !isMobile ? (
        <motion.div 
          className="flex h-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className={`${theme.divw} border-r ${theme.borderColor} ${theme.bgColor}`}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <AnimatePresence mode="wait">
              {activeTab === TABS.CHATS && (
                <motion.div
                  key="chats"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <EliteDiscussionList />
                </motion.div>
              )}
              {activeTab === TABS.CALLS && (
                <motion.div
                  key="calls"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <CallHistory />
                </motion.div>
              )}
              {activeTab === TABS.STATUS && (
                <motion.div
                  key="status"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <StatusInterface />
                </motion.div>
              )}
              {activeTab === TABS.GROUPS && (
                <motion.div
                  key="groups"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <GroupInterface />
                </motion.div>
              )}
              {activeTab === TABS.SETTINGS && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <EmptyState />
                </motion.div>
              )}
              {activeTab === TABS.NATIVE && (
                <motion.div
                  key="native"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <NativeFeatures />
                </motion.div>
              )}

              {activeTab === TABS.WORLD && (
                <motion.div
                  key="native"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <AvailableUsersList />
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>
          <motion.div 
            className="flex-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {activeChat ? (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <EnhancedChatPage />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <EmptyState />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="h-screen"
        >
          <AnimatePresence mode="wait">
            {activeChat ? (
              <motion.div
                key="chat-mobile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <EnhancedChatPage />
              </motion.div>
            ) : (
              <motion.div
                key="tabs-mobile"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <AnimatePresence mode="wait">
                  {activeTab === TABS.CHATS && (
                    <motion.div
                      key="chats-mobile"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <EliteDiscussionList />
                    </motion.div>
                  )}
                  {activeTab === TABS.CALLS && (
                    <motion.div
                      key="calls-mobile"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CallHistory />
                    </motion.div>
                  )}
                  {activeTab === TABS.STATUS && (
                    <motion.div
                      key="status-mobile"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <StatusInterface />
                    </motion.div>
                  )}
                  {activeTab === TABS.GROUPS && (
                    <motion.div
                      key="groups-mobile"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <GroupInterface />
                    </motion.div>
                  )}
                  {activeTab === TABS.SETTINGS && (
                    <motion.div
                      key="settings-mobile"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <EmptyState />
                    </motion.div>
                  )}
                  {activeTab === TABS.NATIVE && (
                    <motion.div
                      key="native-mobile"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <NativeFeatures />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Interface d'appel */}
      <CallInterface />
      
      {/* Notification des nouvelles fonctionnalités */}
      <FeatureNotification theme={theme} />
    </>
  );
};


const EmptyState = () => {
  const { activeTab, theme } = useApp();
  return (
    <motion.div 
      className={`flex-1 flex items-center justify-center ${theme.bgColor}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {activeTab === TABS.CHATS && <Entry />}
      {[TABS.CALLS, TABS.STATUS, TABS.SETTINGS, TABS.NATIVE].includes(activeTab) && <Loading />}
    </motion.div>
  );
}

export default MainView;
