import type { Metadata } from "next";
import TermsPage from "../../terms/page";

export const metadata: Metadata = {
  title: "Terms",
  robots: { index: false, follow: false },
};

export default function EmbedTermsPage() {
  return <TermsPage />;
}
