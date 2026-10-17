"use client";

import { PageSkeleton } from "@/components/page-skeleton";
import { ProfileSettings } from "@/components/profile-settings";
import { useRequireUser } from "@/lib/auth";

export default function SettingsPage() {
  const auth = useRequireUser();

  if (auth.user === null) {
    return <PageSkeleton />;
  }

  return (
    <ProfileSettings user={auth.user} updateUser={auth.updateUser} signOut={auth.signOut} />
  );
}
