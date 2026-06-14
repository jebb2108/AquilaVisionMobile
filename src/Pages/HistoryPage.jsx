import MOCK_OPERATIONS from '../data/mockOperations'; // путь к мок-данным

export default function HistoryPage() {
  // Можно вывести все операции из того же источника, что и в OperationsQueue
  const sorted = [...MOCK_OPERATIONS].sort((a, b) => {
    if (a.type === 'femto' && b.type !== 'femto') return -1;
    if (a.type !== 'femto' && b.type === 'femto') return 1;
    return a.patientName.localeCompare(b.patientName, 'ru');
  });

  return (
    <div className="history-list">
      <h2 className="history-list__title">История операций</h2>
      {sorted.length === 0 ? (
        <p className="history-list__empty">Нет выполненных операций</p>
      ) : (
        <ul className="history-list__items">
          {sorted.map((op) => (
            <li key={op.id} className="history-list__item">
              <div className="history-list__name">{op.patientName}</div>
              <div className="history-list__eye">{op.eye}</div>
              <div className="history-list__type">
                {op.type === 'femto' ? 'FEMTO' : 'PTK/FRK'}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}