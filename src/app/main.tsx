import '@fontsource/barlow-condensed/latin-600.css';
import '@fontsource/barlow-condensed/latin-700.css';
import '@fontsource/figtree/latin-400.css';
import '@fontsource/figtree/latin-500.css';
import '@fontsource/figtree/latin-600.css';
import '@fontsource/figtree/latin-700.css';
import '@/shared/styles/global.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { captureInstallPrompt } from '@/shared/lib/installPrompt';
import { createAppServices } from './container';
import { AppProviders } from './providers';
import { createAppRouter } from './router';
import { UpdatePrompt } from './UpdatePrompt';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Elemen #root tidak ditemukan di index.html');

captureInstallPrompt();
const root = createRoot(rootElement);

createAppServices()
  .then((services) => {
    const router = createAppRouter();
    root.render(
      <StrictMode>
        <AppProviders services={services}>
          <RouterProvider router={router} />
          <UpdatePrompt />
        </AppProviders>
      </StrictMode>,
    );
  })
  .catch((error: unknown) => {
    console.error(error);
    // Tanpa IndexedDB (mis. mode privat tertentu) aplikasi tidak bisa menyimpan data.
    root.render(
      <p style={{ padding: 24 }}>
        Kratos tidak bisa membuka penyimpanan di browser ini. Nonaktifkan mode privat atau coba
        browser lain.
      </p>,
    );
  });
