export function AddPatientField({
  children,
  className = '',
  htmlFor,
  icon,
  label,
  optionalText = '',
}) {
  return (
    <div className={`add-patient__group${className ? ` ${className}` : ''}`}>
      {htmlFor ? (
        <label htmlFor={htmlFor}>
          <i className={`fa-solid ${icon}`}></i>
          {label}
          {optionalText && <span>{optionalText}</span>}
        </label>
      ) : (
        <span className="add-patient__label">
          <i className={`fa-solid ${icon}`}></i>
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
