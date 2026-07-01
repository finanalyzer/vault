import { useTranslation } from "react-i18next";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  const { t } = useTranslation();

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
                {t("login.title")}
              </h1>
              <p className="mt-2 text-light-500 dark:text-dark-300">
                {t("login.subtitle")}
              </p>
            </div>

            <LoginForm onSuccess={() => {}} />
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-light-500 dark:text-dark-400">
          PassXYZ Vault - Secure password management
        </p>
      </div>
    </div>
  );
}