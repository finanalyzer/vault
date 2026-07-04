import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Input } from '@openbb/ui';
import { searchEntries } from '../services/vaultService';
import type { ItemDto } from '../types/vault';
import { ItemSubType } from '../types/vault';
import Sidebar from '../components/layout/Sidebar';

export default function SearchPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<ItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!keyword.trim()) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await searchEntries(keyword.trim());
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [keyword]);

  useEffect(() => {
    const debounce = setTimeout(handleSearch, 300);
    return () => clearTimeout(debounce);
  }, [handleSearch]);

  const handleItemClick = (item: ItemDto) => {
    if (item.isGroup) {
      navigate({ to: `/vault/groups/${item.id}` });
    } else {
      navigate({ to: `/vault/entries/${item.id}` });
    }
  };

  const getIconForItem = (item: ItemDto) => {
    if (item.isGroup) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-main">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      );
    }
    switch (item.type) {
      case ItemSubType.Notes:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-light-500">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        );
      case ItemSubType.PxEntry:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-light-500">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="5" x2="16" y2="19" />
            <line x1="8" y1="5" x2="8" y2="19" />
          </svg>
        );
    }
  };

  const formatLastModified = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-light-100 dark:bg-dark-900 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-dark-800 border-b border-light-200 dark:border-dark-600 px-6 lg:px-6 py-4 pl-20 lg:pl-6">
          <div className="max-w-3xl mx-auto">
            <Input
              type="text"
              value={keyword}
              onChange={(value) => setKeyword(String(value))}
              placeholder={t('common.search') + '...'}
              icon="search"
              clearable={!!keyword}
              onClear={() => setKeyword('')}
            />
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-3xl mx-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <svg className="animate-spin h-8 w-8 text-brand-main mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-2 text-light-500 dark:text-dark-400">{t('common.loading')}</p>
              </div>
            ) : keyword.trim() === '' ? (
              <div className="p-8 text-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-light-300 dark:text-dark-500">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <p className="mt-4 text-light-500 dark:text-dark-400">{t('common.searchHint')}</p>
              </div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-light-300 dark:text-dark-500">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <p className="mt-4 text-light-500 dark:text-dark-400">{t('common.noResults')}</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-light-5 dark:shadow-dark-5 overflow-hidden">
                <div className="p-6 border-b border-light-200 dark:border-dark-600">
                  <h2 className="text-lg font-semibold text-light-900 dark:text-light-100">
                    {t('common.results')} ({results.length})
                  </h2>
                </div>
                <div className="divide-y divide-light-100 dark:divide-dark-700">
                  {results.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-light-50 dark:hover:bg-dark-700 cursor-pointer transition-colors"
                    >
                      <div className="flex-shrink-0">
                        {getIconForItem(item)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-light-900 dark:text-light-100 truncate">
                          {item.name}
                        </h3>
                        <p className="text-sm text-light-500 dark:text-dark-400">
                          {formatLastModified(item.lastModified)}
                        </p>
                      </div>
                      {item.isGroup && (
                        <span className="text-sm text-light-500 dark:text-dark-400">
                          {t('common.group')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}