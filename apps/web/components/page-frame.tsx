import type { ReactNode } from "react";
import { cn } from "cn";

export const pageFrameClassName = "mx-auto max-w-6xl px-6";

export function PageMain({
  children,
  className,
}: {
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return <main className={cn(pageFrameClassName, className)}>{children}</main>;
}

export function FormFrame({ children }: { readonly children: ReactNode }) {
  return (
    <PageMain className="flex min-h-[calc(100vh-3.5rem)] items-center py-16">
      <div className="mx-auto w-full max-w-md">{children}</div>
    </PageMain>
  );
}
