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
      <i className="fa-solid fa-chevron-right"></i>
    </button>
  );
}

export function FemtoParams({ flapThickness, ringDiameter, onCycleFlap, onCycleRing }) {
  return (
    <div className="add-patient__params">
      <div className="add-patient__param">
        <span>Толщина лоскута</span>
        <button type="button" onClick={onCycleFlap}>
          {flapThickness} мкм
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
      <div className="add-patient__param">
        <span>Диаметр кольца</span>
        <button type="button" onClick={onCycleRing}>
          {Number(ringDiameter).toFixed(1)} мм
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
}
