import { FiX } from 'react-icons/fi';

const Header = ({ recipient, onClose }) => (
  <div className="flex justify-between items-center p-4 bg-black/50 text-white z-10">
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
        {recipient.avatar ? (
          <img src={recipient.avatar} alt="" className="rounded-full w-full h-full" />
        ) : (
          <span className="text-sm">{recipient.name.charAt(0)}</span>
        )}
      </div>
      <span className="font-medium">{recipient.name}</span>
    </div>
    <button 
      onClick={onClose} 
      className="p-1 hover:bg-white/10 rounded-full"
      aria-label="Fermer"
    >
      <FiX size={24} />
    </button>
  </div>
);

export default Header;