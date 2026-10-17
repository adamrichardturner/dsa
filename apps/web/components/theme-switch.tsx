"use client";

import { useLayoutEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { themeStorageKey } from "@/lib/theme";

const readDark = (): boolean => {
  return document.documentElement.classList.contains("dark");
};

const applyTheme = (dark: boolean) => {
  const root = document.documentElement;
  root.classList.add("theme-transition");
  root.classList.toggle("dark", dark);
  window.localStorage.setItem(themeStorageKey, dark ? "dark" : "light");
  window.setTimeout(() => {
    root.classList.remove("theme-transition");
  }, 260);
};

export function ThemeSwitch() {
  const [dark, setDark] = useState(false);

  useLayoutEffect(() => {
    setDark(readDark());
  }, []);

  return (
    <div className="flex items-center gap-1.5">
      <Sun className="size-3.5 text-muted-foreground" aria-hidden />
      <Switch
        size="sm"
        checked={dark}
        aria-label="Dark mode"
        onCheckedChange={(checked) => {
          setDark(checked);
          applyTheme(checked);
        }}
      />
      <Moon className="size-3.5 text-muted-foreground" aria-hidden />
    </div>
  );
}
