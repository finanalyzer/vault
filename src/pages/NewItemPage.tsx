import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Label, Textarea } from '@openbb/ui';
import { createEntry, createGroup, getGroup } from '../services/vaultService';
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
  const [groupName, setGroupName] = useState<string>(groupId || '');
  const [rootGroupName, setRootGroupName] = useState<string>('Root');
  const [parentGroup, setParentGroup] = useState<{ id: string; name: string } | undefined>();

  useEffect(() => {
    loadGroupNames();
  }, [groupId]);

  const loadGroupNames = async () => {
    setParentGroup(undefined);
    try {
      const group = await getGroup(groupId!);
      const rootGroup = await getGroup('root');
      
      setGroupName(group.name);
      setRootGroupName(rootGroup.name);
      
      if (groupId !== 'root' && group.parentId && group.parentId !== 'root') {
        const parent = await getGroup(group.parentId);
        setParentGroup({ id: parent.id, name: parent.name });
      } else {
        setParentGroup(undefined);
      }
    } catch {
      setGroupName(groupId || '');
      setRootGroupName('Root');
      setParentGroup(undefined);
    }
  };

  const {
    handleSubmit,
    formState: { errors },
    control,
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
        <header className="bg-white dark:bg-dark-800 border-b border-light-200 dark:border-dark-600 px-6 lg:px-6 py-4 pl-20 lg:pl-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-light-900 dark:text-light-100">
                {t('common.add')}
              </h1>
              <Breadcrumbs groupId={groupId!} groupName={groupName} rootGroupName={rootGroupName} parentGroup={parentGroup} />
            </div>
            <Button variant="secondary" onClick={() => navigate({ to: `/vault/groups/${groupId}` })}>
              {t('common.cancel')}
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-light-5 dark:shadow-dark-5 overflow-hidden">
              <div className="p-6 border-b border-light-200 dark:border-dark-600">
                <div className="flex gap-4">
                  <Button
                    onClick={() => setItemType('group')}
                    variant={itemType === 'group' ? 'primary' : 'secondary'}
                    className="flex-1"
                  >
                    {t('common.group')}
                  </Button>
                  <Button
                    onClick={() => setItemType('entry')}
                    variant={itemType === 'entry' ? 'primary' : 'secondary'}
                    className="flex-1"
                  >
                    {t('common.entry')}
                  </Button>
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

                <div className="space-y-2">
                <Label>{t('common.name')}</Label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="text"
                      placeholder={t('common.name')}
                      disabled={isLoading}
                      error={!!errors.name}
                      message={errors.name?.message ? t(errors.name.message as string) : undefined}
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                    />
                  )}
                />
              </div>

                {itemType === 'entry' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t('login.username')}</Label>
                        <Controller
                          name="username"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="text"
                              placeholder="username"
                              disabled={isLoading}
                              value={field.value}
                              onChange={(value) => field.onChange(value)}
                            />
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('login.masterPassword')}</Label>
                        <Controller
                          name="password"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="password"
                              placeholder="••••••••"
                              disabled={isLoading}
                              revealable
                              value={field.value}
                              onChange={(value) => field.onChange(value)}
                            />
                          )}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t('login.email')}</Label>
                        <Controller
                          name="email"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="email"
                              placeholder="email@example.com"
                              disabled={isLoading}
                              error={!!(errors as any).email}
                              message={(errors as any).email?.message ? t((errors as any).email.message as string) : undefined}
                              value={field.value}
                              onChange={(value) => field.onChange(value)}
                            />
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('login.mobile')}</Label>
                        <Controller
                          name="mobile"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="tel"
                              placeholder="+1 234 567 8900"
                              disabled={isLoading}
                              value={field.value}
                              onChange={(value) => field.onChange(value)}
                            />
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>{t('login.url')}</Label>
                      <Controller
                        name="url"
                        control={control}
                        render={({ field }) => (
                          <Input
                            type="url"
                            placeholder="https://example.com"
                            disabled={isLoading}
                            value={field.value}
                            onChange={(value) => field.onChange(value)}
                          />
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{t('common.notes')}</Label>
                      <Controller
                        name="notes"
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            rows={4}
                            placeholder="Add notes..."
                            disabled={isLoading}
                            value={field.value}
                            onChange={(value) => field.onChange(value)}
                          />
                        )}
                      />
                    </div>
                  </>
                )}

                {error && (
                  <div className="p-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg">
                    <p className="text-sm text-danger-600 dark:text-danger-400">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? t('common.loading') : t('common.save')}
                </Button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}