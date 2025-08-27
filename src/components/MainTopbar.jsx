import { motion } from "framer-motion";
import { FaCog, FaBell, FaUserAlt } from "react-icons/fa";
import { PiSparkleFill } from "react-icons/pi"; // icône IA style futuriste
import { useApp } from "./Context/AppContext";

export default function MainTopbar({ appName = "ELITE", theme, onSettings, onUser, onAI }) {
  const { userProfile, userStatus } = useApp();

  return (
    <motion.div
      className={`fixed top-0 left-0 w-full z-50 px-4 py-2 border-b ${theme.borderColor} ${theme.headerBg} hidden justify-between items-center`}
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 180 }}
    >
      {/* App Name */}
      <motion.h1
        className={`text-xl font-semibold tracking-wide ${theme.textColor}`}
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        {appName}
      </motion.h1>

      {/* Action Icons */}
      <div className="flex items-center gap-3">
        <motion.button
          className={`p-2 rounded-full ${theme.searchHover}`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAI}
          aria-label="AI Assistant"
        >
          <PiSparkleFill className={`text-lg ${theme.secondaryText}`} />
        </motion.button>

        <motion.button
          className={`p-2 rounded-full ${theme.searchHover}`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Notifications"
        >
          <FaBell className={`text-lg ${theme.secondaryText}`} />
        </motion.button>

        <motion.button
          className={`p-2 rounded-full ${theme.searchHover}`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSettings}
          aria-label="Settings"
        >
          <FaCog className={`text-lg ${theme.secondaryText}`} />
        </motion.button>

        {/* User Avatar/Profile Button */}
        <motion.button
          className={`relative p-2 rounded-full ${theme.searchHover}`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onUser}
          aria-label="User Profile"
        >
          {userProfile?.photoURL ? (
            <div className="relative">
              <img
                src={userProfile.photoURL}
                alt={userProfile.displayName || "User"}
                className="w-6 h-6 rounded-full object-cover"
              />
              {/* Status indicator */}
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                userStatus === 'disponible' ? 'bg-green-500' :
                userStatus === 'occupé' ? 'bg-yellow-500' :
                userStatus === 'ne pas déranger' ? 'bg-red-500' :
                'bg-gray-500'
              }`} />
            </div>
          ) : (
            <FaUserAlt className={`text-lg ${theme.secondaryText}`} />
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
