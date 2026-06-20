import { useCallback, useEffect, useRef, useState } from 'react';
import AlphaBookmark from '../AlphaBookmark/AlphaBookmark';
import { OperationCard } from '../../features/operationsQueue/OperationCard';
import {
  DeleteOperationModal,
  StartOperationModal,
} from '../../features/operationsQueue/OperationModals';
import {
  EYE_VALUES,
  FLAP_THICKNESS_VALUES,
  RING_DIAMETER_VALUES,
} from '../../features/operationsQueue/operationValues';
import { AppIcon } from '../Icon/Icon';
import './OperationsQueue.scss';

const DRAFT_VALUE_SETS = {
  eye: EYE_VALUES,
  flapThickness: FLAP_THICKNESS_VALUES,
  ringDiameter: RING_DIAMETER_VALUES,
};

export default function OperationsQueue({
  operations = [],
  onDelete,
  onUpdate,
  onStart,
  onOperationElapsed,
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
  const [cardNumber, setCardNumber] = useState('');
  const [cardNumberError, setCardNumberError] = useState('');
  const pendingFocusId = useRef(null);
  const nudgeTimeoutId = useRef(null);

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

  const jumpToIndex = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  const animateToIndex = useCallback((index) => {
    if (fadeOut) return;
    setFadeOut(true);
    setTimeout(() => {
      setCurrentIndex(index);
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
  const isFrk = op?.type === 'frk';
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
      flapThickness: Number(draft.flapThickness),
      ringDiameter: Number(draft.ringDiameter),
      operationCount: isFrk ? 1 : Number(draft.operationCount),
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

  const cycleDraftValue = (field) => {
    const values = DRAFT_VALUE_SETS[field];
    if (!values) return;

    setDraft(prev => {
      const isNumericValues = values.every(value => typeof value === 'number');
      const valueIndex = values.findIndex(value => (
        isNumericValues
          ? Number(value) === Number(prev[field])
          : String(value) === String(prev[field])
      ));
      const nextIndex = valueIndex === -1 ? 0 : (valueIndex + 1) % values.length;

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
      showNotification('№ не найден', 'error');
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
      setCardNumberError('№ не совпадает');
      return;
    }

    pendingFocusId.current = op.id;
    exitEditMode();
    onStart(op.id);
    showNotification('Операция началась', 'success');
    closeStartModal();
  };

  const changeCardNumber = (value) => {
    setCardNumber(value);
    setCardNumberError('');
  };

  const handleStartProgressEnd = () => {
    if (!op?.isStarted) return;
    onOperationElapsed?.(op.id);
  };

  if (operations.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon"><AppIcon name="medical" /></div>
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
        <AppIcon name={isFullscreen ? 'contract' : 'expand'} />
      </button>

      <OperationCard
        currentIndex={currentIndex}
        draft={draft}
        fadeOut={fadeOut}
        isCardEditMode={isCardEditMode}
        isFemto={isFemto}
        isFrk={isFrk}
        nudgedParam={nudgedParam}
        op={op}
        operationsLength={operations.length}
        startFillElapsed={startFillElapsed}
        onCycleDraftValue={cycleDraftValue}
        onEnterEditMode={enterEditMode}
        onExitEditMode={exitEditMode}
        onOpenDeleteModal={openDeleteModal}
        onOpenStartModal={openStartModal}
        onPrevOperation={prevOperation}
        onNextOperation={nextOperation}
        onSaveAllEdits={saveAllEdits}
        onStartProgressEnd={handleStartProgressEnd}
        onUpdateDraft={updateDraft}
      >
        <AlphaBookmark
          operations={operations}
          currentIndex={currentIndex}
          onJump={jumpToIndex}
        />
      </OperationCard>

      {isDeleteModalOpen && (
        <DeleteOperationModal
          patientName={op.patientName}
          onCancel={closeDeleteModal}
          onConfirm={confirmDeleteOperation}
        />
      )}

      {isStartModalOpen && (
        <StartOperationModal
          cardNumber={cardNumber}
          error={cardNumberError}
          onCancel={closeStartModal}
          onChangeCardNumber={changeCardNumber}
          onConfirm={confirmStartOperation}
        />
      )}
    </div>
  );
}
