import CallHistory from "./CallHistory";
import DiscussionList from "./DiscussionList";
import ChatPage from './ChatPage';
import CallPanel from './CallPanel';
import SharePopup from './SharePopup';
import VideoArea from './VideoArea';
import VerticalControls from './VerticalControls';
import SocialLogin from "./LoginSocial";

const MainView = ({
    activeChat,
    setActiveChat,
    activeTab,
    sortedDiscussions,
    activeCall,
    isSilenced,
    setIsSilenced,
    shareLink,
    setShareLink,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    endCall,
    showPopup,
    setShowPopup,
    setActiveCall
  }) => {
  
    // Vue 1 : chat actif
    if (activeChat?.name) {
      return <ChatPage activeChat={activeChat} setActiveChat={setActiveChat} messages={[]} />;
    }
  
    // Vue 2 : appel actif
    if (activeCall?.name) {
      return (
        <>
          <CallPanel
            activeCall={activeCall} isSilenced={isSilenced}
            setIsSilenced={setIsSilenced} shareLink={shareLink}
            setShareLink={setShareLink} toggleMute={toggleMute}
            toggleVideo={toggleVideo} toggleScreenShare={toggleScreenShare}
            endCall={endCall}
          />
          {showPopup && (
            <SharePopup activeCall={activeCall} onClose={() => setShowPopup(false)} />
          )}
          <VideoArea activeCall={activeCall} />
          <VerticalControls />
        </>
      );
    }
  
    // Vue 3 : navigation par onglets
    switch (activeTab) {
      case 'chats':
        return <DiscussionList discussions={sortedDiscussions} setActiveChat={setActiveChat} />;
      case 'calls':
        return <CallHistory discussions={sortedDiscussions} setActiveCall={setActiveCall} />;
      case 'status':
        return <div className="flex flex-col items-center justify-center flex-1 text-white">🟢 Status - En cours de dev</div>;
      case 'settings':
        return <div className="flex flex-col items-center justify-center flex-1 text-white">⚙️ Settings - À venir</div>;
      case 'login':
        return <SocialLogin />;
      default:
        return null;
    }
  };

  export default MainView;