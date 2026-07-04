import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@openbb/ui';
import { getUserProfile } from '../services/authService';
import type { UserProfileDto } from '../types/api';
import Sidebar from '../components/layout/Sidebar';

export default function QrCodePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState<UserProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeviceLockEnabled, setIsDeviceLockEnabled] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const data = await getUserProfile();
      setUser(data);
      setIsDeviceLockEnabled(data.isDeviceLockEnabled);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const qrCodeData = user ? JSON.stringify({
    username: user.username,
    email: user.email,
    deviceLockEnabled: isDeviceLockEnabled,
    timestamp: Date.now(),
  }) : '';

  return (
    <div className="min-h-screen bg-light-100 dark:bg-dark-900 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-dark-800 border-b border-light-200 dark:border-dark-600 px-6 lg:px-6 py-4 pl-20 lg:pl-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-light-900 dark:text-light-100">
                {t('common.deviceLock')}
              </h1>
              <p className="text-sm text-light-500 dark:text-dark-400 mt-1">
                {t('common.deviceLockQR')}
              </p>
            </div>
            <Button variant="secondary" onClick={() => navigate({ to: '/vault/settings' })}>
              {t('common.close')}
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-md mx-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <svg className="animate-spin h-8 w-8 text-brand-main mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-2 text-light-500 dark:text-dark-400">{t('common.loading')}</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-light-5 dark:shadow-dark-5 overflow-hidden">
                <div className="p-8 text-center">
                  <div className="w-48 h-48 mx-auto bg-white dark:bg-dark-700 rounded-xl p-4 shadow-inner">
                    {qrCodeData && (
                      <QRCodeSVG
                        value={qrCodeData}
                        size={180}
                        level="H"
                        includeMargin={false}
                      />
                    )}
                  </div>
                  <h2 className="mt-6 text-lg font-semibold text-light-900 dark:text-light-100">
                    {t('common.scanQR')}
                  </h2>
                  <p className="mt-2 text-sm text-light-500 dark:text-dark-400">
                    {t('common.scanQRHint')}
                  </p>
                  
                  <div className="mt-8 p-4 bg-light-50 dark:bg-dark-700 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-main/10 rounded-lg flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-main">
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium text-light-900 dark:text-light-100">
                          {user?.username}
                        </h3>
                        <p className="text-sm text-light-500 dark:text-dark-400">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {!isDeviceLockEnabled && (
                    <div className="mt-6 p-4 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-xl">
                      <p className="text-sm text-warning-600 dark:text-warning-400">
                        {t('common.deviceLockDisabled')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}