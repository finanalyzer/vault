import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface BreadcrumbItem {
  id: string;
  name: string;
}

interface NavigationContextType {
  currentGroupId: string;
  breadcrumbs: BreadcrumbItem[];
  setCurrentGroup: (groupId: string, breadcrumbs?: BreadcrumbItem[]) => void;
  resetToRoot: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentGroupId, setCurrentGroupId] = useState('root');
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ id: 'root', name: 'Root' }]);

  const setCurrentGroup = useCallback((groupId: string, newBreadcrumbs?: BreadcrumbItem[]) => {
    setCurrentGroupId(groupId);
    if (newBreadcrumbs) {
      setBreadcrumbs(newBreadcrumbs);
    } else if (groupId === 'root') {
      setBreadcrumbs([{ id: 'root', name: 'Root' }]);
    } else {
      setBreadcrumbs([{ id: 'root', name: 'Root' }, { id: groupId, name: groupId }]);
    }
  }, []);

  const resetToRoot = useCallback(() => {
    setCurrentGroupId('root');
    setBreadcrumbs([{ id: 'root', name: 'Root' }]);
  }, []);

  return (
    <NavigationContext.Provider
      value={{
        currentGroupId,
        breadcrumbs,
        setCurrentGroup,
        resetToRoot,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}