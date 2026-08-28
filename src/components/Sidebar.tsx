import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileSearch, MessageSquare, FolderOpen, BookOpen, Calendar, User, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';

const navItems = [
  { to: '/app', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/app/analyze', icon: FileSearch, label: 'Analyze Document' },
  { to: '/app/chat', icon: MessageSquare, label: 'Ask JurisGuide' },
  { to: '/app/documents', icon: FolderOpen, label: 'My Documents' },
  { to: '/app/topics', icon: BookOpen, label: 'Legal Topics' },
  { to: '/app/reminders', icon: Calendar, label: 'Court Reminders' },
  { to: '/app/profile', icon: User, label: 'Profile' },
];

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { profile } = useAuth();

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-gray-200 dark:border-navy-800">
        <Logo />
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'nav-link-active' : ''}`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
        {profile?.is_admin && (
          <NavLink
            to="/app/admin"
            onClick={onNavigate}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'nav-link-active' : ''}`
            }
          >
            <Shield className="w-5 h-5 flex-shrink-0" />
            <span>Admin Dashboard</span>
          </NavLink>
        )}
      </nav>
      <div className="px-5 py-4 border-t border-gray-200 dark:border-navy-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-navy-600 flex items-center justify-center text-white text-sm font-semibold">
            {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-navy-800 dark:text-white truncate">
              {profile?.full_name || 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {profile?.location || 'No location set'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
