# Web

The Next.js app for [datastructuresandalgorithms.com](https://datastructuresandalgorithms.com). It renders the course desk, the articles, and the account pages. Course data, submissions, and accounts come from the API over GraphQL. Articles are TypeScript modules in this app.

How to run the API and Postgres beside this app, and how a push to `main` ships both, is in the [repository README](../../README.md).

## Routes

| Path | What it renders |
| --- | --- |
| `/` | Landing page, with the syllabus, and FAQ structured data |
| `/course` | Syllabus for the signed-in account |
| `/course/[slug]` | One lesson: prose, exercise, editor, and terminal |
| `/progress` | Lessons completed, pass rate, stars, skipped lessons, and topics still to pass |
| `/articles` | Article index, grouped by topic |
| `/articles/[slug]` | One explainer |
| `/sign-in`, `/sign-up` | Email and password, plus Google and GitHub when the API has them configured |
| `/forgot-password`, `/reset-password` | Password reset |
| `/auth/callback` | Redeems the one-time OAuth code and stores the session |
| `/settings` | Name, email, avatar, password, and account deletion |
| `/privacy`, `/terms` | Legal pages |

`app/sitemap.ts` lists the landing page, the articles, and the legal pages. `app/robots.ts` allows indexing. Course pages stay behind an account, so they are left off the sitemap.

`/course` and `/course/[slug]` hide their content below 1024px and show a notice to open the course on a laptop or desktop. The rest of the site still renders.

## Data

`lib/auth.tsx` builds a urql client against `NEXT_PUBLIC_GRAPHQL_URL`. The default, when that variable is unset, is `http://localhost:4000/graphql`. Every operation is a string in `lib/operations.ts`, and the result shapes are the types in `lib/types.ts`.

Sign-in stores the bearer token and the user in `localStorage` under `kiln.token` and `kiln.user`. urql sends the token as `Authorization: Bearer`. `useRequireUser` sends a signed-out visitor to sign-in. The account menu calls the API `signOut` mutation, then clears that storage. On load, the provider asks `me` and drops the stored session when the API no longer recognises it.

OAuth does not talk to Google or GitHub from the browser. A button navigates to `{API origin}/auth/google` or `/auth/github`. The API finishes the provider handshake and redirects back to `/auth/callback` with a one-time code. The page redeems that code for a session.

## The desk

`components/workspace.tsx` is the lesson. It loads `lesson(slug)`, then:

- Renders the lesson markdown, with Mermaid diagrams and tooltips on the terms that have an article (`lib/lesson-keywords.ts`).
- Opens Monaco with the latest draft, or the passing solution, or the starter.
- Saves the draft about 1.5 seconds after typing stops, and retries a failed save. `components/progress-saved.tsx` shows when the save landed.
- Runs the function with `runCode`, and submits it with `submitSolution`. The terminal prints the lines the API returns.
- Formats the buffer in the browser with Prettier's TypeScript parser (`lib/format-typescript.ts`).

The split is vertical or horizontal, remembered in `localStorage` as `dsa.split-layout.columns` or `dsa.split-layout.stacked`. Editor themes are Kiln, Dark+, Light+, Monokai, Dracula, Solarized Dark, and GitHub Dark (`lib/editor-themes.ts`). The site theme is separate: light, dark, or the system preference, applied by a small script in `app/layout.tsx` before paint so the first frame matches `dsa.theme`.

The syllabus sidebar reads `modules`. With audit mode off, a lesson is available when every earlier lesson has been passed or skipped. A skip is not a pass and earns no stars. Audit mode, stored on the account, opens every lesson. Stars on a lesson are the stars earned on its exercise. A new account sees a short introduction once; `onboardingCompleted` on the user stops it from repeating.

## Articles

Articles are not loaded from the API. Each file under `lib/articles/` exports a list built with `defineArticle`, and `lib/articles/index.ts` concatenates those lists in topic order. A page looks up one slug from that module.

An article body is markdown. A `mermaid` fence becomes a diagram. A TypeScript fence can be run. Suggested reading at the foot of a lesson points at the articles for that lesson's keywords.

## Layout of this app

```text
app/                  routes, sitemap, robots
components/           desk, shell, account forms, and the shadcn-style UI kit
components/ui/        shared controls
hooks/                draft saving, and the mobile viewport check
lib/articles/         article content
lib/auth.tsx          session and the urql client
lib/operations.ts     GraphQL documents
lib/site.ts           name, domain, and the social image
```

Styling is Tailwind. The UI kit follows the shadcn pattern on Base UI. Display type is Fraunces, body type is Geist, and code is JetBrains Mono, loaded in the root layout.

## Local setup

From this directory:

```bash
cp .env.example .env.local
npm run dev
```

From the repository root, `npm run dev:web` is the same command. The app is at [http://localhost:3000](http://localhost:3000). The API has to be running for sign-in, the syllabus, and the desk. Start it with the steps in the [repository README](../../README.md).

`.env.local` is not committed. The value that matters is:

```bash
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
```

Next inlines `NEXT_PUBLIC_*` at build time. Restart `next dev` after changing it, and set the production value in Vercel before a production build. A change to the variable does not reach an already built deployment until that deployment is rebuilt.

```bash
npm run typecheck
npm run build
```

## Deployment

The Vercel project is `dsa`, in the `adamrichardturners-projects` team. The GitHub repository `adamrichardturner/dsa` is connected. The root directory is `apps/web`. The production branch is `main`.

`NEXT_PUBLIC_GRAPHQL_URL` on Vercel is `https://api.datastructuresandalgorithms.com/graphql`.

A push to `main` deploys this app when `apps/web` changed:

1. Vercel receives the push and runs `deploy/vercel-ignore.sh` from the repository.
2. The script exits 0 to skip the build and 1 to build. When Vercel has no previous commit for the branch, the script exits 1, so the first deployment always builds.
3. When the working directory contains `next.config.ts`, the script diffs that directory. The Vercel root is `apps/web`, so a push that only changes the API is skipped.
4. A build that proceeds runs `next build` and serves [https://datastructuresandalgorithms.com](https://datastructuresandalgorithms.com). `www` redirects there.

The API only accepts the origins listed in its `WEB_ORIGIN`. The production site origins are already listed. A preview deployment on a new Vercel URL cannot sign in until that origin is added on the server and the API is restarted. See [apps/api/README.md](../api/README.md).
