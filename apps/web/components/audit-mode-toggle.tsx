"use client";

import { useState } from "react";
import { useMutation } from "urql";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth";
import { graphqlErrorMessage } from "@/lib/graphql-error";
import { SET_AUDIT_MODE } from "@/lib/operations";
import type { User } from "@/lib/types";

export function AuditModeToggle({
  onChanged,
}: {
  readonly onChanged?: () => void;
}) {
  const { user, updateUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [, setAuditMode] = useMutation<{ setAuditMode: User }>(SET_AUDIT_MODE);

  if (user === null) {
    return null;
  }

  const onCheckedChange = async (enabled: boolean) => {
    setPending(true);
    setError(null);
    const response = await setAuditMode({ enabled });
    setPending(false);
    if (response.error !== undefined) {
      setError(
        graphqlErrorMessage(response.error, "Could not update audit mode."),
      );
      return;
    }
    const next = response.data?.setAuditMode;
    if (next === undefined) {
      setError("Could not update audit mode.");
      return;
    }
    updateUser(next);
    onChanged?.();
  };

  return (
    <div className="space-y-1">
      <label className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">Audit mode</span>
        <Switch
          checked={user.auditMode}
          disabled={pending}
          aria-label="Audit mode"
          onCheckedChange={(checked) => {
            void onCheckedChange(checked);
          }}
        />
      </label>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Open any lesson without finishing the ones before it. A skip is still
        not a pass.
      </p>
      {error !== null ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
