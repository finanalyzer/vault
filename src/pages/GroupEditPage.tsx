import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Button, Input, Label, Textarea } from '@openbb/ui';
import { getGroup, updateGroup } from '../services/vaultService';
import type { GroupDto } from '../types/vault';
import Sidebar from '../components/layout/Sidebar';

export default function GroupEditPage() {
  const params = useParams({ from: '/vault/groups/$groupId/fields' });
  const groupId = params.groupId;
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [group, setGroup] = useState<GroupDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editName, setEditName] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [error, setError] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    loadGroup();
  }, [groupId]);

  const loadGroup = async () => {
    setIsLoading(true);
    try {
      const data = await getGroup(groupId!);
      setGroup(data);
      setEditName(data?.name || '');
      setEditNotes(data?.notes || '');
    } catch {
      setGroup(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!group) return;
    setError('');

    try {
      await updateGroup(groupId!, {
        id: group.id,
        name: editName,
        notes: editNotes || undefined,
      } as GroupDto);

      setNotification(t('common.save') + ' ' + t('common.success'));
      setTimeout(() => {
        navigate({ to: '/vault/groups/$groupId', params: { groupId } });
      }, 1500);
    } catch {
      setError(t('common.error'));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-100 dark:bg-dark-900 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-brand-main mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-light-500 dark:text-dark-400">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-light-100 dark:bg-dark-900 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-light-500 dark:text-dark-400">{t('common.error')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-100 dark:bg-dark-900 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-dark-800 border-b border-light-200 dark:border-dark-600 px-6 lg:px-6 py-4 pl-20 lg:pl-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-light-900 dark:text-light-100">
                {t('common.edit')} {group.name}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="secondary" onClick={() => navigate({ to: '/vault/groups/$groupId', params: { groupId } })}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                <span className="hidden md:inline">{t('common.cancel')}</span>
              </Button>
              <Button variant="primary" onClick={handleSave}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                <span className="hidden md:inline">{t('common.save')}</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-2xl mx-auto">
            {notification && (
              <div className="p-4 mb-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg">
                <p className="text-sm text-success-600 dark:text-success-400">{notification}</p>
              </div>
            )}

            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-light-5 dark:shadow-dark-5 overflow-hidden">
              <div className="p-6 border-b border-light-200 dark:border-dark-600">
                <h2 className="text-lg font-semibold text-light-900 dark:text-light-100">
                  {t('common.basicInfo')}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label>{t('common.name')}</Label>
                  <Input
                    type="text"
                    value={editName}
                    onChange={(value) => setEditName(String(value))}
                    placeholder={t('common.name')}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('common.notes')}</Label>
                  <Textarea
                    rows={4}
                    value={editNotes}
                    onChange={(value) => setEditNotes(String(value))}
                    placeholder={t('common.notes')}
                  />
                </div>

                {error && (
                  <div className="p-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg">
                    <p className="text-sm text-danger-600 dark:text-danger-400">{error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}