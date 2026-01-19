import { NavLink } from 'react-router-dom';

export default function BottomNav() {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Programs', path: '/programs' },
    { label: 'Templates', path: '/templates' },
    { label: 'Settings', path: '/settings' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-100 border-t border-gray-300">
      <div className="flex justify-around items-center">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? 'flex-1 text-center py-3 bg-blue-500 text-white'
                : 'flex-1 text-center py-3 text-gray-700'
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
