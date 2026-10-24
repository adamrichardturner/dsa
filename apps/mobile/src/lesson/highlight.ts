import { languages, tokenize, type Grammar, type Token, type TokenStream } from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-json";
import type { CodeThemeId } from "@/lesson/code-theme";

export type HighlightLanguage = "typescript" | "javascript" | "json" | "plaintext";

export interface HighlightPiece {
  readonly text: string;
  readonly kind: string;
  readonly italic: boolean;
}

const monokaiColors: Record<string, string> = {
  keyword: "#F92672",
  builtin: "#66D9EF",
  function: "#A6E22E",
  "class-name": "#A6E22E",
  "generic-function": "#A6E22E",
  string: "#E6DB74",
  "template-string": "#E6DB74",
  number: "#AE81FF",
  boolean: "#AE81FF",
  constant: "#AE81FF",
  comment: "#75715E",
  regex: "#E6DB74",
  operator: "#F8F8F2",
  punctuation: "#F8F8F2",
  parameter: "#FD971F",
  property: "#A6E22E",
  plain: "#F8F8F2",
};

const lightColors: Record<string, string> = {
  keyword: "#0000FF",
  builtin: "#267F99",
  function: "#795E26",
  "class-name": "#267F99",
  "generic-function": "#795E26",
  string: "#A31515",
  "template-string": "#A31515",
  number: "#098658",
  boolean: "#0000FF",
  constant: "#0070C1",
  comment: "#008000",
  regex: "#811F3F",
  operator: "#000000",
  punctuation: "#000000",
  parameter: "#001080",
  property: "#001080",
  plain: "#000000",
};

const italicKinds: Record<string, true> = {
  comment: true,
};

const readGrammar = (name: string): Grammar | null => {
  if (!Object.hasOwn(languages, name)) {
    return null;
  }
  const grammar = languages[name];
  if (grammar === undefined) {
    return null;
  }
  return grammar;
};

const grammarFor = (language: HighlightLanguage): Grammar | null => {
  switch (language) {
    case "typescript": {
      return readGrammar("typescript");
    }
    case "javascript": {
      return readGrammar("javascript");
    }
    case "json": {
      return readGrammar("json");
    }
    case "plaintext": {
      return null;
    }
  }
};

const pushPiece = (into: HighlightPiece[], text: string, kind: string): void => {
  if (text.length === 0) {
    return;
  }
  into.push({
    text,
    kind,
    italic: italicKinds[kind] === true,
  });
};

const appendStream = (stream: TokenStream, kind: string, into: HighlightPiece[]): void => {
  if (typeof stream === "string") {
    pushPiece(into, stream, kind);
    return;
  }
  if (!Array.isArray(stream)) {
    appendToken(stream, into);
    return;
  }
  for (const part of stream) {
    if (typeof part === "string") {
      pushPiece(into, part, kind);
      continue;
    }
    appendToken(part, into);
  }
};

const appendToken = (token: Token, into: HighlightPiece[]): void => {
  appendStream(token.content, token.type, into);
};

export const highlightCode = (code: string, language: HighlightLanguage): readonly HighlightPiece[] => {
  const grammar = grammarFor(language);
  if (grammar === null) {
    return [{ text: code, kind: "plain", italic: false }];
  }
  const pieces: HighlightPiece[] = [];
  appendStream(tokenize(code, grammar), "plain", pieces);
  if (pieces.length === 0) {
    return [{ text: code, kind: "plain", italic: false }];
  }
  return pieces;
};

export const tokenColor = (kind: string, themeId: CodeThemeId): string => {
  const table = themeId === "monokai" ? monokaiColors : lightColors;
  return table[kind] ?? table.plain ?? "#F8F8F2";
};

export const languageFromLabel = (label: string | null | undefined): HighlightLanguage => {
  const value = (label ?? "").trim().toLowerCase();
  if (value === "ts" || value === "typescript") {
    return "typescript";
  }
  if (value === "js" || value === "javascript" || value === "mjs" || value === "cjs") {
    return "javascript";
  }
  if (value === "json") {
    return "json";
  }
  return "plaintext";
};

export const exerciseHighlightLanguage = (starterCode: string): HighlightLanguage => {
  if (starterCode.includes(": ") || starterCode.includes("interface ") || starterCode.includes("type ")) {
    return "typescript";
  }
  if (starterCode.includes("function ") || starterCode.includes("const ") || starterCode.includes("let ")) {
    return "javascript";
  }
  return "typescript";
};
