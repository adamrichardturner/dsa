import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import mermaid from "mermaid";

const articleDirectory = dirname(fileURLToPath(import.meta.url));
const temporaryDirectory = mkdtempSync(join(tmpdir(), "dsa-articles-"));
const compiledDirectory = join(temporaryDirectory, "articles");
const snippetDirectory = join(temporaryDirectory, "snippets");
const require = createRequire(import.meta.url);

const fail = (message) => {
  throw new Error(message);
};

const compile = (rootNames, outDirectory) => {
  const compiler = join(
    articleDirectory,
    "..",
    "..",
    "node_modules",
    ".bin",
    "tsc",
  );
  const result = spawnSync(
    compiler,
    [
      "--ignoreConfig",
      "--esModuleInterop",
      "--module",
      "node16",
      "--moduleResolution",
      "node16",
      "--noEmitOnError",
      "--noUncheckedIndexedAccess",
      "--outDir",
      outDirectory,
      "--skipLibCheck",
      "--strict",
      "--target",
      "es2022",
      ...rootNames,
    ],
    { encoding: "utf8" },
  );

  if (result.error !== undefined || result.status !== 0) {
    fail(result.error?.message ?? result.stdout ?? result.stderr);
  }
};

const validateMermaidStructure = (diagram, slug) => {
  const firstLine = diagram.trimStart().split("\n")[0] ?? "";
  const supportedDirective =
    /^(?:flowchart|graph)\s+(?:TD|TB|LR|RL)|^sequenceDiagram$|^stateDiagram-v2$/;
  if (!supportedDirective.test(firstLine)) {
    fail(`Mermaid diagram in ${slug} has an unsupported directive`);
  }
};

const articleFiles = readdirSync(articleDirectory)
  .filter((fileName) => fileName.endsWith(".ts"))
  .map((fileName) => join(articleDirectory, fileName));

try {
  compile(articleFiles, compiledDirectory);

  const authoredArticles = [];
  for (const sourceFile of articleFiles) {
    const fileName = basename(sourceFile);
    if (fileName === "index.ts" || fileName === "types.ts") {
      continue;
    }

    const modulePath = join(
      compiledDirectory,
      fileName.replace(/\.ts$/, ".js"),
    );
    const moduleExports = require(modulePath);
    const articleArrays = Object.entries(moduleExports).filter(
      ([name, value]) => {
        return name.endsWith("Articles") && Array.isArray(value);
      },
    );

    if (articleArrays.length !== 1) {
      fail(`${fileName} must export exactly one article array`);
    }

    const articleArray = articleArrays[0]?.[1];
    if (!Array.isArray(articleArray)) {
      fail(`${fileName} has no readable article array`);
    }

    for (const article of articleArray) {
      authoredArticles.push({ ...article, sourceFile: fileName });
    }
  }

  const registry = require(join(compiledDirectory, "index.js"));
  const registeredArticles = registry.articles;
  if (!Array.isArray(registeredArticles)) {
    fail("The article registry did not export an articles array");
  }

  if (authoredArticles.length !== registeredArticles.length) {
    fail(
      `Found ${authoredArticles.length} authored articles but ${registeredArticles.length} registered articles`,
    );
  }

  const registeredBySlug = Object.fromEntries(
    registeredArticles.map((article) => [article.slug, article]),
  );
  const slugOwners = {};
  const keywordOwners = {};

  for (const article of authoredArticles) {
    const previousSlugOwner = slugOwners[article.slug];
    if (previousSlugOwner !== undefined) {
      fail(
        `Duplicate slug "${article.slug}" in ${previousSlugOwner} and ${article.sourceFile}`,
      );
    }
    slugOwners[article.slug] = article.sourceFile;

    if (registeredBySlug[article.slug] !== article) {
      const registered = registeredBySlug[article.slug];
      if (registered === undefined || registered.body !== article.body) {
        fail(`${article.slug} is missing from the registry or was overwritten`);
      }
    }

    for (const keyword of article.keywords) {
      const normalised = keyword.toLowerCase();
      const previousKeywordOwner = keywordOwners[normalised];
      if (previousKeywordOwner !== undefined) {
        fail(
          `Duplicate keyword "${keyword}" in ${previousKeywordOwner} and ${article.slug}`,
        );
      }
      keywordOwners[normalised] = article.slug;
    }
  }

  const snippets = [];
  const diagrams = [];
  const codeFence = /```ts\n([\s\S]*?)```/g;
  const mermaidFence = /```mermaid\n([\s\S]*?)```/g;
  const outputEvidence =
    /(?:Expected output|Output:|prints?|output is|```text|console\.log\([^\n]*(?:\/\/|\n\/\/))/i;

  for (const article of authoredArticles) {
    for (const match of article.body.matchAll(codeFence)) {
      const code = match[1];
      if (code === undefined) {
        continue;
      }

      const followingText = article.body.slice(
        (match.index ?? 0) + match[0].length,
        (match.index ?? 0) + match[0].length + 400,
      );
      if (
        !code.includes("console.log") ||
        !outputEvidence.test(`${code}\n${followingText}`)
      ) {
        fail(`${article.slug} has a runnable snippet without explicit output`);
      }

      snippets.push({ article, code });
    }

    for (const match of article.body.matchAll(mermaidFence)) {
      const diagram = match[1];
      if (diagram !== undefined) {
        diagrams.push({ article, diagram });
      }
    }
  }

  const snippetFiles = snippets.map((snippet, index) => {
    const fileName = join(
      snippetDirectory,
      `${String(index + 1).padStart(3, "0")}-${snippet.article.slug}.ts`,
    );
    mkdirSync(snippetDirectory, { recursive: true });
    writeFileSync(fileName, `export {};\n${snippet.code}`);
    return fileName;
  });

  compile(snippetFiles, join(temporaryDirectory, "compiled-snippets"));

  for (const snippetFile of snippetFiles) {
    const outputFile = join(
      temporaryDirectory,
      "compiled-snippets",
      basename(snippetFile).replace(/\.ts$/, ".js"),
    );
    const result = spawnSync(process.execPath, [outputFile], {
      encoding: "utf8",
      timeout: 5_000,
    });

    if (result.error !== undefined || result.status !== 0) {
      fail(
        `Snippet ${basename(snippetFile)} failed:\n${result.error?.message ?? result.stderr}`,
      );
    }
  }

  let mermaidBrowserFallbacks = 0;
  mermaid.initialize({ startOnLoad: false });
  for (const { article, diagram } of diagrams) {
    try {
      await mermaid.parse(diagram);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.startsWith("DOMPurify.")) {
        validateMermaidStructure(diagram, article.slug);
        mermaidBrowserFallbacks += 1;
        continue;
      }
      fail(`Mermaid diagram in ${article.slug} failed: ${message}`);
    }
  }

  console.log(
    JSON.stringify(
      {
        articles: authoredArticles.length,
        snippets: snippets.length,
        mermaidDiagrams: diagrams.length,
        mermaidBrowserFallbacks,
      },
      null,
      2,
    ),
  );
} finally {
  rmSync(temporaryDirectory, { force: true, recursive: true });
}
