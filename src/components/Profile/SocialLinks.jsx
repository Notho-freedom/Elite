import React from 'react';
import { motion } from 'framer-motion';
import { FiExternalLink, FiPlus } from 'react-icons/fi';

const SocialLinks = ({ socialLinks, socialIcons, isEditable = false }) => {
  const handleLinkClick = (url) => {
    window.open(url, '_blank', 'noopener noreferrer');
  };

  const SocialLinkCard = ({ link, index }) => {
    const IconComponent = socialIcons[link.platform];
    
    return (
      <motion.div
        key={index}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleLinkClick(link.url)}
        className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg bg-gradient-to-r ${getPlatformGradient(link.platform)}`}>
            {IconComponent ? (
              <IconComponent className="text-white" size={20} />
            ) : (
              <FiExternalLink className="text-white" size={20} />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 dark:text-white capitalize">
              {link.platform}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {link.username || getDisplayUrl(link.url)}
            </p>
          </div>
          
          <FiExternalLink className="text-gray-400" size={16} />
        </div>
      </motion.div>
    );
  };

  const getPlatformGradient = (platform) => {
    const gradients = {
      instagram: 'from-pink-500 to-orange-500',
      twitter: 'from-blue-400 to-blue-600',
      linkedin: 'from-blue-600 to-blue-800',
      github: 'from-gray-700 to-gray-900',
      telegram: 'from-blue-500 to-cyan-500',
      discord: 'from-indigo-500 to-purple-600',
      youtube: 'from-red-500 to-red-700',
      tiktok: 'from-gray-800 to-black',
      behance: 'from-blue-500 to-indigo-600',
      dribbble: 'from-pink-500 to-rose-500',
      figma: 'from-purple-500 to-pink-500',
      portfolio: 'from-green-500 to-teal-500'
    };
    return gradients[platform] || 'from-gray-500 to-gray-700';
  };

  const getDisplayUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  if (!socialLinks || socialLinks.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-6xl mb-4">🔗</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Aucun lien social
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Aucun réseau social n'a été ajouté pour le moment.
        </p>
        
        {isEditable && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <FiPlus size={16} />
            Ajouter un lien
          </motion.button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Réseaux sociaux</h3>
        {isEditable && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <FiPlus size={14} />
            Ajouter
          </motion.button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {socialLinks.map((link, index) => (
          <SocialLinkCard key={index} link={link} index={index} />
        ))}
      </div>

      {/* Statistiques des liens sociaux */}
      {socialLinks.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            Présence sociale
          </h4>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>{socialLinks.length} plateforme{socialLinks.length > 1 ? 's' : ''}</span>
            <span>•</span>
            <span>Profil complet à {Math.min(100, socialLinks.length * 20)}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialLinks;