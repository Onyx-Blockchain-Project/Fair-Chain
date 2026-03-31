import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

console.log('Starting FairChain frontend...');

try {
  const root = document.getElementById('root');
  console.log('Root element:', root);
  
  if (!root) {
    console.error('Root element not found!');
  } else {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
    console.log('App rendered successfully');
  }
} catch (error) {
  console.error('Error mounting app:', error);
}
