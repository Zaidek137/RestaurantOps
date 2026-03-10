import clsx from "clsx";
import type { PropsWithChildren } from "react";

interface PanelProps extends PropsWithChildren {
  className?: string;
  title?: string;
  subtitle?: string;
}

export const Panel = ({ children, className, title, subtitle }: PanelProps) => (
  <section className={clsx("panel", className)}>
    {(title || subtitle) && (
      <header className="panel__header">
        {title ? <h3>{title}</h3> : null}
        {subtitle ? <p>{subtitle}</p> : null}
      </header>
    )}
    {children}
  </section>
);
