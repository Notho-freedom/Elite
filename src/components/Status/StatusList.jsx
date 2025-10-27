import React, { useState } from 'react';
import { FaCamera, FaPlus } from 'react-icons/fa';
import { motion } from 'framer-motion';
import TabHeader from '../UI/TabHeader';
import { useApp } from '../Context/AppContext';

const StatusList = () => {
  const { theme } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddStatus = () => {
    console.log('Ajouter un statut');
  };

  const handleCamera = () => {
    console.log('Ouvrir caméra pour statut');
  };

  return (
    <div className={`${theme.w} ${theme.bgColor} h-screen flex flex-col`}>
      <TabHeader
        title="Statuts"
        theme={theme}
        showSearch={true}
        showCamera={true}
        showAdd={true}
        onSearch={() => {}}
        onCamera={handleCamera}
        onAdd={handleAddStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Rechercher un statut..."
        customActions={[
          {
            icon: <FaPlus className="w-4 h-4" />,
            label: 'Nouveau statut',
            onClick: handleAddStatus
          }
        ]}
      />

      {/* Content */}
      <div className="flex-1 p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-center ${theme.secondaryText} mt-20`}
        >
          <div className="mb-4">
            <div className={`w-16 h-16 rounded-full ${theme.accentBg} mx-auto flex items-center justify-center mb-4`}>
              <FaCamera className="text-white text-xl" />
            </div>
            <h3 className={`text-lg font-medium ${theme.textColor} mb-2`}>
              Créez votre premier statut
            </h3>
            <p className={theme.secondaryText}>
              Partagez des moments éphémères avec vos contacts
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddStatus}
            className={`px-6 py-3 ${theme.accentBg} text-white rounded-full font-medium`}
          >
            Créer un statut
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default StatusList;
