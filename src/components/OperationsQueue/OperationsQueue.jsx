import { useState, useEffect, useCallback, useRef } from 'react';
import AlphaBookmark from '../AlphaBookmark/AlphaBookmark';
import './OperationsQueue.scss';

const EYE_VALUES = ['OU', 'OD', 'OS'];
const FLAP_THICKNESS_VALUES = [90, 100, 110, 120, 130];
const RING_DIAMETER_VALUES = [8.5, 9.0, 9.5];

export default function OperationsQueue({
  operations = [],
  onDelete,
  onUpdate,
  onStart,
  showNotification,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCardEditMode, setIsCardEditMode] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [draft, setDraft] = useState(null);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [nudgedParam, setNudgedParam] = useState('');
  const pendingFocusId = useRef(null);
  const nudgeTimeoutId = useRef(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardNumberError, setCardNumberError] = useState('');

  useEffect(() => {
    if (currentIndex > operations.length - 1) {
      setCurrentIndex(Math.max(0, operations.length - 1));
    }
  }, [currentIndex, operations.length]);

  useEffect(() => {
    if (!pendingFocusId.current) return;

    const nextIndex = operations.findIndex(
      operation => String(operation.id) === String(pendingFocusId.current)
    );

    if (nextIndex !== -1) {
      setCurrentIndex(nextIndex);
    }

    pendingFocusId.current = null;
  }, [operations]);

  useEffect(() => {
    document.body.classList.toggle('queue-fullscreen', isFullscreen);

    return () => {
      document.body.classList.remove('queue-fullscreen');
    };
  }, [isFullscreen]);

  useEffect(() => () => {
    window.clearTimeout(nudgeTimeoutId.current);
    document.body.classList.remove('queue-fullscreen');
  }, []);

  // Мгновенное переключение (для ползунка)
  const jumpToIndex = useCallback((i) => {
    setCurrentIndex(i);
  }, []);

  // Анимированное переключение (для кнопок)
  const animateToIndex = useCallback((i) => {
    if (fadeOut) return; // предотвращаем двойное срабатывание
    setFadeOut(true);
    setTimeout(() => {
      setCurrentIndex(i);
      setFadeOut(false);
    }, 200);
  }, [fadeOut]);

  const nextOperation = () => {
    if (currentIndex < operations.length - 1) animateToIndex(currentIndex + 1);
  };
  const prevOperation = () => {
    if (currentIndex > 0) animateToIndex(currentIndex - 1);
  };

  const op = operations[currentIndex];
  const isFemto = op?.type === 'femto';
  const startedAt = Number(op?.startedAt) || Date.now();
  const startFillElapsed = op?.isStarted
    ? Math.min(60 * 1000, Math.max(0, Date.now() - startedAt))
    : 0;

  const enterEditMode = () => {
    if (op.isStarted) return;

    setDraft({ ...op });
    setIsCardEditMode(true);
  };

  const exitEditMode = () => {
    setDraft(null);
    setIsCardEditMode(false);
  };

  const saveAllEdits = () => {
    onUpdate(op.id, {
      ...draft,
      age: draft.age === '' ? '' : Number(draft.age),
      flapThickness: Number(draft.flapThickness),
      ringDiameter: Number(draft.ringDiameter),
      operationCount: Number(draft.operationCount),
    });
    showNotification('Изменения сохранены', 'success');
    exitEditMode();
  };

  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const confirmDeleteOperation = () => {
    onDelete(op.id);
    showNotification('Пациент удалён из карточек', 'success');
    closeDeleteModal();
    exitEditMode();
    if (currentIndex >= operations.length - 1) {
      setCurrentIndex(Math.max(0, operations.length - 2));
    }
  };

  const updateDraft = (field, value) => {
    setDraft(prev => ({ ...prev, [field]: value }));
  };

  const cycleDraftValue = (field, values) => {
    setDraft(prev => {
      const isNumericValues = values.every(value => typeof value === 'number');
      const currentIndex = values.findIndex(value => (
        isNumericValues
          ? Number(value) === Number(prev[field])
          : String(value) === String(prev[field])
      ));
      const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % values.length;

      return {
        ...prev,
        [field]: values[nextIndex],
      };
    });

    setNudgedParam(field);
    window.clearTimeout(nudgeTimeoutId.current);
    nudgeTimeoutId.current = window.setTimeout(() => {
      setNudgedParam('');
    }, 180);
  };

  const openStartModal = () => {
    if (op.isStarted) return;

    if (!op.cardNumber) {
      showNotification('Номер карты не найден', 'error');
      return;
    }

    setCardNumber('');
    setCardNumberError('');
    setIsStartModalOpen(true);
  };

  const closeStartModal = () => {
    setIsStartModalOpen(false);
    setCardNumber('');
    setCardNumberError('');
  };

  const confirmStartOperation = () => {
    if (cardNumber.trim() !== String(op.cardNumber).trim()) {
      setCardNumberError('Номер карты не совпадает');
      return;
    }

    pendingFocusId.current = op.id;
    exitEditMode();
    onStart(op.id);
    showNotification('Операция началась', 'success');
    closeStartModal();
  };

  if (operations.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon"><i className="fas fa-procedures"></i></div>
        <h3>Нет операций</h3>
        <p>Добавьте первую операцию</p>
      </div>
    );
  }

  return (
    <div className="queue-container">
      <button
        className="word-card__fullscreen-btn"
        type="button"
        onClick={() => setIsFullscreen(prev => !prev)}
        aria-label={isFullscreen ? 'Вернуть шапку и меню' : 'Расширить карточку'}
      >
        <i className={`fa-solid ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
      </button>
      <div className={`word-card ${fadeOut ? 'fade-out' : 'fade-in'}`}>
        <div className="word-card__content">
          {isCardEditMode ? (
            <input
              className="word-card__patient-name word-card__input word-card__input--name"
              value={draft.patientName}
              onChange={(e) => updateDraft('patientName', e.target.value)}
            />
          ) : (
            <div className="word-card__patient-name">{op.patientName}</div>
          )}

          <div className="word-card__patient-info">
            {isCardEditMode ? (
              <div className="word-card__eye-stepper">
                <span className="word-card__eye-stepper-value">{draft.eye}</span>
                <button
                  className={[
                    'word-card__stepper-btn',
                    nudgedParam === 'eye' ? 'word-card__stepper-btn--nudged' : '',
                  ].filter(Boolean).join(' ')}
                  type="button"
                  onClick={() => cycleDraftValue('eye', EYE_VALUES)}
                  aria-label="Следующий глаз"
                >
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            ) : (
              <span className="word-card__eye-badge">{op.eye}</span>
            )}
            <div className="word-card__details">
              <div className="word-card__detail-row">
                <span className="word-card__detail-label">Дата рождения:</span>
                {isCardEditMode ? (
                  <input
                    className="word-card__input"
                    value={draft.birthDate}
                    onChange={(e) => updateDraft('birthDate', e.target.value)}
                  />
                ) : (
                  <span className="word-card__detail-value">{op.birthDate}</span>
                )}
              </div>
              <div className="word-card__detail-row">
                <span className="word-card__detail-label">Номер тел.:</span>
                {isCardEditMode ? (
                  <input
                    className="word-card__input"
                    value={draft.phone}
                    onChange={(e) => updateDraft('phone', e.target.value)}
                  />
                ) : (
                  <span className="word-card__detail-value">{op.phone}</span>
                )}
              </div>
            </div>
          </div>

          {isFemto ? (
            <div className="word-card__params">
              <div className="word-card__param">
                <div className="word-card__param-label">Толщина лоскута</div>
                {isCardEditMode ? (
                  <div className="word-card__stepper">
                    <span className="word-card__stepper-value">{draft.flapThickness} мкм</span>
                    <button
                      className={[
                        'word-card__stepper-btn',
                        nudgedParam === 'flapThickness' ? 'word-card__stepper-btn--nudged' : '',
                      ].filter(Boolean).join(' ')}
                      type="button"
                      onClick={() => cycleDraftValue('flapThickness', FLAP_THICKNESS_VALUES)}
                      aria-label="Следующая толщина лоскута"
                    >
                      <i className="fa-solid fa-chevron-right"></i>
                    </button>
                  </div>
                ) : (
                  <div className="word-card__param-value">{op.flapThickness} мкм</div>
                )}
              </div>
              <div className="word-card__param">
                <div className="word-card__param-label">Диаметр кольца</div>
                {isCardEditMode ? (
                  <div className="word-card__stepper">
                    <span className="word-card__stepper-value">{Number(draft.ringDiameter).toFixed(1)} мм</span>
                    <button
                      className={[
                        'word-card__stepper-btn',
                        nudgedParam === 'ringDiameter' ? 'word-card__stepper-btn--nudged' : '',
                      ].filter(Boolean).join(' ')}
                      type="button"
                      onClick={() => cycleDraftValue('ringDiameter', RING_DIAMETER_VALUES)}
                      aria-label="Следующий диаметр кольца"
                    >
                      <i className="fa-solid fa-chevron-right"></i>
                    </button>
                  </div>
                ) : (
                  <div className="word-card__param-value">{Number(op.ringDiameter).toFixed(1)} мм</div>
                )}
              </div>
            </div>
          ) : (
            (isCardEditMode || op.operationCount !== 1) && (
              <div className="word-card__operation-count">
                {isCardEditMode ? (
                  <>
                    Количество операций:
                    <input
                      className="word-card__input word-card__input--inline"
                      inputMode="numeric"
                      value={draft.operationCount}
                      onChange={(e) => updateDraft('operationCount', e.target.value)}
                    />
                  </>
                ) : (
                  <>Количество операций: {op.operationCount}</>
                )}
              </div>
            )
          )}

          <div className="word-card__actions">
            <button
              className="word-card__action-btn word-card__action-btn--edit"
              onClick={() => isCardEditMode ? saveAllEdits() : enterEditMode()}
              disabled={op.isStarted}
            >
              {isCardEditMode ? 'Применить' : 'Изменить'}
            </button>
            <button
              className="word-card__action-btn word-card__action-btn--delete"
              onClick={() => isCardEditMode ? exitEditMode() : openDeleteModal()}
              disabled={op.isStarted}
            >
              {isCardEditMode ? 'Отменить' : 'Удалить'}
            </button>
          </div>

          <div className="word-card__bottom">
            {isCardEditMode ? (
              <div className="word-card__special-notes">
                <h4>Особенности операции</h4>
                <textarea
                  className="word-card__textarea"
                  value={draft.specialNotes}
                  onChange={(e) => updateDraft('specialNotes', e.target.value)}
                />
              </div>
            ) : op.specialNotes && (
              <div className="word-card__special-notes">
                <h4>Особенности операции</h4>
                <p>{op.specialNotes}</p>
              </div>
            )}
            <div className="word-card__footer">
              <button className="word-card__nav-btn" onClick={prevOperation} disabled={currentIndex === 0}>
                <i className="fa-solid fa-angle-left"></i>
              </button>
              <button
                className={[
                  'word-card__start-btn',
                  op.isStarted ? 'word-card__start-btn--started' : '',
                ].filter(Boolean).join(' ')}
                style={op.isStarted ? { '--start-fill-delay': `-${startFillElapsed}ms` } : undefined}
                onClick={openStartModal}
                disabled={op.isStarted}
              >
                <span className="word-card__start-btn-label">
                  {op.isStarted ? 'Операция начата' : 'Начать операцию'}
                </span>
              </button>
              <button className="word-card__nav-btn" onClick={nextOperation} disabled={currentIndex >= operations.length - 1}>
                <i className="fa-solid fa-angle-right"></i>
              </button>
            </div>
          </div>
        </div>

        <AlphaBookmark
          operations={operations}
          currentIndex={currentIndex}
          onJump={jumpToIndex}
        />
      </div>

      {isDeleteModalOpen && (
        <div className="operation-modal">
          <div className="operation-modal__window">
            <h3 className="operation-modal__title">Удалить пациента?</h3>
            <p className="operation-modal__text">{op.patientName}</p>
            <div className="operation-modal__actions">
              <button
                className="operation-modal__btn operation-modal__btn--ghost"
                onClick={closeDeleteModal}
              >
                Отмена
              </button>
              <button
                className="operation-modal__btn operation-modal__btn--danger"
                onClick={confirmDeleteOperation}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {isStartModalOpen && (
        <div className="operation-modal">
          <div className="operation-modal__window">
            <h3 className="operation-modal__title">Подтвердите номер карты</h3>
            <input
              className="operation-modal__input"
              value={cardNumber}
              onChange={(e) => {
                setCardNumber(e.target.value);
                setCardNumberError('');
              }}
              autoFocus
            />
            {cardNumberError && (
              <div className="operation-modal__error">{cardNumberError}</div>
            )}
            <div className="operation-modal__actions">
              <button
                className="operation-modal__btn operation-modal__btn--ghost"
                onClick={closeStartModal}
              >
                Отмена
              </button>
              <button
                className="operation-modal__btn"
                onClick={confirmStartOperation}
              >
                Начать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
