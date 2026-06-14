import { useState, useEffect, useCallback } from 'react';
import AlphaBookmark from '../AlphaBookmark/AlphaBookmark';
import MOCK_OPERATIONS from '../../data/mockOperations';
import './OperationsQueue.scss';

export default function OperationsQueue({ showNotification }) {
  const [operations, setOperations] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCardEditMode, setIsCardEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Имитация загрузки
    setTimeout(() => {
      const sorted = [...MOCK_OPERATIONS].sort((a, b) => {
        if (a.type === 'femto' && b.type !== 'femto') return -1;
        if (a.type !== 'femto' && b.type === 'femto') return 1;
        return a.patientName.localeCompare(b.patientName, 'ru');
      });
      setOperations(sorted);
      setIsLoading(false);
    }, 500);
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

  const enterEditMode = () => setIsCardEditMode(true);
  const exitEditMode = () => setIsCardEditMode(false);
  const saveAllEdits = () => {
    showNotification("Изменения сохранены (демо)", "success");
    exitEditMode();
  };
  const deleteOperation = (id) => {
    showNotification(`Операция ${id} удалена (демо)`, "success");
    setOperations(prev => prev.filter(op => op.id !== id));
    if (currentIndex >= operations.length - 1) setCurrentIndex(Math.max(0, operations.length - 2));
  };

  if (isLoading) return (
    <div className="loading-overlay">
      <div className="spinner"></div>
    </div>
  );

  if (operations.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon"><i className="fas fa-procedures"></i></div>
        <h3>Нет операций</h3>
        <p>Добавьте первую операцию</p>
      </div>
    );
  }

  const op = operations[currentIndex];
  const isFemto = op.type === 'femto';

  return (
    <div className="queue-container">
      <div className={`word-card ${fadeOut ? 'fade-out' : 'fade-in'}`}>
        <div className="word-card__content">
          <div className="word-card__patient-name">{op.patientName}</div>

          <div className="word-card__patient-info">
            <span className="word-card__eye-badge">{op.eye}</span>
            <div className="word-card__details">
              <div className="word-card__detail-row">
                <span className="word-card__detail-label">Дата рождения:</span>
                <span className="word-card__detail-value">{op.birthDate}</span>
              </div>
              <div className="word-card__detail-row">
                <span className="word-card__detail-label">Номер тел.:</span>
                <span className="word-card__detail-value">{op.phone}</span>
              </div>
            </div>
          </div>

          {isFemto ? (
            <div className="word-card__params">
              <div className="word-card__param">
                <div className="word-card__param-label">Толщина лоскута</div>
                <div className="word-card__param-value">{op.flapThickness} мкм</div>
              </div>
              <div className="word-card__param">
                <div className="word-card__param-label">Диаметр кольца</div>
                <div className="word-card__param-value">{op.ringDiameter} мм</div>
              </div>
            </div>
          ) : (
            op.operationCount !== 1 && (
              <div className="word-card__operation-count">
                Количество операций: {op.operationCount}
              </div>
            )
          )}

          <div className="word-card__actions">
            <button
              className="word-card__action-btn word-card__action-btn--edit"
              onClick={() => isCardEditMode ? saveAllEdits() : enterEditMode()}
            >
              {isCardEditMode ? 'Применить' : 'Изменить'}
            </button>
            <button
              className="word-card__action-btn word-card__action-btn--delete"
              onClick={() => isCardEditMode ? exitEditMode() : deleteOperation(op.id)}
            >
              {isCardEditMode ? 'Отменить' : 'Удалить'}
            </button>
          </div>

          <div className="word-card__bottom">
            {op.specialNotes && (
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
                className="word-card__start-btn"
                onClick={() => showNotification('Операция началась (демо)', 'success')}
              >
                Начать операцию
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
    </div>
  );
}