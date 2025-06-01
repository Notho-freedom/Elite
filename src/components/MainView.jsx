import CallHistory from "./CallHistory";
import DiscussionList from "./DiscussionList";
import ChatPage from './ChatPage';
import CallPanel from './CallPanel';
import SharePopup from './SharePopup';
import VideoArea from './VideoArea';
import VerticalControls from './VerticalControls';
import { useEffect, useState } from "react";
import Profile from "./chat/Profile";
import LoadingChat from "./LoadingChat";
import { useTheme } from "./Context/ThemeContext";
import { SocialLogin } from "./Auth/SocialLogin";

const MainView = ({
    activeChat,
    setActiveChat,
    activeTab,
    setActiveTab,
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
    setActiveCall,
    setIsLogin,
    isLogin,
}) => {
    const [profile, setProfile] = useState(false);
    const {theme}=useTheme();

    useEffect(() => {
        if (!activeChat && !profile && isLogin) {
            setActiveTab('chats');
        }
    }, [activeChat, profile, setActiveTab, isLogin]);

    // View 2: Active call (prioritaire, prend tout l'écran)
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

    // Disposition pour grands écrans (lg: 1024px et plus)
    if (window.innerWidth >= 720 && isLogin && activeTab === 'chats') {
        return (
            <div className="flex h-screen">

                {/* Liste des discussions (1/4 de l'écran) */}
                <div className={`flex flex-shrink border-r ${theme.borderColor}`}>
                    <DiscussionList 
                        discussions={sortedDiscussions} 
                        setActiveChat={setActiveChat}
                        isWideLayout={true}
                    />
                </div>
                
                {/* Zone de chat (reste de l'écran) */}
                <div className="flex-1">
                    {activeChat?.name ? (
                        <ChatPage 
                            activeChat={activeChat} 
                            setActiveChat={setActiveChat} 
                            messages={[]} 
                            setActiveTab={setActiveTab} 
                            setProfile={setProfile}
                            isWideLayout={true}
                        />
                    ) : (
                        <LoadingChat />
                    )}
                    </div>
                </div>
            );
    }

    // View 1: Active chat (affichage mobile/tablette)
    if (activeChat?.name && !profile) {
        return <ChatPage activeChat={activeChat} setActiveChat={setActiveChat} messages={[]} setActiveTab={setActiveTab} setProfile={setProfile} />;
    }

    // View 3: Tab navigation (affichage mobile/tablette)
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
            return <SocialLogin setIsLogin={setIsLogin} setActiveTab={setActiveTab} />;
        case 'profile':
            return <Profile user={activeChat} onClose={() => setProfile(false)} />;
        default:
            return <LoadingChat />;
    }
};

export default MainView;