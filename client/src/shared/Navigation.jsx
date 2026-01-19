import { NavLink } from 'react-router-dom';

export default function Navigation() {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Programs', path: '/programs' },
    { label: 'Templates', path: '/templates' },
    { label: 'Settings', path: '/settings' },
  ];
  return (
    <nav>
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => (isActive ? 'active-class' : 'inactive-class')}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
