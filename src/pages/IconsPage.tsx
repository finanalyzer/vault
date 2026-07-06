import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '@openbb/ui';
import { getIcons } from '../services/vaultService';
import type { IconDto } from '../types/vault';
import Sidebar from '../components/layout/Sidebar';

export default function IconsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [icons, setIcons] = useState<IconDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

  useEffect(() => {
    loadIcons();
  }, []);

  const loadIcons = async () => {
    setIsLoading(true);
    try {
      const data = await getIcons();
      setIcons(data);
    } catch {
      setIcons([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredIcons = icons.filter(icon =>
    icon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-light-100 dark:bg-dark-900 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-dark-800 border-b border-light-200 dark:border-dark-600 px-6 lg:px-6 py-4 pl-20 lg:pl-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-light-900 dark:text-light-100">
                {t('common.icons')}
              </h1>
              <p className="text-sm text-light-500 dark:text-dark-400 mt-1">
                {t('common.selectIcon')}
              </p>
            </div>
            <Button variant="secondary" onClick={() => navigate({ to: '/vault' })}>
              {t('common.close')}
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Input
                type="text"
                value={searchTerm}
                onChange={(value) => setSearchTerm(String(value))}
                placeholder={t('common.search') + ' icons...'}
              />
            </div>

            {isLoading ? (
              <div className="p-8 text-center">
                <svg className="animate-spin h-8 w-8 text-brand-main mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-2 text-light-500 dark:text-dark-400">{t('common.loading')}</p>
              </div>
            ) : filteredIcons.length === 0 ? (
              <div className="p-8 text-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-light-300 dark:text-dark-500">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <p className="mt-4 text-light-500 dark:text-dark-400">{t('common.noIcons')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                {filteredIcons.map((icon) => (
                  <button
                    key={icon.id}
                    onClick={() => setSelectedIcon(icon.id)}
                    className={`aspect-square flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-colors ${
                      selectedIcon === icon.id
                        ? 'border-brand-main bg-brand-main/10'
                        : 'border-light-200 dark:border-dark-600 hover:border-brand-main'
                    }`}
                  >
                    <div className="w-10 h-10">
                      {icon.data ? (
                        icon.contentType === 'image/svg+xml' ? (
                          <div
                            dangerouslySetInnerHTML={{ __html: atob(icon.data) }}
                            className="w-full h-full text-light-700 dark:text-light-300"
                          />
                        ) : (
                          <img
                            src={`data:image/png;base64,${icon.data}`}
                            alt={icon.name}
                            className="w-full h-full object-contain"
                          />
                        )
                      ) : (
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-light-400">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs text-light-600 dark:text-light-400 truncate max-w-full">
                      {icon.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}