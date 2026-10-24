export const embedPrefix = "/embed";

export const isEmbedPath = (pathname: string): boolean => {
  return pathname === embedPrefix || pathname.startsWith(`${embedPrefix}/`);
};

const pathEnd = (href: string): number => {
  const hash = href.indexOf("#");
  const query = href.indexOf("?");
  let end = href.length;
  if (hash !== -1 && hash < end) {
    end = hash;
  }
  if (query !== -1 && query < end) {
    end = query;
  }
  return end;
};

export const toEmbedHref = (href: string): string => {
  if (href.startsWith(`${embedPrefix}/`) || href === embedPrefix) {
    return href;
  }
  const end = pathEnd(href);
  const path = href.slice(0, end);
  const suffix = href.slice(end);
  if (path.startsWith("/articles/") || path === "/privacy" || path === "/terms") {
    return `${embedPrefix}${path}${suffix}`;
  }
  return href;
};
