export interface Palette {
  readonly background: string;
  readonly foreground: string;
  readonly card: string;
  readonly primary: string;
  readonly primaryForeground: string;
  readonly secondary: string;
  readonly muted: string;
  readonly mutedForeground: string;
  readonly border: string;
  readonly destructive: string;
  readonly success: string;
  readonly code: string;
  readonly overlay: string;
}

export const lightPalette: Palette = {
  background: "#ffffff",
  foreground: "#0a0a0a",
  card: "#ffffff",
  primary: "#171717",
  primaryForeground: "#fafafa",
  secondary: "#f5f5f5",
  muted: "#f5f5f5",
  mutedForeground: "#737373",
  border: "#e5e5e5",
  destructive: "#dc2626",
  success: "#15803d",
  code: "#fafafa",
  overlay: "rgba(10, 10, 10, 0.4)",
};

export const darkPalette: Palette = {
  background: "#0a0a0a",
  foreground: "#fafafa",
  card: "#171717",
  primary: "#e5e5e5",
  primaryForeground: "#171717",
  secondary: "#262626",
  muted: "#262626",
  mutedForeground: "#a1a1a1",
  border: "rgba(255, 255, 255, 0.12)",
  destructive: "#f87171",
  success: "#4ade80",
  code: "#141414",
  overlay: "rgba(0, 0, 0, 0.62)",
};

export type ThemePreference = "system" | "light" | "dark";
export type ColorScheme = "light" | "dark";

export const themeStorageKey = "dsa.theme";
