import { useNavigate } from '@tanstack/react-router';

interface BreadcrumbsProps {
  groupId: string;
}

export default function Breadcrumbs({ groupId }: BreadcrumbsProps) {
  const navigate = useNavigate();

  const breadcrumbs = groupId === 'root' 
    ? [{ id: 'root', name: 'Root' }]
    : [
        { id: 'root', name: 'Root' },
        { id: groupId, name: groupId },
      ];

  return (
    <nav className="flex items-center gap-1 mt-1">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.id} className="flex items-center">
          {index > 0 && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-light-400 dark:text-dark-500 mx-1">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          )}
          <button
            onClick={() => navigate({ to: `/vault/groups/${crumb.id}` })}
            className={`text-sm ${
              index === breadcrumbs.length - 1
                ? 'text-light-500 dark:text-dark-400'
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