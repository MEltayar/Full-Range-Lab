import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { initSentry } from './lib/sentry';

initSentry();

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found. Check index.html.');
createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Remove the HTML boot spinner as soon as React has mounted
document.getElementById('app-boot')?.remove();
