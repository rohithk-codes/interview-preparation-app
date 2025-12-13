import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import  "./index.css"
import App from './App.tsx'
import { GoogleAuthWrapper } from './components/GoogleAuthWrapper.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
    <GoogleAuthWrapper>
      <App />
    </GoogleAuthWrapper>
  </StrictMode>
)
