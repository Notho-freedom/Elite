import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDZEsX8Ufs_BJfBWkmN1AyYZrXuEYoTtl4",
  authDomain: "elite-92ea6.firebaseapp.com",
  projectId: "elite-92ea6",
  storageBucket: "elite-92ea6.firebasestorage.app",
  messagingSenderId: "259231999850",
  appId: "1:259231999850:web:eca5565906dd6826d66713",
  measurementId: "G-B42ED1J3MB",
  databaseURL: "https://elite-92ea6-default-rtdb.europe-west1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app);
export const analytics = getAnalytics(app);

export default app;
