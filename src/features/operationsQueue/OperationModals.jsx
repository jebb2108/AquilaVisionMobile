export function DeleteOperationModal({
  patientName,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="operation-modal">
      <div className="operation-modal__window">
        <h3 className="operation-modal__title">Удалить пациента?</h3>
        <p className="operation-modal__text">{patientName}</p>
        <div className="operation-modal__actions">
          <button
            className="operation-modal__btn operation-modal__btn--ghost"
            onClick={onCancel}
          >
            Отмена
          </button>
          <button
            className="operation-modal__btn operation-modal__btn--danger"
            onClick={onConfirm}
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}

export function StartOperationModal({
  cardNumber,
  error,
  onCancel,
  onChangeCardNumber,
  onConfirm,
}) {
  return (
    <div className="operation-modal">
      <div className="operation-modal__window">
        <h3 className="operation-modal__title">Подтвердите номер карты</h3>
        <input
          className="operation-modal__input"
          value={cardNumber}
          onChange={(event) => onChangeCardNumber(event.target.value)}
          autoFocus
        />
        {error && (
          <div className="operation-modal__error">{error}</div>
        )}
        <div className="operation-modal__actions">
          <button
            className="operation-modal__btn operation-modal__btn--ghost"
            onClick={onCancel}
          >
            Отмена
          </button>
          <button
            className="operation-modal__btn"
            onClick={onConfirm}
          >
            Начать
          </button>
        </div>
      </div>
    </div>
  );
}
