import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { downloadAttachment, getAttachments } from '../services/vaultService';
import type { AttachmentDto } from '../types/vault';
import Sidebar from '../components/layout/Sidebar';

export default function ImagePreviewPage() {
  const params = useParams({ from: '/vault/preview/$entryId/$attachmentId' });
  const entryId = params.entryId;
  const attachmentId = params.attachmentId;
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<AttachmentDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadImage();
  }, [entryId, attachmentId]);

  const loadImage = async () => {
    setIsLoading(true);
    try {
      const blob = await downloadAttachment(entryId!, attachmentId!);
      const url = window.URL.createObjectURL(blob);
      setImageUrl(url);

      const attachments = await getAttachments(entryId!);
      const found = attachments.find(a => a.id === attachmentId);
      setAttachment(found || null);
    } catch {
      setImageUrl(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (imageUrl) {
        window.URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  return (
    <div className="min-h-screen bg-light-100 dark:bg-dark-900 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-dark-800 border-b border-light-200 dark:border-dark-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-light-900 dark:text-light-100">
                {t('common.preview')}
              </h1>
              {attachment && (
                <p className="text-sm text-light-500 dark:text-dark-400 mt-1">
                  {attachment.name}
                </p>
              )}
            </div>
            <button
              onClick={() => navigate({ to: `/vault/entries/${entryId}` })}
              className="px-4 py-2 border border-light-300 dark:border-dark-600 text-light-700 dark:text-light-300 rounded-lg hover:bg-light-50 dark:hover:bg-dark-700 transition-colors"
            >
              {t('common.close')}
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 flex items-center justify-center">
          {isLoading ? (
            <div className="text-center">
              <svg className="animate-spin h-8 w-8 text-brand-main mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-2 text-light-500 dark:text-dark-400">{t('common.loading')}</p>
            </div>
          ) : imageUrl ? (
            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-light-5 dark:shadow-dark-5 overflow-hidden max-w-full max-h-full">
              <img
                src={imageUrl}
                alt={attachment?.name || 'Preview'}
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
          ) : (
            <div className="text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-light-300 dark:text-dark-500">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <p className="mt-4 text-light-500 dark:text-dark-400">{t('common.error')}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}