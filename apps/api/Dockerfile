FROM node:24-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN chown -R node:node /app

USER node

EXPOSE 4000

CMD ["node", "--import", "tsx", "src/index.ts"]
