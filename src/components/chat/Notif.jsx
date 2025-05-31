import React from 'react';
import { BadgeCheck } from 'lucide-react';
import clsx from 'clsx';

const Notif = ({ user }) => {
  return (
    <div
      className={clsx(
        'flex items-center p-3 rounded-2xl transition-all duration-300 shadow-sm hover:bg-white/10 cursor-pointer gap-3',
        user.unread && 'bg-gradient-to-r from-purple-500/10 to-blue-500/10'
      )}
    >
      <div className="relative">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-12 h-12 rounded-full object-cover border border-white/10"
        />
        {user.isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900 animate-pulse" />
        )}
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-center">
          <h4 className="text-white font-semibold truncate">{user.name}</h4>
          <span className="text-xs text-gray-400">{user.timeDisplay}</span>
        </div>

        <div className="text-sm text-gray-300 truncate flex items-center gap-1">
          {user.actu && <BadgeCheck size={14} className="text-indigo-400" />}
          <span className={clsx(user.unread && 'font-semibold text-white')}>
            {user.lastMessage}
          </span>
        </div>
      </div>

      {user.unread && (
        <div className="ml-2 bg-pink-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
          NEW
        </div>
      )}
    </div>
  );
};

export default Notif;
