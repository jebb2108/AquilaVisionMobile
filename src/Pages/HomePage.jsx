import OperationsQueue from '../components/OperationsQueue/OperationsQueue';

export default function HomePage({ showNotification }) {
  return (
    <div style={{ width: '100%', maxWidth: '600px' }}>
      <OperationsQueue showNotification={showNotification} />
    </div>
  );
}