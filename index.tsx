import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Safe environment check for Vite
const isProd = import.meta.env?.PROD ?? false;

if ('serviceWorker' in navigator && isProd) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW failed:', err));
  });
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
