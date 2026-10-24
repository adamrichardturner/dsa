"use client";

import Link from "next/link";
import { createContext, useContext, type ReactNode } from "react";
import { toEmbedHref } from "@/lib/embed";

const EmbedLinkContext = createContext(false);

export function EmbedLinkProvider({ children }: { readonly children: ReactNode }) {
  return <EmbedLinkContext.Provider value={true}>{children}</EmbedLinkContext.Provider>;
}

export const useEmbedLinks = (): boolean => {
  return useContext(EmbedLinkContext);
};

export function SiteLink({
  children,
  className,
  href,
}: {
  readonly children: ReactNode;
  readonly className: string;
  readonly href: string;
}) {
  const embed = useEmbedLinks();
  const next = embed ? toEmbedHref(href) : href;
  if (next.startsWith("/")) {
    return (
      <Link className={className} href={next}>
        {children}
      </Link>
    );
  }
  const external = next.startsWith("http");
  return (
    <a className={className} href={next} rel={external ? "noreferrer" : undefined}>
      {children}
    </a>
  );
}
