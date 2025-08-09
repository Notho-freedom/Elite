import React from 'react';
import { motion } from 'framer-motion';
import {
  FiCheck, FiStar, FiShield, FiAward,
  FiTrendingUp, FiCode, FiMic, FiCamera, FiHeart,
  FiUsers, FiZap, FiGift, FiTarget
} from 'react-icons/fi';
import { USER_TYPES } from '../../models/UserProfile';
import { FaCrown } from 'react-icons/fa';

const ProfileBadges = ({ badges, userType }) => {
  // Configuration des badges avec leurs propriétés
  const badgeConfig = {
    // Badges de vérification
    verified: {
      icon: FiCheck,
      label: 'Vérifié',
      description: 'Profil vérifié par Elite Chat',
      color: 'blue',
      gradient: 'from-blue-400 to-blue-600'
    },
    premium_verified: {
      icon: FiStar,
      label: 'Premium Vérifié',
      description: 'Utilisateur Premium vérifié',
      color: 'purple',
      gradient: 'from-purple-400 to-purple-600'
    },
    elite_verified: {
      icon: FaCrown,
      label: 'Elite Vérifié',
      description: 'Membre Elite vérifié',
      color: 'yellow',
      gradient: 'from-yellow-400 to-orange-500'
    },

    // Badges de statut
    creator: {
      icon: FiCamera,
      label: 'Créateur',
      description: 'Créateur de contenu Elite',
      color: 'pink',
      gradient: 'from-pink-400 to-rose-500'
    },
    developer: {
      icon: FiCode,
      label: 'Développeur',
      description: 'Membre de l\'équipe de développement',
      color: 'green',
      gradient: 'from-green-400 to-emerald-500'
    },
    official: {
      icon: FiShield,
      label: 'Officiel',
      description: 'Compte officiel Elite Chat',
      color: 'indigo',
      gradient: 'from-indigo-400 to-blue-500'
    },

    // Badges d'activité
    early_adopter: {
      icon: FiZap,
      label: 'Adopteur Précoce',
      description: 'Parmi les premiers utilisateurs',
      color: 'orange',
      gradient: 'from-orange-400 to-red-500'
    },
    top_contributor: {
      icon: FiTrendingUp,
      label: 'Top Contributeur',
      description: 'Contributeur très actif',
      color: 'emerald',
      gradient: 'from-emerald-400 to-teal-500'
    },
    community_leader: {
      icon: FiUsers,
      label: 'Leader Communautaire',
      description: 'Leader reconnu de la communauté',
      color: 'violet',
      gradient: 'from-violet-400 to-purple-500'
    },

    // Badges spécialisés
    influencer: {
      icon: FiMic,
      label: 'Influenceur',
      description: 'Influenceur reconnu',
      color: 'rose',
      gradient: 'from-rose-400 to-pink-500'
    },
    marketer: {
      icon: FiTarget,
      label: 'Marketer',
      description: 'Expert en marketing digital',
      color: 'cyan',
      gradient: 'from-cyan-400 to-blue-500'
    },
    product_manager: {
      icon: FiAward,
      label: 'Product Manager',
      description: 'Gestionnaire de produit',
      color: 'amber',
      gradient: 'from-amber-400 to-orange-500'
    },
    innovator: {
      icon: FiGift,
      label: 'Innovateur',
      description: 'Pionnier de l\'innovation',
      color: 'teal',
      gradient: 'from-teal-400 to-cyan-500'
    },
    growth_expert: {
      icon: FiTrendingUp,
      label: 'Expert Croissance',
      description: 'Spécialiste en growth hacking',
      color: 'lime',
      gradient: 'from-lime-400 to-green-500'
    },

    // Badges de récompenses
    elite: {
      icon: FaCrown,
      label: 'Elite',
      description: 'Membre Elite exclusif',
      color: 'gold',
      gradient: 'from-yellow-300 via-yellow-500 to-orange-500'
    },
    supporter: {
      icon: FiHeart,
      label: 'Supporter',
      description: 'Supporter de la communauté',
      color: 'red',
      gradient: 'from-red-400 to-rose-500'
    },
    beta_tester: {
      icon: FiZap,
      label: 'Beta Testeur',
      description: 'Testeur de fonctionnalités beta',
      color: 'indigo',
      gradient: 'from-indigo-400 to-purple-500'
    },
    announcements: {
      icon: FiMic,
      label: 'Annonces',
      description: 'Canal d\'annonces officielles',
      color: 'blue',
      gradient: 'from-blue-400 to-indigo-500'
    }
  };

  // Badge spécial basé sur le type d'utilisateur
  const getUserTypeBadge = () => {
    switch (userType) {
      case USER_TYPES.ELITE:
        return 'elite';
      case USER_TYPES.CREATOR:
        return 'creator';
      case USER_TYPES.BUSINESS:
        return 'official';
      case USER_TYPES.PREMIUM:
        return 'premium_verified';
      default:
        return null;
    }
  };

  // Combiner les badges avec le badge de type d'utilisateur
  const allBadges = [...(badges || [])];
  const userTypeBadge = getUserTypeBadge();
  if (userTypeBadge && !allBadges.includes(userTypeBadge)) {
    allBadges.unshift(userTypeBadge);
  }

  // Fonction pour obtenir les classes de couleur
  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      pink: 'bg-pink-100 text-pink-700 border-pink-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      orange: 'bg-orange-100 text-orange-700 border-orange-200',
      emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      violet: 'bg-violet-100 text-violet-700 border-violet-200',
      rose: 'bg-rose-100 text-rose-700 border-rose-200',
      cyan: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      amber: 'bg-amber-100 text-amber-700 border-amber-200',
      teal: 'bg-teal-100 text-teal-700 border-teal-200',
      lime: 'bg-lime-100 text-lime-700 border-lime-200',
      red: 'bg-red-100 text-red-700 border-red-200',
      gold: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-300'
    };
    return colors[color] || colors.blue;
  };

  const BadgeComponent = ({ badgeKey, badge }) => {
    const Icon = badge.icon;
    
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          inline-flex items-center gap-2 px-3 py-2 rounded-full border 
          ${getColorClasses(badge.color)}
          hover:shadow-md transition-all duration-200 cursor-pointer
          ${badge.color === 'gold' ? 'shadow-lg' : ''}
        `}
        title={badge.description}
      >
        <Icon size={16} />
        <span className="font-medium text-sm">{badge.label}</span>
        
        {/* Effet brillant pour les badges spéciaux */}
        {['elite', 'elite_verified'].includes(badgeKey) && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              background: [
                'transparent',
                'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
                'transparent'
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'loop'
            }}
          />
        )}
      </motion.div>
    );
  };

  if (!allBadges || allBadges.length === 0) {
    return (
      <div>
        <h3 className="font-semibold mb-3">Badges</h3>
        <p className="text-gray-500 text-sm">Aucun badge pour le moment</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <FiAward className="text-yellow-500" />
        Badges et réalisations
      </h3>
      
      <div className="flex flex-wrap gap-2">
        {allBadges.map((badgeKey) => {
          const badge = badgeConfig[badgeKey];
          if (!badge) return null;
          
          return (
            <BadgeComponent 
              key={badgeKey} 
              badgeKey={badgeKey} 
              badge={badge} 
            />
          );
        })}
      </div>

      {/* Note explicative pour les badges Elite */}
      {allBadges.some(badge => ['elite', 'elite_verified', 'official'].includes(badge)) && (
        <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <FiStar className="inline mr-1" />
            Les badges Elite sont attribués aux membres exceptionnels de la communauté.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfileBadges;