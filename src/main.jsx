import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './components/Context/ThemeContext.jsx'
import { AppProvider } from './components/Context/AppContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <ThemeProvider>
          <App />
      </ThemeProvider>
    </AppProvider>
  </StrictMode>,
)
