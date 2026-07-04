import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Label, Checkbox } from '@openbb/ui';
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
  const [isLoading, setIsLoading] = useState(false);
  const [signupError, setSignupError] = useState<string>('');
  const [isDeviceLockEnabled, setIsDeviceLockEnabled] = useState(false);

  const searchParams = new URLSearchParams(window.location.search);
  const initialEmail = searchParams.get('email') || '';

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    control,
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
              <div className="space-y-2">
                <Label>{t('signup.username')}</Label>
                <Controller
                  name="username"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="text"
                      placeholder="username"
                      disabled={isLoading}
                      error={!!errors.username}
                      message={errors.username?.message ? t(errors.username.message) : undefined}
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('signup.email')}</Label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      disabled={isLoading}
                      error={!!errors.email}
                      message={errors.email?.message ? t(errors.email.message) : undefined}
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('signup.masterPassword')}</Label>
                <Controller
                  name="masterPassword"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="password"
                      placeholder="••••••••"
                      disabled={isLoading}
                      error={!!errors.masterPassword}
                      message={errors.masterPassword?.message ? t(errors.masterPassword.message) : undefined}
                      revealable
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('signup.confirmPassword')}</Label>
                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="password"
                      placeholder="••••••••"
                      disabled={isLoading}
                      error={!!errors.confirmPassword}
                      message={errors.confirmPassword?.message ? t(errors.confirmPassword.message) : undefined}
                      revealable
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                    />
                  )}
                />
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  checked={isDeviceLockEnabled}
                  onChange={() => setIsDeviceLockEnabled(!isDeviceLockEnabled)}
                  disabled={isLoading}
                  className="mt-1"
                />
                <div>
                  <Label className="block">{t('signup.deviceLock')}</Label>
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

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? t('login.loading') : t('signup.createAccount')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                variant="link"
                onClick={() => navigate({ to: '/login' })}
              >
                {t('signup.alreadyHaveAccount')} {t('signup.login')}
              </Button>
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