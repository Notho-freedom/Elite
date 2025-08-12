import { useMemo } from 'react';
import { formatMessageForUI } from '../lib/messageFormatter.js';
import { useAuth } from '../components/Context/AuthContext';

/**
 * Hook pour formatter les messages avec contexte utilisateur
 */
export const useMessageFormatter = () => {
  const { user } = useAuth();
  
  const formatMessage = useMemo(() => {
    return (dbMessage) => {
      return formatMessageForUI(dbMessage, user?.id);
    };
  }, [user?.id]);

  const formatMessages = useMemo(() => {
    return (dbMessages) => {
      if (!Array.isArray(dbMessages)) return [];
      return dbMessages.map(msg => formatMessageForUI(msg, user?.id));
    };
  }, [user?.id]);

  const isCurrentUser = useMemo(() => {
    return (senderId) => {
      return user?.id === senderId;
    };
  }, [user?.id]);

  return {
    formatMessage,
    formatMessages,
    isCurrentUser,
    currentUserId: user?.id
  };
};

export default useMessageFormatter;
