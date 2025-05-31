import CallHistory from "./CallHistory";
import DiscussionList from "./DiscussionList";
import ChatPage from './ChatPage';
import CallPanel from './CallPanel';
import SharePopup from './SharePopup';
import VideoArea from './VideoArea';
import VerticalControls from './VerticalControls';
import SocialLogin from "./LoginSocial";
import { useEffect, useState } from "react";
import Profile from "./chat/Profile";
import clsx from "clsx";
import { motion } from 'framer-motion';
import { useTheme } from "./ThemeContext";

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
    if (window.innerWidth >= 1024 && isLogin && activeTab === 'chats') {
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
                        <div className="flex flex-col items-center justify-center h-full p-4 relative overflow-hidden">
                            {/* Animated Background Elements */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.3 }}
                                transition={{ duration: 1 }}
                                className="absolute inset-0 overflow-hidden"
                            >
                                <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-purple-500/20 blur-3xl"></div>
                                <div className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full bg-pink-500/20 blur-3xl"></div>
                            </motion.div>

                            {/* Animated Logo */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ 
                                scale: 1, 
                                opacity: 1,
                                boxShadow: "0 0 7px 7px rgba(139, 92, 246, 0.4)"
                                }}
                                transition={{ 
                                type: "spring", 
                                stiffness: 150, 
                                damping: 15,
                                boxShadow: {
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatType: "mirror"
                                }
                                }}
                                className={clsx(
                                "relative mb-8",
                                "rounded-full flex items-center justify-center",
                                "w-40 h-40 sm:w-48 sm:h-48",
                                "bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600",
                                "z-10",
                                "ring-4 ring-purple-400/30"
                                )}
                            >
                                <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ 
                                    repeat: Infinity, 
                                    duration: 20, 
                                    ease: "linear" 
                                }}
                                className="absolute inset-0 rounded-full border-4 border-white/30"
                                />
                                <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ 
                                    repeat: Infinity, 
                                    duration: 25, 
                                    ease: "linear" 
                                }}
                                className="absolute inset-0 rounded-full border-2 border-white/20"
                                />
                                <div className="rounded-full flex items-center justify-center w-full h-full z-20">
                                <svg 
                                    className="w-full h-full text-white drop-shadow-lg" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2}
                                    d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                                    />
                                </svg>
                                </div>
                            </motion.div>

                            {/* Text with subtle animation */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="text-center z-10"
                            >
                                <h3 className={clsx(
                                "text-2xl sm:text-3xl font-bold mb-2",
                                "bg-clip-text text-transparent",
                                "bg-gradient-to-r from-purple-400 to-pink-400"
                                )}>
                                Sélectionnez une conversation
                                </h3>
                                <p className={clsx(
                                "text-sm sm:text-base max-w-md mx-auto",
                                "text-gray-500 dark:text-gray-400"
                                )}>
                                Choisissez une discussion existante ou démarrez une nouvelle conversation
                                </p>
                            </motion.div>

                            {/* Floating particles */}
                            {[...Array(8)].map((_, i) => (
                                <motion.div
                                key={i}
                                initial={{
                                    opacity: 0,
                                    scale: 0,
                                    x: Math.random() * 100 - 50,
                                    y: Math.random() * 100 - 50
                                }}
                                animate={{
                                    opacity: [0, 0.6, 0],
                                    scale: [0, 1, 0],
                                    x: Math.random() * 200 - 100,
                                    y: Math.random() * 200 - 100
                                }}
                                transition={{
                                    duration: Math.random() * 10 + 10,
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                    delay: Math.random() * 5
                                }}
                                className={clsx(
                                    "absolute rounded-full",
                                    i % 3 === 0 ? "bg-purple-400" : 
                                    i % 3 === 1 ? "bg-pink-400" : "bg-indigo-400",
                                    "w-2 h-2 sm:w-3 sm:h-3",
                                    "blur-[1px]"
                                )}
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`
                                }}
                                />
                            ))}

                            {/* Halo effect */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ 
                                opacity: [0.3, 0.5, 0.3],
                                scale: [0.9, 1.1, 0.9]
                                }}
                                transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                                }}
                                className={clsx(
                                "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
                                "rounded-full pointer-events-none",
                                "w-[300px] h-[300px] sm:w-[400px] sm:h-[400px]",
                                "bg-gradient-to-tr from-purple-500/30 via-pink-500/30 to-rose-500/30",
                                "filter blur-[70px] sm:blur-[90px] saturate-200",
                                "z-0"
                                )}
                            />
                            </div>
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
            return <SocialLogin setIsLogin={setIsLogin} setActiveTab={setActiveTab} />;
    }
};

export default MainView;