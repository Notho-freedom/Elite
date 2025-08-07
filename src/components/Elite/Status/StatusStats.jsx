import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaEye, FaHeart, FaComment, FaShare, FaCoins, FaChartLine, FaCrown, FaClock } from 'react-icons/fa';
import { BsGraphDown, BsGraphUp } from 'react-icons/bs';
import { useStatusStore } from '../../../lib/statusStore';
import { useApp } from '../../Context/AppContext';

const StatusStats = ({ onClose }) => {
  const { theme } = useApp();
  const { myStatuses, stats, paymentHistory } = useStatusStore();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedStatus, setSelectedStatus] = useState(null);

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: <FaChartLine /> },
    { id: 'earnings', label: 'Gains', icon: <FaCoins /> },
    { id: 'engagement', label: 'Engagement', icon: <FaHeart /> },
    { id: 'performance', label: 'Performance', icon: <BsGraphUp /> }
  ];

  const timeRanges = [
    { id: '24h', label: '24h' },
    { id: '7d', label: '7j' },
    { id: '30d', label: '30j' },
    { id: '90d', label: '90j' }
  ];

  // Calculer les statistiques filtrées par période
  const getFilteredStats = () => {
    const now = new Date();
    const filterDate = new Date();
    
    switch (timeRange) {
      case '24h':
        filterDate.setHours(filterDate.getHours() - 24);
        break;
      case '7d':
        filterDate.setDate(filterDate.getDate() - 7);
        break;
      case '30d':
        filterDate.setDate(filterDate.getDate() - 30);
        break;
      case '90d':
        filterDate.setDate(filterDate.getDate() - 90);
        break;
      default:
        filterDate.setDate(filterDate.getDate() - 7);
    }

    const filteredStatuses = myStatuses.filter(status => 
      new Date(status.createdAt) >= filterDate
    );

    const totalViews = filteredStatuses.reduce((sum, status) => sum + status.views.length, 0);
    const totalReactions = filteredStatuses.reduce((sum, status) => sum + status.reactions.length, 0);
    const totalReplies = filteredStatuses.reduce((sum, status) => sum + status.replies.length, 0);
    const totalEarnings = filteredStatuses.reduce((sum, status) => sum + status.earnings, 0);
    const eliteStatuses = filteredStatuses.filter(status => status.type === 'elite');
    const monetizedViews = eliteStatuses.reduce((sum, status) => sum + status.views.length, 0);

    return {
      totalViews,
      totalReactions,
      totalReplies,
      totalEarnings,
      statusCount: filteredStatuses.length,
      eliteCount: eliteStatuses.length,
      monetizedViews,
      averageViews: filteredStatuses.length > 0 ? totalViews / filteredStatuses.length : 0,
      averageEarnings: filteredStatuses.length > 0 ? totalEarnings / filteredStatuses.length : 0
    };
  };

  const filteredStats = getFilteredStats();

  // Données pour les graphiques (simulation)
  const getChartData = () => {
    const days = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toLocaleDateString(),
        views: Math.floor(Math.random() * 100) + 10,
        earnings: Math.floor(Math.random() * 50) + 5,
        reactions: Math.floor(Math.random() * 20) + 2
      });
    }
    
    return data;
  };

  const chartData = getChartData();

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <FaEye className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-500">Vues totales</span>
          </div>
          <p className="text-2xl font-bold">{filteredStats.totalViews.toLocaleString()}</p>
          <p className="text-sm text-green-500">+12% vs période précédente</p>
        </div>

        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <FaCoins className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-gray-500">Gains totaux</span>
          </div>
          <p className="text-2xl font-bold">{filteredStats.totalEarnings.toLocaleString()}</p>
          <p className="text-sm text-green-500">+8% vs période précédente</p>
        </div>

        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <FaHeart className="w-5 h-5 text-red-500" />
            <span className="text-sm text-gray-500">Réactions</span>
          </div>
          <p className="text-2xl font-bold">{filteredStats.totalReactions.toLocaleString()}</p>
          <p className="text-sm text-green-500">+15% vs période précédente</p>
        </div>

        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <FaComment className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-500">Commentaires</span>
          </div>
          <p className="text-2xl font-bold">{filteredStats.totalReplies.toLocaleString()}</p>
          <p className="text-sm text-green-500">+5% vs période précédente</p>
        </div>
      </div>

      {/* Graphique des vues */}
      <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className="text-lg font-semibold mb-4">Évolution des vues</h3>
        <div className="h-64 flex items-end gap-2">
          {chartData.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-blue-500 rounded-t"
                style={{ height: `${(data.views / 100) * 200}px` }}
              />
              <span className="text-xs mt-2 text-gray-500">{data.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Statuts les plus performants */}
      <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className="text-lg font-semibold mb-4">Statuts les plus performants</h3>
        <div className="space-y-3">
          {myStatuses
            .sort((a, b) => b.views.length - a.views.length)
            .slice(0, 5)
            .map((status, index) => (
              <div key={status.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-500">#{index + 1}</span>
                  <div>
                    <p className="font-medium">
                      {status.type === 'text' ? status.content.substring(0, 50) + '...' : `${status.type} status`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(status.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <FaEye className="w-4 h-4" />
                    {status.views.length}
                  </span>
                  {status.monetization?.enabled && (
                    <span className="flex items-center gap-1 text-yellow-500">
                      <FaCoins className="w-4 h-4" />
                      {status.earnings}
                    </span>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  const renderEarnings = () => (
    <div className="space-y-6">
      {/* Résumé des gains */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-3 mb-4">
            <FaCoins className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-500">Gains totaux</p>
              <p className="text-2xl font-bold">{filteredStats.totalEarnings.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <BsGraphUp className="text-green-500" />
            <span className="text-green-500">+12% ce mois</span>
          </div>
        </div>

        <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-3 mb-4">
            <FaCrown className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500">Statuts Elite</p>
              <p className="text-2xl font-bold">{filteredStats.eliteCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FaEye className="text-blue-500" />
            <span className="text-blue-500">{filteredStats.monetizedViews} vues payantes</span>
          </div>
        </div>

        <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-3 mb-4">
            <BsGraphUp className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Gain moyen</p>
              <p className="text-2xl font-bold">{filteredStats.averageEarnings.toFixed(1)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FaCoins className="text-yellow-500" />
            <span className="text-yellow-500">par statut</span>
          </div>
        </div>
      </div>

      {/* Graphique des gains */}
      <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className="text-lg font-semibold mb-4">Évolution des gains</h3>
        <div className="h-64 flex items-end gap-2">
          {chartData.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-yellow-500 rounded-t"
                style={{ height: `${(data.earnings / 50) * 200}px` }}
              />
              <span className="text-xs mt-2 text-gray-500">{data.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Historique des paiements */}
      <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className="text-lg font-semibold mb-4">Historique des paiements</h3>
        <div className="space-y-3">
          {paymentHistory.slice(0, 10).map((payment) => (
            <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <FaCoins className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="font-medium">Paiement #{payment.id.slice(-6)}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-yellow-500">+{payment.amount} Elite-Coins</p>
                <p className="text-sm text-gray-500">{payment.type}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEngagement = () => (
    <div className="space-y-6">
      {/* Métriques d'engagement */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <FaHeart className="w-5 h-5 text-red-500" />
            <span className="text-sm text-gray-500">Taux de réaction</span>
          </div>
          <p className="text-2xl font-bold">
            {filteredStats.totalViews > 0 
              ? ((filteredStats.totalReactions / filteredStats.totalViews) * 100).toFixed(1)
              : 0}%
          </p>
        </div>

        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <FaComment className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-500">Taux de commentaire</span>
          </div>
          <p className="text-2xl font-bold">
            {filteredStats.totalViews > 0 
              ? ((filteredStats.totalReplies / filteredStats.totalViews) * 100).toFixed(1)
              : 0}%
          </p>
        </div>

        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <FaShare className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-500">Partages</span>
          </div>
          <p className="text-2xl font-bold">0</p>
        </div>

        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <FaClock className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-gray-500">Temps moyen</span>
          </div>
          <p className="text-2xl font-bold">2.3s</p>
        </div>
      </div>

      {/* Graphique d'engagement */}
      <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className="text-lg font-semibold mb-4">Engagement par jour</h3>
        <div className="h-64 flex items-end gap-2">
          {chartData.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-red-500 rounded-t"
                style={{ height: `${(data.reactions / 20) * 200}px` }}
              />
              <span className="text-xs mt-2 text-gray-500">{data.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-6">
      {/* Indicateurs de performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h3 className="text-lg font-semibold mb-4">Performance par type</h3>
          <div className="space-y-4">
            {['text', 'image', 'video', 'audio', 'elite'].map((type) => {
              const typeStatuses = myStatuses.filter(s => s.type === type);
              const avgViews = typeStatuses.length > 0 
                ? typeStatuses.reduce((sum, s) => sum + s.views.length, 0) / typeStatuses.length 
                : 0;
              
              return (
                <div key={type} className="flex items-center justify-between">
                  <span className="capitalize">{type}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.min((avgViews / 50) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{avgViews.toFixed(0)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h3 className="text-lg font-semibold mb-4">Tendances</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Vues</span>
              <div className="flex items-center gap-2 text-green-500">
                <BsGraphUp />
                <span>+12%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Engagement</span>
              <div className="flex items-center gap-2 text-green-500">
                <BsGraphUp />
                <span>+8%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Gains</span>
              <div className="flex items-center gap-2 text-green-500">
                <BsGraphUp />
                <span>+15%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Rétention</span>
              <div className="flex items-center gap-2 text-red-500">
                <BsGraphDown />
                <span>-3%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-lg ${
          theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">Statistiques des statuts</h2>
            
            {/* Filtre de période */}
            <div className="flex items-center gap-2">
              {timeRanges.map((range) => (
                <button
                  key={range.id}
                  onClick={() => setTimeRange(range.id)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    timeRange === range.id
                      ? 'bg-blue-500 text-white'
                      : theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium ${
                activeTab === tab.id
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'earnings' && renderEarnings()}
          {activeTab === 'engagement' && renderEngagement()}
          {activeTab === 'performance' && renderPerformance()}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StatusStats;
