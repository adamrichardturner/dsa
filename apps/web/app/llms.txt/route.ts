import { articlesForTopic } from "@/lib/articles";
import {
  articleCategories,
  articleCategoryPath,
} from "@/lib/articles/categories";
import { siteName, siteUrl } from "@/lib/site";

export const dynamic = "force-static";

const line = (label: string, path: string, detail: string): string => {
  return `- [${label}](${siteUrl}${path}): ${detail}`;
};

export function GET(): Response {
  const lines: string[] = [
    `# ${siteName}`,
    "",
    `> Data structures and algorithms, practiced in TypeScript, at ${siteUrl}`,
    "",
    "Data structures and algorithms are how a program stores values and the steps it uses to work on those values. This site is a free four-week TypeScript course: the lesson sits beside a code editor, tests run on submit, and progress stays on the account. There is no payment and no trial.",
    "",
    "## Canonical",
    "",
    siteUrl,
    "",
    "## What the course covers",
    "",
    "- Week 1: complexity, arrays, hash maps, two pointers, sliding windows",
    "- Week 2: linked lists, stacks, queues, recursion, binary search, merge sort",
    "- Week 3: trees, binary search trees, heaps, graphs",
    "- Week 4: greedy choices, backtracking, dynamic programming, tries",
    "",
    "Short lessons, with more than one exercise on each, and a follow-up step after every idea. Written for people who already write TypeScript.",
    "",
    "## Answers",
    "",
    "Data structures and algorithms are the arrangements of values (arrays, hash maps, trees, graphs) and the procedures that use them (search, sort, traversal, dynamic programming).",
    "",
    "The course is 100% free and takes four weeks. A first passing submission earns three stars.",
    "",
    "## Articles",
    "",
    line(
      "All articles",
      "/articles",
      "Index of every explainer, grouped by category.",
    ),
    "",
    "## Categories",
    "",
  ];

  for (const category of articleCategories) {
    lines.push(
      line(category.title, articleCategoryPath(category), category.summary),
    );
  }

  lines.push("", "## Article pages", "");

  for (const category of articleCategories) {
    lines.push(`### ${category.title}`, "");
    for (const item of articlesForTopic(category.topic)) {
      lines.push(line(item.title, `/articles/${item.slug}`, item.summary));
    }
    lines.push("");
  }

  return new Response(`${lines.join("\n").trim()}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
