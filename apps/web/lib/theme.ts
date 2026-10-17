export const themeStorageKey = "dsa.theme";

export const themeBootScript = `(function(){try{var stored=localStorage.getItem("${themeStorageKey}");var dark=stored==="dark"||(stored!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);if(dark){document.documentElement.classList.add("dark");}}catch(error){}})();`;
