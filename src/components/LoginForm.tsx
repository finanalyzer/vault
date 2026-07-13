import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Form, FormField, FormInput, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@openbb/ui';
import { login, getUserByEmail } from '../services/authService';
import type { SessionConflictResponse } from '../types/api';
import { useAuth } from '../contexts/AuthContext';

const loginSchema = z.object({
  identifier: z
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

const isEmail = (input: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
};

export default function LoginForm({ initialUsername }: LoginFormProps) {
  const { t } = useTranslation();
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string>('');
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictData, setConflictData] = useState<SessionConflictResponse | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: initialUsername || '',
      masterPassword: '',
    },
  });

  useEffect(() => {
    if (initialUsername) {
      form.setValue('identifier', initialUsername);
    }
  }, [initialUsername, form]);

  useEffect(() => {
    const cloudflareEmail = localStorage.getItem('cf-email');
    if (cloudflareEmail && !initialUsername) {
      getUserByEmail(cloudflareEmail).then(user => {
        if (user) {
          form.setValue('identifier', user.username);
        } else {
          navigate({ to: '/signup', search: { email: cloudflareEmail } });
        }
      });
    }
  }, [initialUsername, form, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setLoginError('');

    try {
      const identifier = data.identifier;
      const email = isEmail(identifier) ? identifier : undefined;
      const username = isEmail(identifier) ? '' : identifier;

      const response = await login({
        username,
        email,
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
      const identifier = form.getValues('identifier');
      const email = isEmail(identifier) ? identifier : undefined;
      const username = isEmail(identifier) ? '' : identifier;

      const response = await login({
        username,
        email,
        masterPassword: form.getValues('masterPassword'),
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="identifier"
            render={({ field, fieldState }) => (
              <FormInput
                {...field}
                label={t('login.usernameOrEmail')}
                placeholder="username or email"
                disabled={isLoading}
                error={!!fieldState.error}
                message={fieldState.error?.message ? t(fieldState.error.message) : undefined}
              />
            )}
          />

          <FormField
            control={form.control}
            name="masterPassword"
            render={({ field, fieldState }) => (
              <FormInput
                {...field}
                type="password"
                label={t('login.masterPassword')}
                placeholder="••••••••"
                disabled={isLoading}
                revealable
                error={!!fieldState.error}
                message={fieldState.error?.message ? t(fieldState.error.message) : undefined}
              />
            )}
          />

          {loginError && (
            <div className="p-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg">
              <p className="text-sm text-danger-600 dark:text-danger-400">{loginError}</p>
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
            {isLoading ? t('login.loading') : t('login.login')}
          </Button>
        </form>
      </Form>

      <Dialog open={showConflictModal} onOpenChange={setShowConflictModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('login.sessionConflict.title')}</DialogTitle>
            <DialogDescription>{t('login.sessionConflict.message')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <p className="text-sm text-light-500 dark:text-dark-400">
              {t('login.sessionConflict.device')}: {conflictData?.existingSession?.deviceInfo}
            </p>
            <p className="text-sm text-light-500 dark:text-dark-400">
              {t('login.sessionConflict.loginTime')}: {conflictData?.existingSession?.loginTime ? new Date(conflictData.existingSession.loginTime).toLocaleString() : ''}
            </p>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowConflictModal(false)}>
              {t('login.sessionConflict.cancel')}
            </Button>
            <Button variant="danger" onClick={handleTakeOver} disabled={isLoading}>
              {t('login.sessionConflict.takeOver')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}