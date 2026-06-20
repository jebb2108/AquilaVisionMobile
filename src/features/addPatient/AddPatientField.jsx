export function AddPatientField({
  children,
  className = '',
  htmlFor,
  label,
  optionalText = '',
}) {
  return (
    <div className={`add-patient__group${className ? ` ${className}` : ''}`}>
      {htmlFor ? (
        <label htmlFor={htmlFor}>
          {label}
          {optionalText && <span>{optionalText}</span>}
        </label>
      ) : (
        <span className="add-patient__label">
          {label}
        </span>
      )}
      {children}
    </div>
  );
}

export function AddPatientRow({ children }) {
  return (
    <div className="add-patient__row">
      {children}
    </div>
  );
}
