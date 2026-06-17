import { useEffect, useMemo, useState } from 'react';
import { createCanonicalPatient } from '../data/clinicPatients';
import {
  OPERATION_DURATION_MS,
  buildManualPatient,
  fetchPatientsWithRetry,
  getCardOperations,
  getDeviceDateParts,
  getTodayKey,
  isInactivePatient,
  placeInactivePatientsFirst,
  sortPatientsByOperationStart,
  syncOperationStartsWithOrder,
} from './patientQueue';

export function usePatientQueue({ showNotification }) {
  const [patients, setPatients] = useState([]);
  const [historyDays, setHistoryDays] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const loadPatients = async () => {
      try {
        const loadedPatients = await fetchPatientsWithRetry();

        if (!isCancelled) {
          setPatients(placeInactivePatientsFirst(loadedPatients));
        }
      } catch (error) {
        showNotification('Бэк пациентов недоступен, стартуем с пустым списком', 'error');

        if (!isCancelled) {
          setPatients([]);
        }
      } finally {
        if (!isCancelled) {
          setIsBooting(false);
        }
      }
    };

    loadPatients();

    return () => {
      isCancelled = true;
    };
  }, [showNotification]);

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

  useEffect(() => {
    const today = getTodayKey();
    const operationPatients = patients.filter(patient => !patient.isDeleted);
    const completedPatients = operationPatients.filter(patient =>
      patient.isStarted &&
      patient.operationVisibleUntil > 0 &&
      patient.operationVisibleUntil <= now
    );
    const hasPendingPatients = operationPatients.some(patient =>
      !patient.isStarted ||
      patient.operationVisibleUntil > now
    );

    if (operationPatients.length === 0 || completedPatients.length === 0 || hasPendingPatients) {
      return;
    }

    setHistoryDays(prev => {
      const nextDay = {
        date: today,
        patients: sortPatientsByOperationStart(completedPatients),
      };

      if (prev.some(day => day.date === today)) {
        return prev.map(day => day.date === today ? nextDay : day);
      }

      return [
        nextDay,
        ...prev,
      ];
    });
  }, [now, patients]);

  const updatePatient = (id, patch) => {
    setPatients(prev =>
      prev.map(patient => {
        if (String(patient.id) !== String(id)) return patient;

        return createCanonicalPatient({ ...patient, ...patch }, patient.id);
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
    const operationVisibleUntil = startedAt + OPERATION_DURATION_MS;
    const actualStart = getDeviceDateParts(startedAt);

    markPatientAndMoveToInactiveBlock(id, () => ({
      isStarted: true,
      startedAt,
      actualStartDate: actualStart.date,
      actualStartTime: actualStart.time,
      operationVisibleUntil,
    }));
    setNow(startedAt);
  };

  const completeStartedOperation = (id) => {
    const patient = patients.find(item => String(item.id) === String(id));
    const completedAt = patient?.operationVisibleUntil || Date.now();

    setNow(Math.max(Date.now(), completedAt));
  };

  const addPatient = (patient) => {
    const canonicalPatient = buildManualPatient(patient);

    setPatients(prev => placeInactivePatientsFirst([...prev, canonicalPatient]));
    showNotification('Пациент добавлен в очередь', 'success');
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

  const cardOperations = useMemo(
    () => getCardOperations(patients, now),
    [now, patients]
  );

  return {
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
  };
}
