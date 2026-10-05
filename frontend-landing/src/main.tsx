import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { installUmamiTracker } from './lib/umami';

installUmamiTracker({
  hostUrl: import.meta.env.VITE_UMAMI_HOST_URL || '',
  websiteId: import.meta.env.VITE_UMAMI_WEBSITE_ID || '',
  domains: ['flotteq.fr', 'www.flotteq.fr'],
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
