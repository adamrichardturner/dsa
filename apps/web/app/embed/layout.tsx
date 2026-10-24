import type { Metadata } from "next";
import type { ReactNode } from "react";
import { EmbedLinkProvider } from "@/components/embed-links";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function EmbedLayout({ children }: { readonly children: ReactNode }) {
  return <EmbedLinkProvider>{children}</EmbedLinkProvider>;
}
