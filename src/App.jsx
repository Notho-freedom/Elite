import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AppProvider } from './components/Context/AppContext';
import { ThemeProvider } from './components/Context/ThemeContext';
import { AuthProvider } from './components/Context/AuthContext';
import { NotificationProvider } from './components/chat/Notif';
import MainView from './components/MainView';
import Loading from './components/Loading';
import { useAuth } from './components/Context/AuthContext';
import './App.css';

// Composant wrapper pour utiliser les hooks
const AppContent = () => {
  const { loading: authLoading } = useAuth();

  if (authLoading) {
    return <Loading />;
  }

  return <MainView />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <NotificationProvider>
              <AppContent />
          </NotificationProvider>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
