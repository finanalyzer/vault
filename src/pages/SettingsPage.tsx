import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getUserProfile, updateProfile } from '../services/authService';
import { changePassword } from '../services/vaultService';

import Sidebar from '../components/layout/Sidebar';

const passwordSchema = z.object({
  currentPassword: z.string().min(8, { message: 'common.error.passwordMinLength' }),
  newPassword: z.string().min(8, { message: 'common.error.passwordMinLength' }),
  confirmPassword: z.string().min(8, { message: 'common.error.passwordMinLength' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'common.error.passwordMismatch',
  path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'security' | 'password'>('security');
  const [isDeviceLockEnabled, setIsDeviceLockEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const data = await getUserProfile();
      setIsDeviceLockEnabled(data.isDeviceLockEnabled);
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDeviceLock = async () => {
    try {
      await updateProfile({ isDeviceLockEnabled: !isDeviceLockEnabled });
      setIsDeviceLockEnabled(!isDeviceLockEnabled);
      setNotification({ type: 'success', message: t('common.save') + ' ' + t('common.success') });
    } catch {
      setNotification({ type: 'error', message: t('common.error') });
    } finally {
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);
    try {
      await changePassword(data.newPassword);
      setNotification({ type: 'success', message: t('common.passwordChanged') });
      reset();
    } catch {
      setNotification({ type: 'error', message: t('common.error') });
    } finally {
      setIsLoading(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-100 dark:bg-dark-900 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-brand-main mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-light-500 dark:text-dark-400">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-100 dark:bg-dark-900 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-dark-800 border-b border-light-200 dark:border-dark-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-light-900 dark:text-light-100">
                {t('common.settings')}
              </h1>
              <p className="text-sm text-light-500 dark:text-dark-400 mt-1">
                {t('common.settingsHint')}
              </p>
            </div>
            <button
              onClick={() => navigate({ to: '/vault' })}
              className="px-4 py-2 border border-light-300 dark:border-dark-600 text-light-700 dark:text-light-300 rounded-lg hover:bg-light-50 dark:hover:bg-dark-700 transition-colors"
            >
              {t('common.close')}
            </button>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-2xl mx-auto">
            {notification && (
              <div className={`p-4 mb-6 ${notification.type === 'success' ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800' : 'bg-danger-50 dark:bg-danger-900/20 border-danger-200 dark:border-danger-800'} border rounded-lg`}>
                <p className={`text-sm ${notification.type === 'success' ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>
                  {notification.message}
                </p>
              </div>
            )}

            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setActiveTab('security')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'security'
                    ? 'bg-brand-main text-white'
                    : 'bg-light-100 dark:bg-dark-700 text-light-600 dark:text-light-300 hover:bg-light-200 dark:hover:bg-dark-600'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                {t('common.security')}
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'password'
                    ? 'bg-brand-main text-white'
                    : 'bg-light-100 dark:bg-dark-700 text-light-600 dark:text-light-300 hover:bg-light-200 dark:hover:bg-dark-600'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="5" x2="16" y2="19" />
                  <line x1="8" y1="5" x2="8" y2="19" />
                </svg>
                {t('common.password')}
              </button>
            </div>

            {activeTab === 'security' && (
              <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-light-5 dark:shadow-dark-5 overflow-hidden">
                <div className="p-6 border-b border-light-200 dark:border-dark-600">
                  <h2 className="text-lg font-semibold text-light-900 dark:text-light-100">
                    {t('common.security')}
                  </h2>
                </div>
                <div className="divide-y divide-light-100 dark:divide-dark-700">
                  <div className="flex items-center justify-between px-6 py-4">
                    <div>
                      <h3 className="font-medium text-light-900 dark:text-light-100">
                        {t('common.deviceLock')}
                      </h3>
                      <p className="text-sm text-light-500 dark:text-dark-400 mt-1">
                        {t('common.deviceLockHint')}
                      </p>
                    </div>
                    <button
                      onClick={handleUpdateDeviceLock}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isDeviceLockEnabled ? 'bg-brand-main' : 'bg-light-300 dark:bg-dark-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isDeviceLockEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between px-6 py-4">
                    <div>
                      <h3 className="font-medium text-light-900 dark:text-light-100">
                        {t('common.autoLock')}
                      </h3>
                      <p className="text-sm text-light-500 dark:text-dark-400 mt-1">
                        {t('common.autoLockHint')}
                      </p>
                    </div>
                    <select className="px-4 py-2 bg-light-50 dark:bg-dark-700 border border-light-300 dark:border-dark-600 rounded-lg text-light-900 dark:text-light-100 focus:outline-none focus:ring-2 focus:ring-brand-main">
                      <option value="5">{t('common.minutes', { value: 5 })}</option>
                      <option value="10">{t('common.minutes', { value: 10 })}</option>
                      <option value="15">{t('common.minutes', { value: 15 })}</option>
                      <option value="30">{t('common.minutes', { value: 30 })}</option>
                      <option value="60">{t('common.hours', { value: 1 })}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-light-5 dark:shadow-dark-5 overflow-hidden">
                <div className="p-6 border-b border-light-200 dark:border-dark-600">
                  <h2 className="text-lg font-semibold text-light-900 dark:text-light-100">
                    {t('common.changePassword')}
                  </h2>
                </div>
                <form onSubmit={handleSubmit(onPasswordSubmit)} className="p-6 space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-light-850 dark:text-light-100 mb-2">
                      {t('common.currentPassword')}
                    </label>
                    <input
                      {...register('currentPassword')}
                      type="password"
                      id="currentPassword"
                      className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-main ${
                        errors.currentPassword
                          ? 'border-danger-500 focus:ring-danger-500'
                          : 'border-light-300 dark:border-dark-400 focus:border-brand-main'
                      } bg-light-50 dark:bg-dark-700 text-light-900 dark:text-light-100`}
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                    {errors.currentPassword && (
                      <p className="mt-1 text-sm text-danger-500">{t(errors.currentPassword.message as string)}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-light-850 dark:text-light-100 mb-2">
                      {t('common.newPassword')}
                    </label>
                    <input
                      {...register('newPassword')}
                      type="password"
                      id="newPassword"
                      className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-main ${
                        errors.newPassword
                          ? 'border-danger-500 focus:ring-danger-500'
                          : 'border-light-300 dark:border-dark-400 focus:border-brand-main'
                      } bg-light-50 dark:bg-dark-700 text-light-900 dark:text-light-100`}
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                    {errors.newPassword && (
                      <p className="mt-1 text-sm text-danger-500">{t(errors.newPassword.message as string)}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-light-850 dark:text-light-100 mb-2">
                      {t('common.confirmPassword')}
                    </label>
                    <input
                      {...register('confirmPassword')}
                      type="password"
                      id="confirmPassword"
                      className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-main ${
                        errors.confirmPassword
                          ? 'border-danger-500 focus:ring-danger-500'
                          : 'border-light-300 dark:border-dark-400 focus:border-brand-main'
                      } bg-light-50 dark:bg-dark-700 text-light-900 dark:text-light-100`}
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-danger-500">{t(errors.confirmPassword.message as string)}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-main text-white font-medium rounded-lg hover:bg-brand-darker focus:outline-none focus:ring-2 focus:ring-brand-main focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        {t('common.loading')}
                      </>
                    ) : (
                      t('common.changePassword')
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}