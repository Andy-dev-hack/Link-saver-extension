import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import { LeadsProvider } from '@/context/LeadsContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LeadsProvider>
      <App />
    </LeadsProvider>
  </StrictMode>
);
