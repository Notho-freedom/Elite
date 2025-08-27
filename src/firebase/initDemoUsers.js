import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

// Utilisateurs de démonstration pour Elite
const demoUsers = [
  {
    uid: 'demo_user_1',
    email: 'alice.martin@elite.com',
    displayName: 'Alice Martin',
    photoURL: 'https://ui-avatars.com/api/?name=Alice+Martin&background=random&color=fff',
    status: 'disponible',
    bio: 'Développeuse passionnée par les nouvelles technologies',
    isOnline: true,
    lastSeen: new Date().toISOString(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    settings: {
      notifications: true,
      soundEnabled: true,
      theme: 'dark',
      language: 'fr'
    }
  },
  {
    uid: 'demo_user_2',
    email: 'bob.dupont@elite.com',
    displayName: 'Bob Dupont',
    photoURL: 'https://ui-avatars.com/api/?name=Bob+Dupont&background=random&color=fff',
    status: 'occupé',
    bio: 'Designer créatif spécialisé en UX/UI',
    isOnline: false,
    lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    settings: {
      notifications: true,
      soundEnabled: false,
      theme: 'light',
      language: 'fr'
    }
  },
  {
    uid: 'demo_user_3',
    email: 'claire.dubois@elite.com',
    displayName: 'Claire Dubois',
    photoURL: 'https://ui-avatars.com/api/?name=Claire+Dubois&background=random&color=fff',
    status: 'disponible',
    bio: 'Product Manager chez Elite',
    isOnline: true,
    lastSeen: new Date().toISOString(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    settings: {
      notifications: true,
      soundEnabled: true,
      theme: 'dark',
      language: 'fr'
    }
  },
  {
    uid: 'demo_user_4',
    email: 'david.leroy@elite.com',
    displayName: 'David Leroy',
    photoURL: 'https://ui-avatars.com/api/?name=David+Leroy&background=random&color=fff',
    status: 'absent',
    bio: 'Architecte logiciel senior',
    isOnline: false,
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    settings: {
      notifications: false,
      soundEnabled: false,
      theme: 'dark',
      language: 'en'
    }
  },
  {
    uid: 'demo_user_5',
    email: 'emma.rousseau@elite.com',
    displayName: 'Emma Rousseau',
    photoURL: 'https://ui-avatars.com/api/?name=Emma+Rousseau&background=random&color=fff',
    status: 'disponible',
    bio: 'Data Scientist passionnée par l\'IA',
    isOnline: true,
    lastSeen: new Date().toISOString(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    settings: {
      notifications: true,
      soundEnabled: true,
      theme: 'dark',
      language: 'fr'
    }
  }
];

// Fonction pour initialiser les utilisateurs de démonstration
export const initDemoUsers = async () => {
  try {
    console.log('Initialisation des utilisateurs de démonstration...');
    
    for (const userData of demoUsers) {
      const userRef = doc(db, 'users', userData.uid);
      await setDoc(userRef, userData);
      console.log(`Utilisateur créé: ${userData.displayName}`);
    }
    
    console.log('✅ Utilisateurs de démonstration initialisés avec succès!');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des utilisateurs:', error);
    return false;
  }
};

// Fonction pour vérifier si les utilisateurs de démonstration existent
export const checkDemoUsers = async () => {
  try {
    const { getDocs, collection } = await import('firebase/firestore');
    const snapshot = await getDocs(collection(db, 'users'));
    const userCount = snapshot.size;
    console.log(`Nombre d'utilisateurs dans Firestore: ${userCount}`);
    return userCount > 0;
  } catch (error) {
    console.error('Erreur lors de la vérification des utilisateurs:', error);
    return false;
  }
};
