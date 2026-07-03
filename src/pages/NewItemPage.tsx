import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createEntry, createGroup } from '../services/vaultService';
import { ItemSubType } from '../types/vault';
import Sidebar from '../components/layout/Sidebar';
import Breadcrumbs from '../components/layout/Breadcrumbs';

const entrySchema = z.object({
  name: z.string().min(1, { message: 'common.error.nameRequired' }),
  username: z.string().optional(),
  password: z.string().optional(),
  url: z.string().optional(),
  email: z.string().email().optional(),
  mobile: z.string().optional(),
  notes: z.string().optional(),
});

const groupSchema = z.object({
  name: z.string().min(1, { message: 'common.error.nameRequired' }),
});

type EntryFormData = z.infer<typeof entrySchema>;
type GroupFormData = z.infer<typeof groupSchema>;

export default function NewItemPage() {
  const params = useParams({ from: '/vault/new/$groupId' });
  const groupId = params.groupId;
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [itemType, setItemType] = useState<'entry' | 'group'>('entry');
  const [entrySubType, setEntrySubType] = useState<ItemSubType>(ItemSubType.Entry);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EntryFormData | GroupFormData>({
    resolver: itemType === 'entry' ? zodResolver(entrySchema) : zodResolver(groupSchema),
    defaultValues: {
      name: '',
      username: '',
      password: '',
      url: '',
      email: '',
      mobile: '',
      notes: '',
    },
  });

  const onSubmit = async (data: EntryFormData | GroupFormData) => {
    setIsLoading(true);
    setError('');

    try {
      if (itemType === 'group') {
        await createGroup(groupId!, { name: (data as GroupFormData).name });
      } else {
        await createEntry(groupId!, {
          type: entrySubType,
          name: (data as EntryFormData).name,
          username: (data as EntryFormData).username,
          password: (data as EntryFormData).password,
          url: (data as EntryFormData).url,
          email: (data as EntryFormData).email,
          mobile: (data as EntryFormData).mobile,
          notes: (data as EntryFormData).notes,
        });
      }
      navigate({ to: `/vault/groups/${groupId}` });
    } catch {
      setError(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const entryTypes = [
    { value: ItemSubType.Entry, label: 'Entry', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="5" x2="16" y2="19" />
        <line x1="8" y1="5" x2="8" y2="19" />
      </svg>
    )},
    { value: ItemSubType.Notes, label: 'Notes', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    )},
    { value: ItemSubType.PxEntry, label: 'PxEntry', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    )},
  ];

  return (
    <div className="min-h-screen bg-light-100 dark:bg-dark-900 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-dark-800 border-b border-light-200 dark:border-dark-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-light-900 dark:text-light-100">
                {t('common.add')}
              </h1>
              <Breadcrumbs groupId={groupId!} />
            </div>
            <button
              onClick={() => navigate({ to: `/vault/groups/${groupId}` })}
              className="px-4 py-2 border border-light-300 dark:border-dark-600 text-light-700 dark:text-light-300 rounded-lg hover:bg-light-50 dark:hover:bg-dark-700 transition-colors"
            >
              {t('common.cancel')}
            </button>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-light-5 dark:shadow-dark-5 overflow-hidden">
              <div className="p-6 border-b border-light-200 dark:border-dark-600">
                <div className="flex gap-4">
                  <button
                    onClick={() => setItemType('group')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                      itemType === 'group'
                        ? 'bg-brand-main text-white'
                        : 'bg-light-100 dark:bg-dark-700 text-light-600 dark:text-light-300 hover:bg-light-200 dark:hover:bg-dark-600'
                    }`}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                    {t('common.group')}
                  </button>
                  <button
                    onClick={() => setItemType('entry')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                      itemType === 'entry'
                        ? 'bg-brand-main text-white'
                        : 'bg-light-100 dark:bg-dark-700 text-light-600 dark:text-light-300 hover:bg-light-200 dark:hover:bg-dark-600'
                    }`}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="5" x2="16" y2="19" />
                      <line x1="8" y1="5" x2="8" y2="19" />
                    </svg>
                    {t('common.entry')}
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                {itemType === 'entry' && (
                  <div>
                    <label className="block text-sm font-medium text-light-850 dark:text-light-100 mb-2">
                      {t('common.type')}
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {entryTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setEntrySubType(type.value)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors ${
                            entrySubType === type.value
                              ? 'border-brand-main bg-brand-main/10 text-brand-main'
                              : 'border-light-200 dark:border-dark-600 text-light-600 dark:text-light-300 hover:border-brand-main'
                          }`}
                        >
                          {type.icon}
                          <span className="text-sm font-medium">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-light-850 dark:text-light-100 mb-2">
                    {t('common.name')}
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    id="name"
                    className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-main ${
                      errors.name
                        ? 'border-danger-500 focus:ring-danger-500'
                        : 'border-light-300 dark:border-dark-400 focus:border-brand-main'
                    } bg-light-50 dark:bg-dark-700 text-light-900 dark:text-light-100`}
                    placeholder={t('common.name')}
                    disabled={isLoading}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-danger-500">{t(errors.name.message as string)}</p>
                  )}
                </div>

                {itemType === 'entry' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="username" className="block text-sm font-medium text-light-850 dark:text-light-100 mb-2">
                          {t('login.username')}
                        </label>
                        <input
                          {...register('username')}
                          type="text"
                          id="username"
                          className="w-full px-4 py-3 border border-light-300 dark:border-dark-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-main focus:border-brand-main bg-light-50 dark:bg-dark-700 text-light-900 dark:text-light-100"
                          placeholder="username"
                          disabled={isLoading}
                        />
                      </div>
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-light-850 dark:text-light-100 mb-2">
                          {t('login.masterPassword')}
                        </label>
                        <input
                          {...register('password')}
                          type="password"
                          id="password"
                          className="w-full px-4 py-3 border border-light-300 dark:border-dark-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-main focus:border-brand-main bg-light-50 dark:bg-dark-700 text-light-900 dark:text-light-100"
                          placeholder="••••••••"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-light-850 dark:text-light-100 mb-2">
                          {t('login.email')}
                        </label>
                        <input
                          {...register('email')}
                          type="email"
                          id="email"
                          className="w-full px-4 py-3 border border-light-300 dark:border-dark-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-main focus:border-brand-main bg-light-50 dark:bg-dark-700 text-light-900 dark:text-light-100"
                          placeholder="email@example.com"
                          disabled={isLoading}
                        />
                        {itemType === 'entry' && (errors as any).email && (
                          <p className="mt-1 text-sm text-danger-500">{t((errors as any).email.message as string)}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="mobile" className="block text-sm font-medium text-light-850 dark:text-light-100 mb-2">
                          {t('login.mobile')}
                        </label>
                        <input
                          {...register('mobile')}
                          type="tel"
                          id="mobile"
                          className="w-full px-4 py-3 border border-light-300 dark:border-dark-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-main focus:border-brand-main bg-light-50 dark:bg-dark-700 text-light-900 dark:text-light-100"
                          placeholder="+1 234 567 8900"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="url" className="block text-sm font-medium text-light-850 dark:text-light-100 mb-2">
                        {t('login.url')}
                      </label>
                      <input
                        {...register('url')}
                        type="url"
                        id="url"
                        className="w-full px-4 py-3 border border-light-300 dark:border-dark-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-main focus:border-brand-main bg-light-50 dark:bg-dark-700 text-light-900 dark:text-light-100"
                        placeholder="https://example.com"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-light-850 dark:text-light-100 mb-2">
                        {t('common.notes')}
                      </label>
                      <textarea
                        {...register('notes')}
                        id="notes"
                        rows={4}
                        className="w-full px-4 py-3 border border-light-300 dark:border-dark-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-main focus:border-brand-main bg-light-50 dark:bg-dark-700 text-light-900 dark:text-light-100 resize-none"
                        placeholder="Add notes..."
                        disabled={isLoading}
                      />
                    </div>
                  </>
                )}

                {error && (
                  <div className="p-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg">
                    <p className="text-sm text-danger-600 dark:text-danger-400">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-main text-white font-medium rounded-lg hover:bg-brand-darker focus:outline-none focus:ring-2 focus:ring-brand-main focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                      {t('common.loading')}
                    </>
                  ) : (
                    t('common.save')
                  )}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}