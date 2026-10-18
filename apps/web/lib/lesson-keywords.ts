import { articles } from "./articles";

interface Keyword {
  readonly needle: string;
  readonly slug: string;
}

interface Match {
  readonly index: number;
  readonly length: number;
  readonly slug: string;
}

interface AnnotationState {
  readonly used: Record<string, true>;
  readonly slugs: readonly string[];
}

interface Segment {
  readonly kind: "code" | "text";
  readonly value: string;
}

export interface AnnotatedLesson {
  readonly contentMd: string;
  readonly promptMd: string;
  readonly articleSlugs: readonly string[];
}

export interface AnnotatedMarkdown {
  readonly markdown: string;
  readonly articleSlugs: readonly string[];
}

const buildKeywords = (): readonly Keyword[] => {
  const list: Keyword[] = [];
  const seen: Record<string, true> = {};

  for (const item of articles) {
    for (const phrase of item.keywords) {
      const needle = phrase.toLowerCase();
      if (needle.length === 0) {
        continue;
      }
      if (needle.length !== phrase.length) {
        continue;
      }
      if (seen[needle] === true) {
        continue;
      }
      seen[needle] = true;
      list.push({ needle, slug: item.slug });
    }
  }

  return list;
};

const keywords = buildKeywords();

const isBoundary = (char: string | undefined): boolean => {
  if (char === undefined) {
    return true;
  }
  return /[^\p{L}\p{N}]/u.test(char);
};

const findPhrase = (haystack: string, needle: string, from: number): number => {
  let start = from;

  while (start < haystack.length) {
    const found = haystack.indexOf(needle, start);
    if (found === -1) {
      return -1;
    }
    const before = found === 0 ? undefined : haystack[found - 1];
    const after = haystack[found + needle.length];
    if (isBoundary(before) && isBoundary(after)) {
      return found;
    }
    start = found + 1;
  }

  return -1;
};

/**
 * Picks the earliest keyword match, and the longest one when several start together.
 * Used phrases stay in the search so a shorter keyword inside them is not linked later.
 */
const findMatch = (haystack: string, from: number): Match | null => {
  let best: Match | null = null;

  for (const keyword of keywords) {
    const index = findPhrase(haystack, keyword.needle, from);
    if (index === -1) {
      continue;
    }
    const next: Match = {
      index,
      length: keyword.needle.length,
      slug: keyword.slug,
    };
    if (best === null) {
      best = next;
      continue;
    }
    if (next.index < best.index) {
      best = next;
      continue;
    }
    if (next.index > best.index) {
      continue;
    }
    if (next.length > best.length) {
      best = next;
    }
  }

  return best;
};

const linkLabel = (label: string, slug: string): string => {
  return `[${label}](/articles/${slug} "article")`;
};

const annotateText = (
  text: string,
  folded: string,
  state: AnnotationState,
): { readonly text: string; readonly state: AnnotationState } => {
  let cursor = 0;
  let output = "";
  let used = state.used;
  const slugs = [...state.slugs];

  while (cursor < text.length) {
    const match = findMatch(folded, cursor);
    if (match === null) {
      output += text.slice(cursor);
      break;
    }
    const end = match.index + match.length;
    output += text.slice(cursor, match.index);
    if (used[match.slug] === true) {
      output += text.slice(match.index, end);
      cursor = end;
      continue;
    }
    const label = text.slice(match.index, end);
    output += linkLabel(label, match.slug);
    used = { ...used, [match.slug]: true };
    slugs.push(match.slug);
    cursor = end;
  }

  return { text: output, state: { used, slugs } };
};

const consumeFence = (markdown: string, index: number): number | null => {
  if (!markdown.startsWith("```", index)) {
    return null;
  }
  const close = markdown.indexOf("```", index + 3);
  if (close === -1) {
    return markdown.length;
  }
  return close + 3;
};

const consumeInline = (markdown: string, index: number): number | null => {
  if (markdown.startsWith("```", index)) {
    return null;
  }
  if (markdown[index] !== "`") {
    return null;
  }
  const close = markdown.indexOf("`", index + 1);
  if (close === -1) {
    return markdown.length;
  }
  return close + 1;
};

const splitMarkdown = (markdown: string): readonly Segment[] => {
  const segments: Segment[] = [];
  let index = 0;
  let textStart = 0;

  const pushText = (end: number) => {
    if (end <= textStart) {
      return;
    }
    segments.push({ kind: "text", value: markdown.slice(textStart, end) });
  };

  while (index < markdown.length) {
    const fenceEnd = consumeFence(markdown, index);
    if (fenceEnd !== null) {
      pushText(index);
      segments.push({ kind: "code", value: markdown.slice(index, fenceEnd) });
      index = fenceEnd;
      textStart = fenceEnd;
      continue;
    }
    const inlineEnd = consumeInline(markdown, index);
    if (inlineEnd !== null) {
      pushText(index);
      segments.push({ kind: "code", value: markdown.slice(index, inlineEnd) });
      index = inlineEnd;
      textStart = inlineEnd;
      continue;
    }
    index += 1;
  }

  pushText(markdown.length);
  return segments;
};

const annotateWithState = (
  markdown: string,
  state: AnnotationState,
): { readonly markdown: string; readonly state: AnnotationState } => {
  let next = state;
  let output = "";

  for (const segment of splitMarkdown(markdown)) {
    if (segment.kind === "code") {
      output += segment.value;
      continue;
    }
    const folded = segment.value.toLowerCase();
    if (folded.length !== segment.value.length) {
      output += segment.value;
      continue;
    }
    const annotated = annotateText(segment.value, folded, next);
    output += annotated.text;
    next = annotated.state;
  }

  return { markdown: output, state: next };
};

export const annotateMarkdown = (markdown: string): AnnotatedMarkdown => {
  const initial: AnnotationState = { used: {}, slugs: [] };
  const annotated = annotateWithState(markdown, initial);
  return {
    markdown: annotated.markdown,
    articleSlugs: annotated.state.slugs,
  };
};

export const annotateLesson = (
  contentMd: string,
  promptMd: string,
): AnnotatedLesson => {
  const initial: AnnotationState = { used: {}, slugs: [] };
  const content = annotateWithState(contentMd, initial);
  const prompt = annotateWithState(promptMd, content.state);

  return {
    contentMd: content.markdown,
    promptMd: prompt.markdown,
    articleSlugs: prompt.state.slugs,
  };
};
