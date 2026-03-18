import React from "react";
import { Link } from "react-router-dom";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  subtitle?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  breadcrumbs,
  actions,
  subtitle,
  className = "",
}) => {
  return (
    <div className={`sticky top-0 z-10 bg-background-canvas px-6 pt-6 pb-4 ${className}`}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 mb-2 text-[13px] font-normal leading-[18px]">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="text-foreground-disabled mx-1">/</span>}
              {crumb.href ? (
                <Link
                  to={crumb.href}
                  className="text-foreground-tertiary hover:text-foreground-secondary transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground-primary">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-[24px] font-bold leading-[32px] text-foreground-primary">
            {title}
          </h1>
          {subtitle}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
};
