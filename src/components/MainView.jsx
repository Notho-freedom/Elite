import { motion, AnimatePresence } from 'framer-motion';
import CallHistory from "./CallHistory";
import DiscussionList from "./DiscussionList";
import ChatPage from './ChatPage';
import Profile from "./chat/Profile";
import Entry from "./Entry";
import Loading from './Loading';
import Status from './Status/Status';
import { useApp, TABS } from './Context/AppContext';
import { SocialLogin } from './Auth/SocialLogin';
import CallScreen from './CallScreen';

const MainView = () => {
  const {
    theme,
    activeTab,
    activeChat,
    activeCall,
    isLogin, isMobile,
    showProfile, setShowProfile
  } = useApp();
  

  // Priorité absolue aux états critiques
  if (!isLogin) return <SocialLogin />;
  if (activeCall) return <CallScreen />;
  
  // Profil en modale animée
  return (
    <>
      <AnimatePresence>
        {showProfile && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowProfile(false)}
          >
            <motion.div
              className="bg-white rounded-lg max-w-lg w-full p-6"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={e => e.stopPropagation()}
            >
              <Profile />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layout Desktop vs Mobile */}
      { !isMobile ? (
        <div className="flex h-screen">
          <div className={`${theme.divw} border-r ${theme.borderColor}`}>
            {activeTab === TABS.CHATS && <DiscussionList />}
            {activeTab === TABS.CALLS && <CallHistory />}
            {activeTab === TABS.STATUS && <Status />}
            {activeTab === TABS.SETTINGS && <EmptyState />}
          </div>
          <div className="flex-1">
            {activeChat ? (
              <ChatPage />
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      ) : (
        activeChat ? (
          <ChatPage />
        ) : (
          <>
            {activeTab === TABS.CHATS && <DiscussionList />}
            {activeTab === TABS.CALLS && <CallHistory />}
            {activeTab === TABS.STATUS && <Status />}
            {activeTab === TABS.SETTINGS && <EmptyState />}
          </>
        )
      )}
    </>
  );
};


const EmptyState = () => {
  const { activeTab } = useApp();
  return (
    <div className="flex-1 flex items-center justify-center text-gray-500">
      {activeTab === TABS.CHATS && <Entry />}
      {[TABS.CALLS, TABS.STATUS, TABS.GROUPS, TABS.SETTINGS].includes(activeTab) && <Loading />}
    </div>
  );
}

export default MainView;
