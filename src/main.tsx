import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Capture referral code from URL and store temporarily
try {
  const params = new URLSearchParams(window.location.search)
  const ref = params.get('ref')
  if (ref) localStorage.setItem('ref_code', ref)
} catch {}

createRoot(document.getElementById("root")!).render(<App />);
