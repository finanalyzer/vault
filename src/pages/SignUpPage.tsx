import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signUp } from '../services/authService';

const signupSchema = z.object({
  username: z
    .string()
    .min(1, { message: 'signup.error.usernameRequired' })
    .min(3, { message: 'signup.error.usernameMinLength' }),
  email: z
    .string()
    .min(1, { message: 'signup.error.emailRequired' })
    .email({ message: 'signup.error.emailInvalid' }),
  masterPassword: z
    .string()
    .min(1, { message: 'signup.error.passwordRequired' })
    .min(8, { message: 'signup.error.passwordMinLength' }),
  confirmPassword: z
    .string()
    .min(1, { message: 'signup.error.passwordRequired' }),
}).refine((data) => data.masterPassword === data.confirmPassword, {
  message: 'signup.error.passwordMismatch',
  path: ['confirmPassword'],
});

type SignUpFormData = z.infer<typeof signupSchema>;

export default function SignUpPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signupError, setSignupError] = useState<string>('');
  const [isDeviceLockEnabled, setIsDeviceLockEnabled] = useState(false);

  const searchParams = new URLSearchParams(window.location.search);
  const initialEmail = searchParams.get('email') || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      email: initialEmail,
      masterPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (initialEmail) {
      setValue('email', initialEmail);
    }
  }, [initialEmail, setValue]);

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    setSignupError('');

    try {
      await signUp({
        username: data.username,
        email: data.email,
        masterPassword: data.masterPassword,
        isDeviceLockEnabled,
      });

      navigate({ to: '/login', search: { username: data.username } });
    } catch {
      setSignupError(t('signup.error.signupFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-light-100 to-light-200 dark:from-dark-900 dark:to-dark-800">
      <div className="w-full max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-light-5 dark:shadow-dark-5 overflow-hidden">
          <div className="p-8 sm:p-10">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-main to-brand-darker rounded-xl flex items-center justify-center mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                  <path d="M50 25 L35 40 L35 60 L50 75 L65 60 L65 40 Z" transform="scale(0.15)"/>
                  <circle cx="50" cy="50" r="10" fill="white" opacity="0.9" transform="scale(0.15)"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-light-900 dark:text-light-100">
                {t('signup.title')}
              </h1>
              <p className="mt-2 text-light-500 dark:text-dark-300">
                {t('signup.subtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-light-850 dark:text-light-100 mb-2">
                  {t('signup.username')}
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
                <label htmlFor="email" className="block text-sm font-medium text-light-850 dark:text-light-100 mb-2">
                  {t('signup.email')}
                </label>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-main ${
                    errors.email
                      ? 'border-danger-500 focus:ring-danger-500'
                      : 'border-light-300 dark:border-dark-400 focus:border-brand-main'
                  } bg-light-50 dark:bg-dark-700 text-light-900 dark:text-light-100`}
                  placeholder="email@example.com"
                  disabled={isLoading}
                />
                {errors.email && errors.email.message && (
                  <p className="mt-1 text-sm text-danger-500">{t(errors.email.message)}</p>
                )}
              </div>

              <div>
                <label htmlFor="masterPassword" className="block text-sm font-medium text-light-850 dark:text-light-100 mb-2">
                  {t('signup.masterPassword')}
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

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-light-850 dark:text-light-100 mb-2">
                  {t('signup.confirmPassword')}
                </label>
                <div className="relative">
                  <input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-main pr-12 ${
                      errors.confirmPassword
                        ? 'border-danger-500 focus:ring-danger-500'
                        : 'border-light-300 dark:border-dark-400 focus:border-brand-main'
                    } bg-light-50 dark:bg-dark-700 text-light-900 dark:text-light-100`}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-light-500 dark:text-dark-300 hover:text-light-700 dark:hover:text-light-200 transition-colors"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
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
                {errors.confirmPassword && errors.confirmPassword.message && (
                  <p className="mt-1 text-sm text-danger-500">{t(errors.confirmPassword.message)}</p>
                )}
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="deviceLock"
                  checked={isDeviceLockEnabled}
                  onChange={(e) => setIsDeviceLockEnabled(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-light-300 dark:border-dark-500 bg-light-50 dark:bg-dark-700 text-brand-main focus:ring-brand-main"
                  disabled={isLoading}
                />
                <div>
                  <label htmlFor="deviceLock" className="block text-sm font-medium text-light-850 dark:text-light-100">
                    {t('signup.deviceLock')}
                  </label>
                  <p className="text-sm text-light-500 dark:text-dark-400 mt-1">
                    {t('signup.deviceLockHint')}
                  </p>
                </div>
              </div>

              {signupError && (
                <div className="p-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg">
                  <p className="text-sm text-danger-600 dark:text-danger-400">{signupError}</p>
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
                  t('signup.createAccount')
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate({ to: '/login' })}
                className="text-brand-main hover:text-brand-darker transition-colors"
              >
                {t('signup.alreadyHaveAccount')} {t('signup.login')}
              </button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-light-500 dark:text-dark-400">
          PassXYZ Vault - Secure password management
        </p>
      </div>
    </div>
  );
}