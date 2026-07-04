import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@openbb/ui';
import { getEntry, deleteEntry, getAttachments, downloadAttachment, deleteAttachment, getGroup } from '../services/vaultService';
import type { EntryDto } from '../types/vault';
import type { AttachmentDto } from '../types/vault';
import type { GroupDto } from '../types/vault';

import { copyToClipboard } from '../utils/clipboard';
import Sidebar from '../components/layout/Sidebar';
import Breadcrumbs from '../components/layout/Breadcrumbs';

export default function ItemDetailPage() {
  const params = useParams({ from: '/vault/entries/$entryId' });
  const entryId = params.entryId;
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [entry, setEntry] = useState<EntryDto | null>(null);
  const [attachments, setAttachments] = useState<AttachmentDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [rootGroupName, setRootGroupName] = useState<string>('Root');
  const [groupName, setGroupName] = useState<string>('');
  const [groupId, setGroupId] = useState<string>('root');
  const [parentGroup, setParentGroup] = useState<{ id: string; name: string } | undefined>();

  useEffect(() => {
    loadEntry();
    loadAttachments();
    loadRootGroupName();
  }, [entryId]);

  const loadEntry = async () => {
    setIsLoading(true);
    setParentGroup(undefined);
    try {
      const data = await getEntry(entryId!);
      setEntry(data);
      
      if (data.groupId) {
        setGroupId(data.groupId);
        const group = await getGroup(data.groupId);
        setGroupName(group.name);
        
        if (group.parentId && group.parentId !== 'root') {
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

  const loadAttachments = async () => {
    try {
      const data = await getAttachments(entryId!);
      setAttachments(data);
    } catch {
      setAttachments([]);
    }
  };

  const loadRootGroupName = async () => {
    try {
      const rootGroup: GroupDto = await getGroup('root');
      setRootGroupName(rootGroup.name);
    } catch {
      setRootGroupName('Root');
    }
  };

  const handleCopy = async (field: string, value: string) => {
    if (!value) return;
    const success = await copyToClipboard(value);
    if (success) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEntry(entryId!);
      setNotification({ type: 'success', message: t('common.delete') + ' ' + t('common.success') });
      setTimeout(() => navigate({ to: '/vault' }), 1500);
    } catch {
      setNotification({ type: 'error', message: t('common.error') });
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const handleDownloadAttachment = async (attachment: AttachmentDto) => {
    try {
      const blob = await downloadAttachment(entryId!, attachment.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      setNotification({ type: 'error', message: t('common.error') });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      await deleteAttachment(entryId!, attachmentId);
      setAttachments(attachments.filter(a => a.id !== attachmentId));
      setNotification({ type: 'success', message: t('common.delete') + ' ' + t('common.success') });
      setTimeout(() => setNotification(null), 3000);
    } catch {
      setNotification({ type: 'error', message: t('common.error') });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handlePreviewAttachment = (attachmentId: string) => {
    navigate({ to: `/vault/preview/${entryId}/${attachmentId}` });
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

  const fieldItems = [
    { label: 'username', value: entry.username, icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    )},
    { label: 'password', value: entry.password, isPassword: true },
    { label: 'email', value: entry.email, icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    )},
    { label: 'mobile', value: entry.mobile, icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <path d="M12 18h.01" />
      </svg>
    )},
    { label: 'url', value: entry.url, icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 1 5-5m0 0a5 5 0 0 1 5 5m-5 5a5 5 0 0 1-5-5m0 0a5 5 0 0 1 5-5" />
      </svg>
    )},
  ].filter(item => item.value);

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
              <Breadcrumbs groupId={groupId} groupName={groupName} rootGroupName={rootGroupName} parentGroup={parentGroup} />
            </div>
            <div className="flex items-center gap-4">
              <Button variant="secondary" onClick={() => navigate({ to: `/vault/entries/${entryId}/fields` })}>
                {t('common.edit')}
              </Button>
              <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
                {t('common.delete')}
              </Button>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-light-5 dark:shadow-dark-5 overflow-hidden">
              <div className="p-6 border-b border-light-200 dark:border-dark-600">
                <h2 className="text-lg font-semibold text-light-900 dark:text-light-100">
                  {t('common.edit')}
                </h2>
              </div>
              <div className="divide-y divide-light-100 dark:divide-dark-700">
                {fieldItems.map((item) => (
                  <div key={item.label} className="flex items-center gap-4 px-6 py-4 hover:bg-light-50 dark:hover:bg-dark-700">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-light-400 dark:text-dark-500">
                      {item.icon || (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-xs font-medium text-light-500 dark:text-dark-400 uppercase tracking-wider">
                        {t(`login.${item.label}`) || item.label}
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-light-900 dark:text-light-100 truncate">
                          {item.isPassword && !showPassword ? '••••••••' : item.value}
                        </span>
                        {item.isPassword && (
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-light-500 dark:text-dark-300 hover:text-light-700 dark:hover:text-light-200 transition-colors flex-shrink-0"
                          >
                            {showPassword ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9.87 9.87a3 3 0 1 0 4.26 4.26" />
                                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7c1.09 0 2.16-.16 3.16-.46" />
                              </svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(item.label, item.value!)}
                      className="flex-shrink-0 p-2 text-light-400 dark:text-dark-500 hover:text-brand-main transition-colors"
                      title={t('common.copy')}
                    >
                      {copiedField === item.label ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success-500">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      )}
                    </button>
                  </div>
                ))}

                {entry.customFields && Object.keys(entry.customFields).length > 0 && (
                  <>
                    {Object.entries(entry.customFields).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-4 px-6 py-4 hover:bg-light-50 dark:hover:bg-dark-700">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-light-400 dark:text-dark-500">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="block text-xs font-medium text-light-500 dark:text-dark-400 uppercase tracking-wider">
                            {key}
                          </label>
                          <span className="text-sm text-light-900 dark:text-light-100">{value}</span>
                        </div>
                        <button
                          onClick={() => handleCopy(key, value)}
                          className="flex-shrink-0 p-2 text-light-400 dark:text-dark-500 hover:text-brand-main transition-colors"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </>
                )}

                {entry.notes && (
                  <div className="px-6 py-4">
                    <label className="block text-xs font-medium text-light-500 dark:text-dark-400 uppercase tracking-wider mb-2">
                      {t('common.notes')}
                    </label>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-sm text-light-900 dark:text-light-100 whitespace-pre-wrap">{entry.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {attachments.length > 0 && (
              <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-light-5 dark:shadow-dark-5 overflow-hidden">
                <div className="p-6 border-b border-light-200 dark:border-dark-600">
                  <h2 className="text-lg font-semibold text-light-900 dark:text-light-100">
                    {t('common.attachments')}
                  </h2>
                </div>
                <div className="divide-y divide-light-100 dark:divide-dark-700">
                  {attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center gap-4 px-6 py-4 hover:bg-light-50 dark:hover:bg-dark-700">
                      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-light-100 dark:bg-dark-700 rounded-lg">
                        {attachment.isImage ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-main">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-light-500">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-light-900 dark:text-light-100 truncate">{attachment.name}</h3>
                        <p className="text-sm text-light-500 dark:text-dark-400">
                          {(attachment.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {attachment.isImage && (
                          <button
                            onClick={() => handlePreviewAttachment(attachment.id)}
                            className="p-2 text-light-500 hover:text-brand-main transition-colors"
                            title="Preview"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                              <path d="M3 3v5h5" />
                              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                              <path d="M16 21h5v-5" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => handleDownloadAttachment(attachment)}
                          className="p-2 text-light-500 hover:text-brand-main transition-colors"
                          title={t('common.download')}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteAttachment(attachment.id)}
                          className="p-2 text-light-500 hover:text-danger-500 transition-colors"
                          title={t('common.delete')}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <Dialog open={showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('common.delete')}</DialogTitle>
            <p className="text-light-600 dark:text-light-300">
              {t('common.confirmDelete', { name: entry.name })}
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}