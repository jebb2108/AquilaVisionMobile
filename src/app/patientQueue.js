import { createCanonicalPatient, readCanonicalPatients } from '../data/clinicPatients';

export const PATIENTS_API_URL =
  import.meta.env.VITE_PATIENTS_API_URL || 'https://medaquilavision.ru/api/patients';
export const PATIENTS_API_RETRY_COUNT = 5;
export const PATIENTS_API_RETRY_DELAY = 300;
export const OPERATION_DURATION_MS = 60 * 1000;

export const isInactivePatient = (patient) => patient.isDeleted || patient.isStarted;

const getOperationStartMinutes = (value) => {
  const match = String(value || '').trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return Number.POSITIVE_INFINITY;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours > 23 || minutes > 59) return Number.POSITIVE_INFINITY;
  return hours * 60 + minutes;
};

export const sortPatientsByOperationStart = (patients) =>
  [...patients].sort((left, right) =>
    getOperationStartMinutes(left.operationStart) - getOperationStartMinutes(right.operationStart)
  );

export const placeInactivePatientsFirst = (patients) => [
  ...patients.filter(patient => isInactivePatient(patient)),
  ...sortPatientsByOperationStart(patients.filter(patient => !isInactivePatient(patient))),
];

export const wait = (duration) =>
  new Promise(resolve => window.setTimeout(resolve, duration));

export const getTodayKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const getDeviceDateParts = (timestamp) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return {
    date: `${day}.${month}.${year}`,
    time: `${hours}:${minutes}`,
  };
};

export const fetchPatientsWithRetry = async () => {
  let lastError;

  for (let attempt = 1; attempt <= PATIENTS_API_RETRY_COUNT; attempt += 1) {
    try {
      const response = await fetch(PATIENTS_API_URL, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Patients API returned ${response.status}`);
      }

      return readCanonicalPatients(await response.json());
    } catch (error) {
      lastError = error;

      if (attempt < PATIENTS_API_RETRY_COUNT) {
        await wait(PATIENTS_API_RETRY_DELAY);
      }
    }
  }

  throw lastError;
};

export const syncOperationStartsWithOrder = (patients, operationStarts) =>
  patients.map((patient, index) => ({
    ...patient,
    operationStart: operationStarts[index] ?? patient.operationStart,
  }));

export const getCardOperations = (patients, now) => {
  const visiblePatients = patients.filter(patient =>
    !patient.isDeleted &&
    (!patient.isStarted || patient.operationVisibleUntil > now)
  );

  return [
    ...visiblePatients.filter(patient => patient.isStarted),
    ...visiblePatients.filter(patient => !patient.isStarted),
  ];
};

export const buildManualPatient = (patient) =>
  createCanonicalPatient(patient);
