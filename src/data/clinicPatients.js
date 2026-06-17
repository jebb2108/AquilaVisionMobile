import { formatPhoneNumber } from '../domain/patient/phoneMask';

export const OPERATION_TYPES = [
  { value: 'femto', label: 'FEMTO' },
  { value: 'frk', label: 'FRK' },
  { value: 'ptk', label: 'PTK' },
];

export const EYE_VALUES = ['OU', 'OD', 'OS'];

export const GENDER_VALUES = [
  { value: 'male', label: 'М', name: 'Мужчина' },
  { value: 'female', label: 'Ж', name: 'Женщина' },
];

const CANONICAL_PATIENT_DEFAULTS = {
  id: '',
  type: 'femto',
  operationTitle: '',
  operationStart: '',
  patientName: '',
  eye: 'OU',
  gender: '',
  birthDate: '',
  phone: '',
  cardNumber: '',
  flapThickness: 100,
  ringDiameter: 8.5,
  operationCount: 1,
  specialNotes: '',
  isDeleted: false,
  isStarted: false,
  startedAt: 0,
  actualStartDate: '',
  actualStartTime: '',
  operationVisibleUntil: 0,
};

const CANONICAL_LIST_KEYS = ['patients'];

const toStringValue = (value) => {
  if (value === null || value === undefined) return '';
  return String(value);
};

const toNumberValue = (value, fallback) => {
  if (value === '' || value === null || value === undefined) return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

export const calculateFullYears = (birthDate) => {
  const value = toStringValue(birthDate).trim();
  if (!value) return '';

  const parts = value.includes('.')
    ? value.split('.').reverse()
    : value.split('-');

  if (parts.length !== 3) return '';

  const [year, month, day] = parts.map(Number);
  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) return '';

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const isBirthdayAhead =
    today.getMonth() < date.getMonth() ||
    (today.getMonth() === date.getMonth() && today.getDate() < date.getDate());

  if (isBirthdayAhead) age -= 1;
  return age;
};

const extractCanonicalPatients = (payload) => {
  if (Array.isArray(payload)) return payload;

  for (const key of CANONICAL_LIST_KEYS) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }

  return [];
};

export const createCanonicalPatient = (patient = {}, fallbackId = `patient-${Date.now()}`) => {
  const birthDate = toStringValue(patient.birthDate).trim();
  const type = toStringValue(patient.type || CANONICAL_PATIENT_DEFAULTS.type).trim();
  const age = patient.age === '' || patient.age === undefined || patient.age === null
    ? calculateFullYears(birthDate)
    : toNumberValue(patient.age, '');

  return {
    ...CANONICAL_PATIENT_DEFAULTS,
    id: toStringValue(patient.id || fallbackId).trim(),
    type,
    operationTitle: toStringValue(patient.operationTitle).trim(),
    operationStart: toStringValue(patient.operationStart).trim(),
    patientName: toStringValue(patient.patientName).trim(),
    eye: toStringValue(patient.eye || CANONICAL_PATIENT_DEFAULTS.eye).trim(),
    age,
    gender: toStringValue(patient.gender).trim(),
    birthDate,
    phone: formatPhoneNumber(patient.phone),
    cardNumber: toStringValue(patient.cardNumber).trim(),
    flapThickness: toNumberValue(patient.flapThickness, CANONICAL_PATIENT_DEFAULTS.flapThickness),
    ringDiameter: toNumberValue(patient.ringDiameter, CANONICAL_PATIENT_DEFAULTS.ringDiameter),
    operationCount: type === 'frk'
      ? 1
      : toNumberValue(patient.operationCount, CANONICAL_PATIENT_DEFAULTS.operationCount),
    specialNotes: toStringValue(patient.specialNotes).trim(),
    isDeleted: Boolean(patient.isDeleted),
    isStarted: Boolean(patient.isStarted),
    startedAt: toNumberValue(patient.startedAt, 0),
    actualStartDate: toStringValue(patient.actualStartDate).trim(),
    actualStartTime: toStringValue(patient.actualStartTime).trim(),
    operationVisibleUntil: toNumberValue(patient.operationVisibleUntil, 0),
  };
};

export const readCanonicalPatients = (payload) =>
  extractCanonicalPatients(payload).map((patient, index) =>
    createCanonicalPatient(patient, `patient-${Date.now()}-${index}`)
  );
