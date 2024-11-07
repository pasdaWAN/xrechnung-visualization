import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './styles/global.css';
import { TranslationProvider } from './contexts/TranslationContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <TranslationProvider>
      <App />
    </TranslationProvider>
  </React.StrictMode>
); 