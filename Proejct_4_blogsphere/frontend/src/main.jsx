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
        duration: 2400,
        style: {
          background: '#14171F',
          color: '#F3F2ED',
          fontSize: '14px',
          borderRadius: '10px',
          boxShadow: '0 8px 28px -6px rgba(20,23,31,0.45)',
        },
        success: {
          duration: 2200,
          className: 'toast-progress toast-progress-success',
          iconTheme: { primary: '#C99A2E', secondary: '#14171F' },
        },
        error: {
          duration: 3200,
          className: 'toast-progress toast-progress-error',
          iconTheme: { primary: '#C1443C', secondary: '#14171F' },
        },
        loading: { iconTheme: { primary: '#5B84AC', secondary: '#14171F' } },
      }}
    />
  </StrictMode>,
);
