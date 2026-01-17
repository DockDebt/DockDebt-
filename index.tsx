import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Safe environment check for Vite build process
const isProd = typeof import.meta !== 'undefined' && import.meta.env?.PROD;

if ('serviceWorker' in navigator && isProd) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => console.error('SW registration failed:', err));
  });
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
