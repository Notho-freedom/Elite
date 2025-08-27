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
  OAuthProvider
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
  // Authentification avec popup
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

    try {
      const result = await signInWithPopup(auth, provider);
      await this.createUserProfile(result.user);
      return result.user;
    } catch (error) {
      console.error('Erreur d\'authentification:', error);
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
