import { NavLink } from 'react-router-dom';
import { IonFooter } from '@ionic/react';
import { AppIcon } from '../Icon/Icon';
import './BottomNav.scss';

const navItems = [
  { to: '/add-patient', icon: 'personAdd' },
  { to: '/patients', icon: 'list' },
  { to: '/', icon: 'idCard', exact: true },
  { to: '/history', icon: 'time' },
];

export default function BottomNav() {
  return (
    <IonFooter className="bottom-nav-shell">
      <nav className="bottom-nav">
        {navItems.map(({ to, icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `bottom-nav__item${isActive ? ' bottom-nav__item--active' : ''}`
            }
          >
            <AppIcon name={icon} />
          </NavLink>
        ))}
      </nav>
    </IonFooter>
  );
}
