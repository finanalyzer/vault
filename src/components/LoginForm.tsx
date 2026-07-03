import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { login, getUserByEmail } from '../services/authService';
import type { SessionConflictResponse } from '../types/api';
import { useAuth } from '../contexts/AuthContext';

const loginSchema = z.object({
  username: z
    .string()
    .min(1, { message: 'login.error.usernameRequired' })
    .min(3, { message: 'login.error.usernameMinLength' }),
  masterPassword: z
    .string()
    .min(1, { message: 'login.error.passwordRequired' })
    .min(8, { message: 'login.error.passwordMinLength' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  initialUsername?: string;
}

export default function LoginForm({ initialUsername }: LoginFormProps) {
  const { t } = useTranslation();
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string>('');
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictData, setConflictData] = useState<SessionConflictResponse | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: initialUsername || '',
      masterPassword: '',
    },
  });

  useEffect(() => {
    if (initialUsername) {
      setValue('username', initialUsername);
    }
  }, [initialUsername, setValue]);

  useEffect(() => {
    const cloudflareEmail = localStorage.getItem('cf-email');
    if (cloudflareEmail && !initialUsername) {
      getUserByEmail(cloudflareEmail).then(user => {
        if (user) {
          setValue('username', user.username);
        } else {
          navigate({ to: '/signup', search: { email: cloudflareEmail } });
        }
      });
    }
  }, [initialUsername, setValue, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setLoginError('');

    try {
      const response = await login({
        username: data.username,
        masterPassword: data.masterPassword,
        deviceInfo: `${navigator.userAgent}`,
      });

      authLogin(response.token, response.user);
      navigate({ to: '/vault' });
    } catch (error: any) {
      if (error.response?.status === 409) {
        setConflictData(error.response.data);
        setShowConflictModal(true);
      } else {
        setLoginError(t('login.error.loginFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTakeOver = async () => {
    if (!conflictData) return;

    setIsLoading(true);
    try {
      const response = await login({
        username: getValues('username'),
        masterPassword: getValues('masterPassword'),
        takeOver: true,
        deviceInfo: `${navigator.userAgent}`,
      });
      authLogin(response.token, response.user);
      navigate({ to: '/vault' });
    } catch {
      setLoginError(t('login.error.loginFailed'));
    } finally {
      setIsLoading(false);
      setShowConflictModal(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-light-850 dark:text-light-100 mb-2">
            {t('login.username')}
          </label>
          <input
            {...register('username')}
            type="text"
            id="username"
            className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-main ${
              errors.username
                ? 'border-danger-500 focus:ring-danger-500'
                : 'border-light-300 dark:border-dark-400 focus:border-brand-main'
            } bg-light-50 dark:bg-dark-700 text-light-900 dark:text-light-100`}
            placeholder="username"
            disabled={isLoading}
          />
          {errors.username && errors.username.message && (
            <p className="mt-1 text-sm text-danger-500">{t(errors.username.message)}</p>
          )}
        </div>

        <div>
          <label htmlFor="masterPassword" className="block text-sm font-medium text-light-850 dark:text-light-100 mb-2">
            {t('login.masterPassword')}
          </label>
          <div className="relative">
            <input
              {...register('masterPassword')}
              type={showPassword ? 'text' : 'password'}
              id="masterPassword"
              className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-main pr-12 ${
                errors.masterPassword
                  ? 'border-danger-500 focus:ring-danger-500'
                  : 'border-light-300 dark:border-dark-400 focus:border-brand-main'
              } bg-light-50 dark:bg-dark-700 text-light-900 dark:text-light-100`}
              placeholder="••••••••"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-light-500 dark:text-dark-300 hover:text-light-700 dark:hover:text-light-200 transition-colors"
              disabled={isLoading}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.87 9.87a3 3 0 1 0 4.26 4.26" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7c1.09 0 2.16-.16 3.16-.46" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {errors.masterPassword && errors.masterPassword.message && (
            <p className="mt-1 text-sm text-danger-500">{t(errors.masterPassword.message)}</p>
          )}
        </div>

        {loginError && (
          <div className="p-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg">
            <p className="text-sm text-danger-600 dark:text-danger-400">{loginError}</p>
          </div>
        )}

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
              {t('login.loading')}
            </>
          ) : (
            t('login.login')
          )}
        </button>
      </form>

      {showConflictModal && conflictData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-light-900 dark:text-light-100 mb-2">
              {t('login.sessionConflict.title')}
            </h3>
            <p className="text-light-600 dark:text-light-300 mb-4">
              {t('login.sessionConflict.message')}
            </p>
            <div className="space-y-2">
              <p className="text-sm text-light-500 dark:text-dark-400">
                {t('login.sessionConflict.device')}: {conflictData.existingSession?.deviceInfo}
              </p>
              <p className="text-sm text-light-500 dark:text-dark-400">
                {t('login.sessionConflict.loginTime')}: {conflictData.existingSession?.loginTime ? new Date(conflictData.existingSession.loginTime).toLocaleString() : ''}
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowConflictModal(false)}
                className="flex-1 px-4 py-2 border border-light-300 dark:border-dark-600 text-light-700 dark:text-light-300 rounded-lg hover:bg-light-50 dark:hover:bg-dark-700 transition-colors"
              >
                {t('login.sessionConflict.cancel')}
              </button>
              <button
                onClick={handleTakeOver}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-danger-500 text-white rounded-lg hover:bg-danger-600 transition-colors disabled:opacity-50"
              >
                {t('login.sessionConflict.takeOver')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}