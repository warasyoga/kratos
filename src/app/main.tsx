import '@fontsource/barlow-condensed/600.css';
import '@fontsource/barlow-condensed/700.css';
import '@fontsource/figtree/400.css';
import '@fontsource/figtree/500.css';
import '@fontsource/figtree/600.css';
import '@fontsource/figtree/700.css';
import '@/shared/styles/global.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { createServices } from './container';
import { AppProviders } from './providers';
import { createAppRouter } from './router';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Elemen #root tidak ditemukan di index.html');

const services = createServices();
const router = createAppRouter();

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders services={services}>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
);
