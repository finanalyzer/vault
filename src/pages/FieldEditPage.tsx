import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Button, Input, Label, Checkbox, Textarea } from '@openbb/ui';
import { getEntry, updateEntry } from '../services/vaultService';
import { ItemSubType } from '../types/vault';
import type { EntryDto } from '../types/vault';
import type { FieldDto } from '../types/vault';
import Sidebar from '../components/layout/Sidebar';
import { parseOtpUrl } from '../utils/totp';

export default function FieldEditPage() {
  const params = useParams({ from: '/vault/entries/$entryId/fields' });
  const entryId = params.entryId;
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [entry, setEntry] = useState<EntryDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fields, setFields] = useState<FieldDto[]>([]);
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');
  const [newFieldProtected, setNewFieldProtected] = useState(false);
  const [newFieldOtp, setNewFieldOtp] = useState(false);
  const [error, setError] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);
  const [showProtectedValues, setShowProtectedValues] = useState(false);

  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editOtpUrl, setEditOtpUrl] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadEntry();
  }, [entryId]);

  const loadEntry = async () => {
    setIsLoading(true);
    try {
      const data = await getEntry(entryId!);
      setEntry(data);
      setEditName(data.name || '');
      setEditUsername(data.username || '');
      setEditPassword(data.password || '');
      setEditUrl(data.url || '');
      setEditEmail(data.email || '');
      setEditMobile(data.mobile || '');
      setEditNotes(data.notes || '');
      setEditOtpUrl(data.otpUrl || '');

      if (data.fields) {
        setFields(data.fields.filter(f => !f.isBinary));
      } else if (data.customFields) {
        setFields(
          Object.entries(data.customFields).map(([key, value]) => ({
            key,
            value,
            isProtected: false,
            isBinary: false,
          }))
        );
      }
    } catch {
      setEntry(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddField = () => {
    if (newFieldOtp) {
      if (!newFieldValue.trim()) return;
      const parsed = parseOtpUrl(newFieldValue.trim());
      if (!parsed) {
        setError(t('common.error') + ': ' + t('common.invalidOtpUrl'));
        return;
      }
      setEditOtpUrl(newFieldValue.trim());
      setNewFieldValue('');
      setNewFieldOtp(false);
      setError('');
      return;
    }

    if (!newFieldKey.trim()) return;
    const exists = fields.some(f => f.key === newFieldKey.trim());
    if (exists) {
      setError(t('common.error') + ': ' + t('common.duplicate'));
      return;
    }
    setFields([
      ...fields,
      { key: newFieldKey.trim(), value: newFieldValue.trim(), isProtected: newFieldProtected, isBinary: false },
    ]);
    setNewFieldKey('');
    setNewFieldValue('');
    setNewFieldProtected(false);
    setError('');
  };

  const handleRemoveField = (key: string) => {
    setFields(fields.filter(f => f.key !== key));
  };

  const handleUpdateField = (key: string, newValue: string) => {
    setFields(fields.map(f => (f.key === key ? { ...f, value: newValue } : f)));
  };

  const handleToggleProtected = (key: string) => {
    setFields(fields.map(f => (f.key === key ? { ...f, isProtected: !f.isProtected } : f)));
  };

  const handleSave = async () => {
    if (!entry) return;
    setError('');

    try {
      await updateEntry(entryId!, {
        ...entry,
        name: editName,
        username: editUsername || undefined,
        password: editPassword || undefined,
        url: editUrl || undefined,
        email: editEmail || undefined,
        mobile: editMobile || undefined,
        notes: editNotes || undefined,
        otpUrl: editOtpUrl,
        fields: fields.length > 0 ? fields : undefined,
      });

      setNotification(t('common.save') + ' ' + t('common.success'));
      setTimeout(() => {
        navigate({ to: '/vault/entries/$entryId', params: { entryId } });
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
                {t('common.edit')} {entry.name}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="secondary" onClick={() => navigate({ to: '/vault/entries/$entryId', params: { entryId } })}>
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

            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-light-5 dark:shadow-dark-5 overflow-hidden mb-6">
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

                {entry.type !== ItemSubType.Notes && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('login.username')}</Label>
                      <Input
                        type="text"
                        value={editUsername}
                        onChange={(value) => setEditUsername(String(value))}
                        placeholder="username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('login.masterPassword')}</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={editPassword}
                          onChange={(value) => setEditPassword(String(value))}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-light-500 dark:text-dark-300 hover:text-light-700 dark:hover:text-light-200 transition-colors"
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
                      </div>
                    </div>
                  </div>
                )}

                {entry.type !== ItemSubType.Notes && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('login.email')}</Label>
                      <Input
                        type="email"
                        value={editEmail}
                        onChange={(value) => setEditEmail(String(value))}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('common.mobile')}</Label>
                      <Input
                        type="tel"
                        value={editMobile}
                        onChange={(value) => setEditMobile(String(value))}
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                  </div>
                )}

                {entry.type !== ItemSubType.Notes && (
                  <div className="space-y-2">
                    <Label>{t('common.url')}</Label>
                    <Input
                      type="url"
                      value={editUrl}
                      onChange={(value) => setEditUrl(String(value))}
                      placeholder="https://example.com"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>{t('common.notes')}</Label>
                  <Textarea
                    rows={4}
                    value={editNotes}
                    onChange={(value) => setEditNotes(String(value))}
                    placeholder="Add notes..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-light-5 dark:shadow-dark-5 overflow-hidden mb-6">
              <div className="p-6 border-b border-light-200 dark:border-dark-600">
                <h2 className="text-lg font-semibold text-light-900 dark:text-light-100">
                  {t('common.addField')}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('common.key')}</Label>
                    <Input
                      type="text"
                      value={newFieldOtp ? t('common.otp') : newFieldKey}
                      onChange={(value) => setNewFieldKey(String(value))}
                      placeholder="Field name"
                      disabled={newFieldOtp}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('common.value')}</Label>
                    <Input
                      type="text"
                      value={newFieldValue}
                      onChange={(value) => setNewFieldValue(String(value))}
                      placeholder={newFieldOtp ? 'otpauth://totp/...' : 'Field value'}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={newFieldProtected}
                      onCheckedChange={(checked) => setNewFieldProtected(checked as boolean)}
                      disabled={newFieldOtp}
                    />
                    <Label>{t('common.protected')}</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={newFieldOtp}
                      onCheckedChange={(checked) => {
                        setNewFieldOtp(checked as boolean);
                        if (checked) {
                          setNewFieldProtected(false);
                        }
                      }}
                      disabled={newFieldProtected}
                    />
                    <Label>{t('common.otp')}</Label>
                  </div>
                </div>
                {error && (
                  <p className="text-sm text-danger-500">{error}</p>
                )}
                <Button variant="primary" onClick={handleAddField}>
                  {t('common.add')}
                </Button>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-light-5 dark:shadow-dark-5 overflow-hidden">
              <div className="p-6 border-b border-light-200 dark:border-dark-600 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-light-900 dark:text-light-100">
                  {t('common.fields')} ({fields.length})
                </h2>
                {fields.some(f => f.isProtected) && (
                  <button
                    onClick={() => setShowProtectedValues(!showProtectedValues)}
                    className="text-sm text-brand-main hover:text-brand-darker transition-colors"
                  >
                    {showProtectedValues ? t('common.hide') : t('common.show')} {t('common.protected')}
                  </button>
                )}
              </div>
              {fields.length === 0 ? (
                <div className="p-8 text-center">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-light-300 dark:text-dark-500">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <p className="mt-4 text-light-500 dark:text-dark-400">{t('common.noFields')}</p>
                </div>
              ) : (
                <div className="divide-y divide-light-100 dark:divide-dark-700">
                  {fields.map((field) => (
                    <div key={field.key} className="flex items-center gap-4 px-6 py-4 hover:bg-light-50 dark:hover:bg-dark-700">
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-light-100 dark:bg-dark-700 rounded-lg">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-light-500">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="block text-xs font-medium text-light-500 dark:text-dark-400 uppercase tracking-wider">
                          {field.key}
                        </label>
                        <input
                          type={field.isProtected && !showProtectedValues ? 'password' : 'text'}
                          value={field.value}
                          onChange={(e) => handleUpdateField(field.key, e.target.value)}
                          className="w-full text-sm text-light-900 dark:text-light-100 bg-transparent border-none focus:outline-none focus:ring-0"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleProtected(field.key)}
                          className={`p-2 transition-colors ${field.isProtected ? 'text-warning-500 hover:text-warning-600' : 'text-light-400 hover:text-warning-500'}`}
                          title={t('common.protected')}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleRemoveField(field.key)}
                          className="p-2 text-light-400 hover:text-danger-500 transition-colors"
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
              )}
            </div>

            {editOtpUrl && (
              <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-light-5 dark:shadow-dark-5 overflow-hidden mb-6">
                <div className="p-6 border-b border-light-200 dark:border-dark-600 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-light-900 dark:text-light-100">
                    {t('common.otp')}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setEditOtpUrl('')}
                    className="p-2 text-light-400 hover:text-danger-500 transition-colors"
                    title={t('common.delete')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-success-100 dark:bg-success-900/30 rounded-lg">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success-600 dark:text-success-400">
                        <path d="M20 3H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4m8 0h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
                        <path d="M15 10l4 4-4 4" />
                        <path d="M9 18H9.01" />
                      </svg>
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label>{t('common.otpUrl')}</Label>
                      <Input
                        type="text"
                        value={editOtpUrl}
                        onChange={(value) => setEditOtpUrl(String(value))}
                        placeholder="otpauth://totp/..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}