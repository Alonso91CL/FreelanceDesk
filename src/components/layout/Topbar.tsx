interface Breadcrumb {
  label: string;
  href?: string;
}

interface TopbarProps {
  breadcrumbs: Breadcrumb[];
  children?: React.ReactNode;
}

export default function Topbar({ breadcrumbs, children }: TopbarProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gray-800">
      <nav className="flex items-center gap-2 text-sm text-gray-400" aria-label="Breadcrumb">
        {breadcrumbs.map((crumb, idx) => (
          <span key={idx} className="flex items-center gap-2">
            {idx > 0 && <span className="text-gray-600">/</span>}
            {crumb.href ? (
              <a href={crumb.href} className="hover:text-white transition-colors">
                {crumb.label}
              </a>
            ) : (
              <span className="text-white font-medium">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </header>
  );
}
