import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import Sidebar from '../components/layout/Sidebar';

export default function AboutPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const features = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 3H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
      title: 'Security',
      description: 'End-to-end encryption with AES-256-GCM',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      title: 'Privacy',
      description: 'Zero-knowledge architecture',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: 'Multi-platform',
      description: 'Access your vault from anywhere',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M8 12l2 2 4-4" />
        </svg>
      ),
      title: 'Open Source',
      description: 'Community-driven development',
    },
  ];

  return (
    <div className="min-h-screen bg-light-100 dark:bg-dark-900 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-dark-800 border-b border-light-200 dark:border-dark-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-light-900 dark:text-light-100">
                {t('common.about')}
              </h1>
              <p className="text-sm text-light-500 dark:text-dark-400 mt-1">
                {t('common.aboutHint')}
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
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="w-24 h-24 bg-gradient-to-br from-brand-main to-brand-darker rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                  <path d="M50 25 L35 40 L35 60 L50 75 L65 60 L65 40 Z" transform="scale(0.15)"/>
                  <circle cx="50" cy="50" r="10" fill="white" opacity="0.9" transform="scale(0.15)"/>
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-light-900 dark:text-light-100">
                PassXYZ Vault
              </h2>
              <p className="mt-4 text-lg text-light-600 dark:text-light-300 max-w-2xl mx-auto">
                {t('common.aboutDescription')}
              </p>
              <div className="mt-6 flex items-center justify-center gap-2">
                <span className="px-3 py-1 bg-brand-main/10 text-brand-main rounded-full text-sm font-medium">
                  v1.0.0
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {features.map((feature, index) => (
                <div key={index} className="bg-white dark:bg-dark-800 rounded-xl shadow-light-5 dark:shadow-dark-5 p-6">
                  <div className="w-12 h-12 bg-brand-main/10 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-brand-main">{feature.icon}</span>
                  </div>
                  <h3 className="font-semibold text-light-900 dark:text-light-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-light-500 dark:text-dark-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-light-5 dark:shadow-dark-5 overflow-hidden">
              <div className="p-6 border-b border-light-200 dark:border-dark-600">
                <h3 className="text-lg font-semibold text-light-900 dark:text-light-100">
                  {t('common.techStack')}
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['React 18', 'TypeScript', 'TanStack Router', '@openbb/ui', 'Axios', 'Zod'].map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center px-3 py-1.5 bg-light-100 dark:bg-dark-700 rounded-lg text-sm font-medium text-light-700 dark:text-light-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 bg-white dark:bg-dark-800 rounded-xl shadow-light-5 dark:shadow-dark-5 overflow-hidden">
              <div className="p-6">
                <p className="text-sm text-light-500 dark:text-dark-400 text-center">
                  {t('common.copyright')} 2024 PassXYZ. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}