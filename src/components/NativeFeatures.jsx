import React, { useState, useEffect } from 'react';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Preferences } from '@capacitor/preferences';
import { Share } from '@capacitor/share';
import { Device } from '@capacitor/device';
import { PushNotifications } from '@capacitor/push-notifications';
import { useApp } from './Context/AppContext';

const NativeFeatures = () => {
  const { theme } = useApp();
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [storedData, setStoredData] = useState('');
  const [notificationStatus, setNotificationStatus] = useState('');

  useEffect(() => {
    // Charger les informations de l'appareil au démarrage
    loadDeviceInfo();
    loadStoredData();
  }, []);

  const loadDeviceInfo = async () => {
    try {
      const info = await Device.getInfo();
      setDeviceInfo(info);
    } catch (error) {
      console.error('Erreur lors du chargement des infos appareil:', error);
    }
  };

  const loadStoredData = async () => {
    try {
      const { value } = await Preferences.get({ key: 'user_data' });
      setStoredData(value || 'Aucune donnée stockée');
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  // 📸 Prendre une photo
  const takePhoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri
      });
      
      setPhoto(image.webPath);
      console.log('Photo prise:', image);
    } catch (error) {
      console.error('Erreur lors de la prise de photo:', error);
    }
  };

  // 📍 Obtenir la géolocalisation
  const getLocation = async () => {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      setLocation(coordinates);
      console.log('Position:', coordinates);
    } catch (error) {
      console.error('Erreur lors de la géolocalisation:', error);
    }
  };

  // 💾 Sauvegarder des données
  const saveData = async () => {
    try {
      const dataToSave = `Données sauvegardées le ${new Date().toLocaleString()}`;
      await Preferences.set({
        key: 'user_data',
        value: dataToSave
      });
      setStoredData(dataToSave);
      console.log('Données sauvegardées');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  // 📤 Partager du contenu
  const shareContent = async () => {
    try {
      await Share.share({
        title: 'Mon Application Parallele',
        text: 'Découvrez cette super application !',
        url: 'https://mon-app.com',
        dialogTitle: 'Partager avec vos amis'
      });
    } catch (error) {
      console.error('Erreur lors du partage:', error);
    }
  };

  // 🔔 Configurer les notifications push
  const setupNotifications = async () => {
    try {
      // Demander les permissions
      const permission = await PushNotifications.requestPermissions();
      
      if (permission.receive === 'granted') {
        // S'inscrire aux notifications
        await PushNotifications.register();
        setNotificationStatus('Notifications activées');
        
        // Écouter les notifications reçues
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Notification reçue:', notification);
        });
        
        // Écouter les clics sur les notifications
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Action sur notification:', notification);
        });
      } else {
        setNotificationStatus('Permissions refusées');
      }
    } catch (error) {
      console.error('Erreur lors de la configuration des notifications:', error);
    }
  };

  return (
    <div className={`p-6 ${theme.bgColor} ${theme.textColor} h-full overflow-y-auto`}>
      <h2 className={`text-2xl font-bold mb-6 ${theme.textColor}`}>🚀 Fonctionnalités Natives</h2>
      
      {/* Informations de l'appareil */}
      {deviceInfo && (
        <div className={`p-4 rounded-lg mb-6 ${theme.messageBg} ${theme.borderColor} border`}>
          <h3 className={`text-lg font-semibold mb-3 ${theme.textColor}`}>📱 Informations Appareil</h3>
          <div className={`space-y-2 ${theme.secondaryText}`}>
            <p><strong className={theme.textColor}>Nom:</strong> {deviceInfo.name}</p>
            <p><strong className={theme.textColor}>Modèle:</strong> {deviceInfo.model}</p>
            <p><strong className={theme.textColor}>Plateforme:</strong> {deviceInfo.platform}</p>
            <p><strong className={theme.textColor}>Version:</strong> {deviceInfo.osVersion}</p>
          </div>
        </div>
      )}

      {/* Caméra */}
      <div className={`p-4 rounded-lg mb-6 ${theme.messageBg} ${theme.borderColor} border`}>
        <h3 className={`text-lg font-semibold mb-3 ${theme.textColor}`}>📸 Caméra</h3>
        <button 
          onClick={takePhoto} 
          className={`px-4 py-2 rounded-lg ${theme.buttonPrimary} transition-colors duration-200 hover:opacity-90`}
        >
          Prendre une photo
        </button>
        {photo && (
          <div className="mt-4">
            <img src={photo} alt="Photo prise" className="max-w-xs rounded-lg border" />
          </div>
        )}
      </div>

      {/* Géolocalisation */}
      <div className={`p-4 rounded-lg mb-6 ${theme.messageBg} ${theme.borderColor} border`}>
        <h3 className={`text-lg font-semibold mb-3 ${theme.textColor}`}>📍 Géolocalisation</h3>
        <button 
          onClick={getLocation} 
          className={`px-4 py-2 rounded-lg ${theme.buttonPrimary} transition-colors duration-200 hover:opacity-90`}
        >
          Obtenir ma position
        </button>
        {location && (
          <div className={`mt-4 p-3 rounded-lg ${theme.bgColor} ${theme.borderColor} border`}>
            <div className={`space-y-2 ${theme.secondaryText}`}>
              <p><strong className={theme.textColor}>Latitude:</strong> {location.coords.latitude}</p>
              <p><strong className={theme.textColor}>Longitude:</strong> {location.coords.longitude}</p>
              <p><strong className={theme.textColor}>Précision:</strong> {location.coords.accuracy}m</p>
            </div>
          </div>
        )}
      </div>

      {/* Stockage local */}
      <div className={`p-4 rounded-lg mb-6 ${theme.messageBg} ${theme.borderColor} border`}>
        <h3 className={`text-lg font-semibold mb-3 ${theme.textColor}`}>💾 Stockage Local</h3>
        <button 
          onClick={saveData} 
          className={`px-4 py-2 rounded-lg ${theme.buttonPrimary} transition-colors duration-200 hover:opacity-90`}
        >
          Sauvegarder des données
        </button>
        <p className={`mt-3 ${theme.secondaryText}`}>
          <strong className={theme.textColor}>Données stockées:</strong> {storedData}
        </p>
      </div>

      {/* Partage */}
      <div className={`p-4 rounded-lg mb-6 ${theme.messageBg} ${theme.borderColor} border`}>
        <h3 className={`text-lg font-semibold mb-3 ${theme.textColor}`}>📤 Partage</h3>
        <button 
          onClick={shareContent} 
          className={`px-4 py-2 rounded-lg ${theme.buttonPrimary} transition-colors duration-200 hover:opacity-90`}
        >
          Partager l'application
        </button>
      </div>

      {/* Notifications */}
      <div className={`p-4 rounded-lg mb-6 ${theme.messageBg} ${theme.borderColor} border`}>
        <h3 className={`text-lg font-semibold mb-3 ${theme.textColor}`}>🔔 Notifications Push</h3>
        <button 
          onClick={setupNotifications} 
          className={`px-4 py-2 rounded-lg ${theme.buttonPrimary} transition-colors duration-200 hover:opacity-90`}
        >
          Configurer les notifications
        </button>
        {notificationStatus && (
          <p className={`mt-3 ${theme.secondaryText}`}>
            <strong className={theme.textColor}>Statut:</strong> {notificationStatus}
          </p>
        )}
      </div>

    </div>
  );
};

export default NativeFeatures; 