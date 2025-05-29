// hooks/useFetchDiscussions.js
import { useState, useCallback } from 'react';

const useFetchDiscussions = () => {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const generateRandomTime = () => {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    return new Date(sevenDaysAgo + Math.random() * (now - sevenDaysAgo)).toISOString();
  };

  const formatDisplayTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return date.toLocaleDateString(undefined, { weekday: 'short' });
    return date.toLocaleDateString();
  };

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
          time,
          timeDisplay: formatDisplayTime(time),
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

  const sortedDiscussions = [...discussions].sort((a, b) => new Date(b.time) - new Date(a.time));

  return { discussions, loading, error, fetchRandomUsers, sortedDiscussions };
};

export default useFetchDiscussions;