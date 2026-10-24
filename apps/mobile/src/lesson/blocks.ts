export type LessonBlock =
  | { readonly kind: "heading"; readonly level: number; readonly text: string }
  | { readonly kind: "paragraph"; readonly text: string }
  | { readonly kind: "list"; readonly items: readonly string[] }
  | { readonly kind: "code"; readonly language: string; readonly code: string }
  | { readonly kind: "mermaid"; readonly code: string }
  | { readonly kind: "visualization"; readonly source: string };

const headingLevel = (line: string): number => {
  let level = 0;
  while (level < line.length && line[level] === "#") {
    level += 1;
  }
  return level;
};

export const parseBlocks = (markdown: string): readonly LessonBlock[] => {
  const lines = markdown.replaceAll("\r\n", "\n").split("\n");
  const blocks: LessonBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? "";
    if (line.startsWith("```")) {
      const language = line.slice(3).trim();
      const body: string[] = [];
      index += 1;
      while (index < lines.length && !(lines[index] ?? "").startsWith("```")) {
        body.push(lines[index] ?? "");
        index += 1;
      }
      index += 1;
      const code = body.join("\n");
      if (language === "mermaid") {
        blocks.push({ kind: "mermaid", code });
        continue;
      }
      if (language === "visualization") {
        blocks.push({ kind: "visualization", source: code });
        continue;
      }
      blocks.push({ kind: "code", language, code });
      continue;
    }

    if (line.startsWith("#")) {
      const level = headingLevel(line);
      blocks.push({
        kind: "heading",
        level: Math.min(level, 3),
        text: line.slice(level).trim(),
      });
      index += 1;
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: string[] = [];
      while (index < lines.length) {
        const item = lines[index] ?? "";
        if (!item.startsWith("- ") && !item.startsWith("* ")) {
          break;
        }
        items.push(item.slice(2).trim());
        index += 1;
      }
      blocks.push({ kind: "list", items });
      continue;
    }

    if (line.trim().length === 0) {
      index += 1;
      continue;
    }

    const paragraph: string[] = [];
    while (index < lines.length) {
      const current = lines[index] ?? "";
      if (
        current.trim().length === 0 ||
        current.startsWith("```") ||
        current.startsWith("#") ||
        current.startsWith("- ") ||
        current.startsWith("* ")
      ) {
        break;
      }
      paragraph.push(current.trim());
      index += 1;
    }
    blocks.push({ kind: "paragraph", text: paragraph.join(" ") });
  }

  return blocks;
};

export type InlinePiece =
  | { readonly kind: "text"; readonly text: string }
  | { readonly kind: "code"; readonly text: string }
  | { readonly kind: "strong"; readonly text: string };

export const parseInline = (value: string): readonly InlinePiece[] => {
  const pieces: InlinePiece[] = [];
  let cursor = 0;
  while (cursor < value.length) {
    const code = value.indexOf("`", cursor);
    const strong = value.indexOf("**", cursor);
    const next =
      code === -1 ? strong : strong === -1 ? code : Math.min(code, strong);
    if (next === -1) {
      pieces.push({ kind: "text", text: value.slice(cursor) });
      break;
    }
    if (next > cursor) {
      pieces.push({ kind: "text", text: value.slice(cursor, next) });
    }
    if (next === code) {
      const end = value.indexOf("`", next + 1);
      if (end === -1) {
        pieces.push({ kind: "text", text: value.slice(next) });
        break;
      }
      pieces.push({ kind: "code", text: value.slice(next + 1, end) });
      cursor = end + 1;
      continue;
    }
    const end = value.indexOf("**", next + 2);
    if (end === -1) {
      pieces.push({ kind: "text", text: value.slice(next) });
      break;
    }
    pieces.push({ kind: "strong", text: value.slice(next + 2, end) });
    cursor = end + 2;
  }
  return pieces;
};
