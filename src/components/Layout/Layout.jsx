import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import './Layout.scss';

export default function Layout() {
  return (
    <div className="app-layout">
      <header className="app-header">
        <h1 className="app-header__title">Aquila Vision</h1>
      </header>

      <main className="app-layout__content">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}