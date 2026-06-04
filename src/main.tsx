import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// ─── Error overlay — shows crashes visually before DevTools is open ──────────
window.addEventListener('error', (e) => {
  const div = document.createElement('div')
  div.style.cssText =
    'position:fixed;top:0;left:0;background:red;color:white;font-size:10px;z-index:9999;padding:4px;max-width:300px;word-break:break-all'
  div.textContent = e.message + ' | ' + e.filename + ':' + e.lineno
  document.body.appendChild(div)
})

window.addEventListener('unhandledrejection', (e) => {
  const div = document.createElement('div')
  div.style.cssText =
    'position:fixed;top:20px;left:0;background:orange;color:white;font-size:10px;z-index:9999;padding:4px;max-width:300px;word-break:break-all'
  div.textContent = String(e.reason)
  document.body.appendChild(div)
})
// ─────────────────────────────────────────────────────────────────────────────

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
