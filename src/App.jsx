import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import DiscussionList from './components/DiscussionList';
import CallPanel from './components/CallPanel';
import VideoArea from './components/VideoArea';
import SharePopup from './components/SharePopup';
import VerticalControls from './components/VerticalControls';
import CallHistory from './components/CallHistory';
import { useTheme } from './components/ThemeContext';
import ChatPage from './components/ChatPage';


const FaceTimeApp = () => {
  const [activeCall, setActiveCall] = useState({
    name: '',
    avatar: '',
    status: 'FaceTime Video',
    isMuted: false,
    isVideoOn: true,
    isScreenSharing: false,
  });

  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(true);
  const [activeTab, setActiveTab] = useState('chats');
  const [activeChat, setActiveChat] = useState({
    name: '',
    avatar: '',
  });
  const [isSilenced, setIsSilenced] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const { theme } = useTheme();

  // Génère un message aléatoire
  const generateRandomMessage = () => {
    const messages = [
      "Hey, are you available for a quick call?",
      "Just sent you the documents",
      "Let's schedule a meeting next week",
      "Did you see my last message?",
      "Thanks for your help!",
      "Can we talk about the project?",
      "I'll call you later",
      "Check out this cool feature"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // Génère un timestamp ISO aléatoire dans les 7 derniers jours
  const generateRandomTime = () => {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const randomTime = new Date(sevenDaysAgo + Math.random() * (now - sevenDaysAgo));
    return randomTime.toISOString();
  };

  // Format d'affichage friendly (ex: "14:35", "Yesterday", "Mon")
  const formatDisplayTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();

    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Même jour : afficher heure
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (diffDays === 1) {
      return 'Yesterday';
    }
    if (diffDays < 7) {
      // Affiche le jour court (ex: Mon, Tue)
      return date.toLocaleDateString(undefined, { weekday: 'short' });
    }
    // Sinon date classique
    return date.toLocaleDateString();
  };

  // Fetch users + préparer discussions
  const fetchRandomUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('https://randomuser.me/api/?results=20&inc=name,picture,email');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const { results } = await response.json();

      const users = results.map((user, idx) => {
        const fullName = `${user.name?.first ?? 'Unknown'} ${user.name?.last ?? 'User'}`;
        const unread = Math.random() > 0.5;
        const time = generateRandomTime();

        return {
          id: idx + 1,
          name: fullName,
          avatar: user.picture?.medium ?? '',
          lastMessage: generateRandomMessage(),
          time,              // timestamp ISO
          timeDisplay: formatDisplayTime(time),  // string friendly pour l'affichage
          unread,
          isRead: !unread && Math.random() > 0.5,
          isOnline: Math.random() > 0.5,
          actu: Math.random() > 0.5,
        };
      });

      setDiscussions(users);
      setError(null);
    } catch (err) {
      setError(err.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRandomUsers();
  }, [fetchRandomUsers]);

  // Call controls
  const toggleMute = () => setActiveCall(prev => ({ ...prev, isMuted: !prev.isMuted }));
  const toggleVideo = () => setActiveCall(prev => ({ ...prev, isVideoOn: !prev.isVideoOn }));
  const toggleScreenShare = () => setActiveCall(prev => ({ ...prev, isScreenSharing: !prev.isScreenSharing }));
  const endCall = () => console.log('Call ended');

  // Trier les discussions par date décroissante (les plus récentes en premier)
  const sortedDiscussions = [...discussions].sort(
    (a, b) => new Date(b.time) - new Date(a.time)
  );

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        Loading contacts...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className={`flex w-full h-screen ${theme.bgColor}`}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      {renderContent()}

      {!!activeCall.name && (
        <CallPanel
          activeCall={activeCall}
          isSilenced={isSilenced}
          setIsSilenced={setIsSilenced}
          shareLink={shareLink}
          setShareLink={setShareLink}
          toggleMute={toggleMute}
          toggleVideo={toggleVideo}
          toggleScreenShare={toggleScreenShare}
          endCall={endCall}
        />
      )}

      {activeChat!=null ? (
        <ChatPage
          activeChat={activeChat}
          setActiveChat={setActiveChat}
          messages={[]}
        />
      ):(
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

export default FaceTimeApp;
