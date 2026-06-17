import { useRef, useState } from 'react';
import { calculateFullYears } from '../data/clinicPatients';
import './PatientListPage.scss';

export default function PatientListPage({
  patients,
  onMovePatient,
}) {
  const draggedId = useRef(null);
  const [draggingId, setDraggingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const getListOperationTitle = (patient) => {
    if (patient.type === 'frk') return 'FRK';
    if (patient.type === 'ptk') return 'PTK';
    return patient.operationTitle || String(patient.type || '').toUpperCase();
  };

  const getListPatientName = (patientName) => {
    const parts = String(patientName || '').trim().split(/\s+/).filter(Boolean);

    if (parts.length >= 3) return `${parts[0]} ${parts[1][0]}. ${parts[2][0]}.`;
    if (parts.length === 2) return `${parts[0]} ${parts[1][0]}.`;
    return patientName;
  };

  const getListAge = (patient) => {
    if (patient.age !== '' && patient.age !== null && patient.age !== undefined) return patient.age;
    const calculatedAge = calculateFullYears(patient.birthDate);
    return calculatedAge === '' ? '-' : calculatedAge;
  };

  const formatAge = (age) => {
    const value = Number(age);

    if (!Number.isFinite(value)) return '-';

    const mod100 = Math.abs(value) % 100;
    const mod10 = Math.abs(value) % 10;

    if (mod100 >= 11 && mod100 <= 14) return `${value} лет`;
    if (mod10 === 1) return `${value} год`;
    if (mod10 >= 2 && mod10 <= 4) return `${value} года`;
    return `${value} лет`;
  };

  const togglePatientDetails = (patientId) => {
    setExpandedId(prev => String(prev) === String(patientId) ? null : patientId);
  };

  const handleDragStart = (event, patientId) => {
    const patient = patients.find(item => String(item.id) === String(patientId));

    if (patient?.isDeleted || patient?.isStarted) return;

    event.preventDefault();
    draggedId.current = patientId;
    setDraggingId(patientId);

    const move = (moveEvent) => {
      const target = document
        .elementFromPoint(moveEvent.clientX, moveEvent.clientY)
        ?.closest('[data-patient-id]');

      if (!target) return;

      const overId = target.dataset.patientId;

      if (draggedId.current && draggedId.current !== overId) {
        onMovePatient(draggedId.current, overId);
      }
    };

    const stop = () => {
      draggedId.current = null;
      setDraggingId(null);
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', stop);
      document.removeEventListener('pointercancel', stop);
    };

    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', stop);
    document.addEventListener('pointercancel', stop);
  };

  return (
    <div className={`patient-list${patients.length === 0 ? ' patient-list--empty' : ''}`}>
      {patients.length === 0 ? (
        <div className="empty-state patient-list__empty-state">
          <div className="empty-icon"><i className="fas fa-list"></i></div>
          <h3>Нет пациентов</h3>
          <p>Добавленные пациенты появятся здесь</p>
        </div>
      ) : (
        <ul className="patient-list__items">
          {patients.map(patient => {
            const isExpanded = String(expandedId) === String(patient.id);

            return (
              <li
                key={patient.id}
                data-patient-id={patient.id}
                className={[
                  'patient-list__item',
                  patient.isDeleted ? 'patient-list__item--deleted' : '',
                  patient.isStarted ? 'patient-list__item--started' : '',
                  patient.isDeleted || patient.isStarted ? 'patient-list__item--inactive' : '',
                  draggingId === patient.id ? 'patient-list__item--dragging' : '',
                  isExpanded ? 'patient-list__item--expanded' : '',
                ].filter(Boolean).join(' ')}
              >
                <div className="patient-list__summary">
                  <button
                    className="patient-list__drag-handle"
                    onPointerDown={(event) => handleDragStart(event, patient.id)}
                    disabled={patient.isDeleted || patient.isStarted}
                    aria-label="Переместить пациента"
                  >
                    <span></span>
                    <span></span>
                    <span></span>
                  </button>
                  <span className="patient-list__start">{patient.operationStart || '-'}</span>
                  <span className="patient-list__name">{getListPatientName(patient.patientName)}</span>
                  <button
                    className="patient-list__expand"
                    type="button"
                    onClick={() => togglePatientDetails(patient.id)}
                    aria-label={isExpanded ? 'Скрыть детали пациента' : 'Показать детали пациента'}
                    aria-expanded={isExpanded}
                  >
                    <i className="fa-solid fa-chevron-down"></i>
                  </button>
                </div>

                {isExpanded && (
                  <div className="patient-list__details">
                    <span>{formatAge(getListAge(patient))}</span>
                    <span>№ {patient.cardNumber || '-'}</span>
                    <span>{patient.phone || 'телефон не указан'}</span>
                    <span>{patient.eye || '-'}</span>
                    <span>{getListOperationTitle(patient)}</span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
