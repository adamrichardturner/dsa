# API

The course's backend. Express serves HTTP, GraphQL Yoga serves the schema, and the domain is written in Effect. Postgres is reached through `@effect/sql-pg`.

This process owns accounts, the course catalogue, submissions, and the code runner. The web app is a client of it.

How to run this API beside the web app, and how a push to `main` ships both, is in the [repository README](../../README.md).

## HTTP

`src/index.ts` boots the Effect runtime, prepares the database, then listens on `API_PORT` (4000 by default).

| Method and path | Purpose |
| --- | --- |
| `GET /health` | `{ "ok": true }` |
| `GET /auth/:provider` | Starts Google or GitHub sign-in and redirects to the provider |
| `GET /auth/:provider/callback` | Finishes the provider handshake and redirects to the web app |
| `GET`, `POST /graphql` | GraphQL. Opening it in a browser loads GraphiQL unless `NODE_ENV` is `production` |

CORS allows the origins in `WEB_ORIGIN`. GraphQL reads the session from `Authorization: Bearer`.

Yoga is configured with `maskedErrors: false`, so a domain error message reaches the client. Write those messages as something a learner can act on.

`runSnippet` is public. TypeScript fences in the reading, the articles, and the written solutions call it. The exercise terminal uses `runCode`, which requires a session.

## Effect services

`src/runtime.ts` builds one layer: config from the environment, a Postgres pool with up to 10 connections, then the domain services.

Resolvers in `src/graphql/schema.ts` stay thin. They call `runEffect`, which provides the bearer token as `RequestAuth`, and they map a domain error onto a GraphQL error.

SQL rows are decoded with `SqlSchema`.

| Service | Responsibility |
| --- | --- |
| `AppConfig` | Environment. Secrets stay in `Redacted`. |
| `Auth` | Sign-up, email verification, sign-in, sessions, profile, password reset, account deletion |
| `Mail` | Resend messages for verification, password reset, and password change |
| `OAuth` | Google and GitHub, including the one-time code the browser redeems |
| `Catalog` | Modules, lessons, and whether the next lesson is open |
| `Solutions` | Drafts, runs, and submissions |
| `Insights` | Progress totals, pass rate, and the topics still to pass |
| `Admin` | The maintainer overview, and deleting another account |

`src/domain/errors.ts` is the tagged error set (`Unauthorized`, `BadInput`, `NotFound`, `Unexpected`, and the rest).

Match on the tag at the boundary. A resolver should leave raw driver errors inside the domain.

### Queries and mutations

| Query | Returns |
| --- | --- |
| `oauthProviders` | `"google"` and `"github"`, for the providers that have both a client id and a secret |
| `me` | The current user, or null when the session is missing |
| `modules` | The syllabus, with each lesson marked completed, skipped, and available |
| `lesson(slug)` | Reading, exercises, starter code, draft, and passing solution |
| `analytics` | Lessons completed, pass rate, skips, and topic totals |
| `adminOverview` | Account and progress totals for the maintainer |

Sign-up and session mutations are `signUp`, `verifyEmail`, `resendVerificationEmail`, `signIn`, `redeemOAuthCode`, and `signOut`.

Profile mutations are `completeOnboarding`, `setAuditMode`, `updateProfile`, `changePassword`, `requestPasswordReset`, `resetPassword`, and `deleteAccount`.

Desk mutations are `saveProgress`, `runCode`, `submitSolution`, and `skipLesson`. `runSnippet` is the public snippet runner. `adminDeleteAccount` is limited to the maintainer.

## Accounts

Passwords are stored with scrypt. A password is at least 8 characters.

Sign-in creates a session that lasts 30 days. The database stores the SHA-256 of the token, so a dump of `sessions` does not contain a usable bearer token.

Password-reset and email-verification tokens are stored the same way, and each verification token can be consumed once. A verification link lasts 24 hours.

Email and password sign-up returns the address and sends a verification link. The course stays closed until that link is used.

`verifyEmail` then issues the session.

Google and GitHub appear once both the client id and the secret for that provider are set. The browser is sent to `/auth/google` or `/auth/github` with the web origin.

The API keeps a short-lived OAuth state, including the PKCE verifier, then exchanges the provider code. The callback redirects to `{web origin}/auth/callback` with a one-time code.

`redeemOAuthCode` turns that code into a session and accepts it once.

A verified email from either provider signs into the account that already uses that address, including an email-and-password account.

The provider's own user id stays attached to that account if the address later changes.

The API links a provider only when that provider has verified the email.

Account mail is sent through Resend from `Data Structures and Algorithms <noreply@datastructuresandalgorithms.com>`. That address is fixed in `src/domain/mail.ts`.

`RESEND_API_KEY` is the only mail setting. With the key empty, verification and reset mail are not sent.

## Course and submissions

Lesson prose, starter code, and tests live in `src/content/week1.ts` through `week4.ts`.

`src/content/course.ts` runs them through `expandCourse`, which keeps every original lesson id, swaps in the shorter reading, adds the extra exercises, and inserts one follow-up lesson after each.

On startup `prepareDatabase` creates any missing tables, applies additive column changes, drops the retired `submissions.stars` column, and upserts modules, lessons, and problems.

A new lesson or column in that list is applied the next time the process boots. Submitted code and drafts are left as they are.

Removing a lesson from the seed leaves its row in place.

Lessons open in order unless the account has audit mode on. `Catalog` marks a lesson available when audit mode is on, or when every earlier lesson has been passed or skipped.

A skip is stored on `lesson_skips` and leaves the exercises unsolved. `assertProblemOpen` rejects a draft, a run, or a submit against a lesson that is still closed.

New accounts have `onboarding_completed` false until they finish the introduction. Existing accounts default to finished.

`Solutions.submit` runs the hidden and public tests and stores the submission. A pass marks the exercise solved. Drafts are capped at 100,000 characters.

## The runner

`src/domain/runner.ts` compiles the submission with Sucrase and runs it in `node:vm` with a ten-second timeout.

`require`, imports, `process`, `globalThis`, `eval`, and the `Function` constructor are rejected before the script runs.

A problem can also list `disallow` snippets. That is how a lesson can refuse a nested loop when the point of the exercise is a single pass.

Tests compare with `exact`, or with `set` when order does not matter.

Public tests are the examples shown beside the prompt. Hidden tests are still executed.

The learner sees the name, the expected value, and the received value for each result.

A problem can also pin a per-test timeout, mark arguments that must stay unchanged, and require an array return to be a fresh array.

Those checks live on the seed test, next to `expected`.

This runner is sized for the exercises in the course: a short timeout and a denylist around `node:vm`.

## Layout of this app

```text
src/index.ts           process entry, listen, shutdown
src/config.ts          AppConfig from the environment
src/runtime.ts         the Effect layer and ManagedRuntime
src/http/server.ts     Express, CORS, health, Yoga
src/http/oauth.ts      provider redirects
src/graphql/schema.ts  queries and mutations
src/domain/            Auth, OAuth, Catalog, Solutions, Insights, Mail, Admin, the runner
src/content/           the four weeks, plus expand, follow-ups, and stress tests
src/db/prepare.ts      tables and the course upsert
```

The image is `node:24-bookworm-slim`. The container runs as `node` and starts with `node --import tsx src/index.ts`.

Port 4000 is what the process binds. The published port on the host is separate.

## Local setup

The process reads the repository-root `.env`, via `src/load-env.ts`. From the repository root:

```bash
cp .env.example .env
npm run dev:db
npm run dev:api
```

`POSTGRES_HOST=localhost` is correct for the API on your machine. GraphQL, including GraphiQL, is at [http://localhost:4000/graphql](http://localhost:4000/graphql).

`npm run dev:docker` runs this app in a container next to Postgres. Compose sets `POSTGRES_HOST=db` for that container.

The container still listens on `API_PORT` (4000). Your machine reaches it through `API_PUBLISH_PORT`. Both published ports bind to `127.0.0.1`.

Required variables are `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB`. The rest have defaults, listed in `.env.example`:

```bash
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_PUBLISH_PORT=5432
API_PORT=4000
API_PUBLISH_PORT=4000
API_ORIGIN=http://localhost:4000
WEB_ORIGIN=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
RESEND_API_KEY=
```

`WEB_ORIGIN` is a comma-separated list. `API_ORIGIN` is the URL the browser uses for the API, with no trailing slash.

OAuth redirect URIs, once the client ids and secrets are filled in:

- Google redirect URI: `{API_ORIGIN}/auth/google/callback`
- GitHub callback URL: `{API_ORIGIN}/auth/github/callback`

Google needs the `openid`, `email`, and `profile` scopes. GitHub needs `read:user` and `user:email`.

```bash
npm run typecheck
npm test
```

`npm test` runs the runner, gating, mail, OAuth plan, email verification, admin, insights, course seed, and public-error tests.

## Deployment

The public origin is `https://api.datastructuresandalgorithms.com`. Nginx on the VPS terminates TLS and proxies to `127.0.0.1:4002`.

The site config lives in `deploy/nginx/api.datastructuresandalgorithms.com`. Certbot manages the certificates.

`/healthz` on Nginx returns `ok` without reaching the container. The app's own check is `GET /health`.

A push to `main` that changes this app, the Compose files, `deploy/`, or `.github/workflows/deploy-api.yml` runs that workflow. It can also be started by hand from GitHub.

1. The workflow SSHes to the VPS. If `/var/www/dsa` is not a git checkout yet, it clones `git@github.com:adamrichardturner/dsa.git` there.
2. It fetches `origin/main` and resets the checkout to that commit.
3. It stops when `/var/www/dsa/.env` is missing.
4. `deploy/vps.sh` takes a lock at `/tmp/dsa-deploy.lock`, then runs `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build --remove-orphans --wait`.

`docker-compose.prod.yml` publishes Postgres on `127.0.0.1:5437` and the API on `127.0.0.1:4002`.

Inside the containers the API still listens on 4000 and Postgres on 5432.

`POSTGRES_PORT` in the server `.env` stays `5432` and `POSTGRES_HOST` stays `localhost` for any host process.

The API container overrides `POSTGRES_HOST` to `db`.

Schema changes run when the new container starts.

`docker-compose.yml` by itself is the local file. Leave the production ports off your machine.

`/var/www/dsa/.env` is not in git. It needs:

```bash
POSTGRES_USER=dsa
POSTGRES_PASSWORD=<secret>
POSTGRES_DB=dsa
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
API_PORT=4000
API_ORIGIN=https://api.datastructuresandalgorithms.com
WEB_ORIGIN=https://datastructuresandalgorithms.com,https://www.datastructuresandalgorithms.com,https://dsa-wheat-phi.vercel.app,https://dsa-adamrichardturners-projects.vercel.app,https://dsa-git-main-adamrichardturners-projects.vercel.app
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
RESEND_API_KEY=
```

Add a Vercel preview origin to `WEB_ORIGIN` when that preview should be able to sign in, then redeploy so the process picks up the new list.

Production OAuth callbacks:

- Google redirect URI: `https://api.datastructuresandalgorithms.com/auth/google/callback`
- GitHub callback URL: `https://api.datastructuresandalgorithms.com/auth/github/callback`
