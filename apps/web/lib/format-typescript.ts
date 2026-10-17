import type { Plugin } from "prettier";
import { formatWithCursor } from "prettier/standalone";

export interface FormattedTypeScript {
  readonly formatted: string;
  readonly cursorOffset: number;
}

let pluginsPromise: Promise<readonly Plugin[]> | null = null;

const loadPlugins = (): Promise<readonly Plugin[]> => {
  if (pluginsPromise !== null) {
    return pluginsPromise;
  }
  pluginsPromise = Promise.all([
    import("prettier/plugins/estree"),
    import("prettier/plugins/typescript"),
  ])
    .then(([estree, typescript]) => [estree, typescript])
    .catch((error: unknown) => {
      pluginsPromise = null;
      throw error;
    });
  return pluginsPromise;
};

export const formatTypeScript = async (
  source: string,
  cursorOffset: number,
): Promise<FormattedTypeScript> => {
  const plugins = await loadPlugins();
  const result = await formatWithCursor(source, {
    cursorOffset,
    parser: "typescript",
    plugins: [...plugins],
    semi: true,
    singleQuote: false,
    quoteProps: "as-needed",
    tabWidth: 2,
    useTabs: false,
    trailingComma: "all",
    printWidth: 80,
    arrowParens: "always",
    bracketSpacing: true,
  });
  return {
    formatted: result.formatted,
    cursorOffset: result.cursorOffset,
  };
};
