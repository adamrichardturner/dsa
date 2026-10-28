import assert from "node:assert/strict";
import test from "node:test";
import { themeBootScript } from "./theme.ts";

interface BootDocument {
  readonly classes: Set<string>;
}

const installBoot = (
  search: string,
  stored: string | null,
  systemDark: boolean,
): BootDocument => {
  const classes = new Set<string>();
  const documentMock = {
    documentElement: {
      classList: {
        toggle(name: string, force: boolean) {
          if (force) {
            classes.add(name);
            return;
          }
          classes.delete(name);
        },
        add(name: string) {
          classes.add(name);
        },
      },
    },
    querySelectorAll() {
      return [];
    },
  };
  Reflect.set(globalThis, "document", documentMock);
  Reflect.set(globalThis, "location", { search });
  Reflect.set(globalThis, "localStorage", {
    getItem() {
      return stored;
    },
  });
  Reflect.set(globalThis, "matchMedia", () => ({ matches: systemDark }));
  const run = new Function(themeBootScript);
  run();
  return { classes };
};

test("an explicit color scheme overrides the saved theme and the system theme", () => {
  const dark = installBoot("?colorScheme=dark", "light", false);
  assert.equal(dark.classes.has("dark"), true);

  const light = installBoot("?colorScheme=light", "dark", true);
  assert.equal(light.classes.has("dark"), false);
});

test("without an explicit color scheme the saved theme still wins", () => {
  const savedDark = installBoot("", "dark", false);
  assert.equal(savedDark.classes.has("dark"), true);

  const savedLight = installBoot("?from=lesson", "light", true);
  assert.equal(savedLight.classes.has("dark"), false);
});

test("without a saved theme the system color scheme is used", () => {
  const systemDark = installBoot("", null, true);
  assert.equal(systemDark.classes.has("dark"), true);

  const systemLight = installBoot("", null, false);
  assert.equal(systemLight.classes.has("dark"), false);
});
