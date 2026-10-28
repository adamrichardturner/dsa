const isHttp = (url: string): boolean => {
  return url.startsWith("http://") || url.startsWith("https://");
};

const isHttpProtocol = (protocol: string): boolean => {
  return protocol === "http:" || protocol === "https:";
};

export const embedColorSchemeQuery = "colorScheme";

export const withEmbedTheme = (
  url: string,
  scheme: "light" | "dark",
): string => {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }
  if (!isHttpProtocol(parsed.protocol)) {
    return url;
  }
  if (parsed.searchParams.get(embedColorSchemeQuery) === scheme) {
    return url;
  }
  parsed.searchParams.set(embedColorSchemeQuery, scheme);
  return parsed.toString();
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

export const embedThemeLockScript = (
  scheme: "light" | "dark",
  storageKey: string,
): string => {
  const theme = JSON.stringify(scheme);
  const key = JSON.stringify(storageKey);
  return `(function(){try{var theme=${theme};localStorage.setItem(${key},theme);var root=document.documentElement;if(!root){return;}root.classList.toggle("dark",theme==="dark");root.style.colorScheme=theme;}catch(error){}})();`;
};

export const nextEmbedUrl = (
  url: string,
  site: string,
  scheme: "light" | "dark",
): string | null => {
  const embed = chromeFreeUrl(url, site);
  if (embed !== url) {
    return withEmbedTheme(embed, scheme);
  }
  if (shouldOpenOutside(url, site)) {
    return null;
  }
  const themed = withEmbedTheme(url, scheme);
  if (themed !== url) {
    return themed;
  }
  return url;
};
