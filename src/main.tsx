import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ArtStyleCompass from './ArtStyleCompass';
import './styles.css';

const isArtStyleCompass = window.location.pathname.replace(/\/$/, '') === '/art-style-compass';
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {isArtStyleCompass ? <ArtStyleCompass /> : <App />}
  </React.StrictMode>
);
