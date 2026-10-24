const isHttp = (url: string): boolean => {
  return url.startsWith("http://") || url.startsWith("https://");
};

const embedPath = (pathname: string): string | null => {
  if (pathname === "/embed" || pathname.startsWith("/embed/")) {
    return pathname;
  }
  if (pathname.startsWith("/articles/")) {
    return `/embed${pathname}`;
  }
  if (pathname === "/privacy" || pathname === "/terms") {
    return `/embed${pathname}`;
  }
  return null;
};

export const chromeFreeUrl = (url: string, site: string): string => {
  let parsed: URL;
  try {
    parsed = new URL(url, site);
  } catch {
    return url;
  }
  let siteUrl: URL;
  try {
    siteUrl = new URL(site);
  } catch {
    return url;
  }
  if (parsed.origin !== siteUrl.origin) {
    return url;
  }
  const nextPath = embedPath(parsed.pathname);
  if (nextPath === null) {
    return url;
  }
  return `${parsed.origin}${nextPath}${parsed.search}${parsed.hash}`;
};

export const shouldOpenOutside = (url: string, site: string): boolean => {
  if (url.startsWith("about:")) {
    return false;
  }
  if (!isHttp(url)) {
    return true;
  }
  let siteUrl: URL;
  try {
    siteUrl = new URL(site);
  } catch {
    return false;
  }
  let current: URL;
  try {
    current = new URL(url);
  } catch {
    return true;
  }
  if (current.origin !== siteUrl.origin) {
    return true;
  }
  return embedPath(current.pathname) === null;
};
