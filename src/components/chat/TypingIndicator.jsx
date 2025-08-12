import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const TypingIndicator = ({ theme, users = [] }) => {
  const [typingUserNames, setTypingUserNames] = useState([]);

  // Récupérer les noms des utilisateurs qui tapent
  useEffect(() => {
    const fetchUserNames = async () => {
      if (users.length === 0) {
        setTypingUserNames([]);
        return;
      }

      try {
        const userIds = users.map(u => u.user_id);
        const { data, error } = await supabase
          .from('users')
          .select('id, name')
          .in('id', userIds);

        if (error) {
          console.error('Erreur récupération noms utilisateurs:', error);
        } else {
          const names = data.map(user => user.name || 'Utilisateur');
          setTypingUserNames(names);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des noms:', error);
      }
    };

    fetchUserNames();
  }, [users]);

  if (users.length === 0) return null;

  const getTypingText = () => {
    if (typingUserNames.length === 0) return 'En train d\'écrire...';
    if (typingUserNames.length === 1) return `${typingUserNames[0]} est en train d'écrire...`;
    if (typingUserNames.length === 2) return `${typingUserNames[0]} et ${typingUserNames[1]} sont en train d'écrire...`;
    return `${typingUserNames[0]} et ${typingUserNames.length - 1} autres sont en train d'écrire...`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex justify-start mb-4"
    >
      <div className={`px-4 py-2 rounded-2xl ${theme.messageBg} rounded-bl-none ${theme.textColor} flex items-center gap-3`}>
        <div className="flex space-x-1">
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <span className={`text-sm ${theme.secondaryText}`}>
          {getTypingText()}
        </span>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;