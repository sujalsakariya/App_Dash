import '@/components/keenicons/assets/styles.css';
import './styles/globals.css';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ProvidersWrapper } from './providers';
import React from 'react';
import { initializeMobileApp } from './utils/MobileCapacitor';

// Initialize mobile app features
initializeMobileApp();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ProvidersWrapper>
    <App />
  </ProvidersWrapper>
);