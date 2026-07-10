import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@openbb/ui';
import { getEntry, updateEntry, getGroup } from '../services/vaultService';
import { getUserProfile } from '../services/authService';
import type { EntryDto } from '../types/vault';
import type { GroupDto } from '../types/vault';
import Sidebar from '../components/layout/Sidebar';
import Breadcrumbs from '../components/layout/Breadcrumbs';
import MarkdownRenderer from '../components/MarkdownRenderer';

export default function NotesPage() {
  const params = useParams({ from: '/vault/notes/$entryId' });
  const entryId = params.entryId;
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [entry, setEntry] = useState<EntryDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [rootGroupName, setRootGroupName] = useState<string>('Root');
  const [rootGroupId, setRootGroupId] = useState<string>('root');
  const [groupName, setGroupName] = useState<string>('');
  const [groupId, setGroupId] = useState<string>('root');
  const [parentGroup, setParentGroup] = useState<{ id: string; name: string } | undefined>();

  useEffect(() => {
    loadEntry();
    loadRootGroupName();
  }, [entryId]);

  useEffect(() => {
    if (entry?.notes !== undefined) {
      setEditedNotes(entry.notes);
    }
  }, [entry]);

  const loadEntry = async () => {
    setIsLoading(true);
    setParentGroup(undefined);
    try {
      const data = await getEntry(entryId!);
      setEntry(data);
      
      if (data.groupId) {
        setGroupId(data.groupId);
        const group = await getGroup(data.groupId);

        const rootGroup = await getGroup('root');
        setRootGroupId(rootGroup.id);

        // Decode groupName if this entry is directly in the root group
        if (group.id === rootGroup.id && group.name.startsWith('pass_')) {
          try {
            const profile = await getUserProfile();
            setGroupName(profile.username);
          } catch {
            setGroupName(group.name);
          }
        } else {
          setGroupName(group.name);
        }
        
        if (group.parentId && group.parentId !== rootGroup.id) {
          const parent = await getGroup(group.parentId);
          setParentGroup({ id: parent.id, name: parent.name });
        } else {
          setParentGroup(undefined);
        }
      }
    } catch {
      setEntry(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setNotification(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedNotes(entry?.notes || '');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateEntry(entryId!, { notes: editedNotes });
      setEntry(prev => prev ? { ...prev, notes: editedNotes } : null);
      setIsEditing(false);
      setNotification({ type: 'success', message: t('common.save') + ' ' + t('common.success') });
      setTimeout(() => setNotification(null), 3000);
    } catch {
      setNotification({ type: 'error', message: t('common.error') });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const loadRootGroupName = async () => {
    try {
      const rootGroup: GroupDto = await getGroup('root');
      if (rootGroup.name.startsWith('pass_')) {
        try {
          const profile = await getUserProfile();
          setRootGroupName(profile.username);
        } catch {
          setRootGroupName(rootGroup.name);
        }
      } else {
        setRootGroupName(rootGroup.name);
      }
    } catch {
      setRootGroupName('Root');
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

  if (!entry) {
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
                {entry.name}
              </h1>
              <Breadcrumbs 
                groupId={groupId} 
                groupName={groupName} 
                rootGroupName={rootGroupName} 
                rootGroupId={rootGroupId} 
                parentGroup={parentGroup} 
              />
            </div>
            <div className="flex items-center gap-4">
              {isEditing ? (
                <>
                  <Button variant="secondary" onClick={handleCancelEdit}>
                    {t('common.cancel')}
                  </Button>
                  <Button variant="primary" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? t('common.saving') : t('common.save')}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="secondary" onClick={handleStartEdit}>
                    {t('common.edit')}
                  </Button>
                  <Button variant="secondary" onClick={() => navigate({ to: `/vault/groups/${groupId}` })}>
                    {t('common.close')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          {notification && (
            <div className={`p-4 mb-4 ${notification.type === 'success' ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800' : 'bg-danger-50 dark:bg-danger-900/20 border-danger-200 dark:border-danger-800'} border rounded-lg`}>
              <p className={`text-sm ${notification.type === 'success' ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>
                {notification.message}
              </p>
            </div>
          )}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-light-5 dark:shadow-dark-5 overflow-hidden">
              <div className="p-8">
                {isEditing ? (
                  <textarea
                    className="w-full h-96 p-4 bg-light-50 dark:bg-dark-700 border border-light-200 dark:border-dark-600 rounded-lg resize-none text-sm text-light-900 dark:text-light-100 font-mono"
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    placeholder={t('common.noNotes')}
                    autoFocus
                  />
                ) : entry.notes ? (
                  <MarkdownRenderer content={entry.notes} />
                ) : (
                  <div className="text-center py-12">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-light-300 dark:text-dark-500">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    <p className="mt-4 text-light-500 dark:text-dark-400">{t('common.noNotes')}</p>
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