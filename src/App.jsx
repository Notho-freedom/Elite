// App.js
import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import DiscussionList from './components/DiscussionList';
import CallPanel from './components/CallPanel';
import VideoArea from './components/VideoArea';
import SharePopup from './components/SharePopup';
import VerticalControls from './components/VerticalControls';
import CallHistory from './components/CallHistory';
import ChatPage from './components/ChatPage';
import { useTheme } from './components/ThemeContext';
import useFetchDiscussions from './components/hooks/useFetchDiscussions';

const App = () => {
  const { theme } = useTheme();
  const {
    discussions,
    loading,
    error,
    fetchRandomUsers,
    sortedDiscussions
  } = useFetchDiscussions();

  const [activeCall, setActiveCall] = useState({
    name: '', avatar: '', status: 'FaceTime Video',
    isMuted: false, isVideoOn: true, isScreenSharing: false,
  });
  const [showPopup, setShowPopup] = useState(true);
  const [activeTab, setActiveTab] = useState('chats');
  const [activeChat, setActiveChat] = useState({ name: '', avatar: '' });
  const [isSilenced, setIsSilenced] = useState(false);
  const [shareLink, setShareLink] = useState('');

  useEffect(() => { fetchRandomUsers(); }, [fetchRandomUsers]);

  const toggleMute = () => setActiveCall(prev => ({ ...prev, isMuted: !prev.isMuted }));
  const toggleVideo = () => setActiveCall(prev => ({ ...prev, isVideoOn: !prev.isVideoOn }));
  const toggleScreenShare = () => setActiveCall(prev => ({ ...prev, isScreenSharing: !prev.isScreenSharing }));
  const endCall = () => console.log('Call ended');

  const renderContent = () => {
    switch (activeTab) {
      case 'chats':
        return <DiscussionList discussions={sortedDiscussions} setActiveChat={setActiveChat} />;
      case 'calls':
        return <CallHistory discussions={sortedDiscussions} setActiveCall={setActiveCall} />;
      default:
        return null;
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Loading contacts...</div>;
  if (error) return <div className="flex items-center justify-center h-screen bg-gray-900 text-red-500">Error: {error}</div>;

  return (
    <div className={`flex w-full h-screen ${theme.bgColor}`}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      {renderContent()}

      {!!activeCall.name && (
        <CallPanel
          activeCall={activeCall} isSilenced={isSilenced}
          setIsSilenced={setIsSilenced} shareLink={shareLink}
          setShareLink={setShareLink} toggleMute={toggleMute}
          toggleVideo={toggleVideo} toggleScreenShare={toggleScreenShare}
          endCall={endCall}
        />
      )}

      {activeChat ? (
        <ChatPage activeChat={activeChat} setActiveChat={setActiveChat} messages={[]} />
      ) : (
        <>
          {showPopup && (
            <SharePopup activeCall={activeCall} onClose={() => setShowPopup(false)} />
          )}
          <VideoArea activeCall={activeCall} />
          <VerticalControls />
        </>
      )}
    </div>
  );
};

export default App;