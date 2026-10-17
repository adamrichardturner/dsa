const lessonPathPattern = /^\/course\/([a-z0-9]+(?:-[a-z0-9]+)*)$/;

const decodeFrom = (value: string): string | null => {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
};

const queryIsSafe = (query: string): boolean => {
  if (query.length === 0) {
    return true;
  }
  if (query.length > 200) {
    return false;
  }
  return /^[A-Za-z0-9._~%=&-]+$/.test(query);
};

/**
 * Accepts only a same-site course lesson path. Rejects external URLs,
 * protocol-relative URLs, and anything that is not `/course/<slug>`.
 */
export const lessonReturnPath = (from: string | undefined): string | null => {
  if (from === undefined) {
    return null;
  }
  if (from.length === 0 || from.length > 300) {
    return null;
  }
  if (!from.startsWith("/course/")) {
    return null;
  }
  if (from.includes("\\") || from.includes("@") || from.includes("#")) {
    return null;
  }
  if (/[\u0000-\u001f\u007f]/.test(from)) {
    return null;
  }
  const decoded = decodeFrom(from);
  if (decoded === null || decoded !== from) {
    return null;
  }
  const queryAt = decoded.indexOf("?");
  const path = queryAt === -1 ? decoded : decoded.slice(0, queryAt);
  const query = queryAt === -1 ? "" : decoded.slice(queryAt + 1);
  const match = lessonPathPattern.exec(path);
  if (match === null) {
    return null;
  }
  const slug = match[1];
  if (slug === undefined) {
    return null;
  }
  if (!queryIsSafe(query)) {
    return null;
  }
  if (query.length === 0) {
    return `/course/${slug}`;
  }
  return `/course/${slug}?${query}`;
};

export const withLessonFrom = (
  href: string,
  from: string | undefined,
): string => {
  if ((from ?? "").length === 0) {
    return href;
  }
  const params = new URLSearchParams();
  params.set("from", from ?? "");
  return `${href}?${params.toString()}`;
};

export const currentLessonFrom = (
  pathname: string,
  search: string,
): string | undefined => {
  if (!pathname.startsWith("/course/")) {
    return undefined;
  }
  const slug = pathname.slice("/course/".length);
  if (slug.length === 0 || slug.includes("/")) {
    return undefined;
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return undefined;
  }
  if (search.length === 0) {
    return pathname;
  }
  return `${pathname}?${search}`;
};
