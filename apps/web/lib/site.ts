export const siteName = "Data Structures and Algorithms";
export const siteShortName = "DSA";
export const siteDomain = "datastructuresandalgorithms.com";
export const siteUrl = `https://${siteDomain}`;
export const creatorName = "Adam Richard Turner";
export const creatorUrl = "https://adamrichardturner.dev";
export const contactEmail = "hello@adamrichardturner.dev";
export const legalUpdated = "17 October 2026";
export const privacyUpdated = "31 October 2026";
export const siteDescription =
  "A 100% free TypeScript course in data structures and algorithms. Four weeks of short lessons with an editor and tests, progress on your account, and articles on the terms the lessons use.";

export const socialImage = {
  url: "/datastructuresandalgorithms-og.png",
  width: 1200,
  height: 630,
  alt: siteName,
  type: "image/png",
};

/**
 * The iOS app's listing, and the screens the landing page cycles through. The
 * images are raw iPhone captures from apps/mobile/store/screenshots/raw/iphone,
 * resized to 660 × 1434 (see public/app/README.md).
 */
export const iosApp = {
  appStoreUrl: "https://apps.apple.com/app/dsa-in-typescript/id6826677227",
  name: "DSA in TypeScript",
  screenshots: [
    {
      src: "/app/course.png",
      label: "The course",
      caption: "Four weeks, 38 lessons, taken in order",
      alt: "The course screen in the iPhone app: week one, Foundations, with completed lessons ticked.",
    },
    {
      src: "/app/lesson.png",
      label: "A lesson",
      caption: "One idea, with highlighted code you can read",
      alt: "A lesson in the iPhone app with its reading and a highlighted TypeScript example.",
    },
    {
      src: "/app/practice.png",
      label: "Fill the gap",
      caption: "Drag a snippet into the blank",
      alt: "A gap exercise in the iPhone app: a TypeScript function with blanks and snippet chips.",
    },
    {
      src: "/app/passed.png",
      label: "Tests pass",
      caption: "The same tests as the website decide",
      alt: "A passed gap exercise in the iPhone app, each blank outlined in green.",
    },
    {
      src: "/app/progress.png",
      label: "Progress",
      caption: "Lessons, pass rate, and every topic",
      alt: "The progress screen in the iPhone app with lessons passed, pass rate and topic bars.",
    },
    {
      src: "/app/articles.png",
      label: "Articles",
      caption: "64 explainers, diagrams included",
      alt: "The articles screen in the iPhone app, grouped by topic.",
    },
  ],
} as const;
