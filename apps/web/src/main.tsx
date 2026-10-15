import React from 'react';
import ReactDOM from 'react-dom/client';
import './lib/i18n.js';
import './styles/globals.css';
import { App } from './app/App.js';
import { replayOfflineQueue } from './lib/offlineQueue.js';

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

// ─── Service Worker Registration ──────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        // Listen for messages from SW (e.g., REPLAY_OFFLINE_QUEUE after background sync)
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data?.type === 'REPLAY_OFFLINE_QUEUE') {
            void replayOfflineQueue();
          }
        });

        // Also replay immediately when device comes back online
        window.addEventListener('online', () => {
          void replayOfflineQueue();
        });

        console.debug('[SAATHI SW] Registered:', reg.scope);
      })
      .catch((err) => {
        console.warn('[SAATHI SW] Registration failed:', err);
      });
  });
}
