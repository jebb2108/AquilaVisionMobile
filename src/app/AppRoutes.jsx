import { IonRouterOutlet } from '@ionic/react';
import { Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import AddPatientPage from '../Pages/AddPatientPage';
import HistoryPage from '../Pages/HistoryPage';
import HomePage from '../Pages/HomePage';
import PatientListPage from '../Pages/PatientListPage';

export function AppRoutes({
  cardOperations,
  historyDays,
  patients,
  onAddPatient,
  onDeletePatient,
  onMovePatient,
  onOperationElapsed,
  onStartOperation,
  onUpdatePatient,
  showNotification,
}) {
  return (
    <IonRouterOutlet animated={false}>
      <Routes>
        <Route element={<Layout />}>
          <Route
            path="/"
            element={
              <HomePage
                operations={cardOperations}
                onDelete={onDeletePatient}
                onUpdate={onUpdatePatient}
                onStart={onStartOperation}
                onOperationElapsed={onOperationElapsed}
                showNotification={showNotification}
              />
            }
          />
          <Route
            path="/add-patient"
            element={<AddPatientPage onAddPatient={onAddPatient} />}
          />
          <Route
            path="/patients"
            element={
              <PatientListPage
                patients={patients}
                onMovePatient={onMovePatient}
              />
            }
          />
          <Route
            path="/history"
            element={<HistoryPage historyDays={historyDays} />}
          />
        </Route>
      </Routes>
    </IonRouterOutlet>
  );
}
