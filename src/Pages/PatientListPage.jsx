// src/pages/PatientListPage.jsx
import { useRef, useState } from 'react';
import './PatientListPage.scss';

export default function PatientListPage({
  patients,
  onImportPatients,
  onMovePatient,
}) {
  const fileInputRef = useRef(null);
  const draggedId = useRef(null);
  const [draggingId, setDraggingId] = useState(null);

  const getListOperationTitle = (patient) => {
    if (patient.type === 'frk') return 'FRK';
    if (patient.type === 'ptk') return 'PTK';
    return patient.operationTitle || String(patient.type || '').toUpperCase();
  };

  const getListPatientName = (patientName) => {
    const parts = String(patientName || '').trim().split(/\s+/).filter(Boolean);

    if (parts.length >= 3) return parts.slice(1).join(' ');
    if (parts.length === 2) return parts[1];
    return patientName;
  };

  const importJson = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        onImportPatients(JSON.parse(reader.result));
      } catch (error) {
        console.error('Не удалось прочитать JSON', error);
      } finally {
        event.target.value = '';
      }
    };

    reader.readAsText(file);
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
    <div className="patient-list">
      <div className="patient-list__header">
        <h2 className="patient-list__title">Список пациентов</h2>
        <button
          className="patient-list__import-btn"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Загрузить JSON"
        >
          <i className="fa-solid fa-upload"></i>
        </button>
        <input
          ref={fileInputRef}
          className="patient-list__file"
          type="file"
          accept="application/json,.json"
          onChange={importJson}
        />
      </div>
      {patients.length === 0 ? (
        <p className="patient-list__empty">Нет пациентов</p>
      ) : (
        <ul className="patient-list__items">
          {patients.map(patient => (
            <li
              key={patient.id}
              data-patient-id={patient.id}
              className={[
                'patient-list__item',
                patient.isDeleted ? 'patient-list__item--deleted' : '',
                patient.isStarted ? 'patient-list__item--started' : '',
                patient.isDeleted || patient.isStarted ? 'patient-list__item--inactive' : '',
                draggingId === patient.id ? 'patient-list__item--dragging' : '',
              ].filter(Boolean).join(' ')}
            >
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
              <span className="patient-list__age">{patient.age || '-'}</span>
              <span className="patient-list__eye">{patient.eye}</span>
              <span className="patient-list__type">{getListOperationTitle(patient)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
