"use client";

import { AdminPanel } from "@/components/admin-panel";
import { PageSpinner } from "@/components/page-spinner";
import { useRequireAdmin } from "@/lib/auth";

export default function AdminPage() {
  const auth = useRequireAdmin();

  if (!auth.ready || !auth.settled || auth.user === null || !auth.user.isAdmin) {
    return <PageSpinner />;
  }

  return <AdminPanel />;
}
