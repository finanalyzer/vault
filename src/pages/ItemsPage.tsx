import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@openbb/ui';
import { getItemsByGroup, getGroup, deleteEntry, deleteGroup } from '../services/vaultService';
import { getUserProfile } from '../services/authService';
import type { ItemDto } from '../types/vault';
import { ItemSubType } from '../types/vault';
import Sidebar from '../components/layout/Sidebar';
import Breadcrumbs from '../components/layout/Breadcrumbs';

export default function ItemsPage() {
  const params = useParams({ strict: false });
  const groupId = params.groupId || 'root';
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [items, setItems] = useState<ItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [groupName, setGroupName] = useState<string>(groupId);
  const [rootGroupName, setRootGroupName] = useState<string>('Root');
  const [rootGroupId, setRootGroupId] = useState<string>('root');
  const [parentGroup, setParentGroup] = useState<{ id: string; name: string } | undefined>();
  
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: ItemDto } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ItemDto | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadData();
  }, [groupId]);

  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setParentGroup(undefined);
    try {
      const fetchItems = getItemsByGroup(groupId);
      const fetchGroup = getGroup(groupId);
      const fetchRootGroup = getGroup('root');
      
      const [data, group, rootGroup] = await Promise.all([
        fetchItems,
        fetchGroup,
        fetchRootGroup,
      ]);
      setItems(data);

      // Decode the root group name if it's base58-encoded
      let decodedRootName = rootGroup.name;
      if (rootGroup.name.startsWith('pass_')) {
        try {
          const profile = await getUserProfile();
          decodedRootName = profile.username;
        } catch {
          // keep encoded value on failure
        }
      }

      // When viewing the root group itself, groupName should also use the decoded name
      if (group.id === rootGroup.id) {
        setGroupName(decodedRootName);
      } else {
        setGroupName(group.name);
      }

      setRootGroupName(decodedRootName);
      setRootGroupId(rootGroup.id);
      
      if (group.id !== rootGroup.id && group.parentId && group.parentId !== rootGroup.id) {
        const parent = await getGroup(group.parentId);
        setParentGroup({ id: parent.id, name: parent.name });
      } else {
        setParentGroup(undefined);
      }
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemClick = (item: ItemDto) => {
    if (item.isGroup) {
      navigate({ to: '/vault/groups/$groupId', params: { groupId: item.id } });
    } else {
      if (item.type === ItemSubType.Notes) {
        navigate({ to: '/vault/notes/$entryId', params: { entryId: item.id } });
      } else {
        navigate({ to: '/vault/entries/$entryId', params: { entryId: item.id } });
      }
    }
  };

  const handleContextMenu = useCallback((e: React.MouseEvent, item: ItemDto) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({ x: rect.right - 160, y: rect.bottom + 4, item });
  }, []);

  const handleEdit = () => {
    if (!contextMenu) return;
    const { item } = contextMenu;
    if (item.isGroup) {
      navigate({ to: '/vault/groups/$groupId/fields', params: { groupId: item.id } });
    } else {
      navigate({ to: '/vault/entries/$entryId/fields', params: { entryId: item.id } });
    }
    setContextMenu(null);
  };

  const handleDelete = () => {
    if (!contextMenu) return;
    setItemToDelete(contextMenu.item);
    setShowDeleteConfirm(true);
    setContextMenu(null);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      if (itemToDelete.isGroup) {
        await deleteGroup(itemToDelete.id);
      } else {
        await deleteEntry(itemToDelete.id);
      }
      setNotification({ type: 'success', message: t('common.delete') + ' ' + t('common.success') });
      setItems(items.filter(i => i.id !== itemToDelete.id));
      setTimeout(() => setNotification(null), 3000);
    } catch {
      setNotification({ type: 'error', message: t('common.error') });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  };

  const handleChangeIcon = () => {
    if (!contextMenu) return;
    navigate({ to: `/vault/icons?itemId=${contextMenu.item.id}&isGroup=${contextMenu.item.isGroup}` });
    setContextMenu(null);
  };

  const handleNewItem = () => {
    navigate({ to: `/vault/new/${groupId}` });
  };

  const getIconForItem = (item: ItemDto) => {
    if (item.icon) {
      if (item.iconContentType === 'image/svg+xml') {
        const svgContent = atob(item.icon);
        return (
          <div
            dangerouslySetInnerHTML={{ __html: svgContent }}
            className={`w-6 h-6 ${item.isGroup ? 'text-brand-main' : 'text-light-500 dark:text-dark-300'}`}
          />
        );
      } else {
        const src = `data:image/png;base64,${item.icon}`;
        return (
          <img
            src={src}
            alt={item.name}
            className={`w-6 h-6 object-contain ${item.isGroup ? 'text-brand-main' : 'text-light-500'}`}
          />
        );
      }
    }

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

  return (
    <div className="min-h-screen bg-light-100 dark:bg-dark-900 flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-dark-800 border-b border-light-200 dark:border-dark-600 px-6 lg:px-6 py-4 pl-20 lg:pl-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-light-900 dark:text-light-100">
                {groupName}
              </h1>
              <Breadcrumbs groupId={groupId} groupName={groupName} rootGroupName={rootGroupName} rootGroupId={rootGroupId} parentGroup={parentGroup} />
            </div>
            <div className="flex items-center gap-4">
              <Button variant="primary" onClick={handleNewItem}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span className="hidden md:inline">{t('common.add')}</span>
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

          <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-light-5 dark:shadow-dark-5 overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <svg className="animate-spin h-8 w-8 text-brand-main mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-2 text-light-500 dark:text-dark-400">{t('common.loading')}</p>
              </div>
            ) : items.length === 0 ? (
              <div className="p-8 text-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-light-300 dark:text-dark-500">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                <p className="mt-4 text-light-500 dark:text-dark-400">No items found</p>
                <button
                  onClick={handleNewItem}
                  className="mt-4 px-4 py-2 bg-brand-main text-white rounded-lg hover:bg-brand-darker transition-colors"
                >
                  {t('common.add')}
                </button>
              </div>
            ) : (
              <div className="divide-y divide-light-100 dark:divide-dark-700">
                {items.map((item) => (
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
                        {item.description || ''}
                      </p>
                    </div>
                    {item.isGroup && (
                      <span className="text-sm text-light-500 dark:text-dark-400">
                        Group
                      </span>
                    )}
                    <button
                      onClick={(e) => handleContextMenu(e, item)}
                      className="flex-shrink-0 p-2 text-light-400 dark:text-dark-500 hover:text-brand-main hover:bg-light-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                      title={t('common.more')}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="19" cy="12" r="1" />
                        <circle cx="5" cy="12" r="1" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {contextMenu && (
        <div
          className="fixed z-50 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-light-200 dark:border-dark-600 py-1 min-w-[160px]"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleEdit}
            className="w-full text-left px-4 py-2 text-sm text-light-900 dark:text-light-100 hover:bg-light-100 dark:hover:bg-dark-700 flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
            {t('common.edit')}
          </button>
          <button
            onClick={handleChangeIcon}
            className="w-full text-left px-4 py-2 text-sm text-light-900 dark:text-light-100 hover:bg-light-100 dark:hover:bg-dark-700 flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            {t('common.changeIcon')}
          </button>
          <div className="border-t border-light-200 dark:border-dark-600 my-1" />
          <button
            onClick={handleDelete}
            className="w-full text-left px-4 py-2 text-sm text-danger-600 dark:text-danger-400 hover:bg-light-100 dark:hover:bg-dark-700 flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
            {t('common.delete')}
          </button>
        </div>
      )}

      <Dialog open={showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('common.delete')}</DialogTitle>
            <p className="text-light-600 dark:text-light-300">
              {t('common.confirmDelete', { name: itemToDelete?.name })}
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}