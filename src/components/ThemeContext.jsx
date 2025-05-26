// context/ThemeContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { theme } from './theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('dark'); // ou 'light'

  const toggleTheme = () => {
    setMode(prev => (prev === 'dark' ? 'light' : 'dark'));
  };
  
  useEffect(() => {
    const storedMode = localStorage.getItem('themeMode');
    if (storedMode) setMode(storedMode);
  }, []);
  
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);
  

  return (
    <ThemeContext.Provider value={{ theme: theme[mode], mode, setMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
