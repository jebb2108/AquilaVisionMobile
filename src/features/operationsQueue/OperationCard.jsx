import { AppIcon } from '../../components/Icon/Icon';

export function OperationCard({
  children,
  currentIndex,
  draft,
  fadeOut,
  isCardEditMode,
  isFemto,
  isFrk,
  nudgedParam,
  op,
  operationsLength,
  startFillElapsed,
  onCycleDraftValue,
  onEnterEditMode,
  onExitEditMode,
  onOpenDeleteModal,
  onOpenStartModal,
  onPrevOperation,
  onNextOperation,
  onSaveAllEdits,
  onStartProgressEnd,
  onUpdateDraft,
}) {
  return (
    <div className={`word-card ${fadeOut ? 'fade-out' : 'fade-in'}`}>
      <div className="word-card__content">
        {isCardEditMode ? (
          <input
            className="word-card__patient-name word-card__input word-card__input--name"
            value={draft.patientName}
            onChange={(event) => onUpdateDraft('patientName', event.target.value)}
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
                onClick={() => onCycleDraftValue('eye')}
                aria-label="Следующий глаз"
              >
                <AppIcon name="chevronForward" />
              </button>
            </div>
          ) : (
            <span className="word-card__eye-badge">{op.eye}</span>
          )}
          <div className={`word-card__details${isCardEditMode ? ' word-card__details--editing' : ''}`}>
            <div className="word-card__detail-row">
              {!isCardEditMode && (
                <span className="word-card__detail-label">Дата рождения:</span>
              )}
              {isCardEditMode ? (
                <input
                  className="word-card__input"
                  aria-label="Дата рождения"
                  value={draft.birthDate}
                  onChange={(event) => onUpdateDraft('birthDate', event.target.value)}
                />
              ) : (
                <span className="word-card__detail-value">{op.birthDate}</span>
              )}
            </div>
            <div className="word-card__detail-row">
              {!isCardEditMode && (
                <span className="word-card__detail-label">Тел:</span>
              )}
              {isCardEditMode ? (
                <input
                  className="word-card__input"
                  aria-label="Телефон"
                  value={draft.phone}
                  onChange={(event) => onUpdateDraft('phone', event.target.value)}
                />
              ) : (
                <span className="word-card__detail-value">{op.phone}</span>
              )}
            </div>
          </div>
        </div>

        {isFemto ? (
          <FemtoOperationParams
            draft={draft}
            isCardEditMode={isCardEditMode}
            nudgedParam={nudgedParam}
            op={op}
            onCycleDraftValue={onCycleDraftValue}
          />
        ) : !isFrk && (
          (isCardEditMode || op.operationCount !== 1) && (
            <OperationCount
              draft={draft}
              isCardEditMode={isCardEditMode}
              op={op}
              onUpdateDraft={onUpdateDraft}
            />
          )
        )}

        <div className="word-card__actions">
          <button
            className="word-card__action-btn word-card__action-btn--edit"
            onClick={() => isCardEditMode ? onSaveAllEdits() : onEnterEditMode()}
            disabled={op.isStarted}
          >
            {isCardEditMode ? 'Применить' : 'Изменить'}
          </button>
          <button
            className="word-card__action-btn word-card__action-btn--delete"
            onClick={() => isCardEditMode ? onExitEditMode() : onOpenDeleteModal()}
            disabled={op.isStarted}
          >
            {isCardEditMode ? 'Отменить' : 'Удалить'}
          </button>
        </div>

        <div className="word-card__bottom">
          <SpecialNotes
            draft={draft}
            isCardEditMode={isCardEditMode}
            op={op}
            onUpdateDraft={onUpdateDraft}
          />

          <div className="word-card__footer">
            <button
              className="word-card__nav-btn"
              onClick={onPrevOperation}
              disabled={currentIndex === 0}
            >
              <AppIcon name="chevronBack" />
            </button>
            <button
              className={[
                'word-card__start-btn',
                op.isStarted ? 'word-card__start-btn--started' : '',
              ].filter(Boolean).join(' ')}
              style={op.isStarted ? { '--start-fill-delay': `-${startFillElapsed}ms` } : undefined}
              onClick={onOpenStartModal}
              disabled={op.isStarted}
            >
              {op.isStarted && (
                <span
                  className="word-card__start-btn-progress"
                  aria-hidden="true"
                  onAnimationEnd={onStartProgressEnd}
                />
              )}
              <span className="word-card__start-btn-label">
                {op.isStarted ? 'Оперируется' : 'Оперировать'}
              </span>
            </button>
            <button
              className="word-card__nav-btn"
              onClick={onNextOperation}
              disabled={currentIndex >= operationsLength - 1}
            >
              <AppIcon name="chevronForward" />
            </button>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

function FemtoOperationParams({
  draft,
  isCardEditMode,
  nudgedParam,
  op,
  onCycleDraftValue,
}) {
  return (
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
              onClick={() => onCycleDraftValue('flapThickness')}
              aria-label="Следующая толщина лоскута"
            >
              <AppIcon name="chevronForward" />
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
              onClick={() => onCycleDraftValue('ringDiameter')}
              aria-label="Следующий диаметр кольца"
            >
              <AppIcon name="chevronForward" />
            </button>
          </div>
        ) : (
          <div className="word-card__param-value">{Number(op.ringDiameter).toFixed(1)} мм</div>
        )}
      </div>
    </div>
  );
}

function OperationCount({ draft, isCardEditMode, op, onUpdateDraft }) {
  return (
    <div className="word-card__operation-count">
      {isCardEditMode ? (
        <>
          Количество операций:
          <input
            className="word-card__input word-card__input--inline"
            inputMode="numeric"
            value={draft.operationCount}
            onChange={(event) => onUpdateDraft('operationCount', event.target.value)}
          />
        </>
      ) : (
        <>Количество операций: {op.operationCount}</>
      )}
    </div>
  );
}

function SpecialNotes({ draft, isCardEditMode, op, onUpdateDraft }) {
  if (isCardEditMode) {
    return (
      <div className="word-card__special-notes">
        <h4>Особенности операции</h4>
        <textarea
          className="word-card__textarea"
          value={draft.specialNotes}
          onChange={(event) => onUpdateDraft('specialNotes', event.target.value)}
        />
      </div>
    );
  }

  if (!op.specialNotes) return null;

  return (
    <div className="word-card__special-notes">
      <h4>Особенности операции</h4>
      <p>{op.specialNotes}</p>
    </div>
  );
}
