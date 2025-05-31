import { useTheme } from './../ThemeContext';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { FiMessageSquare, FiBell, FiSettings, FiLogOut } from 'react-icons/fi';

const Profile = ({ user }) => {
  const { theme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={clsx(
        "w-full max-w-2xl mx-auto rounded-2xl shadow-lg overflow-hidden",
        theme.bgColor,
        theme.textColor
      )}
    >
      {/* Header with cover photo */}
      <div className={clsx(
        "h-32 sm:h-40 w-full relative",
        "bg-gradient-to-r from-indigo-500 to-purple-600"
      )}>
        {/* Online status indicator */}
        {user?.isOnline && (
          <div className="absolute top-4 right-4 flex items-center">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="ml-2 text-xs text-white">Online</span>
          </div>
        )}
      </div>

      {/* Profile content */}
      <div className="px-6 pb-8 sm:px-8">
        {/* Avatar and basic info */}
        <div className="flex flex-col items-center -mt-16 sm:-mt-20 relative">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={clsx(
              "h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 overflow-hidden",
              theme.borderColor,
              "shadow-lg relative"
            )}
          >
            <img 
              src={user?.avatar || 'https://via.placeholder.com/150'} 
              alt={user?.name}
              className="w-full h-full object-cover"
            />
            {user?.actu && (
              <div className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                NEW
              </div>
            )}
          </motion.div>

          <h2 className={clsx(
            "mt-4 text-xl sm:text-2xl font-bold",
            theme.textColor
          )}>
            {user?.name}
          </h2>

          <p className={clsx(
            "text-sm sm:text-base mt-1",
            theme.secondaryText
          )}>
            Last active: {user?.timeDisplay}
          </p>
        </div>

        {/* Last message */}
        <div className={clsx(
          "mt-6 p-4 rounded-xl",
          theme.cardBgColor,
          "border",
          theme.borderColor
        )}>
          <div className="flex items-center justify-between">
            <h3 className={clsx(
              "text-sm font-semibold",
              theme.textColor
            )}>
              Last Message
            </h3>
            {!user?.isRead && (
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
            )}
          </div>
          <p className={clsx(
            "mt-2 text-sm",
            theme.secondaryText,
            "truncate"
          )}>
            {user?.lastMessage}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 text-center">
          <div>
            <p className={clsx(
              "text-lg font-bold",
              theme.textColor
            )}>42</p>
            <p className={clsx(
              "text-xs",
              theme.secondaryText
            )}>Friends</p>
          </div>
          <div>
            <p className={clsx(
              "text-lg font-bold",
              theme.textColor
            )}>128</p>
            <p className={clsx(
              "text-xs",
              theme.secondaryText
            )}>Posts</p>
          </div>
          <div>
            <p className={clsx(
              "text-lg font-bold",
              theme.textColor
            )}>1.2K</p>
            <p className={clsx(
              "text-xs",
              theme.secondaryText
            )}>Likes</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={clsx(
              "flex flex-col items-center justify-center p-3 rounded-xl",
              theme.cardBgColor,
              "text-sm font-medium"
            )}
          >
            <FiMessageSquare className="text-lg mb-1" />
            Message
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={clsx(
              "flex flex-col items-center justify-center p-3 rounded-xl",
              theme.cardBgColor,
              "text-sm font-medium"
            )}
          >
            <FiBell className="text-lg mb-1" />
            Notify
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={clsx(
              "flex flex-col items-center justify-center p-3 rounded-xl",
              theme.cardBgColor,
              "text-sm font-medium"
            )}
          >
            <FiSettings className="text-lg mb-1" />
            Settings
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={clsx(
              "flex flex-col items-center justify-center p-3 rounded-xl",
              "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
              "text-sm font-medium"
            )}
          >
            <FiLogOut className="text-lg mb-1" />
            Logout
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;