import { LayoutDashboard, PlusCircle, Kanban, Users, Bell, Clock, Settings } from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { path: '/new', label: 'Nueva Solicitud', icon: <PlusCircle size={20} /> },
  { path: '/pipeline', label: 'Pipeline', icon: <Kanban size={20} /> },
  { path: '/clients', label: 'Clientes', icon: <Users size={20} /> },
  { path: '/tracking', label: 'Seguimiento', icon: <Bell size={20} /> },
  { path: '/times', label: 'Tiempos', icon: <Clock size={20} /> },
  { path: '/settings', label: 'Configuración', icon: <Settings size={20} /> },
];

export default function Sidebar() {
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  return (
    <aside className="hidden md:flex flex-col w-64 bg-gray-800 border-r border-gray-700 min-h-screen">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-blue-400">FreelanceDesk</h1>
        <p className="text-xs text-gray-400 mt-1">Suite para freelancers</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path));
          return (
            <a
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </a>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <p className="text-xs text-gray-500">v0.1.0</p>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 z-50">
      <div className="flex justify-around py-2">
        {navItems.slice(0, 5).map((item) => {
          const isActive = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path));
          return (
            <a
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center gap-1 px-2 py-1 rounded text-xs ${
                isActive ? 'text-blue-400' : 'text-gray-400'
              }`}
            >
              {item.icon}
              <span className="text-[10px]">{item.label.split(' ')[0]}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
