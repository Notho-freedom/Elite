import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  GithubAuthProvider,
  TwitterAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

// Providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
const twitterProvider = new TwitterAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

// Configuration des providers
googleProvider.addScope('profile');
googleProvider.addScope('email');
githubProvider.addScope('user');
twitterProvider.addScope('email');

export const authService = {
  // Authentification avec gestion des erreurs de sessionStorage
  async signInWithProvider(providerName) {
    let provider;
    switch (providerName) {
      case 'google':
        provider = googleProvider;
        break;
      case 'github':
        provider = githubProvider;
        break;
      case 'twitter':
        provider = twitterProvider;
        break;
      case 'facebook':
        provider = facebookProvider;
        break;
      case 'apple':
        provider = appleProvider;
        break;
      default:
        throw new Error('Provider non supporté');
    }

    // Détecter si on est dans une app mobile
    const isMobileApp = window.Capacitor && window.Capacitor.isNative;
    
    try {
      if (isMobileApp) {
        // Sur mobile, essayer d'abord le popup, puis fallback vers le navigateur externe
        try {
          console.log('Tentative d\'authentification mobile avec popup...');
          const result = await signInWithPopup(auth, provider);
          await this.createUserProfile(result.user);
          return result.user;
        } catch (popupError) {
          console.log('Popup échoué, utilisation du navigateur externe:', popupError.message);
          
          // Fallback vers le navigateur externe
          const authUrl = await this.buildAuthUrl(provider, providerName);
          
          if (window.Capacitor && window.Capacitor.Plugins.Browser) {
            await window.Capacitor.Plugins.Browser.open({
              url: authUrl,
              windowName: '_self'
            });
          } else {
            window.open(authUrl, '_blank');
          }
          
          return { success: true, method: 'external_browser' };
        }
      } else {
        // Sur desktop, utiliser le popup
        const result = await signInWithPopup(auth, provider);
        await this.createUserProfile(result.user);
        return result.user;
      }
    } catch (error) {
      console.error('Erreur d\'authentification:', error);
      
      // Si c'est une erreur de sessionStorage, essayer le navigateur externe
      if (error.message.includes('sessionStorage') || error.message.includes('missing initial state')) {
        console.log('Erreur sessionStorage détectée, tentative avec navigateur externe...');
        try {
          const authUrl = await this.buildAuthUrl(provider, providerName);
          window.open(authUrl, '_blank');
          return { success: true, method: 'external_browser_fallback' };
        } catch (fallbackError) {
          console.error('Fallback échoué:', fallbackError);
          throw error; // Relancer l'erreur originale
        }
      }
      
      throw error;
    }
  },

  // Construire l'URL d'authentification pour le navigateur externe
  async buildAuthUrl(provider, providerName) {
    try {
      // Utiliser une approche différente pour éviter les problèmes de sessionStorage
      const authDomain = auth.config.authDomain;
      const apiKey = auth.config.apiKey;
      
      // URL de base pour l'authentification Firebase
      let authUrl = `https://${authDomain}/__/auth/handler?apiKey=${apiKey}`;
      
      // Ajouter les paramètres spécifiques au provider
      switch (providerName) {
        case 'google':
          authUrl += '&providerId=google.com';
          break;
        case 'github':
          authUrl += '&providerId=github.com';
          break;
        case 'facebook':
          authUrl += '&providerId=facebook.com';
          break;
        case 'twitter':
          authUrl += '&providerId=twitter.com';
          break;
        case 'apple':
          authUrl += '&providerId=apple.com';
          break;
      }
      
      // Ajouter l'URL de retour vers l'app
      authUrl += `&redirectUrl=${encodeURIComponent(window.location.origin)}`;
      
      return authUrl;
    } catch (error) {
      console.error('Erreur construction URL auth:', error);
      // Fallback vers l'URL Firebase standard
      return `https://${auth.config.authDomain}/__/auth/handler`;
    }
  },

  // Gérer le résultat de l'authentification par redirection
  async handleRedirectResult() {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        await this.createUserProfile(result.user);
        return result.user;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors du traitement de la redirection:', error);
      throw error;
    }
  },

  // Authentification email/mot de passe
  async signInWithEmail(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  },

  // Création de compte
  async createAccount(email, password, displayName) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      await this.createUserProfile(result.user);
      return result.user;
    } catch (error) {
      console.error('Erreur de création de compte:', error);
      throw error;
    }
  },

  // Déconnexion
  async signOut() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      throw error;
    }
  },

  // Réinitialisation du mot de passe
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Erreur de réinitialisation:', error);
      throw error;
    }
  },

  // Création du profil utilisateur
  async createUserProfile(user) {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || 'Utilisateur',
          photoURL: user.photoURL || null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastSeen: new Date().toISOString(),
          isOnline: true,
          status: 'disponible',
          bio: '',
          phoneNumber: user.phoneNumber || null,
          provider: user.providerData[0]?.providerId || 'email',
          settings: {
            notifications: true,
            soundEnabled: true,
            theme: 'dark',
            language: 'fr'
          }
        };

        await setDoc(userRef, userData);
        
        // Mettre à jour le statut en ligne dans Realtime Database
        const { databaseService } = await import('./database');
        await databaseService.updateOnlineStatus(user.uid, true);
        
        console.log('Profil utilisateur créé et synchronisé:', userData);
      }
    } catch (error) {
      console.error('Erreur de création du profil:', error);
      throw error;
    }
  },

  // Écouteur d'état d'authentification
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  },

  // Obtenir l'utilisateur actuel
  getCurrentUser() {
    return auth.currentUser;
  }
};
