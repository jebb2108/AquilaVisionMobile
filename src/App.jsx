import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import AddPatientPage from './pages/AddPatientPage';
import PatientListPage from './pages/PatientListPage';
import HistoryPage from './pages/HistoryPage';
import './App.scss';

// Функция для уведомлений
function showNotification(message, type) {
  // Пока просто alert
  alert(`${type}: ${message}`);
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage showNotification={showNotification} />} />
          <Route path="/add-patient" element={<AddPatientPage />} />
          <Route path="/patients" element={<PatientListPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}