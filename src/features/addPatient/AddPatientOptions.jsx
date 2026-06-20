import { AppIcon } from '../../components/Icon/Icon';

const HOURS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));
const MINUTES = Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, '0'));

export function GenderOptions({ genders, selectedGender, onSelect }) {
  return (
    <div className="add-patient__gender-options" aria-label="Пол пациента">
      {genders.map(gender => (
        <button
          key={gender.value}
          type="button"
          className={[
            'add-patient__gender-option',
            selectedGender === gender.value ? 'add-patient__gender-option--active' : '',
          ].filter(Boolean).join(' ')}
          onClick={() => onSelect(gender.value)}
        >
          <span>{gender.name}</span>
        </button>
      ))}
    </div>
  );
}

export function EyeChips({ eyes, selectedEye, onSelect }) {
  return (
    <div className="add-patient__chips" aria-label="Выбор глаза">
      {eyes.map(eye => (
        <button
          key={eye}
          className={`add-patient__chip${selectedEye === eye ? ' add-patient__chip--active' : ''}`}
          type="button"
          onClick={() => onSelect(eye)}
        >
          {eye}
        </button>
      ))}
    </div>
  );
}

export function CycleButton({ children, id, onClick }) {
  return (
    <button
      id={id}
      className="add-patient__cycle"
      type="button"
      onClick={onClick}
    >
      <span>{children}</span>
      <AppIcon name="chevronForward" />
    </button>
  );
}

export function TimeSelect({ id, value, onChange }) {
  const [hours = '', minutes = ''] = String(value || '').split(':');

  const updateTime = (nextHours, nextMinutes) => {
    if (!nextHours && !nextMinutes) {
      onChange('');
      return;
    }

    onChange(`${nextHours || '00'}:${nextMinutes || '00'}`);
  };

  return (
    <div className="add-patient__time" id={id}>
      <AppIcon name="time" />
      <select
        aria-label="Часы начала операции"
        value={hours}
        onChange={(event) => updateTime(event.target.value, minutes)}
      >
        <option value="">чч</option>
        {HOURS.map(hour => <option key={hour} value={hour}>{hour}</option>)}
      </select>
      <span aria-hidden="true">:</span>
      <select
        aria-label="Минуты начала операции"
        value={minutes}
        onChange={(event) => updateTime(hours, event.target.value)}
      >
        <option value="">мм</option>
        {MINUTES.map(minute => <option key={minute} value={minute}>{minute}</option>)}
      </select>
    </div>
  );
}

export function FemtoParams({ flapThickness, ringDiameter, onCycleFlap, onCycleRing }) {
  return (
    <div className="add-patient__params">
      <div className="add-patient__param">
        <span>Толщина лоскута</span>
        <button type="button" onClick={onCycleFlap}>
          {flapThickness} мкм
          <AppIcon name="chevronForward" />
        </button>
      </div>
      <div className="add-patient__param">
        <span>Диаметр кольца</span>
        <button type="button" onClick={onCycleRing}>
          {Number(ringDiameter).toFixed(1)} мм
          <AppIcon name="chevronForward" />
        </button>
      </div>
    </div>
  );
}
