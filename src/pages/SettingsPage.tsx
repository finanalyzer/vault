import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Label, Select, Checkbox } from '@openbb/ui';
import { getUserProfile } from '../services/authService';
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
    handleSubmit,
    formState: { errors },
    reset,
    control,
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
        <header className="bg-white dark:bg-dark-800 border-b border-light-200 dark:border-dark-600 px-6 lg:px-6 py-4 pl-20 lg:pl-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-light-900 dark:text-light-100">
                {t('common.settings')}
              </h1>
              <p className="text-sm text-light-500 dark:text-dark-400 mt-1">
                {t('common.settingsHint')}
              </p>
            </div>
            <Button variant="secondary" onClick={() => navigate({ to: '/vault' })}>
              {t('common.close')}
            </Button>
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
              <Button
                onClick={() => setActiveTab('security')}
                variant={activeTab === 'security' ? 'primary' : 'secondary'}
                className="flex-1"
              >
                {t('common.security')}
              </Button>
              <Button
                onClick={() => setActiveTab('password')}
                variant={activeTab === 'password' ? 'primary' : 'secondary'}
                className="flex-1"
              >
                {t('common.password')}
              </Button>
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
                      <Label className="block font-medium text-light-900 dark:text-light-100">
                        {t('common.deviceLock')}
                      </Label>
                      <p className="text-sm text-light-500 dark:text-dark-400 mt-1">
                        {t('common.deviceLockHint')}
                      </p>
                    </div>
                    <Checkbox
                      checked={isDeviceLockEnabled}
                      disabled
                    />
                  </div>

                  <div className="flex items-center justify-between px-6 py-4">
                    <div>
                      <Label className="block font-medium text-light-900 dark:text-light-100">
                        {t('common.autoLock')}
                      </Label>
                      <p className="text-sm text-light-500 dark:text-dark-400 mt-1">
                        {t('common.autoLockHint')}
                      </p>
                    </div>
                    <Select
                      options={[
                        { value: '5', label: t('common.minutes', { value: 5 }) },
                        { value: '10', label: t('common.minutes', { value: 10 }) },
                        { value: '15', label: t('common.minutes', { value: 15 }) },
                        { value: '30', label: t('common.minutes', { value: 30 }) },
                        { value: '60', label: t('common.hours', { value: 1 }) },
                      ]}
                    />
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
                  <div className="space-y-2">
                    <Label>{t('common.currentPassword')}</Label>
                    <Controller
                      name="currentPassword"
                      control={control}
                      render={({ field }) => (
                        <Input
                          type="password"
                          placeholder="••••••••"
                          disabled={isLoading}
                          error={!!errors.currentPassword}
                          message={errors.currentPassword?.message ? t(errors.currentPassword.message as string) : undefined}
                          revealable
                          value={field.value}
                          onChange={(value) => field.onChange(value)}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t('common.newPassword')}</Label>
                    <Controller
                      name="newPassword"
                      control={control}
                      render={({ field }) => (
                        <Input
                          type="password"
                          placeholder="••••••••"
                          disabled={isLoading}
                          error={!!errors.newPassword}
                          message={errors.newPassword?.message ? t(errors.newPassword.message as string) : undefined}
                          revealable
                          value={field.value}
                          onChange={(value) => field.onChange(value)}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t('common.confirmPassword')}</Label>
                    <Controller
                      name="confirmPassword"
                      control={control}
                      render={({ field }) => (
                        <Input
                          type="password"
                          placeholder="••••••••"
                          disabled={isLoading}
                          error={!!errors.confirmPassword}
                          message={errors.confirmPassword?.message ? t(errors.confirmPassword.message as string) : undefined}
                          revealable
                          value={field.value}
                          onChange={(value) => field.onChange(value)}
                        />
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    {isLoading ? t('common.loading') : t('common.changePassword')}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}