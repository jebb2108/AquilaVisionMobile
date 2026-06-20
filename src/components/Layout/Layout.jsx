import { Outlet, useLocation } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import BottomNav from './BottomNav';
import './Layout.scss';

const PAGE_TITLES = {
  '/': 'Карточка пациента',
  '/add-patient': 'Добавление пациента',
  '/patients': 'Список пациентов',
  '/history': 'История операций',
};

export default function Layout() {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] || 'Aquila Vision';

  return (
    <IonPage className="app-layout">
      <header className="app-header">
        <h1 className="app-header__title">{title}</h1>
      </header>

      <IonContent className="app-layout__scroll">
        <main className="app-layout__content">
          <Outlet />
        </main>
      </IonContent>

      <BottomNav />
    </IonPage>
  );
}
