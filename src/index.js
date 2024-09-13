import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App'; // Ensure this path is correct
import * as serviceWorkerRegistration from './serviceWorkerRegistration'; // Import the service worker registration

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// Register the service worker
serviceWorkerRegistration.register();
