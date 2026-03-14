import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global fetch interceptor - auto add Bearer token
const originalFetch = window.fetch;
window.fetch = function(...args) {
    const token = localStorage.getItem('auth_token');
    if (token) {
        if (!args[1]) args[1] = {};
        if (!args[1].headers) args[1].headers = {};
        
        if (args[1].headers instanceof Headers) {
            args[1].headers.set('Authorization', `Bearer ${token}`);
        } else {
            args[1].headers['Authorization'] = `Bearer ${token}`;
        }
    }
    return originalFetch.apply(this, args);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
