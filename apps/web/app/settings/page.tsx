"use client";

import { PageSpinner } from "@/components/page-spinner";
import { ProfileSettings } from "@/components/profile-settings";
import { useRequireUser } from "@/lib/auth";

export default function SettingsPage() {
  const auth = useRequireUser();

  if (auth.user === null) {
    return <PageSpinner />;
  }

  return (
    <ProfileSettings user={auth.user} updateUser={auth.updateUser} signOut={auth.signOut} />
  );
}
