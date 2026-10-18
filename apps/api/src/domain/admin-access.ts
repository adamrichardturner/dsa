import { normalizeEmail } from "./oauth-plan.js";

export const adminEmail = "hello@adamrichardturner.dev";

export const isAdminEmail = (email: string): boolean => normalizeEmail(email) === adminEmail;

/** The admin account is the only one that can open this panel, so it stays. */
export const adminDeleteBlock = (email: string): string | null => {
  if (isAdminEmail(email)) {
    return "The admin account cannot be deleted from here.";
  }
  return null;
};
