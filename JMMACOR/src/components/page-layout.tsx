import { ReactNode } from "react";
import { PageContainer } from "./page-container";

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function PageLayout({
  title,
  subtitle,
  actions,
  children,
}: PageLayoutProps) {
  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink dark:text-paper">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-graphite dark:text-graphite mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div>{actions}</div>}
        </div>
        {children}
      </div>
    </PageContainer>
  );
}
