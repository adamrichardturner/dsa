"use client";

import { PageSpinner } from "@/components/page-spinner";
import { ProfileSettings } from "@/components/profile-settings";
import { VerifyEmailScreen } from "@/components/verify-email-hold";
import { useRequireUser } from "@/lib/auth";
import { courseAccessOpen } from "@/lib/verification";

export default function SettingsPage() {
  const auth = useRequireUser();

  if (auth.user === null) {
    return <PageSpinner />;
  }

  if (!courseAccessOpen(auth.user)) {
    return <VerifyEmailScreen email={auth.user.email} />;
  }

  return <ProfileSettings user={auth.user} updateUser={auth.updateUser} signOut={auth.signOut} />;
}
