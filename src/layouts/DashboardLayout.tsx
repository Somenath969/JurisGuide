import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-navy-900 border-r border-gray-200 dark:border-navy-800 hidden lg:block z-40">
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-50 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-navy-900 border-r border-gray-200 dark:border-navy-800 z-50 lg:hidden animate-slide-in">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
