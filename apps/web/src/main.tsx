import React from 'react';
import ReactDOM from 'react-dom/client';
import './lib/i18n.js';
import './styles/globals.css';
import { App } from './app/App.js';

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
