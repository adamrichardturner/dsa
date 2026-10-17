# Data Structures and Algorithms

A four-week TypeScript course at datastructuresandalgorithms.com. The lesson and the editor open in a vertical split, and the desk can switch to a horizontal split. Submissions, stars, and a short progress note are stored for each account.

## Layout

- `apps/web` is the Next.js app. Deploy this on Vercel.
- `apps/api` is an Express server with a GraphQL endpoint. The domain code is written with Effect: services, layers, schema decoding, and `@effect/sql-pg`.
- Postgres holds users, sessions, OAuth identities, the course, and submissions.

The course is nineteen lessons across four weeks: complexity and scanning patterns, lists through sorting, trees and graphs, then greedy search, backtracking, dynamic programming, and tries. Each lesson has one exercise. A first-try pass earns three stars, a pass within three attempts earns two, and a later pass earns one.

## Local development

Copy the env files and start Postgres:

```bash
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local
docker compose up db -d
```

`.env` is the only place secrets live. The Docker files do not contain them. `docker compose` overrides `POSTGRES_HOST` to `db` for the API container. For the API running on your machine, leave `POSTGRES_HOST=localhost`.

```bash
npm run dev:api
npm run dev:web
```

The app is at [http://localhost:3000](http://localhost:3000). GraphQL, including GraphiQL, is at [http://localhost:4000/graphql](http://localhost:4000/graphql).

Sign-in and sign-up always show Google and GitHub. Set `API_ORIGIN` to the URL the browser uses for the API, then set each provider's client id and secret in `.env`.

- Google redirect URI: `{API_ORIGIN}/auth/google/callback`
- GitHub callback URL: `{API_ORIGIN}/auth/github/callback`

Google needs the `openid`, `email`, and `profile` scopes. GitHub needs `read:user` and `user:email`. A verified email from either provider signs into the account that already uses that address, including an email-and-password account. The provider's own user id stays attached to that account if the address later changes. An unverified address is not linked.

To run the API in Docker as well:

```bash
docker compose up --build
```

## Deploy

**Frontend.** Point Vercel at `apps/web` and set `NEXT_PUBLIC_GRAPHQL_URL` to the public GraphQL URL, for example `https://api.example.com/graphql`.

**API and database.** On the VPS, create `.env` from `.env.example`. Set `WEB_ORIGIN` to the Vercel origin (comma-separate more than one). Set `API_ORIGIN` to the public API origin, including `https://`. Set a real `POSTGRES_PASSWORD`. Add the Google and GitHub client variables when those buttons should appear, and register the callback URLs from the local development section. Then:

```bash
docker compose up -d --build
```

Put a TLS reverse proxy in front of port 4000. Browsers will block an HTTPS site from calling an HTTP API.

The code runner executes student solutions inside `node:vm` with a one-second timeout and no `require`. That is enough for these exercises. It is not a hardened sandbox for arbitrary untrusted programs.

## Where Effect shows up

`apps/api/src/runtime.ts` builds one layer: config from the environment, a Postgres pool, then `Auth`, `Catalog`, `Solutions`, and `Insights`. GraphQL resolvers in `apps/api/src/graphql/schema.ts` are thin. They call `runtime.runPromise` on an Effect and turn a domain error into a GraphQL error. SQL rows are decoded with `SqlSchema` rather than cast.
