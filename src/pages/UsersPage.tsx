import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { getUsersList, deleteUser, getUserProfile } from '../services/authService';
import type { UserProfileDto } from '../types/api';

interface UserItem {
  username: string;
  email: string;
  createdAt: string;
  lastLogin: string;
  isDeviceLockEnabled: boolean;
}

export default function UsersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const usernames = await getUsersList();
      const userProfiles: UserItem[] = await Promise.all(
        usernames.map(async (username) => {
          const profile = await getUserProfile();
          return {
            username: typeof username === 'string' ? username : (username as UserProfileDto).username,
            email: profile?.email || '',
            createdAt: profile?.createdAt || '',
            lastLogin: profile?.lastLogin || '',
            isDeviceLockEnabled: profile?.isDeviceLockEnabled || false,
          };
        })
      );
      setUsers(userProfiles);
    } catch {
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser);
      setNotification({ type: 'success', message: t('users.deleteSuccess') });
      setUsers(users.filter(u => u.username !== selectedUser));
    } catch {
      setNotification({ type: 'error', message: t('users.deleteError') });
    } finally {
      setShowDeleteConfirm(false);
      setSelectedUser(null);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleImportKeyFile = () => {
    setNotification({ type: 'success', message: t('users.importSuccess') });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="min-h-screen bg-light-100 dark:bg-dark-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-light-5 dark:shadow-dark-5 overflow-hidden">
          <div className="p-6 border-b border-light-200 dark:border-dark-600">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-light-900 dark:text-light-100">
                  {t('users.title')}
                </h1>
                <p className="mt-1 text-light-500 dark:text-dark-300">
                  {t('users.subtitle')}
                </p>
              </div>
              <button
                onClick={() => navigate({ to: '/signup' })}
                className="px-4 py-2 bg-brand-main text-white rounded-lg hover:bg-brand-darker transition-colors"
              >
                {t('common.add')}
              </button>
            </div>
          </div>

          {notification && (
            <div className={`p-4 ${notification.type === 'success' ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800' : 'bg-danger-50 dark:bg-danger-900/20 border-danger-200 dark:border-danger-800'} border-b`}>
              <p className={`text-sm ${notification.type === 'success' ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>
                {notification.message}
              </p>
            </div>
          )}

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <svg className="animate-spin h-8 w-8 text-brand-main mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-2 text-light-500 dark:text-dark-400">{t('common.loading')}</p>
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-light-500 dark:text-dark-400">{t('users.noUsers')}</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-light-50 dark:bg-dark-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light-500 dark:text-dark-400 uppercase tracking-wider">
                      {t('users.username')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light-500 dark:text-dark-400 uppercase tracking-wider">
                      {t('users.email')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light-500 dark:text-dark-400 uppercase tracking-wider">
                      {t('users.createdAt')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light-500 dark:text-dark-400 uppercase tracking-wider">
                      {t('users.lastLogin')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light-500 dark:text-dark-400 uppercase tracking-wider">
                      {t('users.deviceLock')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light-500 dark:text-dark-400 uppercase tracking-wider">
                      {t('users.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-200 dark:divide-dark-600">
                  {users.map((user) => (
                    <tr key={user.username} className="hover:bg-light-50 dark:hover:bg-dark-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-light-900 dark:text-light-100">{user.username}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-light-600 dark:text-light-300">{user.email}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-light-600 dark:text-light-300">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-light-600 dark:text-light-300">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isDeviceLockEnabled
                            ? 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400'
                            : 'bg-light-100 text-light-600 dark:bg-dark-600 dark:text-dark-400'
                        }`}>
                          {user.isDeviceLockEnabled ? t('common.yes') : t('common.no')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleImportKeyFile}
                            className="text-light-500 hover:text-brand-main transition-colors"
                            title={t('users.importKeyFile')}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="17 8 12 3 7 8" />
                              <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user.username);
                              setShowDeleteConfirm(true);
                            }}
                            className="text-light-500 hover:text-danger-500 transition-colors"
                            title={t('users.delete')}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-light-900 dark:text-light-100 mb-2">
              {t('common.delete')}
            </h3>
            <p className="text-light-600 dark:text-light-300 mb-4">
              {t('users.confirmDelete', { username: selectedUser })}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 border border-light-300 dark:border-dark-600 text-light-700 dark:text-light-300 rounded-lg hover:bg-light-50 dark:hover:bg-dark-700 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-danger-500 text-white rounded-lg hover:bg-danger-600 transition-colors"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}