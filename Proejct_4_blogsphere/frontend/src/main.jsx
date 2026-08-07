import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import './styles/index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#14171F',
          color: '#F3F2ED',
          fontSize: '14px',
          borderRadius: '10px',
        },
        success: { iconTheme: { primary: '#C99A2E', secondary: '#14171F' } },
        error: { iconTheme: { primary: '#C1443C', secondary: '#14171F' } },
      }}
    />
  </StrictMode>,
);
