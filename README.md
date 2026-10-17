# Data Structures and Algorithms

A four-week TypeScript course at datastructuresandalgorithms.com. The lesson and the editor open in a vertical split, and the desk can switch to a horizontal split. Submissions and a short progress note are stored for each account.

## Layout

- `apps/web` is the Next.js app. Deploy this on Vercel.
- `apps/api` is an Express server with a GraphQL endpoint. The domain code is written with Effect: services, layers, schema decoding, and `@effect/sql-pg`.
- Postgres holds users, sessions, OAuth identities, the course, and submissions.

The course is nineteen lessons across four weeks: complexity and scanning patterns, lists through sorting, trees and graphs, then greedy search, backtracking, dynamic programming, and tries. Each lesson has one exercise. A pass marks the lesson done.

## Local development

Copy the env files, put a real `POSTGRES_PASSWORD` in `.env`, and start Postgres:

```bash
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local
npm run dev:db
```

`.env` is the only place secrets live. The Docker files do not contain them. `docker compose` overrides `POSTGRES_HOST` to `db` for the API container. For the API running on your machine, leave `POSTGRES_HOST=localhost`. `POSTGRES_PORT` is the port Postgres listens on inside the container. `POSTGRES_PUBLISH_PORT` and `API_PUBLISH_PORT` are the ports published on your machine, `5432` and `4000` by default, bound to `127.0.0.1`.

```bash
npm run dev:api
npm run dev:web
```

`npm run dev:docker` builds and runs the API and Postgres together. `npm run dev:docker:detach` does the same in the background. `npm run dev:logs` follows the container logs, and `npm run dev:down` stops them.

The app is at [http://localhost:3000](http://localhost:3000). GraphQL, including GraphiQL, is at [http://localhost:4000/graphql](http://localhost:4000/graphql).

Google and GitHub appear on sign-in and sign-up once both the client id and secret for that provider are set. Set `API_ORIGIN` to the URL the browser uses for the API, then set those variables in `.env`.

- Google redirect URI: `{API_ORIGIN}/auth/google/callback`
- GitHub callback URL: `{API_ORIGIN}/auth/github/callback`

Google needs the `openid`, `email`, and `profile` scopes. GitHub needs `read:user` and `user:email`. A verified email from either provider signs into the account that already uses that address, including an email-and-password account. The provider's own user id stays attached to that account if the address later changes. An unverified address is not linked.

## Deploy

Pushes to `main` deploy the two apps separately.

**Frontend.** The Vercel project `dsa` is connected to this GitHub repo. Its root directory is `apps/web`, and `NEXT_PUBLIC_GRAPHQL_URL` is `https://api.datastructuresandalgorithms.com/graphql`. A push to `main` that changes `apps/web` builds production and serves [https://datastructuresandalgorithms.com](https://datastructuresandalgorithms.com). `deploy/vercel-ignore.sh` skips the build when that directory did not change. Details are in `apps/web/README.md`.

**API and database.** `.github/workflows/deploy-api.yml` SSHes to the VPS when a push to `main` changes `apps/api`, the Compose files, or `deploy/`. The checkout on the server is `/var/www/dsa`. `deploy/vps.sh` runs `docker compose` with `docker-compose.prod.yml`, which publishes Postgres on `127.0.0.1:5437` and the API on `127.0.0.1:4002` so they do not collide with the other stacks. Nginx at `api.datastructuresandalgorithms.com` proxies TLS to that API port. The API applies schema and course content changes on startup. Details, including the server `.env`, are in `apps/api/README.md`.

The code runner executes student solutions inside `node:vm` with a one-second timeout and no `require`. That is enough for these exercises. It is not a hardened sandbox for arbitrary untrusted programs.

## Where Effect shows up

`apps/api/src/runtime.ts` builds one layer: config from the environment, a Postgres pool, then `Auth`, `Catalog`, `Solutions`, and `Insights`. GraphQL resolvers in `apps/api/src/graphql/schema.ts` are thin. They call `runtime.runPromise` on an Effect and turn a domain error into a GraphQL error. SQL rows are decoded with `SqlSchema` rather than cast.
