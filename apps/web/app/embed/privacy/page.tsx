import type { Metadata } from "next";
import PrivacyPage from "../../privacy/page";

export const metadata: Metadata = {
  title: "Privacy",
  robots: { index: false, follow: false },
};

export default function EmbedPrivacyPage() {
  return <PrivacyPage />;
}
