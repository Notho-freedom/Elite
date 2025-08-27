import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { FaFilter, FaSearch, FaTimes, FaChevronCircleDown, FaCamera } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import DiscussionItem from './DiscussionItem';
import { useApp } from './Context/AppContext';
import { databaseService } from '../firebase/database';
import { useUserProfiles, useUserPresence } from '../firebase';


const FILTERS = { ALL: 'all', UNREAD: 'unread', ONLINE: 'online' };

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

const buttonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

const FilterButton = ({ label, isActive, onClick, t }) => (
  <motion.button
    onClick={onClick}
    className={`px-3 py-2 text-sm font-medium relative ${
      isActive ? 'text-blue-500' :  `${t.secondaryText} ${t.filterHover}`
    }`}
    variants={buttonVariants}
    whileHover="hover"
    whileTap="tap"
  >
    {label.charAt(0).toUpperCase() + label.slice(1)}
    {isActive && (
      <motion.span
        layoutId="underline"
        className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-md"
      />
    )}
  </motion.button>
);

const EmptyState = ({ filter, searchQuery }) => {
  let message = 'Commencez une nouvelle discussion';
  if (filter === FILTERS.UNREAD) message = 'Aucun message non lu';
  if (filter === FILTERS.ONLINE) message = 'Aucun contact en ligne';

  return (
    <motion.div
      key="no-discussions"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-full italic text-muted p-4"
    >
      {searchQuery ? (
        <>
          <div className="text-lg mb-2">Aucun résultat pour "{searchQuery}"</div>
          <div className="text-sm">Essayez un autre terme de recherche</div>
        </>
      ) : (
        <>
          <div className="text-lg mb-2">Aucune discussion</div>
          <div className="text-sm">{message}</div>
        </>
      )}
    </motion.div>
  );
};

const DiscussionList = () => {
  const [filter, setFilter] = useState(FILTERS.ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  
  const { 
    conversations, 
    conversationsLoading, 
    theme: t, 
    setActiveChat, 
    isMobile,
    user,
    debugUsers
  } = useApp();

  // Récupérer tous les utilisateurs de l'application depuis Firestore
  useEffect(() => {
    const fetchAllUsers = async () => {
      if (!user) return;
      
      try {
        setUsersLoading(true);
        const users = await databaseService.getAllUsers();
        // Filtrer l'utilisateur actuel de la liste
        const filteredUsers = users.filter(u => u.uid !== user.uid);
        setAllUsers(filteredUsers);
      } catch (error) {
        console.error('Erreur récupération utilisateurs:', error);
        setAllUsers([]);
      } finally {
        setUsersLoading(false);
      }
    };

    fetchAllUsers();
    
    // Debug: vérifier les utilisateurs après chargement
    if (user) {
      setTimeout(() => {
        debugUsers();
      }, 2000);
    }
  }, [user, debugUsers]);

  // Récupérer les profils des utilisateurs
  const userIds = useMemo(() => allUsers.map(u => u.uid), [allUsers]);
  const { profiles: userProfiles, loading: profilesLoading } = useUserProfiles(userIds);
  
  // Écouter la présence des utilisateurs
  const { presence: userPresence } = useUserPresence(userIds);

  // Fonction utilitaire pour formater l'heure d'affichage
  const formatDisplayTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return date.toLocaleDateString(undefined, { weekday: 'short' });
    return date.toLocaleDateString();
  };

  const toggleSearch = useCallback(() => {
    setIsSearching((prev) => !prev);
    if (isSearching) setSearchQuery('');
  }, [isSearching]);

  const handleFilterClick = useCallback((f) => () => setFilter(f), []);
  const handleAddFilter = useCallback(() => alert('Fonction "Ajouter un filtre" à implémenter 😎'), []);

  // Gérer le clic sur une discussion
  const handleDiscussionClick = useCallback(async (discussion) => {
    if (!discussion.hasConversation) {
      try {
        // Créer une nouvelle conversation dans Firebase
        const conversationId = await databaseService.createConversation([
          user.uid,
          discussion.otherParticipantId
        ]);
        console.log('Nouvelle conversation créée:', conversationId);
        
        // Mettre à jour la discussion avec l'ID de conversation
        const updatedDiscussion = {
          ...discussion,
          id: conversationId,
          hasConversation: true
        };
        setActiveChat(updatedDiscussion);
      } catch (error) {
        console.error('Erreur création conversation:', error);
        // En cas d'erreur, utiliser la discussion virtuelle
        setActiveChat(discussion);
      }
    } else {
      setActiveChat(discussion);
    }
  }, [setActiveChat, user]);

  // Transformer les conversations et ajouter tous les utilisateurs
  const transformedConversations = useMemo(() => {
    if (!user || usersLoading || profilesLoading) return [];

    // Créer un map des conversations existantes par participant
    const existingConversations = new Map();
    if (conversations) {
      conversations.forEach(conversation => {
        const otherParticipantId = conversation.participants.find(p => p !== user.uid);
        if (otherParticipantId) {
          existingConversations.set(otherParticipantId, conversation);
        }
      });
    }

    // Créer des discussions pour tous les utilisateurs
    return allUsers.map(userProfile => {
      const existingConversation = existingConversations.get(userProfile.uid);
      const userPresenceData = userPresence[userProfile.uid];
      const profile = userProfiles[userProfile.uid] || userProfile;
      
      if (existingConversation) {
        // Conversation existante
        return {
          id: existingConversation.id,
          name: profile.displayName || `Utilisateur ${userProfile.uid.slice(-4)}`,
          avatar: profile.photoURL || `https://ui-avatars.com/api/?name=${profile.displayName?.slice(0, 1) || 'U'}&background=random&color=fff`,
          lastMessage: existingConversation.lastMessage || 'Aucun message',
          time: existingConversation.lastMessageTime?.toDate?.() || new Date(),
          timeDisplay: formatDisplayTime(existingConversation.lastMessageTime?.toDate?.() || new Date()),
          unread: existingConversation.unreadCount?.[user.uid] || 0,
          isRead: existingConversation.unreadCount?.[user.uid] === 0,
          isReceived: true,
          isOnline: userPresenceData?.online || profile.isOnline || false,
          actu: profile.status === 'disponible' || false,
          otherParticipantId: userProfile.uid,
          userProfile: profile,
          hasConversation: true
        };
      } else {
        // Nouvelle conversation virtuelle
        return {
          id: `virtual-${userProfile.uid}`,
          name: profile.displayName || `Utilisateur ${userProfile.uid.slice(-4)}`,
          avatar: profile.photoURL || `https://ui-avatars.com/api/?name=${profile.displayName?.slice(0, 1) || 'U'}&background=random&color=fff`,
          lastMessage: 'Cliquez pour commencer une conversation',
          time: new Date(),
          timeDisplay: 'Maintenant',
          unread: 0,
          isRead: true,
          isReceived: false,
          isOnline: userPresenceData?.online || profile.isOnline || false,
          actu: profile.status === 'disponible' || false,
          otherParticipantId: userProfile.uid,
          userProfile: profile,
          hasConversation: false
        };
      }
    });
  }, [conversations, user, userProfiles, userPresence, allUsers, usersLoading, profilesLoading]);

  const filteredConversations = useMemo(() => {
    return transformedConversations
      .filter((d) => {
        if (filter === FILTERS.UNREAD) return d.unread > 0;
        if (filter === FILTERS.ONLINE) return d.isOnline;
        return true;
      })
      .filter((d) => {
        const q = searchQuery.toLowerCase();
        return !q || d.name.toLowerCase().includes(q) || (d.lastMessage?.toLowerCase().includes(q));
      });
  }, [filter, transformedConversations, searchQuery]);

  return (
    <div className={`${t.w} ${t.bgColor} h-screen flex flex-col`}>
      {/* Header */}
      <motion.div className={`px-4 py-3 ${t.borderColor} flex justify-between items-center ${t.headerBg}`} variants={itemVariants}>
        <motion.h2 className={`text-lg font-semibold ${t.textColor}`} variants={itemVariants}>
          Discussions
        </motion.h2>

        <div className="flex items-center gap-2">
          <motion.button
            className={`p-1 rounded-full ${t.searchHover}`}
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            onClick={toggleSearch}
            aria-label="Rechercher"
          >
            <FaSearch className={t.textColor} />
          </motion.button>

          <motion.button className={`p-1 rounded-full ${t.searchHover}`} variants={buttonVariants} aria-label="Camera">
            <FaCamera className={`w-4 h-4 ${t.textColor}`} />
          </motion.button>

          <motion.button className={`p-1 rounded-full ${t.searchHover}`} variants={buttonVariants} aria-label="Plus">
            <FaChevronCircleDown className={`w-4 h-4 ${t.textColor}`} />
          </motion.button>
        </div>
      </motion.div>

      {/* Barre de recherche */}
      <AnimatePresence>
        {isSearching && (
          <motion.div
            className={`px-4 py-2 ${t.borderColor} ${t.headerBg}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <FaSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.secondaryText}`} />
              <motion.input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className={`w-full pl-9 pr-10 py-2 rounded-full focus:outline-none ${t.inputBg} ${t.textColor}`}
                whileFocus={{ scale: 1.01 }}
              />
              {searchQuery && (
                <motion.button
                  onClick={() => setSearchQuery('')}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${t.secondaryText} ${t.filterHover}`}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  aria-label="Effacer"
                >
                  <FaTimes />
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filtres */}
      <motion.div className={`flex px-4 items-center ${t.borderColor}`} initial="rest" animate="rest">
        {Object.values(FILTERS).map((f) => (
          <FilterButton key={f} label={f} isActive={filter === f} onClick={handleFilterClick(f)} t={t} />
        ))}

        <motion.button
          onClick={handleAddFilter}
          className={`ml-auto flex items-center gap-2 text-sm ${t.secondaryText} ${t.hoverBg} px-3 py-1 rounded-md`}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <FaFilter />
        </motion.button>
      </motion.div>

             {/* Liste des discussions */}
       <div className={`flex-1 overflow-y-auto overflow-x-hidden mt-2 ${isMobile ? 'mb-[12vh]':' mb-[1vh]'}`}>
         {conversationsLoading || usersLoading || profilesLoading ? (
           <motion.div className={`p-4 text-center ${t.secondaryText}`} variants={itemVariants}>
             Chargement des utilisateurs...
           </motion.div>
         ) : (
          <AnimatePresence mode="popLayout">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((discussion, index) => (
                <motion.div
                  key={discussion.id}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={itemVariants}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                                     <DiscussionItem
                     discussion={discussion}
                     onClick={() => handleDiscussionClick(discussion)}
                     highlight={
                       !!searchQuery &&
                       (discussion.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         discussion.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase()))
                     }
                   />
                </motion.div>
              ))
            ) : (
              <EmptyState filter={filter} searchQuery={searchQuery} />
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default React.memo(DiscussionList);
