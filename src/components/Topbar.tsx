import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import Logo from '@/components/Logo';

export default function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 glass border-b border-gray-200/50 dark:border-navy-800/50">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors"
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="lg:hidden">
            <Logo showText={false} />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors text-gray-600 dark:text-gray-300"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <div className="h-8 w-px bg-gray-200 dark:bg-navy-700" />
          <button
            onClick={() => navigate('/app/profile')}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-navy-600 flex items-center justify-center text-white text-sm font-semibold">
              {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="hidden sm:block text-sm font-medium text-navy-800 dark:text-gray-200 max-w-[120px] truncate">
              {profile?.full_name || 'User'}
            </span>
          </button>
          <button
            onClick={handleSignOut}
            className="p-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
