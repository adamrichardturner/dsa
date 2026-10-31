import { router } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ApiError, request } from "@/api/client";
import { webUrl } from "@/api/config";
import { ContentWebView } from "@/content/content-webview";
import { CHANGE_PASSWORD, SET_AUDIT_MODE, UPDATE_PROFILE } from "@/api/operations";
import { readUser, useSession } from "@/auth/session";
import { badgeLabel, useNotifications } from "@/notifications/centre";
import { useTheme } from "@/theme/theme";
import { UserAvatar } from "@/ui/avatar";
import type { ThemePreference } from "@/theme/palette";
import { Body, Button, Field, Notice, Title } from "@/ui/primitives";

const SUBMIT_COOLDOWN_MS = 2000;
const NAME_MAX_LENGTH = 80;

const preferences: readonly { readonly id: ThemePreference; readonly label: string }[] = [
  { id: "system", label: "System" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];

interface SubmitLock {
  current: boolean;
}

const releaseAfterCooldown = (lock: SubmitLock, setLocked: (locked: boolean) => void) => {
  setTimeout(() => {
    lock.current = false;
    setLocked(false);
  }, SUBMIT_COOLDOWN_MS);
};

const nameIsSaveable = (trimmedName: string, savedName: string): boolean => {
  if (trimmedName.length === 0 || trimmedName.length > NAME_MAX_LENGTH) {
    return false;
  }
  return trimmedName !== savedName.trim();
};

const passwordFieldsReady = (currentPassword: string, nextPassword: string): boolean => {
  return currentPassword.length > 0 && nextPassword.length > 0;
};

export default function SettingsScreen() {
  const { user, token, updateUser, signOut } = useSession();
  const { centre } = useNotifications();
  const { colors, preference, setPreference } = useTheme();
  const badge = badgeLabel(centre?.unreadCount ?? 0);
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(user?.name ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [legal, setLegal] = useState<string | null>(null);
  const [namePending, setNamePending] = useState(false);
  const [passwordPending, setPasswordPending] = useState(false);
  const [nameLocked, setNameLocked] = useState(false);
  const [passwordLocked, setPasswordLocked] = useState(false);
  const nameLock = useRef(false);
  const passwordLock = useRef(false);
  const savedName = user?.name ?? "";
  const nameReady = nameIsSaveable(name.trim(), savedName);
  const passwordReady = passwordFieldsReady(currentPassword, nextPassword);

  if (legal !== null) {
    return (
      <View style={[styles.legal, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <Pressable accessibilityRole="button" onPress={() => setLegal(null)} style={styles.legalBack}>
          <Text style={[styles.back, { color: colors.mutedForeground }]}>Settings</Text>
        </Pressable>
        <ContentWebView uri={legal} />
      </View>
    );
  }

  const saveName = async () => {
    if (nameLock.current) {
      return;
    }
    if (user === null || token === null) {
      return;
    }
    const trimmedName = name.trim();
    if (!nameIsSaveable(trimmedName, user.name)) {
      return;
    }
    nameLock.current = true;
    setNameLocked(true);
    setNamePending(true);
    setError(null);
    setMessage(null);
    try {
      const data = await request<{ updateProfile: unknown }>(
        UPDATE_PROFILE,
        { name: trimmedName, email: user.email, avatarUrl: user.avatarUrl },
        token,
      );
      const next = readUser(data.updateProfile);
      if (next !== null) {
        updateUser(next);
        setName(next.name);
      }
      setMessage("Name saved.");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not save your name.");
    } finally {
      setNamePending(false);
      releaseAfterCooldown(nameLock, setNameLocked);
    }
  };

  const saveAudit = async (enabled: boolean) => {
    if (token === null || user === null) {
      return;
    }
    try {
      const data = await request<{ setAuditMode: unknown }>(SET_AUDIT_MODE, { enabled }, token);
      const next = readUser(data.setAuditMode);
      if (next !== null) {
        updateUser(next);
      }
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not update audit mode.");
    }
  };

  const savePassword = async () => {
    if (passwordLock.current) {
      return;
    }
    if (token === null) {
      return;
    }
    if (!passwordFieldsReady(currentPassword, nextPassword)) {
      return;
    }
    passwordLock.current = true;
    setPasswordLocked(true);
    setPasswordPending(true);
    setError(null);
    setMessage(null);
    try {
      await request(CHANGE_PASSWORD, { currentPassword, nextPassword }, token);
      setCurrentPassword("");
      setNextPassword("");
      setMessage("Password updated.");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not change the password.");
    } finally {
      setPasswordPending(false);
      releaseAfterCooldown(passwordLock, setPasswordLocked);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 32 }]}
      style={{ backgroundColor: colors.background }}
    >
      {user === null ? null : (
        <Pressable
          accessibilityLabel={badge === null ? "Notifications" : `Notifications, ${badge} new`}
          accessibilityRole="button"
          onPress={() => router.navigate("/notifications")}
          style={[styles.identity, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <UserAvatar avatarUrl={user.avatarUrl} name={user.name} size={44} />
          <View style={styles.identityCopy}>
            <Text style={[styles.identityName, { color: colors.foreground }]}>{user.name}</Text>
            <Text style={[styles.identityHint, { color: colors.mutedForeground }]}>Notifications</Text>
          </View>
          {badge === null ? null : (
            <View style={[styles.count, { backgroundColor: colors.foreground }]}>
              <Text style={[styles.countLabel, { color: colors.background }]}>{badge}</Text>
            </View>
          )}
        </Pressable>
      )}
      <Title>Settings</Title>
      <Body muted>{user?.email ?? ""}</Body>
      <Text style={[styles.section, { color: colors.foreground }]}>Appearance</Text>
      <View style={styles.segment}>
        {preferences.map((item) => {
          const selected = preference === item.id;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              onPress={() => setPreference(item.id)}
              style={[
                styles.segmentItem,
                {
                  backgroundColor: selected ? colors.primary : colors.secondary,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={{ color: selected ? colors.primaryForeground : colors.foreground, fontFamily: "Geist_500Medium" }}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.section, { color: colors.foreground }]}>Course</Text>
      <View style={styles.row}>
        <Text style={[styles.rowLabel, { color: colors.foreground }]}>Audit mode</Text>
        <Switch
          onValueChange={(enabled) => void saveAudit(enabled)}
          thumbColor={colors.primaryForeground}
          trackColor={{ false: colors.border, true: colors.primary }}
          value={user?.auditMode ?? false}
        />
      </View>
      <Body muted>Open any lesson without finishing the ones before it.</Body>
      <Field label="Name" onChangeText={setName} value={name} />
      <Button
        disabled={!nameReady || nameLocked}
        label="Save name"
        onPress={() => void saveName()}
        pending={namePending}
        variant="secondary"
      />
      {user?.hasPassword ? (
        <>
          <Text style={[styles.section, { color: colors.foreground }]}>Password</Text>
          <Field label="Current password" onChangeText={setCurrentPassword} secure value={currentPassword} />
          <Field label="New password" onChangeText={setNextPassword} secure value={nextPassword} />
          <Button
            disabled={!passwordReady || passwordLocked}
            label="Update password"
            onPress={() => void savePassword()}
            pending={passwordPending}
            variant="secondary"
          />
        </>
      ) : null}
      {message === null ? null : <Notice>{message}</Notice>}
      {error === null ? null : <Notice>{error}</Notice>}
      <Pressable accessibilityRole="button" onPress={() => setLegal(`${webUrl}/embed/privacy`)}>
        <Text style={[styles.link, { color: colors.foreground }]}>Privacy</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={() => setLegal(`${webUrl}/embed/terms`)}>
        <Text style={[styles.link, { color: colors.foreground }]}>Terms</Text>
      </Pressable>
      <Button
        label="Sign out"
        onPress={() => {
          void signOut().then(() => router.replace("/sign-in"));
        }}
        variant="secondary"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingHorizontal: 24,
  },
  identity: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 12,
  },
  identityCopy: {
    flex: 1,
    gap: 2,
  },
  identityName: {
    fontFamily: "Geist_500Medium",
    fontSize: 16,
  },
  identityHint: {
    fontFamily: "Geist_400Regular",
    fontSize: 14,
  },
  count: {
    alignItems: "center",
    borderRadius: 999,
    minWidth: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  countLabel: {
    fontFamily: "Geist_500Medium",
    fontSize: 12,
  },
  section: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 22,
    marginTop: 8,
  },
  segment: {
    flexDirection: "row",
    gap: 8,
  },
  segmentItem: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rowLabel: {
    fontFamily: "Geist_500Medium",
    fontSize: 16,
  },
  link: {
    fontFamily: "Geist_500Medium",
    fontSize: 16,
    textDecorationLine: "underline",
  },
  legal: {
    flex: 1,
  },
  legalBack: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  back: {
    fontFamily: "Geist_500Medium",
    fontSize: 15,
  },
});
