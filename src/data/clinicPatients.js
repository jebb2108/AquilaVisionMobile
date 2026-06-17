const SOURCE_LIST_KEYS = [
  'patients',
  'operations',
  'data',
  'items',
  'list',
  'queue',
  'surgeryList',
];

const asString = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

const isObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const firstValue = (source, keys) => {
  for (const key of keys) {
    if (
      source[key] !== null &&
      source[key] !== undefined &&
      source[key] !== '' &&
      !isObject(source[key])
    ) {
      return source[key];
    }
  }
  return '';
};

const getPatientName = (source) => {
  const directName = firstValue(source, [
    'patientName',
    'fullName',
    'fio',
    'name',
  ]);

  if (directName) return asString(directName);

  return [
    firstValue(source, ['lastName', 'surname']),
    firstValue(source, ['firstName']),
    firstValue(source, ['middleName', 'patronymic']),
  ]
    .map(asString)
    .filter(Boolean)
    .join(' ');
};

export const getOperationTitle = (operation) => {
  const title = firstValue(operation, [
    'operationTitle',
    'operationName',
    'surgeryName',
    'procedureName',
  ]);

  if (title) return asString(title);
  if (operation.type === 'femto') return 'FEMTO';
  if (operation.type === 'ptk' || operation.type === 'frk') return 'PTK/FRK';
  return asString(operation.type).toUpperCase();
};

export const calculateFullYears = (birthDate) => {
  const value = asString(birthDate);
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

const normalizeEye = (value) => {
  const eye = asString(value).toUpperCase();
  if (eye === 'RIGHT') return 'OD';
  if (eye === 'LEFT') return 'OS';
  if (eye === 'BOTH') return 'OU';
  if (['OU', 'OD', 'OS'].includes(eye)) return eye;
  return eye || 'OU';
};

const normalizeType = (value) => {
  const type = asString(value).toLowerCase();
  if (type.includes('femto') || type.includes('lasik')) return 'femto';
  if (type.includes('ptk')) return 'ptk';
  if (type.includes('frk') || type.includes('prk')) return 'frk';
  return type || 'femto';
};

const normalizeBoolean = (value) => {
  if (typeof value === 'boolean') return value;

  const normalized = asString(value).toLowerCase();

  if (['true', '1', 'yes', 'да'].includes(normalized)) return true;
  if (['false', '0', 'no', 'нет', ''].includes(normalized)) return false;
  return Boolean(value);
};

const normalizeNumber = (value, fallback = '') => {
  const number = Number.parseFloat(value);
  return Number.isNaN(number) ? fallback : number;
};

const flattenOperation = (source) => ({
  ...(isObject(source.patient) ? source.patient : {}),
  ...(isObject(source.operation) ? source.operation : {}),
  ...(isObject(source.surgery) ? source.surgery : {}),
  ...(isObject(source.procedure) ? source.procedure : {}),
  ...source,
});

const normalizeOperation = (rawSource, index) => {
  const source = flattenOperation(rawSource);
  const birthDate = firstValue(source, [
    'birthDate',
    'birth_date',
    'birthday',
    'dateOfBirth',
  ]);
  const age = firstValue(source, ['age', 'fullYears', 'years']);
  const typeSource = firstValue(source, [
    'type',
    'operationType',
    'operationTitle',
    'operationName',
    'surgeryType',
    'surgeryName',
    'procedureName',
  ]);

  return {
    id: firstValue(source, ['id', 'operationId', 'patientId', 'uuid']) || `clinic-${index}`,
    type: normalizeType(typeSource),
    operationTitle: asString(firstValue(source, [
      'operationTitle',
      'operationName',
      'surgeryName',
      'procedureName',
    ])),
    operationStart: asString(firstValue(source, [
      'operationStart',
      'start',
      'startTime',
      'time',
      'surgeryStart',
      'beginAt',
    ])),
    patientName: getPatientName(source),
    eye: normalizeEye(firstValue(source, ['eye', 'eyes', 'operationEye'])),
    age: age === '' ? calculateFullYears(birthDate) : normalizeNumber(age),
    birthDate: asString(birthDate),
    phone: asString(firstValue(source, ['phone', 'phoneNumber', 'mobile'])),
    cardNumber: asString(firstValue(source, [
      'cardNumber',
      'medicalCardNumber',
      'medicalRecordNumber',
      'recordNumber',
      'card',
    ])),
    flapThickness: normalizeNumber(firstValue(source, ['flapThickness', 'flap', 'flapMicrons']), 100),
    ringDiameter: normalizeNumber(firstValue(source, ['ringDiameter', 'ring', 'ringMm']), 8.5),
    operationCount: normalizeNumber(firstValue(source, ['operationCount', 'operationsCount', 'surgeryCount']), 1),
    specialNotes: asString(firstValue(source, ['specialNotes', 'notes', 'comment'])),
    isDeleted: normalizeBoolean(firstValue(source, ['isDeleted', 'deleted'])),
    isStarted: normalizeBoolean(firstValue(source, ['isStarted', 'started', 'operationStarted'])),
  };
};

const extractOperations = (payload) => {
  if (Array.isArray(payload)) return payload;

  for (const key of SOURCE_LIST_KEYS) {
    const value = payload?.[key];
    if (Array.isArray(value)) return value;
    if (value && typeof value === 'object') {
      const nested = extractOperations(value);
      if (nested.length > 0) return nested;
    }
  }

  return [];
};

export const normalizeClinicPatients = (payload) =>
  extractOperations(payload).map(normalizeOperation);
