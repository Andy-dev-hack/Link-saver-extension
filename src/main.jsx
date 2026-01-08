import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import { LeadsProvider } from '@/context/LeadsContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <LeadsProvider>
        <App />
      </LeadsProvider>
    </ErrorBoundary>
  </StrictMode>
);
