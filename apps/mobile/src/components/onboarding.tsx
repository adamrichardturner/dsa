import { useState } from "react";
import { Modal, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { ApiError, request } from "@/api/client";
import { COMPLETE_ONBOARDING, SET_AUDIT_MODE } from "@/api/operations";
import { readUser, useSession } from "@/auth/session";
import { useTheme } from "@/theme/theme";
import { Body, Button, Notice, Title } from "@/ui/primitives";

const steps: readonly { readonly title: string; readonly paragraphs: readonly string[] }[] = [
  {
    title: "A path of short lessons",
    paragraphs: [
      "Each lesson is a short reading, a diagram, and one to four exercises. You fill the gaps in a TypeScript function, then submit.",
      "A pass marks that exercise complete. When every exercise in the lesson passes, the next lesson opens.",
    ],
  },
  {
    title: "When an attempt does not pass",
    paragraphs: [
      "After two submissions that miss, a prompt offers the written solution. Read it, then close it and place the snippets yourself.",
      "You can also skip the lesson. A skip opens the next one and is not a pass.",
    ],
  },
  {
    title: "Follow the path, or open any lesson",
    paragraphs: [
      "Audit mode lets you open any lesson without finishing the ones before it. Leave it off to work in order.",
      "You can change this later in settings. Progress stays on the account you use on the web.",
    ],
  },
];

export function Onboarding() {
  const { user, token, updateUser } = useSession();
  const { colors } = useTheme();
  const [index, setIndex] = useState(0);
  const [audit, setAudit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const step = steps[index];

  if (user === null || token === null || user.onboardingCompleted || step === undefined) {
    return null;
  }

  const last = index === steps.length - 1;

  const finish = async () => {
    setPending(true);
    setError(null);
    try {
      if (audit) {
        const saved = await request<{ setAuditMode: unknown }>(SET_AUDIT_MODE, { enabled: true }, token);
        const next = readUser(saved.setAuditMode);
        if (next !== null) {
          updateUser(next);
        }
      }
      const completed = await request<{ completeOnboarding: unknown }>(COMPLETE_ONBOARDING, null, token);
      const next = readUser(completed.completeOnboarding);
      if (next !== null) {
        updateUser(next);
      }
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not save that choice.");
    }
    setPending(false);
  };

  return (
    <Modal animationType="fade" transparent visible>
      <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
        <View style={[styles.card, { backgroundColor: colors.background }]}>
          <Title>{step.title}</Title>
          {step.paragraphs.map((paragraph) => (
            <Body key={paragraph}>{paragraph}</Body>
          ))}
          {last ? (
            <View style={styles.audit}>
              <Text style={[styles.auditLabel, { color: colors.foreground }]}>Audit mode</Text>
              <Switch
                onValueChange={setAudit}
                thumbColor={colors.primaryForeground}
                trackColor={{ false: colors.border, true: colors.primary }}
                value={audit}
              />
            </View>
          ) : null}
          {error === null ? null : <Notice>{error}</Notice>}
          <View style={styles.actions}>
            {index === 0 ? null : (
              <Pressable accessibilityRole="button" onPress={() => setIndex((current) => current - 1)}>
                <Text style={[styles.back, { color: colors.mutedForeground }]}>Back</Text>
              </Pressable>
            )}
            <Button
              label={last ? "Start the course" : "Continue"}
              onPress={() => {
                if (!last) {
                  setIndex((current) => current + 1);
                  return;
                }
                void finish();
              }}
              pending={pending}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    borderRadius: 20,
    gap: 14,
    padding: 20,
    width: "100%",
  },
  audit: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  auditLabel: {
    fontFamily: "Geist_500Medium",
    fontSize: 16,
  },
  actions: {
    gap: 12,
  },
  back: {
    fontFamily: "Geist_500Medium",
    fontSize: 15,
  },
});
