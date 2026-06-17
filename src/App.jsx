import { useCallback } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './app/AppRoutes';
import { SplashScreen } from './app/SplashScreen';
import { usePatientQueue } from './app/usePatientQueue';
import './App.scss';

function notify(message, type) {
  const log = type === 'error' ? console.error : console.log;
  log(message);
}

export default function App() {
  const showNotification = useCallback(notify, []);
  const {
    cardOperations,
    historyDays,
    isBooting,
    patients,
    addPatient,
    completeStartedOperation,
    deletePatient,
    movePatient,
    startOperation,
    updatePatient,
  } = usePatientQueue({ showNotification });

  return (
    <BrowserRouter>
      {isBooting && <SplashScreen />}
      <AppRoutes
        cardOperations={cardOperations}
        historyDays={historyDays}
        patients={patients}
        onAddPatient={addPatient}
        onDeletePatient={deletePatient}
        onMovePatient={movePatient}
        onOperationElapsed={completeStartedOperation}
        onStartOperation={startOperation}
        onUpdatePatient={updatePatient}
        showNotification={showNotification}
      />
    </BrowserRouter>
  );
}
