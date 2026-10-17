# API

Express and GraphQL Yoga. Domain code is Effect. Postgres is reached through `@effect/sql-pg`.

## Local

From the repo root, start Postgres and the API on the host:

```bash
npm run dev:db
npm run dev:api
```

The API reads the repo-root `.env`. `POSTGRES_HOST=localhost` is correct for this process. GraphQL is at [http://localhost:4000/graphql](http://localhost:4000/graphql). `GET /health` returns `{ "ok": true }`.

`npm run dev:docker` runs this app in a container next to Postgres. Compose sets `POSTGRES_HOST=db` for that container. The container still listens on `API_PORT` (4000). Your machine reaches it through `API_PUBLISH_PORT`.

On startup the process runs `prepareDatabase`: it creates any missing tables, applies additive column changes, and upserts the course. A new lesson or column in that list is applied the next time the process boots. It does not drop columns or rewrite submitted code.

## Production

The public origin is `https://api.datastructuresandalgorithms.com`. Nginx on the VPS terminates TLS and proxies to `127.0.0.1:4002`. The site config lives in `deploy/nginx/api.datastructuresandalgorithms.com`.

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

`WEB_ORIGIN` is a comma-separated list of browser origins allowed to call GraphQL. Add a Vercel preview origin here when that preview should be able to sign in.

Account and password email is sent through Resend from `noreply@datastructuresandalgorithms.com`. That address is fixed in the API. `RESEND_API_KEY` is the only mail setting.

OAuth callbacks, once the client ids and secrets are filled in:

- Google redirect URI: `https://api.datastructuresandalgorithms.com/auth/google/callback`
- GitHub callback URL: `https://api.datastructuresandalgorithms.com/auth/github/callback`

A push to `main` that changes this app, the Compose files, or `deploy/` runs `.github/workflows/deploy-api.yml`. The workflow pulls `/var/www/dsa` and runs `deploy/vps.sh`. That script uses `docker-compose.prod.yml`, so Postgres is published on `127.0.0.1:5437` and the API on `127.0.0.1:4002`. Schema changes run when the new container starts.

`docker-compose.yml` by itself is the local file. Do not point it at the production ports on your machine.
