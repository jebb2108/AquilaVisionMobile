import React from 'react';
import ReactDOM from 'react-dom/client';
import { IonApp, setupIonicReact } from '@ionic/react';
import App from './App';
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import './styles/global.scss';

setupIonicReact();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <IonApp>
      <App />
    </IonApp>
  </React.StrictMode>
);
