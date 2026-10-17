import type { editor } from "monaco-editor";
import draculaTheme from "../node_modules/monaco-themes/themes/Dracula.json";
import githubDarkTheme from "../node_modules/monaco-themes/themes/GitHub Dark.json";
import monokaiTheme from "../node_modules/monaco-themes/themes/Monokai.json";
import solarizedDarkTheme from "../node_modules/monaco-themes/themes/Solarized-dark.json";

const builtinBases = {
  vs: true,
  "vs-dark": true,
  "hc-black": true,
  "hc-light": true,
} as const;

type BuiltinBase = keyof typeof builtinBases;

type ImportedTheme = {
  readonly base: string;
  readonly inherit: boolean;
  readonly rules: readonly {
    readonly token: string;
    readonly foreground?: string;
    readonly background?: string;
    readonly fontStyle?: string;
  }[];
  readonly colors: object;
};

export type EditorThemeId =
  | "kiln"
  | "dark-plus"
  | "light-plus"
  | "monokai"
  | "dracula"
  | "solarized-dark"
  | "github-dark";

export type EditorTheme = {
  readonly id: EditorThemeId;
  readonly label: string;
  readonly monacoId: string;
  readonly light: boolean;
  readonly background: string;
  readonly foreground: string;
  readonly data: editor.IStandaloneThemeData | null;
};

const isBuiltinBase = (value: string): value is BuiltinBase => {
  return Object.hasOwn(builtinBases, value);
};

const copyColors = (colors: object): editor.IColors => {
  const next: editor.IColors = {};
  for (const [key, value] of Object.entries(colors)) {
    if (typeof value !== "string") {
      continue;
    }
    next[key] = value;
  }
  return next;
};

const toThemeData = (theme: ImportedTheme): editor.IStandaloneThemeData | null => {
  if (!isBuiltinBase(theme.base)) {
    return null;
  }
  const rules: editor.ITokenThemeRule[] = [];
  for (const rule of theme.rules) {
    rules.push({
      token: rule.token,
      foreground: rule.foreground,
      background: rule.background,
      fontStyle: rule.fontStyle,
    });
  }
  return {
    base: theme.base,
    inherit: theme.inherit,
    rules,
    colors: copyColors(theme.colors),
  };
};

const kilnTheme = {
  base: "vs-dark",
  inherit: true,
  rules: [],
  colors: {
    "editor.background": "#161311",
    "editor.foreground": "#f6f1e8",
    "editorLineNumber.foreground": "#6d645b",
    "editorCursor.foreground": "#e7b089",
  },
} satisfies editor.IStandaloneThemeData;

const requireTheme = (theme: ImportedTheme): editor.IStandaloneThemeData => {
  const data = toThemeData(theme);
  if (data === null) {
    return kilnTheme;
  }
  return data;
};

const kiln: EditorTheme = {
  id: "kiln",
  label: "Kiln",
  monacoId: "kiln",
  light: false,
  background: "#161311",
  foreground: "#f6f1e8",
  data: kilnTheme,
};

export const editorThemes: readonly EditorTheme[] = [
  kiln,
  {
    id: "dark-plus",
    label: "Dark+",
    monacoId: "vs-dark",
    light: false,
    background: "#1e1e1e",
    foreground: "#d4d4d4",
    data: null,
  },
  {
    id: "light-plus",
    label: "Light+",
    monacoId: "vs",
    light: true,
    background: "#ffffff",
    foreground: "#000000",
    data: null,
  },
  {
    id: "monokai",
    label: "Monokai",
    monacoId: "monokai",
    light: false,
    background: "#272822",
    foreground: "#f8f8f2",
    data: requireTheme(monokaiTheme),
  },
  {
    id: "dracula",
    label: "Dracula",
    monacoId: "dracula",
    light: false,
    background: "#282a36",
    foreground: "#f8f8f2",
    data: requireTheme(draculaTheme),
  },
  {
    id: "solarized-dark",
    label: "Solarized Dark",
    monacoId: "solarized-dark",
    light: false,
    background: "#002b36",
    foreground: "#839496",
    data: requireTheme(solarizedDarkTheme),
  },
  {
    id: "github-dark",
    label: "GitHub Dark",
    monacoId: "github-dark",
    light: false,
    background: "#24292e",
    foreground: "#f6f8fa",
    data: requireTheme(githubDarkTheme),
  },
];

export const editorThemeItems: Record<string, string> = {};

for (const theme of editorThemes) {
  editorThemeItems[theme.id] = theme.label;
}

export const getEditorTheme = (themeId: EditorThemeId): EditorTheme => {
  for (const theme of editorThemes) {
    if (theme.id === themeId) {
      return theme;
    }
  }
  return kiln;
};

export const readEditorThemeId = (value: string | null): EditorThemeId => {
  for (const theme of editorThemes) {
    if (theme.id === value) {
      return theme.id;
    }
  }
  return kiln.id;
};

export const defineEditorThemes = (monaco: {
  readonly editor: {
    defineTheme: (themeId: string, data: editor.IStandaloneThemeData) => void;
  };
}): void => {
  for (const theme of editorThemes) {
    if (theme.data === null) {
      continue;
    }
    monaco.editor.defineTheme(theme.monacoId, theme.data);
  }
};
