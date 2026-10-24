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
import { useColorScheme } from "react-native";
import {
  darkPalette,
  lightPalette,
  themeStorageKey,
  type ColorScheme,
  type Palette,
  type ThemePreference,
} from "@/theme/palette";

interface ThemeValue {
  readonly preference: ThemePreference;
  readonly scheme: ColorScheme;
  readonly colors: Palette;
  readonly setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeValue | null>(null);

const isPreference = (value: string | null): value is ThemePreference => {
  return value === "system" || value === "light" || value === "dark";
};

export function ThemeProvider({ children }: { readonly children: ReactNode }) {
  const system = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(themeStorageKey).then((stored) => {
      if (!active || !isPreference(stored)) {
        return;
      }
      setPreferenceState(stored);
    });
    return () => {
      active = false;
    };
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    void AsyncStorage.setItem(themeStorageKey, next);
  }, []);

  const scheme: ColorScheme =
    preference === "system" ? (system === "dark" ? "dark" : "light") : preference;

  const value = useMemo<ThemeValue>(
    () => ({
      preference,
      scheme,
      colors: scheme === "dark" ? darkPalette : lightPalette,
      setPreference,
    }),
    [preference, scheme, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = (): ThemeValue => {
  const value = useContext(ThemeContext);
  if (value === null) {
    throw new Error("ThemeProvider is missing.");
  }
  return value;
};
