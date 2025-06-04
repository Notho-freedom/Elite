import { useMediaQuery } from 'react-responsive';
import CallHistory from "./CallHistory";
import DiscussionList from "./DiscussionList";
import ChatPage from './ChatPage';
import { useState } from "react";
import Profile from "./chat/Profile";
import Entry from "./Entry";
import { useTheme } from "./Context/ThemeContext";
import { SocialLogin } from "./Auth/SocialLogin";
import Loading from './Loading';


const MainView = ({
  activeTab, setActiveTab,
  activeChat, setActiveChat,
  sortedDiscussions, activeCall,
  isLogin, setIsLogin,
  callHandlers, setActiveCall,
}) => {
  const { theme } = useTheme();
  const isDesktop = useMediaQuery({ minWidth: 780 });
  const [showProfile, setShowProfile] = useState(false);


  // 1. Gestion prioritaire des états
  if (!isLogin) return <SocialLogin setIsLogin={setIsLogin} setActiveTab={setActiveTab} />;
  if (activeCall) return <CallScreen activeCall={activeCall} callHandlers={callHandlers} />;
  if (showProfile) return <Profile user={activeChat} onClose={() => setShowProfile(false)} />;

  // 2. Layout Desktop
  if (isDesktop) {
    if (activeTab.includes('chats') || activeTab.includes('calls')){
        return (
            <div className="flex h-screen">
              <div className={`w-1/3 border-r ${theme.borderColor}`}>
                {activeTab === 'chats' && (
                  <DiscussionList discussions={sortedDiscussions} setActiveChat={setActiveChat} />
                )}
                {activeTab === 'calls' && (
                  <CallHistory discussions={sortedDiscussions} setActiveCall={setActiveCall} />
                )}
              </div>
      
              <div className="flex-1">
                {activeChat ? (
                  <ChatPage 
                    activeChat={activeChat} 
                    setActiveChat={setActiveChat}
                    onProfileOpen={() => setShowProfile(true)}
                  />
                ) : (
                  <EmptyState activeTab={activeTab} />
                )}
              </div>
            </div>
          );
    }
  }

  // 3. Layout Mobile
  if (activeChat) {
    return (
      <ChatPage 
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        onProfileOpen={() => setShowProfile(true)}
      />
    );
  }

  return (
    <>
      {activeTab === 'chats' && <DiscussionList discussions={sortedDiscussions} setActiveChat={setActiveChat} />}
      {activeTab === 'calls' && <CallHistory discussions={sortedDiscussions} setActiveCall={setActiveCall} />}
      {activeTab === 'status' && <EmptyState activeTab={activeTab} />}
      {activeTab === 'settings' && <EmptyState activeTab={activeTab} />}
    </>
  );
};

const CallScreen = ({ activeCall, callHandlers }) => (
  <div className="relative h-screen w-screen bg-black">
    {/* VideoArea, CallPanel, etc. */}
    <button onClick={callHandlers.endCall}>End Call</button>
  </div>
);

const EmptyState = ({ activeTab }) => (
  <div className="flex-1 flex items-center justify-center">
    {activeTab === 'chats' && <Entry />}
    {activeTab === 'calls' && <Loading />}
    {activeTab === 'status' && <Loading />}
    {activeTab === 'settings' && <Loading />}
  </div>
);

export default MainView;