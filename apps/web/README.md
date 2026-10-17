# Web

Next.js app. The course UI, editor, and account pages live here. Data comes from the API over GraphQL.

## Local

```bash
cp .env.example .env.local
npm run dev
```

From the repo root, `npm run dev:web` is the same command. The app is at [http://localhost:3000](http://localhost:3000).

`.env.local` is not committed. The value that matters is:

```bash
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
```

Next inlines `NEXT_PUBLIC_*` at build time. Restart `next dev` after changing it.

## Production

The Vercel project is `dsa`, in the `adamrichardturners-projects` team. The GitHub repo `adamrichardturner/dsa` is connected, the root directory is `apps/web`, and the production branch is `main`.

`NEXT_PUBLIC_GRAPHQL_URL` on Vercel is `https://api.datastructuresandalgorithms.com/graphql`.

A push to `main` deploys this app when `apps/web` changed. `deploy/vercel-ignore.sh` exits 0 to skip the build and 1 to build. The first deployment of a branch always builds. Production is served at [https://datastructuresandalgorithms.com](https://datastructuresandalgorithms.com), and `www` redirects there.

The API only accepts the origins listed in its `WEB_ORIGIN`. The production site origins are already listed. A Vercel preview URL is not, until that origin is added on the server.
