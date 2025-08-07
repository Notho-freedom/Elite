import React, { useState, useEffect } from 'react';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Preferences } from '@capacitor/preferences';
import { Share } from '@capacitor/share';
import { Device } from '@capacitor/device';
import { PushNotifications } from '@capacitor/push-notifications';

const NativeFeatures = () => {
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
    <div className="native-features">
      <h2>🚀 Fonctionnalités Natives</h2>
      
      {/* Informations de l'appareil */}
      {deviceInfo && (
        <div className="device-info">
          <h3>📱 Informations Appareil</h3>
          <p><strong>Nom:</strong> {deviceInfo.name}</p>
          <p><strong>Modèle:</strong> {deviceInfo.model}</p>
          <p><strong>Plateforme:</strong> {deviceInfo.platform}</p>
          <p><strong>Version:</strong> {deviceInfo.osVersion}</p>
        </div>
      )}

      {/* Caméra */}
      <div className="feature-section">
        <h3>📸 Caméra</h3>
        <button onClick={takePhoto} className="feature-btn">
          Prendre une photo
        </button>
        {photo && (
          <div className="photo-preview">
            <img src={photo} alt="Photo prise" style={{ maxWidth: '200px' }} />
          </div>
        )}
      </div>

      {/* Géolocalisation */}
      <div className="feature-section">
        <h3>📍 Géolocalisation</h3>
        <button onClick={getLocation} className="feature-btn">
          Obtenir ma position
        </button>
        {location && (
          <div className="location-info">
            <p><strong>Latitude:</strong> {location.coords.latitude}</p>
            <p><strong>Longitude:</strong> {location.coords.longitude}</p>
            <p><strong>Précision:</strong> {location.coords.accuracy}m</p>
          </div>
        )}
      </div>

      {/* Stockage local */}
      <div className="feature-section">
        <h3>💾 Stockage Local</h3>
        <button onClick={saveData} className="feature-btn">
          Sauvegarder des données
        </button>
        <p><strong>Données stockées:</strong> {storedData}</p>
      </div>

      {/* Partage */}
      <div className="feature-section">
        <h3>📤 Partage</h3>
        <button onClick={shareContent} className="feature-btn">
          Partager l'application
        </button>
      </div>

      {/* Notifications */}
      <div className="feature-section">
        <h3>🔔 Notifications Push</h3>
        <button onClick={setupNotifications} className="feature-btn">
          Configurer les notifications
        </button>
        {notificationStatus && (
          <p><strong>Statut:</strong> {notificationStatus}</p>
        )}
      </div>

      <style jsx>{`
        .native-features {
          padding: 20px;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .feature-section {
          margin: 20px 0;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: #f9f9f9;
        }
        
        .feature-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          margin: 5px 0;
        }
        
        .feature-btn:hover {
          background: #0056b3;
        }
        
        .device-info {
          background: #e3f2fd;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
        }
        
        .photo-preview {
          margin: 10px 0;
        }
        
        .location-info {
          background: #f0f8ff;
          padding: 10px;
          border-radius: 5px;
          margin: 10px 0;
        }
      `}</style>
    </div>
  );
};

export default NativeFeatures; 