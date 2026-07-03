import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';

export default function Sidebar() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      ),
      label: 'Home',
      path: '/vault',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
      label: 'Search',
      path: '/vault/search',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="5" x2="16" y2="19" />
          <line x1="8" y1="5" x2="8" y2="19" />
        </svg>
      ),
      label: 'OTP',
      path: '/vault/otp',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      label: 'Settings',
      path: '/vault/settings',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="16" x2="12" y2="16.01" />
        </svg>
      ),
      label: 'About',
      path: '/vault/about',
    },
  ];

  const handleLogout = () => {
    logout();
    navigate({ to: '/login' });
  };

  return (
    <aside className={`bg-white dark:bg-dark-800 border-r border-light-200 dark:border-dark-600 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4 border-b border-light-200 dark:border-dark-600">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-main to-brand-darker rounded-xl flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M50 25 L35 40 L35 60 L50 75 L65 60 L65 40 Z" transform="scale(0.15)"/>
              <circle cx="50" cy="50" r="10" fill="white" opacity="0.9" transform="scale(0.15)"/>
            </svg>
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="font-bold text-light-900 dark:text-light-100">PassXYZ</h1>
              <p className="text-xs text-light-500 dark:text-dark-400">Vault</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => (
            <li key={item.label}>
              <button
                onClick={() => navigate({ to: item.path })}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  window.location.pathname.startsWith(item.path)
                    ? 'bg-brand-main/10 text-brand-main'
                    : 'text-light-600 dark:text-light-300 hover:bg-light-100 dark:hover:bg-dark-700'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-light-200 dark:border-dark-600">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors`}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {!isCollapsed && <span className="text-sm font-medium">{t('common.logout')}</span>}
        </button>
      </div>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-dark-800 border border-light-200 dark:border-dark-600 rounded-full flex items-center justify-center shadow-light-2 dark:shadow-dark-2 hover:shadow-light-4 dark:hover:shadow-dark-4 transition-shadow"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isCollapsed ? 'rotate-180' : ''}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </aside>
  );
}