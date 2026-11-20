import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HomeIcon, UsersIcon, FunnelIcon, CurrencyDollarIcon,
  CheckCircleIcon, EnvelopeIcon, ChartBarIcon,
  UserGroupIcon, ArrowRightOnRectangleIcon, UserCircleIcon,
} from '@heroicons/react/24/outline';

const links = [
  { to: '/',        label: 'Dashboard', icon: HomeIcon,            exact: true },
  { to: '/contacts',label: 'Contacts',  icon: UsersIcon },
  { to: '/leads',   label: 'Leads',     icon: FunnelIcon },
  { to: '/deals',   label: 'Deals',     icon: CurrencyDollarIcon },
  { to: '/tasks',   label: 'Tasks',     icon: CheckCircleIcon },
  { to: '/emails',  label: 'Emails',    icon: EnvelopeIcon },
  { to: '/reports', label: 'Reports',   icon: ChartBarIcon },
];

export default function Sidebar({ open, setOpen }) {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={() => setOpen(false)} />}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-30 flex flex-col transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>

        {/* Logo */}
        <div className="flex items-center gap-2 px-5 h-16 border-b border-gray-200 flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 text-lg">SalesSphere</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {links.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </NavLink>
          ))}

          {hasRole('admin') && (
            <NavLink to="/users" onClick={() => setOpen(false)}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <UserGroupIcon className="w-5 h-5 flex-shrink-0" />
              Users
            </NavLink>
          )}
        </nav>

        {/* User footer */}
        <div className="border-t border-gray-200 p-3 flex-shrink-0">
          <NavLink to="/profile" onClick={() => setOpen(false)}
            className={({ isActive }) => `sidebar-link mb-1 ${isActive ? 'active' : ''}`}>
            <UserCircleIcon className="w-5 h-5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </NavLink>
          <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:text-red-700 hover:bg-red-50">
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
