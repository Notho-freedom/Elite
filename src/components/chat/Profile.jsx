import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { 
  FiSearch,
  FiMoreVertical,
  FiX,
  FiMessageSquare,
  FiPhone,
  FiVideo,
  FiUser,
  FiMail,
  FiClock,
  FiStar,
  FiLink
} from 'react-icons/fi';
import { 
  IoMdNotificationsOutline,
  IoMdCheckmarkCircleOutline
} from 'react-icons/io';
import { 
  BsEmojiSmile,
  BsCamera,
  BsFileEarmark
} from 'react-icons/bs';
import { RiVipCrownLine } from 'react-icons/ri';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../Context/AppContext';
import EnhancedProfile from '../Profile/EnhancedProfile';

const Profile = () => {
  // Utiliser le nouveau composant EnhancedProfile
  return <EnhancedProfile />;
};

export default Profile;