import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Programs', path: '/programs' },
    { label: 'Templates', path: '/templates' },
    { label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-gray-100 h-screen fixed left-0 top-0">
      <nav className="flex flex-col p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? 'px-4 py-2 bg-blue-500 text-white rounded'
                : 'px-4 py-2 text-gray-700 hover:bg-gray-200 rounded'
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
