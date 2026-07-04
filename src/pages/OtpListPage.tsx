import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@openbb/ui';
import { getItemsByGroup } from '../services/vaultService';
import type { ItemDto } from '../types/vault';
import type { EntryDto } from '../types/vault';
import { ItemSubType } from '../types/vault';
import { generateOtp, parseOtpUrl, getOtpRemainingSeconds } from '../utils/totp';
import { copyToClipboard } from '../utils/clipboard';
import Sidebar from '../components/layout/Sidebar';

interface OtpEntry {
  item: ItemDto;
  entry: EntryDto;
  otpCode: string;
  remaining: number;
}

export default function OtpListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [otpEntries, setOtpEntries] = useState<OtpEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadOtpEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const items = await getItemsByGroup('root');
      const entriesWithOtp: OtpEntry[] = [];

      for (const item of items) {
        if (!item.isGroup && (item.type === ItemSubType.Entry || item.type === ItemSubType.PxEntry)) {
          const response = await fetch(`/api/vault/entries/${item.id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('passxyz-token')}` },
          });
          if (response.ok) {
            const entry: EntryDto = await response.json();
            if (entry.otpUrl) {
              const otpData = parseOtpUrl(entry.otpUrl);
              if (otpData) {
                const { code, remaining } = generateOtp(otpData.secret);
                entriesWithOtp.push({ item, entry, otpCode: code, remaining });
              }
            }
          }
        }
      }

      setOtpEntries(entriesWithOtp);
    } catch {
      setOtpEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOtpEntries();
  }, [loadOtpEntries]);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getOtpRemainingSeconds();
      setOtpEntries(prev => prev.map(entry => {
        if (remaining !== entry.remaining) {
          const otpData = parseOtpUrl(entry.entry.otpUrl!);
          if (otpData) {
            const { code } = generateOtp(otpData.secret);
            return { ...entry, otpCode: code, remaining };
          }
        }
        return { ...entry, remaining };
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCopy = async (id: string, code: string) => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleItemClick = (item: ItemDto) => {
    navigate({ to: `/vault/entries/${item.id}` });
  };

  return (
    <div className="min-h-screen bg-light-100 dark:bg-dark-900 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-dark-800 border-b border-light-200 dark:border-dark-600 px-6 lg:px-6 py-4 pl-20 lg:pl-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-light-900 dark:text-light-100">
                {t('common.otp')}
              </h1>
              <p className="text-sm text-light-500 dark:text-dark-400 mt-1">
                {t('common.otpHint')}
              </p>
            </div>
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
            ) : otpEntries.length === 0 ? (
              <div className="p-8 text-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-light-300 dark:text-dark-500">
                  <path d="M20 3H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4m8 0h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
                  <path d="M15 10l4 4-4 4" />
                  <path d="M9 18H9.01" />
                </svg>
                <p className="mt-4 text-light-500 dark:text-dark-400">{t('common.noOtp')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {otpEntries.map((entry) => (
                  <div
                    key={entry.item.id}
                    onClick={() => handleItemClick(entry.item)}
                    className="bg-white dark:bg-dark-800 rounded-xl shadow-light-5 dark:shadow-dark-5 p-6 hover:bg-light-50 dark:hover:bg-dark-700 cursor-pointer transition-colors relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-success-100 dark:bg-success-900/30 rounded-lg flex items-center justify-center">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success-600 dark:text-success-400">
                            <path d="M20 3H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4m8 0h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
                            <path d="M15 10l4 4-4 4" />
                            <path d="M9 18H9.01" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-light-900 dark:text-light-100">
                            {entry.item.name}
                          </h3>
                          <p className="text-sm text-light-500 dark:text-dark-400">
                            {entry.entry.username || ''}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(entry.item.id, entry.otpCode);
                        }}
                        className={copiedId === entry.item.id ? 'text-success-500' : 'text-light-400 hover:text-brand-main'}
                      >
                        {copiedId === entry.item.id ? 'check' : 'copy'}
                      </Button>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="text-3xl font-bold text-light-900 dark:text-light-100 tracking-wider font-mono">
                          {entry.otpCode}
                        </div>
                        <div className="mt-2 h-1.5 bg-light-200 dark:bg-dark-600 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-success-500 transition-all duration-1000"
                            style={{ width: `${(entry.remaining / 30) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-light-500 dark:text-dark-400">
                        {entry.remaining}s
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}