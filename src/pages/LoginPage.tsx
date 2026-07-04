import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@openbb/ui';
import LoginForm from '../components/LoginForm';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const initialUsername = searchParams.get('username') || undefined;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-light-100 to-light-200 dark:from-dark-900 dark:to-dark-800">
      <div className="w-full max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-light-5 dark:shadow-dark-5 overflow-hidden">
          <div className="p-8 sm:p-10">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-main to-brand-darker rounded-xl flex items-center justify-center mb-4">
                <img src={`${import.meta.env.BASE_URL}passxyz.svg`} alt="PassXYZ" className="w-10 h-10 object-contain" />
              </div>
              <h1 className="text-2xl font-bold text-light-900 dark:text-light-100">
                {t('login.title')}
              </h1>
              <p className="mt-2 text-light-500 dark:text-dark-300">
                {t('login.subtitle')}
              </p>
            </div>

            <LoginForm initialUsername={initialUsername} />

            <div className="mt-6 text-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate({ to: '/signup' })}
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