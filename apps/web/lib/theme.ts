export const themeStorageKey = "dsa.theme";
export const lightIconPath = "/icon-light.svg";
export const darkIconPath = "/icon-dark.svg";

const faviconBootScript = `var links=document.querySelectorAll('link[rel="icon"]');for(var i=0;i<links.length;i++){var link=links[i];var href=link.getAttribute("href")||"";var lightIcon=href.indexOf("${lightIconPath}")!==-1;var darkIcon=href.indexOf("${darkIconPath}")!==-1;if(!lightIcon&&!darkIcon){continue;}link.media=(darkIcon===dark)?"all":"not all";}`;

export const themeBootScript = `(function(){try{var params=new URLSearchParams(location.search);var requested=params.get("colorScheme");var forced=requested==="dark"||requested==="light";var dark=false;if(forced){dark=requested==="dark";document.documentElement.classList.toggle("dark",dark);}if(!forced){var stored=null;try{stored=localStorage.getItem("${themeStorageKey}");}catch(error){}dark=stored==="dark"||(stored!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);}if(!forced&&dark){document.documentElement.classList.add("dark");}${faviconBootScript}}catch(error){}})();`;

export const applyFavicon = (dark: boolean): void => {
  const links = document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]');
  for (const link of links) {
    const href = link.getAttribute("href") ?? "";
    const lightIcon = href.includes(lightIconPath);
    const darkIcon = href.includes(darkIconPath);
    if (!lightIcon && !darkIcon) {
      continue;
    }
    link.media = darkIcon === dark ? "all" : "not all";
  }
};
