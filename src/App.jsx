import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Layout from './components/Layout/Layout';
import HomePage from './Pages/HomePage';
import AddPatientPage from './Pages/AddPatientPage';
import PatientListPage from './Pages/PatientListPage';
import HistoryPage from './Pages/HistoryPage';
import MOCK_OPERATIONS, { MOCK_HISTORY_DAYS } from './data/mockOperations';
import { calculateFullYears, normalizeClinicPatients } from './data/clinicPatients';
import './App.scss';

function showNotification(message, type) {
  const log = type === 'error' ? console.error : console.log;
  log(message);
}

const isInactivePatient = (patient) => patient.isDeleted || patient.isStarted;

const placeInactivePatientsFirst = (patients) => [
  ...patients.filter(patient => isInactivePatient(patient)),
  ...patients.filter(patient => !isInactivePatient(patient)),
];

const syncOperationStartsWithOrder = (patients, operationStarts) =>
  patients.map((patient, index) => ({
    ...patient,
    operationStart: operationStarts[index] ?? patient.operationStart,
  }));

const getCardOperations = (patients, now) => {
  const visiblePatients = patients.filter(patient =>
    !patient.isDeleted &&
    (!patient.isStarted || patient.operationVisibleUntil > now)
  );

  return [
    ...visiblePatients.filter(patient => patient.isStarted),
    ...visiblePatients.filter(patient => !patient.isStarted),
  ];
};

export default function App() {
  const [patients, setPatients] = useState(() =>
    placeInactivePatientsFirst(normalizeClinicPatients(MOCK_OPERATIONS))
  );
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const nextHideAt = patients.reduce((soonest, patient) => {
      if (
        !patient.isDeleted &&
        patient.isStarted &&
        patient.operationVisibleUntil > now
      ) {
        return Math.min(soonest, patient.operationVisibleUntil);
      }

      return soonest;
    }, Infinity);

    if (!Number.isFinite(nextHideAt)) return undefined;

    const timeoutId = window.setTimeout(() => {
      setNow(Date.now());
    }, Math.max(0, nextHideAt - now));

    return () => window.clearTimeout(timeoutId);
  }, [now, patients]);

  const updatePatient = (id, patch) => {
    setPatients(prev =>
      prev.map(patient => {
        if (String(patient.id) !== String(id)) return patient;

        const next = { ...patient, ...patch };

        if (patch.birthDate && !patch.age) {
          next.age = calculateFullYears(patch.birthDate);
        }

        return next;
      })
    );
  };

  const markPatientAndMoveToInactiveBlock = (id, getPatch) => {
    setPatients(prev => {
      const index = prev.findIndex(patient => String(patient.id) === String(id));
      if (index === -1) return prev;

      const operationStarts = prev.map(patient => patient.operationStart);
      const next = [...prev];
      const [patient] = next.splice(index, 1);
      const updatedPatient = {
        ...patient,
        ...getPatch(patient),
      };
      const inactiveBlockEnd = next.findIndex(item => !isInactivePatient(item));
      const targetIndex = inactiveBlockEnd === -1 ? next.length : inactiveBlockEnd;

      next.splice(targetIndex, 0, updatedPatient);

      return syncOperationStartsWithOrder(next, operationStarts);
    });
  };

  const deletePatient = (id) => {
    markPatientAndMoveToInactiveBlock(id, () => ({
      isDeleted: true,
    }));
  };

  const startOperation = (id) => {
    const startedAt = Date.now();
    const operationVisibleUntil = startedAt + 60 * 1000;

    markPatientAndMoveToInactiveBlock(id, () => ({
      isStarted: true,
      startedAt,
      operationVisibleUntil,
    }));
    setNow(startedAt);
  };

  const importPatients = (payload) => {
    const importedPatients = normalizeClinicPatients(payload);

    if (importedPatients.length === 0) {
      showNotification('В JSON не найдены пациенты', 'error');
      return;
    }

    setPatients(placeInactivePatientsFirst(importedPatients));
    showNotification('Список пациентов загружен', 'success');
  };

  const movePatient = (activeId, overId) => {
    if (activeId === overId) return;

    setPatients(prev => {
      const activeIndex = prev.findIndex(patient => String(patient.id) === String(activeId));
      const overIndex = prev.findIndex(patient => String(patient.id) === String(overId));

      if (activeIndex === -1 || overIndex === -1) return prev;

      const activePatient = prev[activeIndex];
      const overPatient = prev[overIndex];

      if (isInactivePatient(activePatient) || isInactivePatient(overPatient)) return prev;

      const operationStarts = prev.map(patient => patient.operationStart);
      const next = [...prev];
      const [movedPatient] = next.splice(activeIndex, 1);
      next.splice(overIndex, 0, movedPatient);
      return syncOperationStartsWithOrder(next, operationStarts);
    });
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route
            path="/"
            element={
              <HomePage
                operations={getCardOperations(patients, now)}
                onDelete={deletePatient}
                onUpdate={updatePatient}
                onStart={startOperation}
                showNotification={showNotification}
              />
            }
          />
          <Route path="/add-patient" element={<AddPatientPage />} />
          <Route
            path="/patients"
            element={
              <PatientListPage
                patients={patients}
                onImportPatients={importPatients}
                onMovePatient={movePatient}
              />
            }
          />
          <Route
            path="/history"
            element={<HistoryPage historyDays={MOCK_HISTORY_DAYS} />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
