// src/pages/HistoryPage.jsx
import './HistoryPage.scss';

export default function HistoryPage({ historyDays }) {
  return (
    <div className="history-days">
      <h2 className="history-days__title">История операций</h2>
      {historyDays.length === 0 ? (
        <p className="history-days__empty">Нет завершённых операционных дней</p>
      ) : (
        <ul className="history-days__list">
          {historyDays.map((day, index) => (
            <li key={index} className="history-days__item">
              <span className="history-days__date">{day.date}</span>
              <span className="history-days__count">
                {day.patients.length} пациентов
              </span>
              <button
                className="history-days__download-btn"
                onClick={() => console.log(`Скачать данные за ${day.date} (заглушка)`)}
              >
                <i className="fa-solid fa-download"></i>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}