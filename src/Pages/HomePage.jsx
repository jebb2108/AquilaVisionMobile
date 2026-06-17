// src/pages/HomePage.jsx
import OperationsQueue from '../components/OperationsQueue/OperationsQueue';

export default function HomePage({
  operations,
  onDelete,
  onUpdate,
  onStart,
  onOperationElapsed,
  showNotification,
}) {
  return (
    <div className="home-page">
      <OperationsQueue
        operations={operations}
        onDelete={onDelete}
        onUpdate={onUpdate}
        onStart={onStart}
        onOperationElapsed={onOperationElapsed}
        showNotification={showNotification}
      />
    </div>
  );
}
