FROM node:24-slim

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY studio/package.json studio/
COPY sveltekit-app/package.json sveltekit-app/
RUN pnpm install --frozen-lockfile
