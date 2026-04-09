import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Triggering fresh deploy to apply restricted API key - 2026-04-07
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
