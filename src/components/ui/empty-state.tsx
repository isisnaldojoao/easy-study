import * as React from "react";

import { cn } from "@/lib/utils";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

function EmptyState({
  title,
  description,
  action,
  icon,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex w-full max-w-full min-w-0 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)] px-3 py-8 text-center sm:px-6 sm:py-12",
        className
      )}
      {...props}
    >
      {icon ? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--muted)] text-[var(--muted-foreground)]">
          {icon}
        </div>
      ) : null}
      <h3 className="text-base font-semibold text-[var(--foreground)]">
        {title}
      </h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm text-[var(--muted-foreground)]">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export { EmptyState };
