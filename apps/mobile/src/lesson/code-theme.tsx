import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useTheme } from "@/theme/theme";

export type CodeThemeId = "monokai" | "light";

export interface CodePalette {
  readonly id: CodeThemeId;
  readonly label: string;
  readonly background: string;
  readonly header: string;
  readonly foreground: string;
  readonly muted: string;
  readonly border: string;
  readonly gapBackground: string;
  readonly gapBorder: string;
  readonly gapActive: string;
  readonly success: string;
  readonly successFill: string;
  readonly danger: string;
  readonly dangerFill: string;
  readonly menu: string;
}

export const monokaiPalette: CodePalette = {
  id: "monokai",
  label: "Dark mode",
  background: "#272822",
  header: "#1E1F1C",
  foreground: "#F8F8F2",
  muted: "#75715E",
  border: "#3E3D32",
  gapBackground: "#3E3D32",
  gapBorder: "#75715E",
  gapActive: "#66D9EF",
  success: "#A6E22E",
  successFill: "rgba(166, 226, 46, 0.16)",
  danger: "#F92672",
  dangerFill: "rgba(249, 38, 114, 0.16)",
  menu: "#3E3D32",
};

export const lightCodePalette: CodePalette = {
  id: "light",
  label: "Light mode",
  background: "#FFFFFF",
  header: "#F3F3F3",
  foreground: "#000000",
  muted: "#6A6A6A",
  border: "#E5E5E5",
  gapBackground: "#F3F3F3",
  gapBorder: "#C8C8C8",
  gapActive: "#0000FF",
  success: "#107C10",
  successFill: "rgba(16, 124, 16, 0.12)",
  danger: "#E51400",
  dangerFill: "rgba(229, 20, 0, 0.12)",
  menu: "#FFFFFF",
};

const storageKey = "dsa.code-theme";

interface CodeThemeValue {
  readonly themeId: CodeThemeId;
  readonly palette: CodePalette;
  readonly setThemeId: (themeId: CodeThemeId) => void;
}

const CodeThemeContext = createContext<CodeThemeValue | null>(null);

const isThemeId = (value: string | null): value is CodeThemeId => {
  return value === "monokai" || value === "light";
};

const paletteFor = (themeId: CodeThemeId): CodePalette => {
  if (themeId === "monokai") {
    return monokaiPalette;
  }
  return lightCodePalette;
};

export function CodeThemeProvider({ children }: { readonly children: ReactNode }) {
  const { scheme } = useTheme();
  const [stored, setStored] = useState<CodeThemeId | null>(null);

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(storageKey).then((value) => {
      if (!active || !isThemeId(value)) {
        return;
      }
      setStored(value);
    });
    return () => {
      active = false;
    };
  }, []);

  const setThemeId = useCallback((next: CodeThemeId) => {
    setStored(next);
    void AsyncStorage.setItem(storageKey, next);
  }, []);

  const themeId: CodeThemeId = stored ?? (scheme === "dark" ? "monokai" : "light");
  const palette = paletteFor(themeId);
  const value = useMemo<CodeThemeValue>(
    () => ({
      themeId,
      palette,
      setThemeId,
    }),
    [palette, setThemeId, themeId],
  );

  return <CodeThemeContext.Provider value={value}>{children}</CodeThemeContext.Provider>;
}

export const useCodeTheme = (): CodeThemeValue => {
  const value = useContext(CodeThemeContext);
  if (value === null) {
    throw new Error("CodeThemeProvider is missing.");
  }
  return value;
};
