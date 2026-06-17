import { downloadOperationDay } from '../features/history/operationDayExport';
import './HistoryPage.scss';

function EmptyHistory() {
  return (
    <div className="empty-state history-days__empty-state">
      <div className="empty-icon"><i className="fas fa-clock"></i></div>
      <h3>Нет истории</h3>
      <p>
        Завершённые операционные дни
        <br />
        появятся здесь
      </p>
    </div>
  );
}

function HistoryDayItem({ day }) {
  return (
    <li className="history-days__item">
      <span className="history-days__date">{day.date}</span>
      <span className="history-days__count">
        {day.patients.length} пациентов
      </span>
      <button
        className="history-days__download-btn"
        type="button"
        onClick={() => downloadOperationDay(day)}
        aria-label={`Скачать историю за ${day.date}`}
      >
        <i className="fa-solid fa-download"></i>
      </button>
    </li>
  );
}

function HistoryDayList({ historyDays }) {
  return (
    <ul className="history-days__list">
      {historyDays.map(day => (
        <HistoryDayItem key={day.date} day={day} />
      ))}
    </ul>
  );
}

export default function HistoryPage({ historyDays }) {
  return (
    <div className={`history-days${historyDays.length === 0 ? ' history-days--empty' : ''}`}>
      {historyDays.length === 0 ? (
        <EmptyHistory />
      ) : (
        <HistoryDayList historyDays={historyDays} />
      )}
    </div>
  );
}
