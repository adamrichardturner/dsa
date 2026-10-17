#!/bin/sh
set -eu

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "Missing .env in $(pwd). Create it on the server before deploying." >&2
  exit 1
fi

lock="/tmp/dsa-deploy.lock"
if command -v flock >/dev/null 2>&1; then
  exec 9>"$lock"
  flock 9
fi

docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build --remove-orphans --wait
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
