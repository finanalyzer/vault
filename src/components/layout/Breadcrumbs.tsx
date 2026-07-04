import { useNavigate } from '@tanstack/react-router';

interface BreadcrumbItem {
  id: string;
  name: string;
}

interface BreadcrumbsProps {
  groupId: string;
  groupName: string;
  rootGroupName: string;
  parentGroup?: BreadcrumbItem;
}

export default function Breadcrumbs({ groupId, groupName, rootGroupName, parentGroup }: BreadcrumbsProps) {
  const navigate = useNavigate();

  const breadcrumbs: BreadcrumbItem[] = groupId === 'root'
    ? [{ id: 'root', name: groupName }]
    : parentGroup && parentGroup.id !== 'root' && parentGroup.id !== groupId
    ? [
        { id: 'root', name: rootGroupName },
        parentGroup,
        { id: groupId, name: groupName },
      ]
    : [
        { id: 'root', name: rootGroupName },
        { id: groupId, name: groupName },
      ];

  return (
    <nav className="flex items-center gap-1 mt-1 overflow-x-auto whitespace-nowrap">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.id} className="flex items-center">
          {index > 0 && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-light-400 dark:text-dark-500 mx-1 flex-shrink-0">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          )}
          <button
            onClick={() => navigate({ to: `/vault/groups/${crumb.id}` })}
            className={`text-sm flex-shrink-0 transition-colors ${
              index === breadcrumbs.length - 1
                ? 'text-light-500 dark:text-dark-400 font-medium'
                : 'text-brand-main hover:text-brand-darker'
            }`}
          >
            {crumb.name}
          </button>
        </div>
      ))}
    </nav>
  );
}