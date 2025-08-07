import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
   FaMicrophone, FaVideo, FaWifi,
  FaCheck, FaSignal, FaBatteryThreeQuarters
} from 'react-icons/fa6';
import {  FaTimes, FaCog } from 'react-icons/fa';
import { useCallStore } from '../../../lib/callStore';

const CallSettings = ({ onClose }) => {
  const { settings, updateSettings } = useCallStore();
  const [activeTab, setActiveTab] = useState('audio');
  const [localSettings, setLocalSettings] = useState(settings);

  const tabs = [
    { id: 'audio', label: 'Audio', icon: FaMicrophone },
    { id: 'video', label: 'Vidéo', icon: FaVideo },
    { id: 'general', label: 'Général', icon: FaCog }
  ];

  const audioDevices = [
    { id: 'default', name: 'Périphérique par défaut', type: 'microphone' },
    { id: 'headphones', name: 'Casque USB', type: 'microphone' },
    { id: 'webcam', name: 'Micro webcam', type: 'microphone' }
  ];

  const videoDevices = [
    { id: 'default', name: 'Caméra par défaut', type: 'camera' },
    { id: 'webcam', name: 'Webcam HD', type: 'camera' },
    { id: 'external', name: 'Caméra externe', type: 'camera' }
  ];

  const videoQualities = [
    { id: 'auto', name: 'Automatique', description: 'Ajuste selon la connexion' },
    { id: 'hd', name: 'HD (720p)', description: 'Qualité standard' },
    { id: 'fullhd', name: 'Full HD (1080p)', description: 'Haute qualité' },
    { id: '4k', name: '4K (2160p)', description: 'Qualité maximale' }
  ];

  const handleSave = () => {
    updateSettings(localSettings);
    onClose();
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    onClose();
  };

  const renderAudioTab = () => (
    <div className="space-y-6">
      {/* Périphériques audio */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Périphériques audio</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Microphone
            </label>
            <select 
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={localSettings.microphoneDevice || 'default'}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, microphoneDevice: e.target.value }))}
            >
              {audioDevices.map(device => (
                <option key={device.id} value={device.id}>{device.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Haut-parleurs
            </label>
            <select 
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={localSettings.speakerDevice || 'default'}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, speakerDevice: e.target.value }))}
            >
              {audioDevices.map(device => (
                <option key={device.id} value={device.id}>{device.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Paramètres audio */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Paramètres audio</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-300">Réduction de bruit</label>
              <p className="text-xs text-gray-400">Améliore la qualité audio</p>
            </div>
            <button
              onClick={() => setLocalSettings(prev => ({ ...prev, noiseReduction: !prev.noiseReduction }))}
              className={`w-12 h-6 rounded-full transition-colors ${
                localSettings.noiseReduction ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                localSettings.noiseReduction ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-300">Annulation d'écho</label>
              <p className="text-xs text-gray-400">Évite les retours audio</p>
            </div>
            <button
              onClick={() => setLocalSettings(prev => ({ ...prev, echoCancellation: !prev.echoCancellation }))}
              className={`w-12 h-6 rounded-full transition-colors ${
                localSettings.echoCancellation ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                localSettings.echoCancellation ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-300">Mode haut-parleur par défaut</label>
              <p className="text-xs text-gray-400">Active le haut-parleur au début</p>
            </div>
            <button
              onClick={() => setLocalSettings(prev => ({ ...prev, speakerMode: !prev.speakerMode }))}
              className={`w-12 h-6 rounded-full transition-colors ${
                localSettings.speakerMode ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                localSettings.speakerMode ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVideoTab = () => (
    <div className="space-y-6">
      {/* Périphériques vidéo */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Périphériques vidéo</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Caméra
          </label>
          <select 
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={localSettings.cameraDevice || 'default'}
            onChange={(e) => setLocalSettings(prev => ({ ...prev, cameraDevice: e.target.value }))}
          >
            {videoDevices.map(device => (
              <option key={device.id} value={device.id}>{device.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Qualité vidéo */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Qualité vidéo</h3>
        
        <div className="space-y-3">
          {videoQualities.map(quality => (
            <div
              key={quality.id}
              onClick={() => setLocalSettings(prev => ({ ...prev, videoQuality: quality.id }))}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                localSettings.videoQuality === quality.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">{quality.name}</div>
                  <div className="text-gray-400 text-sm">{quality.description}</div>
                </div>
                {localSettings.videoQuality === quality.id && (
                  <FaCheck className="text-blue-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Paramètres vidéo */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Paramètres vidéo</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-300">Vidéo par défaut</label>
              <p className="text-xs text-gray-400">Active la caméra au début</p>
            </div>
            <button
              onClick={() => setLocalSettings(prev => ({ ...prev, videoOnStart: !prev.videoOnStart }))}
              className={`w-12 h-6 rounded-full transition-colors ${
                localSettings.videoOnStart ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                localSettings.videoOnStart ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-300">Optimisation automatique</label>
              <p className="text-xs text-gray-400">Ajuste la qualité selon la connexion</p>
            </div>
            <button
              onClick={() => setLocalSettings(prev => ({ ...prev, autoOptimization: !prev.autoOptimization }))}
              className={`w-12 h-6 rounded-full transition-colors ${
                localSettings.autoOptimization ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                localSettings.autoOptimization ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGeneralTab = () => (
    <div className="space-y-6">
      {/* Paramètres généraux */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Paramètres généraux</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-300">Réponse automatique</label>
              <p className="text-xs text-gray-400">Répond automatiquement aux appels</p>
            </div>
            <button
              onClick={() => setLocalSettings(prev => ({ ...prev, autoAnswer: !prev.autoAnswer }))}
              className={`w-12 h-6 rounded-full transition-colors ${
                localSettings.autoAnswer ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                localSettings.autoAnswer ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-300">Mute par défaut</label>
              <p className="text-xs text-gray-400">Coupe le micro au début</p>
            </div>
            <button
              onClick={() => setLocalSettings(prev => ({ ...prev, muteOnStart: !prev.muteOnStart }))}
              className={`w-12 h-6 rounded-full transition-colors ${
                localSettings.muteOnStart ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                localSettings.muteOnStart ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-300">Enregistrement automatique</label>
              <p className="text-xs text-gray-400">Enregistre tous les appels</p>
            </div>
            <button
              onClick={() => setLocalSettings(prev => ({ ...prev, autoRecord: !prev.autoRecord }))}
              className={`w-12 h-6 rounded-full transition-colors ${
                localSettings.autoRecord ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                localSettings.autoRecord ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Informations système */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Informations système</h3>
        
        <div className="bg-gray-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">Connexion</span>
            <div className="flex items-center space-x-2">
              <FaWifi className="text-green-400" />
              <span className="text-white text-sm">WiFi - Excellent</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">Signal</span>
            <div className="flex items-center space-x-2">
              <FaSignal className="text-green-400" />
              <span className="text-white text-sm">5 barres</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">Batterie</span>
            <div className="flex items-center space-x-2">
              <FaBatteryThreeQuarters className="text-yellow-400" />
              <span className="text-white text-sm">75%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <FaCog className="text-blue-500 text-xl" />
              <h2 className="text-xl font-bold text-white">Paramètres d'appel</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <FaTimes className="text-gray-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-500 border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <tab.icon />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {activeTab === 'audio' && renderAudioTab()}
            {activeTab === 'video' && renderVideoTab()}
            {activeTab === 'general' && renderGeneralTab()}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-700">
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              Enregistrer
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CallSettings;
