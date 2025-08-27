import { useState, useEffect } from 'react';
import { authService } from '../firebase/auth';

export const useMobileAuth = () => {
  const [isMobileApp, setIsMobileApp] = useState(false);
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);

  useEffect(() => {
    // Détecter si l'app est dans un environnement mobile
    const detectMobileApp = () => {
      const mobile = window.Capacitor && window.Capacitor.isNative;
      setIsMobileApp(mobile);
      return mobile;
    };

    detectMobileApp();
  }, []);

  // Authentification avec gestion mobile/desktop
  const signInWithProvider = async (providerName) => {
    try {
      setIsProcessingAuth(true);
      
      if (isMobileApp) {
        // Sur mobile, utiliser la redirection
        console.log('Authentification mobile avec redirection vers:', providerName);
        await authService.signInWithProvider(providerName);
        // L'utilisateur sera redirigé vers le navigateur externe
        return { success: true, method: 'redirect' };
      } else {
        // Sur desktop, utiliser le popup
        console.log('Authentification desktop avec popup:', providerName);
        const user = await authService.signInWithProvider(providerName);
        return { success: true, method: 'popup', user };
      }
    } catch (error) {
      console.error('Erreur d\'authentification:', error);
      return { success: false, error };
    } finally {
      setIsProcessingAuth(false);
    }
  };

  // Vérifier le résultat de l'authentification par redirection
  const checkRedirectResult = async () => {
    try {
      const user = await authService.handleRedirectResult();
      if (user) {
        console.log('Utilisateur authentifié via redirection:', user);
        return { success: true, user };
      }
      return { success: false, user: null };
    } catch (error) {
      console.error('Erreur lors de la vérification de la redirection:', error);
      return { success: false, error };
    }
  };

  // Ouvrir un lien dans le navigateur externe (pour l'authentification)
  const openExternalBrowser = async (url) => {
    if (!isMobileApp) {
      // Sur desktop, ouvrir dans un nouvel onglet
      window.open(url, '_blank');
      return;
    }

    try {
      // Sur mobile, utiliser le plugin Browser de Capacitor
      if (window.Capacitor && window.Capacitor.Plugins.Browser) {
        await window.Capacitor.Plugins.Browser.open({
          url: url,
          windowName: '_self'
        });
      } else {
        // Fallback
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du navigateur:', error);
      // Fallback vers l'ouverture standard
      window.open(url, '_blank');
    }
  };

  return {
    isMobileApp,
    isProcessingAuth,
    signInWithProvider,
    checkRedirectResult,
    openExternalBrowser
  };
};
