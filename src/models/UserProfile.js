/**
 * Modèle de données complet pour les profils utilisateurs Elite Chat
 * Système méticuleux de gestion des profils avec toutes les fonctionnalités avancées
 */

// Types d'utilisateurs Elite
export const USER_TYPES = {
  FREE: 'free',
  PREMIUM: 'premium',
  ELITE: 'elite',
  CREATOR: 'creator',
  BUSINESS: 'business',
  ADMIN: 'admin'
};

// Statuts de vérification
export const VERIFICATION_STATUS = {
  NONE: 'none',
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  PREMIUM_VERIFIED: 'premium_verified',
  ELITE_VERIFIED: 'elite_verified'
};

// Statuts de présence
export const PRESENCE_STATUS = {
  ONLINE: 'online',
  AWAY: 'away',
  BUSY: 'busy',
  INVISIBLE: 'invisible',
  OFFLINE: 'offline'
};

// Niveaux de confidentialité
export const PRIVACY_LEVELS = {
  PUBLIC: 'public',
  FRIENDS: 'friends',
  CONNECTIONS: 'connections',
  PRIVATE: 'private',
  CUSTOM: 'custom'
};

// Classe principale du profil utilisateur
export class UserProfile {
  constructor(data = {}) {
    // Informations de base
    this.id = data.id || null;
    this.username = data.username || '';
    this.displayName = data.displayName || '';
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.email = data.email || '';
    this.phoneNumber = data.phoneNumber || '';
    
    // Informations du profil
    this.avatar = data.avatar || null;
    this.coverImage = data.coverImage || null;
    this.bio = data.bio || '';
    this.tagline = data.tagline || '';
    this.location = data.location || null;
    this.website = data.website || '';
    this.dateOfBirth = data.dateOfBirth || null;
    this.gender = data.gender || null;
    
    // Statuts et vérification
    this.userType = data.userType || USER_TYPES.FREE;
    this.verificationStatus = data.verificationStatus || VERIFICATION_STATUS.NONE;
    this.presenceStatus = data.presenceStatus || PRESENCE_STATUS.OFFLINE;
    this.isOnline = data.isOnline || false;
    this.lastSeen = data.lastSeen || null;
    this.joinedAt = data.joinedAt || new Date().toISOString();
    
    // Paramètres de confidentialité
    this.privacy = new PrivacySettings(data.privacy);
    
    // Préférences utilisateur
    this.preferences = new UserPreferences(data.preferences);
    
    // Statistiques et analytics
    this.stats = new UserStatistics(data.stats);
    
    // Badges et réalisations
    this.badges = data.badges || [];
    this.achievements = data.achievements || [];
    
    // Liens sociaux et contacts
    this.socialLinks = data.socialLinks || [];
    this.customFields = data.customFields || [];
    
    // Paramètres de sécurité
    this.security = new SecuritySettings(data.security);
    
    // Abonnements et monétisation
    this.subscription = new SubscriptionInfo(data.subscription);
    
    // Métadonnées
    this.metadata = {
      createdAt: data.metadata?.createdAt || new Date().toISOString(),
      updatedAt: data.metadata?.updatedAt || new Date().toISOString(),
      lastLoginAt: data.metadata?.lastLoginAt || null,
      profileVersion: data.metadata?.profileVersion || '1.0.0',
      ...data.metadata
    };
  }

  // Méthodes utilitaires
  getFullName() {
    return `${this.firstName} ${this.lastName}`.trim() || this.displayName || this.username;
  }

  getDisplayName() {
    return this.displayName || this.getFullName() || this.username;
  }

  isVerified() {
    return [
      VERIFICATION_STATUS.VERIFIED,
      VERIFICATION_STATUS.PREMIUM_VERIFIED,
      VERIFICATION_STATUS.ELITE_VERIFIED
    ].includes(this.verificationStatus);
  }

  isPremium() {
    return [USER_TYPES.PREMIUM, USER_TYPES.ELITE, USER_TYPES.CREATOR, USER_TYPES.BUSINESS].includes(this.userType);
  }

  isElite() {
    return this.userType === USER_TYPES.ELITE;
  }

  canMonetize() {
    return [USER_TYPES.CREATOR, USER_TYPES.ELITE, USER_TYPES.BUSINESS].includes(this.userType);
  }

  getAgeFromBirthDate() {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      displayName: this.displayName,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phoneNumber: this.phoneNumber,
      avatar: this.avatar,
      coverImage: this.coverImage,
      bio: this.bio,
      tagline: this.tagline,
      location: this.location,
      website: this.website,
      dateOfBirth: this.dateOfBirth,
      gender: this.gender,
      userType: this.userType,
      verificationStatus: this.verificationStatus,
      presenceStatus: this.presenceStatus,
      isOnline: this.isOnline,
      lastSeen: this.lastSeen,
      joinedAt: this.joinedAt,
      privacy: this.privacy.toJSON(),
      preferences: this.preferences.toJSON(),
      stats: this.stats.toJSON(),
      badges: this.badges,
      achievements: this.achievements,
      socialLinks: this.socialLinks,
      customFields: this.customFields,
      security: this.security.toJSON(),
      subscription: this.subscription.toJSON(),
      metadata: this.metadata
    };
  }
}

// Paramètres de confidentialité
export class PrivacySettings {
  constructor(data = {}) {
    this.profileVisibility = data.profileVisibility || PRIVACY_LEVELS.PUBLIC;
    this.showEmail = data.showEmail || PRIVACY_LEVELS.PRIVATE;
    this.showPhoneNumber = data.showPhoneNumber || PRIVACY_LEVELS.PRIVATE;
    this.showLastSeen = data.showLastSeen || PRIVACY_LEVELS.FRIENDS;
    this.showOnlineStatus = data.showOnlineStatus || PRIVACY_LEVELS.FRIENDS;
    this.allowMessagesFrom = data.allowMessagesFrom || PRIVACY_LEVELS.PUBLIC;
    this.allowCallsFrom = data.allowCallsFrom || PRIVACY_LEVELS.FRIENDS;
    this.allowGroupInvites = data.allowGroupInvites || PRIVACY_LEVELS.FRIENDS;
    this.showProfileInSearch = data.showProfileInSearch !== false;
    this.showInPeopleYouMayKnow = data.showInPeopleYouMayKnow !== false;
    this.allowDataCollection = data.allowDataCollection !== false;
    this.allowPersonalizedAds = data.allowPersonalizedAds !== false;
    this.blockedUsers = data.blockedUsers || [];
    this.mutedUsers = data.mutedUsers || [];
    this.restrictedUsers = data.restrictedUsers || [];
  }

  toJSON() {
    return {
      profileVisibility: this.profileVisibility,
      showEmail: this.showEmail,
      showPhoneNumber: this.showPhoneNumber,
      showLastSeen: this.showLastSeen,
      showOnlineStatus: this.showOnlineStatus,
      allowMessagesFrom: this.allowMessagesFrom,
      allowCallsFrom: this.allowCallsFrom,
      allowGroupInvites: this.allowGroupInvites,
      showProfileInSearch: this.showProfileInSearch,
      showInPeopleYouMayKnow: this.showInPeopleYouMayKnow,
      allowDataCollection: this.allowDataCollection,
      allowPersonalizedAds: this.allowPersonalizedAds,
      blockedUsers: this.blockedUsers,
      mutedUsers: this.mutedUsers,
      restrictedUsers: this.restrictedUsers
    };
  }
}

// Préférences utilisateur
export class UserPreferences {
  constructor(data = {}) {
    // Apparence
    this.theme = data.theme || 'auto'; // light, dark, auto
    this.accentColor = data.accentColor || 'blue';
    this.fontSize = data.fontSize || 'medium'; // small, medium, large
    this.language = data.language || 'fr';
    this.timezone = data.timezone || 'Europe/Paris';
    
    // Notifications
    this.notifications = {
      push: data.notifications?.push !== false,
      email: data.notifications?.email !== false,
      sms: data.notifications?.sms || false,
      desktop: data.notifications?.desktop !== false,
      sounds: data.notifications?.sounds !== false,
      vibration: data.notifications?.vibration !== false,
      messageNotifications: data.notifications?.messageNotifications !== false,
      callNotifications: data.notifications?.callNotifications !== false,
      groupNotifications: data.notifications?.groupNotifications !== false,
      mentionNotifications: data.notifications?.mentionNotifications !== false,
      reactionNotifications: data.notifications?.reactionNotifications !== false,
      followNotifications: data.notifications?.followNotifications !== false,
      ...data.notifications
    };
    
    // Chat
    this.chat = {
      enterToSend: data.chat?.enterToSend !== false,
      showTypingIndicator: data.chat?.showTypingIndicator !== false,
      showReadReceipts: data.chat?.showReadReceipts !== false,
      autoSaveMedia: data.chat?.autoSaveMedia || false,
      compressImages: data.chat?.compressImages !== false,
      fontSize: data.chat?.fontSize || 'medium',
      bubbleStyle: data.chat?.bubbleStyle || 'modern',
      ...data.chat
    };
    
    // Appels
    this.calls = {
      autoAcceptFromContacts: data.calls?.autoAcceptFromContacts || false,
      showCallHistory: data.calls?.showCallHistory !== false,
      enableCallWaiting: data.calls?.enableCallWaiting !== false,
      preferredQuality: data.calls?.preferredQuality || 'auto',
      ...data.calls
    };
    
    // Sécurité
    this.security = {
      twoFactorAuth: data.security?.twoFactorAuth || false,
      loginNotifications: data.security?.loginNotifications !== false,
      sessionTimeout: data.security?.sessionTimeout || 30, // minutes
      biometricAuth: data.security?.biometricAuth || false,
      ...data.security
    };
  }

  toJSON() {
    return {
      theme: this.theme,
      accentColor: this.accentColor,
      fontSize: this.fontSize,
      language: this.language,
      timezone: this.timezone,
      notifications: this.notifications,
      chat: this.chat,
      calls: this.calls,
      security: this.security
    };
  }
}

// Statistiques utilisateur
export class UserStatistics {
  constructor(data = {}) {
    // Statistiques de base
    this.totalMessages = data.totalMessages || 0;
    this.totalCalls = data.totalCalls || 0;
    this.totalCallDuration = data.totalCallDuration || 0; // en secondes
    this.totalGroups = data.totalGroups || 0;
    this.totalContacts = data.totalContacts || 0;
    this.totalMediaShared = data.totalMediaShared || 0;
    
    // Engagement
    this.dailyActiveStreaks = data.dailyActiveStreaks || 0;
    this.messagesThisWeek = data.messagesThisWeek || 0;
    this.messagesThisMonth = data.messagesThisMonth || 0;
    this.averageResponseTime = data.averageResponseTime || 0; // en minutes
    
    // Pour les créateurs/Elite
    this.followers = data.followers || 0;
    this.following = data.following || 0;
    this.totalViews = data.totalViews || 0;
    this.totalLikes = data.totalLikes || 0;
    this.totalShares = data.totalShares || 0;
    this.totalEarnings = data.totalEarnings || 0;
    this.monthlyEarnings = data.monthlyEarnings || 0;
    
    // Analytiques avancées
    this.peakActivityHour = data.peakActivityHour || 0;
    this.favoriteEmojis = data.favoriteEmojis || [];
    this.topContacts = data.topContacts || [];
    this.topGroups = data.topGroups || [];
    
    // Historique mensuel
    this.monthlyStats = data.monthlyStats || [];
    
    // Dernière mise à jour
    this.lastUpdated = data.lastUpdated || new Date().toISOString();
  }

  toJSON() {
    return {
      totalMessages: this.totalMessages,
      totalCalls: this.totalCalls,
      totalCallDuration: this.totalCallDuration,
      totalGroups: this.totalGroups,
      totalContacts: this.totalContacts,
      totalMediaShared: this.totalMediaShared,
      dailyActiveStreaks: this.dailyActiveStreaks,
      messagesThisWeek: this.messagesThisWeek,
      messagesThisMonth: this.messagesThisMonth,
      averageResponseTime: this.averageResponseTime,
      followers: this.followers,
      following: this.following,
      totalViews: this.totalViews,
      totalLikes: this.totalLikes,
      totalShares: this.totalShares,
      totalEarnings: this.totalEarnings,
      monthlyEarnings: this.monthlyEarnings,
      peakActivityHour: this.peakActivityHour,
      favoriteEmojis: this.favoriteEmojis,
      topContacts: this.topContacts,
      topGroups: this.topGroups,
      monthlyStats: this.monthlyStats,
      lastUpdated: this.lastUpdated
    };
  }
}

// Paramètres de sécurité
export class SecuritySettings {
  constructor(data = {}) {
    this.twoFactorEnabled = data.twoFactorEnabled || false;
    this.biometricEnabled = data.biometricEnabled || false;
    this.loginNotifications = data.loginNotifications !== false;
    this.sessionTimeout = data.sessionTimeout || 30; // minutes
    this.trustedDevices = data.trustedDevices || [];
    this.activeSessions = data.activeSessions || [];
    this.loginHistory = data.loginHistory || [];
    this.backupCodes = data.backupCodes || [];
    this.lastPasswordChange = data.lastPasswordChange || null;
    this.securityQuestions = data.securityQuestions || [];
  }

  toJSON() {
    return {
      twoFactorEnabled: this.twoFactorEnabled,
      biometricEnabled: this.biometricEnabled,
      loginNotifications: this.loginNotifications,
      sessionTimeout: this.sessionTimeout,
      trustedDevices: this.trustedDevices,
      activeSessions: this.activeSessions,
      loginHistory: this.loginHistory,
      backupCodes: this.backupCodes,
      lastPasswordChange: this.lastPasswordChange,
      securityQuestions: this.securityQuestions
    };
  }
}

// Informations d'abonnement
export class SubscriptionInfo {
  constructor(data = {}) {
    this.plan = data.plan || USER_TYPES.FREE;
    this.isActive = data.isActive || false;
    this.startDate = data.startDate || null;
    this.endDate = data.endDate || null;
    this.autoRenew = data.autoRenew || false;
    this.features = data.features || [];
    this.billingCycle = data.billingCycle || 'monthly'; // monthly, yearly
    this.amount = data.amount || 0;
    this.currency = data.currency || 'EUR';
    this.paymentMethod = data.paymentMethod || null;
    this.trialEndsAt = data.trialEndsAt || null;
    this.isTrialActive = data.isTrialActive || false;
  }

  isExpired() {
    if (!this.endDate) return false;
    return new Date(this.endDate) < new Date();
  }

  daysUntilExpiry() {
    if (!this.endDate) return null;
    const diffTime = new Date(this.endDate) - new Date();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  toJSON() {
    return {
      plan: this.plan,
      isActive: this.isActive,
      startDate: this.startDate,
      endDate: this.endDate,
      autoRenew: this.autoRenew,
      features: this.features,
      billingCycle: this.billingCycle,
      amount: this.amount,
      currency: this.currency,
      paymentMethod: this.paymentMethod,
      trialEndsAt: this.trialEndsAt,
      isTrialActive: this.isTrialActive
    };
  }
}

// Factory pour créer des profils de démonstration
export class ProfileFactory {
  static createDemoProfile(contactId, contactData) {
    const demoProfiles = {
      '1': { // Sarah Johnson
        username: 'sarah_johnson',
        displayName: 'Sarah Johnson',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah@eliteapp.com',
        bio: 'Digital designer & photographer 📸 Créatrice de contenu passionnée par l\'art visuel et l\'innovation.',
        tagline: 'Creating visual stories that inspire ✨',
        location: { city: 'Paris', country: 'France' },
        website: 'https://sarahj-portfolio.com',
        userType: USER_TYPES.CREATOR,
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
        badges: ['verified', 'creator', 'early_adopter'],
        socialLinks: [
          { platform: 'instagram', url: 'https://instagram.com/sarah_creates', username: '@sarah_creates' },
          { platform: 'behance', url: 'https://behance.net/sarahj', username: 'sarahj' }
        ],
        stats: {
          followers: 12500,
          following: 890,
          totalMessages: 15420,
          totalViews: 89200,
          monthlyEarnings: 2450
        }
      },
      '2': { // Équipe Développement
        username: 'dev_team',
        displayName: 'Équipe Développement',
        firstName: 'Équipe',
        lastName: 'Développement',
        email: 'dev@eliteapp.com',
        bio: 'Équipe officielle de développement Elite Chat 👨‍💻 Nous créons l\'avenir de la communication.',
        tagline: 'Building the future of communication 🚀',
        userType: USER_TYPES.BUSINESS,
        verificationStatus: VERIFICATION_STATUS.ELITE_VERIFIED,
        badges: ['official', 'developer', 'elite'],
        stats: {
          totalMessages: 45000,
          totalCalls: 1200,
          totalContacts: 5000
        }
      },
      '3': { // Mike Chen
        username: 'mike_chen',
        displayName: 'Mike Chen',
        firstName: 'Mike',
        lastName: 'Chen',
        email: 'mike@eliteapp.com',
        bio: 'Product Manager chez Elite Technologies 💼 Passionné d\'innovation et d\'expérience utilisateur.',
        tagline: 'Innovation through user-centric design',
        location: { city: 'London', country: 'UK' },
        userType: USER_TYPES.ELITE,
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
        badges: ['verified', 'product_manager', 'innovator'],
        stats: {
          totalMessages: 8900,
          totalCalls: 450,
          following: 320,
          followers: 1250
        }
      },
      '4': { // Annonces Elite
        username: 'elite_official',
        displayName: 'Elite Official',
        firstName: 'Elite',
        lastName: 'Official',
        email: 'official@eliteapp.com',
        bio: 'Canal officiel Elite Chat 📢 Restez informés des dernières nouveautés et mises à jour.',
        tagline: 'Your gateway to Elite experiences',
        userType: USER_TYPES.BUSINESS,
        verificationStatus: VERIFICATION_STATUS.ELITE_VERIFIED,
        badges: ['official', 'announcements', 'elite', 'verified'],
        stats: {
          followers: 125000,
          totalMessages: 2500,
          totalViews: 890000
        }
      },
      '5': { // Emma Wilson
        username: 'emma_wilson',
        displayName: 'Emma Wilson',
        firstName: 'Emma',
        lastName: 'Wilson',
        email: 'emma@eliteapp.com',
        bio: 'Marketing Manager 📈 Spécialiste en stratégie digitale et growth hacking.',
        tagline: 'Growing brands through digital innovation',
        location: { city: 'New York', country: 'USA' },
        userType: USER_TYPES.PREMIUM,
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
        badges: ['verified', 'marketer', 'growth_expert'],
        stats: {
          totalMessages: 6780,
          totalCalls: 234,
          followers: 3400,
          following: 567
        }
      }
    };

    const profileData = demoProfiles[contactId] || demoProfiles['1'];
    
    // Merge avec les données du contact
    const mergedData = {
      ...profileData,
      id: contactId,
      avatar: contactData?.avatar,
      displayName: contactData?.name || profileData.displayName,
      isOnline: contactData?.isOnline || false,
      lastSeen: contactData?.time || new Date().toISOString(),
      presenceStatus: contactData?.isOnline ? PRESENCE_STATUS.ONLINE : PRESENCE_STATUS.OFFLINE
    };

    return new UserProfile(mergedData);
  }

  static createDefaultProfile() {
    return new UserProfile({
      userType: USER_TYPES.FREE,
      verificationStatus: VERIFICATION_STATUS.NONE,
      presenceStatus: PRESENCE_STATUS.OFFLINE
    });
  }
}

export default UserProfile;