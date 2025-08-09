import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppProvider } from './components/Context/AppContext'
import { ThemeProvider } from './components/Context/ThemeContext'
import { AuthProvider } from './components/Context/AuthContext'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <App />
        </AppProvider>
<<<<<<< Current (Your changes)
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>
=======
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
>>>>>>> Incoming (Background Agent changes)
)
