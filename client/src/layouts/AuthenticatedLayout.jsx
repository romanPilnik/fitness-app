import { Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';

export default function AuthenticatedLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64">
        <header className="p-4 bg-white border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            Hello {user?.name}
            <button
              onClick={logout}
              className="ml-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </h2>
        </header>

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
