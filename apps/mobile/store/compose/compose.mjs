#!/usr/bin/env node
/**
 * Turns raw simulator captures (store/screenshots/raw/<device>/<name>.png) into
 * App Store screenshots: the app in a device frame on the site's ink and paper,
 * under a headline in the app's display serif, with generated artwork (art.mjs)
 * behind the headline and floating across the device.
 *
 *   node store/compose/compose.mjs            # every device and the creatives
 *   node store/compose/compose.mjs duo        # one device
 *   node store/compose/compose.mjs creatives  # the Header and Search Results assets
 *
 * Each shot is an HTML page (template.html) rendered by headless Chrome at the
 * exact size App Store Connect asks for, then flattened to an opaque PNG.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { backdrop, cards, creativeCards, field } from "./art.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const mobile = resolve(here, "../..");
const raw = join(mobile, "store/screenshots/raw");
const out = join(mobile, "store/screenshots");
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

/**
 * App Store Connect sizes: 6.9" iPhone, 6.3" iPhone (drawn from the same 6.9"
 * captures, since the design is sized in vw), 13" iPad, and the iPhone Duo.
 * The Duo slot takes either display: the cover, 1398 × 2034, or the inner
 * display open, 2007 × 2853. The set follows whichever the captures used.
 */
const duoOpen = (() => {
  const sample = join(raw, "duo/course.png");
  if (!existsSync(sample)) return false;
  const width = execFileSync("python3", ["-c", "import sys; from PIL import Image; print(Image.open(sys.argv[1]).size[0])", sample]);
  return Number(String(width).trim()) > 1800;
})();
const devices = {
  iphone: { width: 1320, height: 2868, frame: "phone" },
  "iphone-6.3": { width: 1206, height: 2622, frame: "phone", raw: "iphone" },
  ipad: { width: 2064, height: 2752, frame: "tablet" },
  duo: duoOpen ? { width: 2007, height: 2853, frame: "duo open" } : { width: 1398, height: 2034, frame: "duo" },
};

/**
 * The listing, in order. The first three carry the search result, so they say
 * what the app is: a free course, a lesson, and the gap exercise. `title` takes
 * one *italic* accent; `theme` is ink, paper or dusk.
 */
const listing = [
  { name: "01-course", title: "Learn DSA in *TypeScript*, free", sub: "38 short lessons over four weeks, from Big O to tries", theme: "ink" },
  { name: "02-lesson", title: "One idea per *lesson*", sub: "Plain reading, diagrams and highlighted code", theme: "paper" },
  { name: "03-practice", title: "Fill the gap, *pass* the tests", sub: "Drag a snippet into the function, then submit", theme: "ink" },
  { name: "04-passed", title: "Checked by *real* tests", sub: "The same hidden tests as the website", theme: "dusk" },
  { name: "05-progress", title: "See what still needs a *pass*", sub: "Lessons, pass rate and every topic's progress", theme: "paper" },
  { name: "06-articles", title: "64 explainers, *diagrams* included", sub: "Arrays to graphs, readable before you start", theme: "ink" },
];
const shots = { iphone: listing, "iphone-6.3": listing, ipad: listing, duo: listing };

const font = (p) => pathToFileURL(join(mobile, "node_modules/@expo-google-fonts", p)).href;
const fonts = {
  serif: font("fraunces/500Medium/Fraunces_500Medium.ttf"),
  serifItalic: font("fraunces/500Medium_Italic/Fraunces_500Medium_Italic.ttf"),
  sans: font("geist/400Regular/Geist_400Regular.ttf"),
  sansMedium: font("geist/500Medium/Geist_500Medium.ttf"),
  sansSemibold: font("geist/600SemiBold/Geist_600SemiBold.ttf"),
  mono: font("jetbrains-mono/400Regular/JetBrainsMono_400Regular.ttf"),
};

/** The site's infinity mark (apps/web/components/infinity-path.ts). */
const infinityPath = readFileSync(join(mobile, "../web/components/infinity-path.ts"), "utf8").match(/"(M [^"]+)"/)[1];
const mark = `<svg viewBox="0 0 500 500" fill="none" aria-hidden="true"><path d="${infinityPath}" stroke="currentColor" stroke-width="54" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const template = readFileSync(join(here, "template.html"), "utf8");
const creative = readFileSync(join(here, "creative.html"), "utf8");
const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const headline = (t) => escape(t).replace(/\*(.+?)\*/g, "<em>$1</em>");

const fill = (html, w, h) =>
  html
    .replaceAll("{{W}}", String(w))
    .replaceAll("{{H}}", String(h))
    .replace("{{ART_CSS}}", pathToFileURL(join(here, "art.css")).href)
    .replace("{{SERIF}}", fonts.serif)
    .replace("{{SERIF_ITALIC}}", fonts.serifItalic)
    .replace("{{SANS}}", fonts.sans)
    .replace("{{SANS_MEDIUM}}", fonts.sansMedium)
    .replace("{{SANS_SEMIBOLD}}", fonts.sansSemibold)
    .replace("{{MONO}}", fonts.mono)
    .replace("{{MARK}}", mark);

/** Renders a page in headless Chrome at w×h and saves it as an opaque PNG. */
const render = (html, w, h, dest, work) => {
  const page = join(work, "page.html");
  const png = join(work, "page.png");
  writeFileSync(page, html);
  execFileSync(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--allow-file-access-from-files",
      "--force-device-scale-factor=1",
      "--virtual-time-budget=3000",
      `--window-size=${w},${h}`,
      `--screenshot=${png}`,
      pathToFileURL(page).href,
    ],
    { stdio: "ignore" },
  );
  // App Store Connect rejects images with an alpha channel: flatten to RGB.
  execFileSync(
    "python3",
    ["-c", "import sys; from PIL import Image; Image.open(sys.argv[1]).convert('RGB').save(sys.argv[2], optimize=True)", png, dest],
    { cwd: work },
  );
};

/**
 * The product page's creatives (Product Page Information › Header and Search
 * Results): the header at 21:9, 3840 × 1646, and the search results asset at
 * 3:2, 3840 × 2560.
 */
const creatives = {
  header: { width: 3840, height: 1646, clear: [0.24, 0.12, 0.76, 0.9] },
  search: { width: 3840, height: 2560, clear: [0.1, 0.08, 0.9, 0.94], screen: "iphone/practice.png" },
};
const chip = `<span class="chip">${mark}<span>DSA in TypeScript</span></span>`;
const creativeBody = {
  header: () =>
    `${creativeCards.header()}<div class="copy">${chip}<h1>${headline("Algorithms, one *function* at a time")}</h1><p>A free TypeScript course for iPhone, iPad and iPhone Duo</p></div>`,
  search: (spec) =>
    `<div class="copy">${chip}<h1>${headline("Fill the gap, *pass* the tests")}</h1><p>38 short lessons in data structures and algorithms, checked by real tests. Free, with no paid tier.</p></div>
     <div class="device"><img class="screen" src="${pathToFileURL(join(raw, spec.screen)).href}" alt="" /><div class="island"></div>${creativeCards.search()}</div>`,
};

const only = process.argv[2];
const work = mkdtempSync(join(tmpdir(), "dsa-shots-"));
try {
  for (const [device, spec] of Object.entries(devices)) {
    if (only && only !== device) continue;
    mkdirSync(join(out, device), { recursive: true });
    for (const shot of shots[device]) {
      const screen = join(raw, spec.raw ?? device, `${shot.name.replace(/^\d+-/, "")}.png`);
      if (!existsSync(screen)) {
        console.warn(`skip ${device}/${shot.name}: no ${screen}`);
        continue;
      }
      const html = fill(template, spec.width, spec.height)
        .replace("{{FRAME}}", spec.frame)
        .replace("{{THEME}}", shot.theme)
        .replace("{{TITLE}}", headline(shot.title))
        .replace("{{SUB}}", escape(shot.sub))
        .replace("{{BACKDROP}}", backdrop(shot.name))
        .replace("{{CARDS}}", cards(shot.name))
        .replace("{{SCREEN}}", pathToFileURL(screen).href);
      render(html, spec.width, spec.height, join(out, device, `${shot.name}.png`), work);
      console.log(`✓ ${device}/${shot.name}.png`);
    }
  }
  if (!only || only === "creatives") {
    mkdirSync(join(out, "creatives"), { recursive: true });
    for (const [kind, spec] of Object.entries(creatives)) {
      const html = fill(creative, spec.width, spec.height)
        .replace("{{KIND}}", kind)
        .replace("{{FIELD}}", field(`creative-${kind}`, { clear: spec.clear }))
        .replace("{{BODY}}", creativeBody[kind](spec));
      render(html, spec.width, spec.height, join(out, "creatives", `${kind}.png`), work);
      console.log(`✓ creatives/${kind}.png`);
    }
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
