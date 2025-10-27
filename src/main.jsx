import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './components/Context/ThemeContext.jsx'
import { AppProvider } from './components/Context/AppContext.jsx'
import { AuthProvider } from './components/Context/AuthContext.jsx'
import { NotificationProvider } from './components/chat/Notif.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <AppProvider>
          <NotificationProvider>
          <App />
          </NotificationProvider>
        </AppProvider>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>
)
