import { router } from "expo-router";
import { useRef, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { ApiError, request } from "@/api/client";
import { DELETE_ACCOUNT } from "@/api/operations";
import { useSession } from "@/auth/session";
import { useTheme } from "@/theme/theme";
import { Body, Button, Field } from "@/ui/primitives";

const warning =
  "This permanently deletes your account and everything stored with it: your profile, sign-in methods, sessions, course progress, submissions, drafts, and notifications. That includes data from this app and the website. There is no way to restore it.";

const emailsMatch = (typed: string, accountEmail: string): boolean => {
  const confirmation = typed.trim().toLowerCase();
  if (confirmation.length === 0) {
    return false;
  }
  return confirmation === accountEmail.trim().toLowerCase();
};

export function DeleteAccount() {
  const { user, token, signOut } = useSession();
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const lock = useRef(false);

  if (user === null) {
    return null;
  }

  const canDelete = user.hasPassword ? password.length > 0 : emailsMatch(confirmation, user.email);

  const close = () => {
    if (pending || lock.current) {
      return;
    }
    setOpen(false);
    setPassword("");
    setConfirmation("");
    setError(null);
  };

  const fail = (message: string) => {
    setError(message);
    setPending(false);
    lock.current = false;
  };

  const remove = async () => {
    if (lock.current) {
      return;
    }
    if (token === null) {
      setError("Sign in to continue.");
      return;
    }
    if (!canDelete) {
      return;
    }
    lock.current = true;
    setPending(true);
    setError(null);
    const variables = user.hasPassword
      ? { password, confirmation: null }
      : { password: null, confirmation: confirmation.trim() };
    try {
      const data = await request<{ deleteAccount: boolean }>(DELETE_ACCOUNT, variables, token);
      if (data.deleteAccount !== true) {
        fail("Could not delete the account.");
        return;
      }
    } catch (caught) {
      const message = caught instanceof ApiError ? caught.message : "Could not delete the account.";
      fail(message);
      return;
    }
    await signOut().catch(() => undefined);
    router.replace("/sign-in");
  };

  return (
    <>
      <Button label="Delete account" onPress={() => setOpen(true)} variant="destructive" />
      <Modal animationType="fade" onRequestClose={close} transparent visible={open}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={[styles.backdrop, { backgroundColor: colors.overlay }]}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View
              accessibilityViewIsModal
              style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}
            >
              <View style={[styles.alert, { backgroundColor: colors.secondary, borderColor: colors.destructive }]}>
                <Text style={[styles.alertTitle, { color: colors.destructive }]}>This cannot be undone</Text>
                <Body>{warning}</Body>
              </View>
              {user.hasPassword ? (
                <Field
                  autoCapitalize="none"
                  label="Enter your password to confirm"
                  onChangeText={(value) => {
                    setPassword(value);
                    setError(null);
                  }}
                  secure
                  value={password}
                />
              ) : (
                <Field
                  autoCapitalize="none"
                  keyboard="email-address"
                  label="Type your email address to confirm"
                  onChangeText={(value) => {
                    setConfirmation(value);
                    setError(null);
                  }}
                  placeholder={user.email}
                  value={confirmation}
                />
              )}
              {error === null ? null : <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>}
              <View style={styles.actions}>
                <Button
                  disabled={!canDelete}
                  label="Delete account"
                  onPress={() => void remove()}
                  pending={pending}
                  variant="destructive"
                />
                <Button disabled={pending} label="Cancel" onPress={close} variant="secondary" />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
    padding: 20,
  },
  alert: {
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    padding: 14,
  },
  alertTitle: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 22,
  },
  error: {
    fontFamily: "Geist_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    gap: 10,
  },
});
