import { Buffer } from 'buffer';
window.Buffer = Buffer;

import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { Web3ReactProvider } from '@web3-react/core';
import { AuthProvider } from './context/AuthContext.tsx';
import './index.css';
import { getProvider } from './utils/provider.ts';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Failed to find the root element');
}

const root = createRoot(container);
root.render(
  <BrowserRouter>
    <Web3ReactProvider getLibrary={getProvider}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Web3ReactProvider>
  </BrowserRouter>
);
