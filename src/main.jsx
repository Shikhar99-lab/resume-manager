/**
 * main.jsx — Entry Point
 *
 * This is the FIRST file that runs.
 * It mounts the React app into the <div id="root"> in index.html.
 *
 * React 18 uses createRoot() instead of the old ReactDOM.render().
 * StrictMode runs your components twice in development to catch bugs early —
 * you might notice useEffect firing twice; that's normal and expected.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
