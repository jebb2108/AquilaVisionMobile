import { calculateFullYears } from '../../data/clinicPatients';

const DEFAULT_SURGEON_NAME = 'Еруков В.М';
const DEFAULT_NURSE_NAME = 'Махмудова О.С.';
const DEFAULT_ENGINEER_NAME = 'Бушар Г.А.';

const getPatientAge = (patient) => {
  if (patient.age !== '' && patient.age !== null && patient.age !== undefined) return patient.age;
  return calculateFullYears(patient.birthDate);
};

const escapeCell = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

export const buildOperationDayRows = (day) => {
  const headers = [
    'Дата',
    'Время',
    'Номер карты',
    'ФИО пациента',
    'Возраст',
    'ФИО хирурга',
    'ФИО мед сестры',
    'ФИО инженер',
  ];
  const rows = day.patients.map(patient => [
    patient.actualStartDate || day.date,
    patient.actualStartTime || patient.operationStart,
    patient.cardNumber,
    patient.patientName,
    getPatientAge(patient),
    DEFAULT_SURGEON_NAME,
    DEFAULT_NURSE_NAME,
    DEFAULT_ENGINEER_NAME,
  ]);

  return [headers, ...rows];
};

export const downloadOperationDay = (day) => {
  const tableRows = buildOperationDayRows(day)
    .map(row => `<tr>${row.map(cell => `<td>${escapeCell(cell)}</td>`).join('')}</tr>`)
    .join('');
  const documentHtml = `
    <html>
      <head>
        <meta charset="UTF-8" />
      </head>
      <body>
        <table>${tableRows}</table>
      </body>
    </html>
  `;
  const blob = new Blob([documentHtml], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `aquila-vision-${day.date}.xls`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
