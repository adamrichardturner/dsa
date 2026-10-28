import assert from "node:assert/strict";
import test from "node:test";
import {
  embedThemeLockScript,
  nextEmbedUrl,
  withEmbedTheme,
} from "./embed-url.ts";

const site = "https://datastructuresandalgorithms.com";

test("article links open in the embed view with the app color scheme", () => {
  const next = nextEmbedUrl(
    `${site}/articles/graphs?from=lesson#walk`,
    site,
    "dark",
  );
  assert.equal(
    next,
    `${site}/embed/articles/graphs?from=lesson&colorScheme=dark#walk`,
  );
});

test("an embed page keeps its address when the color scheme already matches", () => {
  const url = `${site}/embed/articles/graphs?colorScheme=light`;
  assert.equal(withEmbedTheme(url, "light"), url);
  assert.equal(nextEmbedUrl(url, site, "light"), url);
});

test("changing the app color scheme replaces the page color scheme", () => {
  const current = `${site}/embed/privacy?colorScheme=dark#notice`;
  assert.equal(
    withEmbedTheme(current, "light"),
    `${site}/embed/privacy?colorScheme=light#notice`,
  );
});

test("a themed embed address is stable when loaded again", () => {
  const first = nextEmbedUrl(`${site}/terms`, site, "dark");
  assert.equal(first, `${site}/embed/terms?colorScheme=dark`);
  assert.equal(nextEmbedUrl(first ?? "", site, "dark"), first);
});

test("links outside the embed site stay outside", () => {
  assert.equal(nextEmbedUrl("https://example.com/docs", site, "light"), null);
  assert.equal(nextEmbedUrl("mailto:hello@example.com", site, "light"), null);
});

test("blank and invalid addresses are left unchanged", () => {
  assert.equal(nextEmbedUrl("about:blank", site, "dark"), "about:blank");
  assert.equal(withEmbedTheme("not a url", "dark"), "not a url");
});

test("the theme lock records the app color scheme before the page paints", () => {
  const classes = new Set<string>();
  const stored: { theme: string | null } = { theme: null };
  const root = {
    classList: {
      toggle(name: string, force: boolean) {
        if (force) {
          classes.add(name);
          return;
        }
        classes.delete(name);
      },
    },
    style: { colorScheme: "" },
  };
  Reflect.set(globalThis, "document", { documentElement: root });
  Reflect.set(globalThis, "localStorage", {
    setItem(_key: string, value: string) {
      stored.theme = value;
    },
  });

  const script = embedThemeLockScript("light", "dsa.theme");
  const run = new Function(script);
  run();

  assert.equal(stored.theme, "light");
  assert.equal(classes.has("dark"), false);
  assert.equal(root.style.colorScheme, "light");
});
