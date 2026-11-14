/**
 * Generated artwork for the App Store screenshots and creatives: a field of
 * code glyphs behind the headline, and cards drawn from the course itself
 * (an array with two pointers, a binary tree, a linked list, Big O curves,
 * a gap chip, the test result) that float across each device's edges.
 *
 * Seeded, so a re-run draws the same picture.
 */

const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 2147483647, 7) || 1;

/* ---------------- Glyphs ---------------- */

/** `m` glyphs are set in JetBrains Mono, `s` glyphs in the display serif's italic. */
const GLYPHS = [
  ["m", "O(n)"],
  ["m", "O(1)"],
  ["m", "log n"],
  ["m", "{ }"],
  ["m", "=>"],
  ["m", "[ ]"],
  ["s", "∞"],
  ["m", "n²"],
  ["m", "&lt;T&gt;"],
  ["m", "!=="],
  ["s", "λ"],
  ["s", "Σ"],
  ["m", "[i]"],
  ["m", "→"],
  ["m", "//"],
  ["m", "≤"],
  ["m", "null"],
  ["m", "++"],
];

const glyphSpan = (g, left, top, size, rot, opacity) =>
  `<span class="glyph ${g[0]}" style="left:${left};top:${top};font-size:${size};opacity:${opacity};transform:translate(-50%,-50%) rotate(${rot}deg)">${g[1]}</span>`;

const wave = (amp, freq, phase, y0) =>
  Array.from(
    { length: 101 },
    (_, i) => `${i === 0 ? "M" : "L"}${i} ${(y0 + amp * Math.sin((i / 100) * Math.PI * 2 * freq + phase)).toFixed(2)}`,
  ).join(" ");

/**
 * The header's backdrop: glyphs towards the edges (never under the headline)
 * and two curves sweeping through the gap above the device. Units are the
 * header's own viewBox (100 × 60), stretched to the page width.
 */
export function backdrop(name) {
  const r = rng(hash(name));
  const glyphs = [];
  for (let tries = 0; glyphs.length < 8 && tries < 400; tries++) {
    const x = 3 + r() * 94;
    const y = 4 + r() * 48;
    if (Math.abs(x - 50) < 41) continue;
    if (glyphs.some((g) => Math.hypot(g.x - x, (g.y - y) * 0.9) < 11)) continue;
    glyphs.push({ x, y, g: GLYPHS[Math.floor(r() * GLYPHS.length)], s: 2.6 + r() * 2.2, rot: (r() - 0.5) * 26, o: 0.32 + r() * 0.4 });
  }
  const phase = r() * Math.PI * 2;
  return `<svg class="backdrop" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id="curve" x1="0" x2="1"><stop offset="0" stop-color="var(--a1)" stop-opacity="0"/><stop offset="0.25" stop-color="var(--a1)"/><stop offset="0.75" stop-color="var(--a2)"/><stop offset="1" stop-color="var(--a2)" stop-opacity="0"/></linearGradient></defs>
    <path d="${wave(1.5, 1.15, phase, 56)}" fill="none" stroke="url(#curve)" stroke-width="0.3" vector-effect="non-scaling-stroke" class="c1"/>
    <path d="${wave(1.0, 1.7, phase + 2, 57.6)}" fill="none" stroke="url(#curve)" stroke-width="0.2" vector-effect="non-scaling-stroke" class="c2"/>
  </svg>
  ${glyphs
    .map((g) =>
      glyphSpan(g.g, `${g.x}%`, `${((g.y / 60) * 100).toFixed(1)}%`, `calc(var(--gs) * ${g.s.toFixed(2)})`, g.rot.toFixed(1), g.o.toFixed(2)),
    )
    .join("")}`;
}

/**
 * A full-bleed field of glyphs for the creatives, kept out of the `clear` box
 * (fractions of the canvas) where the key art sits. Sized in vh.
 */
export function field(name, { count = 22, clear = [0.3, 0.25, 0.7, 0.75] } = {}) {
  const r = rng(hash(name));
  const [cx0, cy0, cx1, cy1] = clear;
  const glyphs = [];
  for (let tries = 0; glyphs.length < count && tries < 2000; tries++) {
    const x = 0.02 + r() * 0.96;
    const y = 0.04 + r() * 0.92;
    if (x > cx0 && x < cx1 && y > cy0 && y < cy1) continue;
    if (glyphs.some((g) => Math.hypot(g.x - x, (g.y - y) * 0.6) < 0.075)) continue;
    glyphs.push({ x, y, g: GLYPHS[Math.floor(r() * GLYPHS.length)], s: 3.4 + r() * 4, rot: (r() - 0.5) * 26, o: 0.28 + r() * 0.4 });
  }
  const phase = r() * Math.PI * 2;
  return `<svg class="field-curves" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id="fcurve" x1="0" x2="1"><stop offset="0" stop-color="var(--a1)" stop-opacity="0"/><stop offset="0.3" stop-color="var(--a1)"/><stop offset="0.7" stop-color="var(--a2)"/><stop offset="1" stop-color="var(--a2)" stop-opacity="0"/></linearGradient></defs>
    <path d="${wave(7, 1.1, phase, 80)}" fill="none" stroke="url(#fcurve)" stroke-width="0.35" vector-effect="non-scaling-stroke" opacity="0.8"/>
    <path d="${wave(5, 1.6, phase + 2, 86)}" fill="none" stroke="url(#fcurve)" stroke-width="0.25" vector-effect="non-scaling-stroke" opacity="0.45"/>
    <path d="${wave(6, 0.8, phase + 4, 16)}" fill="none" stroke="url(#fcurve)" stroke-width="0.25" vector-effect="non-scaling-stroke" opacity="0.35"/>
  </svg>
  ${glyphs
    .map((g) =>
      glyphSpan(g.g, `${(g.x * 100).toFixed(1)}%`, `${(g.y * 100).toFixed(1)}%`, `${g.s.toFixed(2)}vh`, g.rot.toFixed(1), g.o.toFixed(2)),
    )
    .join("")}`;
}

/* ---------------- Cards ---------------- */

const card = (body, { side, top, rot, cls = "" }) =>
  `<div class="card ${side} ${cls}" style="top:${top}%;--rot:${rot}deg">${body}</div>`;
const at = (body, x, y, rot, cls = "") =>
  `<div class="card free ${cls}" style="left:${x}%;top:${y}%;--rot:${rot}deg">${body}</div>`;

const tick = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`;

/** The exercise result, as the app reports it after a submit. */
const passed = (title, sub) =>
  `<div class="row"><span class="badge ok">${tick}</span><div><div class="t">${title}</div><div class="s">${sub}</div></div></div>`;

/** An array with two pointers meeting in the middle. */
const pointers = () => {
  const values = [1, 3, 4, 6, 8, 9, 11];
  const cells = values
    .map((v, i) => {
      const on = i === 1 || i === 5;
      return `<rect x="${6 + i * 26}" y="22" width="22" height="26" rx="5" class="${on ? "cell on" : "cell"}"/>
        <text x="${17 + i * 26}" y="40" text-anchor="middle" class="mono">${v}</text>
        <text x="${17 + i * 26}" y="62" text-anchor="middle" class="idx">${i}</text>`;
    })
    .join("");
  const arrow = (i, label) =>
    `<text x="${17 + i * 26}" y="11" text-anchor="middle" class="ptr">${label}</text><path d="M${17 + i * 26} 14 v5" class="ptr-line"/>`;
  return `<div class="eyebrow">Two pointers</div><svg viewBox="0 0 190 68" class="w-array">${cells}${arrow(1, "left")}${arrow(5, "right")}</svg>`;
};

/** A small binary search tree. */
const tree = () => {
  const nodes = [
    [80, 16, 8],
    [42, 50, 3],
    [118, 50, 10],
    [22, 84, 1],
    [62, 84, 6],
    [138, 84, 14],
  ];
  const edges = [
    [0, 1],
    [0, 2],
    [1, 3],
    [1, 4],
    [2, 5],
  ];
  const lit = new Set([0, 1, 4]);
  return `<div class="eyebrow">Binary search tree</div><svg viewBox="0 0 160 102" class="w-tree">${edges
    .map(([a, b]) => `<line x1="${nodes[a][0]}" y1="${nodes[a][1]}" x2="${nodes[b][0]}" y2="${nodes[b][1]}" class="${lit.has(a) && lit.has(b) ? "edge on" : "edge"}"/>`)
    .join("")}${nodes
    .map(([x, y, v], i) => `<circle cx="${x}" cy="${y}" r="13" class="${lit.has(i) ? "node on" : "node"}"/><text x="${x}" y="${y + 5}" text-anchor="middle" class="${lit.has(i) ? "mono inv" : "mono"}">${v}</text>`)
    .join("")}</svg>`;
};

/** A singly linked list, reversed one pointer at a time. */
const list = () => {
  const values = [7, 2, 9, 4];
  return `<div class="eyebrow">Linked list</div><svg viewBox="0 0 196 44" class="w-list">${values
    .map((v, i) => {
      const x = 4 + i * 48;
      return `<rect x="${x}" y="8" width="34" height="28" rx="7" class="${i === 1 ? "cell on" : "cell"}"/><text x="${x + 17}" y="27" text-anchor="middle" class="mono">${v}</text>${
        i < values.length - 1 ? `<path d="M${x + 36} 22 h9" class="arrow"/><path d="M${x + 42} 18 l4 4 l-4 4" class="arrow"/>` : ""
      }`;
    })
    .join("")}</svg>`;
};

/** Growth curves for the cost lesson. */
const bigO = () => {
  const X = (x) => 12 + x * 1.5;
  const Y = (y) => 92 - y * 0.82;
  const curve = (f) =>
    Array.from({ length: 41 }, (_, i) => {
      const x = (i / 40) * 100;
      return `${i ? "L" : "M"}${X(x).toFixed(1)} ${Y(Math.min(100, f(x))).toFixed(1)}`;
    }).join(" ");
  return `<div class="eyebrow">Cost as n grows</div><svg viewBox="0 0 172 100" class="w-plot">
    <line x1="12" y1="92" x2="166" y2="92" class="ax"/><line x1="12" y1="6" x2="12" y2="92" class="ax"/>
    <path d="${curve((x) => (x * x) / 100)}" class="curve c-n2"/>
    <path d="${curve((x) => x * 0.62)}" class="curve c-n"/>
    <path d="${curve((x) => 14 * Math.log2(1 + x / 6))}" class="curve c-log"/>
    <path d="${curve(() => 8)}" class="curve c-1"/>
    <text x="104" y="16" class="lbl">n²</text><text x="146" y="44" class="lbl">n</text><text x="140" y="54" class="lbl">log n</text><text x="150" y="80" class="lbl">1</text>
  </svg>`;
};

/** A line of the gap exercise with a snippet placed in its blank. */
const gap = (before, chip, after) =>
  `<div class="eyebrow">Fill the gap</div><div class="code"><span class="kw">${before}</span><span class="chip-gap">${chip}</span><span class="kw">${after}</span></div>`;

/** Lessons done, as a ring. */
const ring = (done, total, title, sub) => {
  const R = 26;
  const C = 2 * Math.PI * R;
  return `<div class="row"><svg viewBox="0 0 64 64" class="w-ring">
    <circle cx="32" cy="32" r="${R}" fill="none" class="ring-track" stroke-width="7"/>
    <circle cx="32" cy="32" r="${R}" fill="none" class="ring-fill" stroke-width="7" stroke-linecap="round" stroke-dasharray="${(C * done) / total} ${C}" transform="rotate(-90 32 32)"/>
    <text x="32" y="37" text-anchor="middle" class="pct">${done}</text>
  </svg><div><div class="t">${title}</div><div class="s">${sub}</div></div></div>`;
};

/** A hash map's buckets. */
const buckets = () =>
  `<div class="eyebrow">Hash map</div>${[
    ["0", "“ab” → 2"],
    ["1", ""],
    ["2", "“cd” → 7"],
    ["3", "“ef” → 1"],
  ]
    .map(([k, v]) => `<div class="bucket"><span class="k">${k}</span><span class="v${v ? "" : " empty"}">${v || "empty"}</span></div>`)
    .join("")}`;

/** Two cards per shot, one hanging off each side of the device. */
const motifs = {
  "01-course": () => [
    card(ring(12, 38, "12 of 38 lessons", "Week 2 · Core structures"), { side: "right", top: 16, rot: 3 }),
    card(pointers(), { side: "left", top: 60, rot: -4 }),
  ],
  "02-lesson": () => [card(bigO(), { side: "right", top: 22, rot: 4 }), card(list(), { side: "left", top: 66, rot: -3 })],
  "03-practice": () => [
    card(gap("while (", "left < right", ") {"), { side: "left", top: 30, rot: -4 }),
    card(tree(), { side: "right", top: 60, rot: 3 }),
  ],
  "04-passed": () => [
    card(passed("All tests pass", "5 of 5, hidden cases included"), { side: "right", top: 26, rot: 3 }),
    card(buckets(), { side: "left", top: 62, rot: -4 }),
  ],
  "05-progress": () => [
    card(passed("Week 1 complete", "Foundations · 10 lessons"), { side: "left", top: 30, rot: -4 }),
    card(bigO(), { side: "right", top: 62, rot: 3 }),
  ],
  "06-articles": () => [card(tree(), { side: "right", top: 20, rot: 3 }), card(list(), { side: "left", top: 64, rot: -4 })],
};

export const cards = (name) => (motifs[name] ? motifs[name]().join("") : "");

/**
 * Header (21:9): cards orbit a centred headline. Search Results (3:2): two
 * cards hang off the device, as on the screenshots.
 */
export const creativeCards = {
  header: () =>
    [
      at(pointers(), 20, 58, -5),
      at(bigO(), 80, 54, 5),
      at(list(), 31, 18, 4),
      at(ring(12, 38, "12 of 38 lessons", "Four weeks, in order"), 70, 17, -3),
      at(passed("All tests pass", "5 of 5 on the server"), 65, 86, 3),
      at(gap("return ", "seen.has(x)", ";"), 35, 86, -3),
    ].join(""),
  search: () =>
    [card(tree(), { side: "right", top: 18, rot: 4 }), card(passed("All tests pass", "5 of 5, hidden cases included"), { side: "left", top: 74, rot: -3 })].join(""),
};
