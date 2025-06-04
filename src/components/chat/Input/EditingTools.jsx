import { useState } from 'react';
import { FiPlus, FiTrash2, FiCrop, FiFilter } from 'react-icons/fi';
import { RiImageEditLine } from 'react-icons/ri';
import { FaRegFilePdf } from 'react-icons/fa';
import { MdOutlineGifBox } from 'react-icons/md';

const EditingTools = ({ showOptions, onToggleOptions, onEdit, onRemove }) => (
  <div className="flex justify-center space-x-4 p-3 bg-black/50 relative">
    <div className="flex space-x-2">
      <button 
        onClick={onEdit}
        className="p-3 rounded-full hover:bg-white/10 text-white"
        title="Éditer"
      >
        <RiImageEditLine size={20} />
      </button>
      <button 
        onClick={onToggleOptions}
        className="p-3 rounded-full hover:bg-white/10 text-white"
        title="Plus d'options"
      >
        <FiPlus size={20} className="transform rotate-45" />
      </button>
    </div>
    
    {showOptions && (
      <div className="absolute bottom-full mb-2 bg-gray-800 rounded-lg p-2 shadow-xl flex space-x-2 animate-fade-in">
        <button 
          className="p-2 rounded-full hover:bg-gray-700 text-white" 
          title="Recadrer"
          onClick={onEdit}
        >
          <FiCrop size={18} />
        </button>
        <button 
          className="p-2 rounded-full hover:bg-gray-700 text-white" 
          title="Filtres"
        >
          <FiFilter size={18} />
        </button>
        <button 
          className="p-2 rounded-full hover:bg-gray-700 text-white" 
          title="PDF"
        >
          <FaRegFilePdf size={18} />
        </button>
        <button 
          className="p-2 rounded-full hover:bg-gray-700 text-white" 
          title="GIF"
        >
          <MdOutlineGifBox size={18} />
        </button>
      </div>
    )}

    <button 
      onClick={onRemove}
      className="p-3 rounded-full hover:bg-red-500/20 text-red-500 ml-auto"
      title="Supprimer"
    >
      <FiTrash2 size={20} />
    </button>
  </div>
);

export default EditingTools;