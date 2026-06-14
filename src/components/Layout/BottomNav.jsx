import { NavLink } from 'react-router-dom';
import './BottomNav.scss';

const navItems = [
  { to: '/add-patient', icon: 'fa-user-plus' },
  { to: '/patients', icon: 'fa-list' },
  { to: '/', icon: 'fa-id-card', exact: true },
  { to: '/history', icon: 'fa-clock' },
];

export default function BottomNav() {
  return (
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
          <i className={`fa-solid ${icon}`}></i>
        </NavLink>
      ))}
    </nav>
  );
}