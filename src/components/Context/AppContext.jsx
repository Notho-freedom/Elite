import { useState, useEffect, useContext, createContext, useCallback } from 'react';
import useFetchDiscussions from './../hooks/useFetchDiscussions';
import { useTheme } from './ThemeContext';
import { useMediaQuery } from 'react-responsive';

// Enum pour éviter les strings magiques
export const TABS = {
  CHATS: 'chats',
  STATUS: 'status',
  GROUPS: 'groups',
  CALLS: 'calls',
  SETTINGS: 'settings',
};

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { theme, mode, setMode, toggleTheme } = useTheme();
  const { discussions, loading, error, fetchRandomUsers, sortedDiscussions } = useFetchDiscussions();
  const isMobile = useMediaQuery({ maxWidth: 779 });
  const [messages, setMessages] = useState([
    { 
        id: 1, 
        text: 'Hey there! How are you?', 
        sender: 'them', 
        time: '10:30 AM', 
        status: 'read',
        reactions: []
      },
      { 
        id: 2, 
        text: 'I was just thinking about our project', 
        sender: 'them', 
        time: '10:31 AM', 
        status: 'read',
        reactions: []
      }
  ]);

  const [activeCall, setActiveCall] = useState(null);
  const [activeTab, setActiveTab] = useState(TABS.CHATS);
  const [activeChat, setActiveChat] = useState(null);
  const [isLogin, setIsLogin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Notifications dynamiques mockées, à remplacer par le backend / websocket
  const [notifications, setNotifications] = useState({
    [TABS.CHATS]: 3,
    [TABS.STATUS]: 0,
    [TABS.GROUPS]: 12,
    [TABS.CALLS]: 1,
    [TABS.SETTINGS]: 0,
  });

  // Gestion appels
  const callHandlers = {
    toggleMute: () => setActiveCall(prev => prev ? { ...prev, isMuted: !prev.isMuted } : prev),
    toggleVideo: () => setActiveCall(prev => prev ? { ...prev, isVideoOn: !prev.isVideoOn } : prev),
    endCall: () => setActiveCall(null),
  };

  useEffect(() => {
    fetchRandomUsers();
  }, [fetchRandomUsers]);

  // Hook helper pour changer d'onglet et reset activeChat si besoin
  const switchTab = useCallback((tabId) => {
    setActiveTab(tabId);
    if (tabId !== TABS.CHATS && activeChat) setActiveChat(null);
  }, [activeChat]);

  const value = {
    theme, toggleTheme,
    mode, setMode,
    discussions, fetchRandomUsers, sortedDiscussions,
    isMobile,
    loading, error,
    activeCall, setActiveCall,
    activeTab, setActiveTab, switchTab,
    activeChat, setActiveChat,
    isLogin, setIsLogin,
    callHandlers,
    notifications, setNotifications,
    showProfile, setShowProfile,
    messages, setMessages,
    
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
