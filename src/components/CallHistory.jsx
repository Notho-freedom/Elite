import { useState, useEffect, useMemo } from 'react';
import { FaPhone, FaVideo, FaSearch, FaTimes, FaChevronDown } from 'react-icons/fa';
import { IoMdCall } from 'react-icons/io';
import { BsFilterCircleFill } from 'react-icons/bs';
import { motion, AnimatePresence } from 'framer-motion';
import { MdCallMade, MdCallReceived } from 'react-icons/md';
import { useTheme } from './Context/ThemeContext';

const FILTERS = ['all', 'audio', 'video', 'missed'];

const iconsByType = {
  video: <FaVideo className="text-blue-500" />,
  missed: <IoMdCall className="text-red-500 transform rotate-135" />,
  audio: <FaPhone className="text-green-500" />,
};

const containerVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
  exit: { opacity: 0, x: 30, transition: { staggerChildren: 0.05, staggerDirection: -1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
};

const buttonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

const CallDirectionIcon = ({ type }) => {
  switch (type) {
    case 'missed':
      return <MdCallReceived className="text-red-500" title="Missed Call" />;
    case 'audio':
      return <MdCallMade className="text-green-500" title="Outgoing Call" />;
    case 'video':
      return <MdCallReceived className="text-green-500" title="Incoming Call" />;
    default:
      return <FaPhone className="text-green-500" />;
  }
};

const CallHistory = ({ discussions, setActiveCall }) => {
  const [calls, setCalls] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    if (discussions && discussions.length > 0) {
      generateCallDataFromDiscussions();
    }
  }, [discussions]);

  const generateCallDataFromDiscussions = () => {
    setLoading(true);
    const callTypes = ['audio', 'video', 'missed'];

    const callData = discussions.map(discussion => {
      const callDate = new Date();
      callDate.setDate(callDate.getDate() - Math.floor(Math.random() * 7));
      const hours = 9 + Math.floor(Math.random() * 9);
      const minutes = Math.floor(Math.random() * 60);
      callDate.setHours(hours, minutes);

      return {
        id: discussion.id,
        name: discussion.name,
        avatar: discussion.avatar,
        type: callTypes[Math.floor(Math.random() * callTypes.length)],
        date: callDate,
        duration: Math.floor(Math.random() * 1200),
        lastMessage: discussion.lastMessage,
      };
    });

    setCalls(callData);
    setLoading(false);
  };

  const filteredCalls = useMemo(() => {
    return calls.filter(call => {
      const matchesSearch = call.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = selectedFilter === 'all' || call.type === selectedFilter;
      return matchesSearch && matchesFilter;
    });
  }, [calls, searchTerm, selectedFilter]);

  const formatDate = date => {
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDuration = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getCallIcon = type => iconsByType[type];

  const handleCallClick = call => {
    setActiveCall({
      name: call.name,
      avatar: call.avatar,
      status: call.type === 'video' ? 'FaceTime Video' : 'FaceTime Audio',
      isMuted: false,
      isVideoOn: call.type === 'video',
      isScreenSharing: false,
    });
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch) setSearchTerm('');
  };

  return (
    <motion.div
      className={`${theme.w} flex flex-col h-full overflow-hidden shadow-lg border ${theme.borderColor} ${theme.bgColor} ${theme.textColor}`}
      exit="exit"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div
        className={`${theme.headerBg} px-4 py-3 border-b ${theme.borderColor} flex justify-between items-center`}
        variants={itemVariants}
      >
        <motion.h2 className={`text-lg font-semibold ${theme.textColor}`} variants={itemVariants}>
          Recents
        </motion.h2>
        <div className="flex space-x-2">
          <motion.button
            className={`p-1 rounded-full ${theme.searchHover}`}
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            onClick={toggleSearch}
          >
            <FaSearch className={theme.secondaryText} />
          </motion.button>
          <motion.div className="relative" variants={itemVariants}>
            <motion.button
              className={`p-1 rounded-full ${theme.searchHover} flex items-center`}
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
            >
              <BsFilterCircleFill className={theme.secondaryText} />
              <FaChevronDown className={`text-xs ml-1 ${theme.secondaryText}`} />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Search Bar - Conditionally Rendered */}
      <AnimatePresence>
        {showSearch && (
          <motion.div 
            className={`px-4 py-2 border-b ${theme.borderColor}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme.secondaryText}`} />
              <motion.input
                type="text"
                placeholder="Search"
                className={`w-full pl-9 pr-4 py-2 rounded-md focus:outline-none ${theme.inputBg}`}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                whileFocus={{ scale: 1.02 }}
                autoFocus
              />
              {searchTerm && (
                <motion.button
                  onClick={() => setSearchTerm('')}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${theme.secondaryText} ${theme.filterHover}`}
                  variants={buttonVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <FaTimes />
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Tabs */}
      <motion.div className={`flex border-b ${theme.borderColor} px-4`} variants={itemVariants}>
        {FILTERS.map(filter => (
          <motion.button
            key={filter}
            className={`px-4 py-2 text-sm font-medium relative ${
              selectedFilter === filter
                ? 'text-blue-500'
                : `${theme.secondaryText} ${theme.filterHover}`
            }`}
            onClick={() => setSelectedFilter(filter)}
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
            {selectedFilter === filter && (
              <motion.span
                layoutId="underline"
                className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-md"
              />
            )}
          </motion.button>
        ))}
        <motion.button
          onClick={() => setCalls([])}
          className={theme.clearAllText + ' ml-auto text-sm'}
          title="Clear All"
          variants={buttonVariants}
          initial="rest"
          whileHover="hover"
          whileTap="tap"
        >
          Clear All
        </motion.button>
      </motion.div>

      {/* Call List */}
      <motion.div className="flex-1 overflow-y-auto overflow-x-hidden" variants={itemVariants}>
        {loading ? (
          <motion.div className={`p-4 text-center ${theme.secondaryText}`} variants={itemVariants}>
            Loading calls...
          </motion.div>
        ) : filteredCalls.length === 0 ? (
          <motion.div className={`p-4 text-center ${theme.emptyStateText}`} variants={itemVariants}>
            {searchTerm ? 'No matching calls found' : 'No calls found'}
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredCalls.map((call, index) => (
              <motion.div
                key={call.id}
                className={`flex items-center px-4 py-3 cursor-pointer ${theme.hoverBg}`}
                onClick={() => handleCallClick(call)}
                variants={itemVariants}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                layout
                whileHover={{ scale: 1.03 }}
              >
                <img
                  src={call.avatar}
                  alt={call.name}
                  className="w-12 h-12 rounded-full object-cover mr-3"
                  loading="lazy"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h6 className={`${call.type === 'missed' ? 'text-red-500' : theme.textColor}`}>{call.name}</h6>
                    <span className={`text-xs font-mono ${theme.secondaryText}`}>{formatDate(call.date)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-0.5 text-sm">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <CallDirectionIcon type={call.type} />
                      <span>{call.type === 'missed' ? 'Missed Call' : formatDuration(call.duration)}</span>                    
                    </div>
                    <span className="flex items-center space-x-1">
                      {getCallIcon(call.type)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </motion.div>
    </motion.div>
  );
};

export default CallHistory;