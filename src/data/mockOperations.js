const MOCK_OPERATIONS = [
  {
    id: 1,
    type: 'femto',
    operationStart: '08:30',
    patientName: 'Александров Александр',
    eye: 'OU',
    birthDate: '12.03.1985',
    age: 41,
    phone: '+7 900 123-45-67',
    cardNumber: '1001',
    flapThickness: 100,
    ringDiameter: 8.5,
    specialNotes: 'Астигматизм высокой степени',
  },
  {
    id: 2,
    type: 'frk',
    operationStart: '09:00',
    patientName: 'Борисов Борис',
    eye: 'OS',
    birthDate: '01.12.1990',
    age: 35,
    phone: '+7 901 234-56-78',
    cardNumber: '1002',
    operationCount: 3,
    specialNotes: null,
  },
  {
    id: 3,
    type: 'ptk',
    operationStart: '09:30',
    patientName: 'Владимиров Владимир',
    eye: 'OU',
    birthDate: '15.06.1978',
    age: 48,
    phone: '+7 902 345-67-89',
    cardNumber: '1003',
    operationCount: 1,
    specialNotes: 'Повторная операция',
  },
  {
    id: 4,
    type: 'femto',
    operationStart: '10:00',
    patientName: 'Григорьев Григорий',
    eye: 'OD',
    birthDate: '22.09.2000',
    age: 25,
    phone: '+7 903 456-78-90',
    cardNumber: '1004',
    flapThickness: 110,
    ringDiameter: 9.0,
    specialNotes: '',
  },
];

// Экспорт для истории – дни с количеством пациентов
export const MOCK_HISTORY_DAYS = [
  {
    date: '2026-05-15',
    patients: [
      { ...MOCK_OPERATIONS[0] },
      { ...MOCK_OPERATIONS[1] },
      { ...MOCK_OPERATIONS[2] },
      { ...MOCK_OPERATIONS[3] },
    ],
  },
  {
    date: '2026-05-22',
    patients: [
      { ...MOCK_OPERATIONS[0] },
      { ...MOCK_OPERATIONS[2] },
      { ...MOCK_OPERATIONS[3] },
    ],
  },
  {
    date: '2026-05-29',
    patients: [
      { ...MOCK_OPERATIONS[1] },
    ],
  },
];

export default MOCK_OPERATIONS;
