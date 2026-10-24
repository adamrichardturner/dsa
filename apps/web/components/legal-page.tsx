import Link from "next/link";
import type { ReactNode } from "react";

export interface LegalContentsItem {
  readonly id: string;
  readonly label: string;
}

export function LegalPage({
  kicker,
  title,
  updated,
  lede,
  contents,
  children,
}: {
  readonly kicker: string;
  readonly title: string;
  readonly updated: string;
  readonly lede: ReactNode;
  readonly contents: readonly LegalContentsItem[];
  readonly children: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <p className="text-sm text-muted-foreground">{kicker}</p>
      <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">{title}</h1>
      <p className="mt-6 text-sm text-muted-foreground">Updated {updated}</p>
      <div className="mt-8 space-y-4 text-base leading-relaxed text-muted-foreground">{lede}</div>
      <nav className="mt-10" aria-label="On this page">
        <ol className="grid gap-2 text-sm sm:grid-cols-2">
          {contents.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} className="text-foreground underline-offset-4 hover:underline">
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <div className="mt-12 space-y-12">{children}</div>
    </main>
  );
}

export function LegalSection({
  id,
  title,
  children,
}: {
  readonly id: string;
  readonly title: string;
  readonly children: ReactNode;
}) {
  return (
    <section className="space-y-4 text-sm leading-relaxed text-muted-foreground" aria-labelledby={id}>
      <h2
        id={id}
        className="font-serif text-2xl tracking-tight text-foreground max-md:scroll-mt-20"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

export function LegalSubheading({ children }: { readonly children: ReactNode }) {
  return <h3 className="pt-2 font-serif text-xl text-foreground">{children}</h3>;
}

export function LegalList({ children }: { readonly children: ReactNode }) {
  return <ul className="list-disc space-y-2 pl-5">{children}</ul>;
}

export function LegalCode({ children }: { readonly children: ReactNode }) {
  return (
    <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em] text-foreground">
      {children}
    </code>
  );
}

export function LegalLink({
  href,
  children,
}: {
  readonly href: string;
  readonly children: ReactNode;
}) {
  const className = "text-foreground underline underline-offset-4";
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  const external = href.startsWith("http");
  return (
    <a href={href} className={className} rel={external ? "noreferrer" : undefined}>
      {children}
    </a>
  );
}
