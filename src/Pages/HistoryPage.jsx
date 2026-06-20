import { useState } from 'react';
import { downloadOperationDay } from '../features/history/operationDayExport';
import { AppIcon } from '../components/Icon/Icon';
import './HistoryPage.scss';

function EmptyHistory() {
  return (
    <div className="empty-state history-days__empty-state">
      <div className="empty-icon"><AppIcon name="time" /></div>
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
  const [isExporting, setIsExporting] = useState(false);

  const exportDay = async () => {
    if (isExporting) return;

    setIsExporting(true);

    try {
      await downloadOperationDay(day);
    } catch (error) {
      console.error('Не удалось сохранить историю операций', error);
      window.alert('Не удалось сохранить историю операций');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <li className="history-days__item">
      <span className="history-days__date">{day.date}</span>
      <span className="history-days__count">
        {day.patients.length} пациентов
      </span>
      <button
        className="history-days__download-btn"
        type="button"
        onClick={exportDay}
        disabled={isExporting}
        aria-label={`Скачать историю за ${day.date}`}
      >
        <AppIcon name="download" />
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
