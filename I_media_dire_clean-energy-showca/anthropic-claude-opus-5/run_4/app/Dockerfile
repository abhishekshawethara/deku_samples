# Zettajoule. Node 20, SvelteKit built to a Node adapter and served by the same
# Fastify listener that carries the /api routes, on the container-internal port
# 4173. No service is reachable during the build: the schema, the seed and every
# service address are applied at container start, from the environment.

FROM node:20-bookworm-slim AS build
WORKDIR /app

ENV npm_config_update_notifier=false

# Install with the lockfile so the build is reproducible. devDependencies are
# needed here because Vite and the SvelteKit compiler run at build time.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Sources the build needs. .dockerignore keeps screenshots, the local
# node_modules and the previous build out of the context.
COPY svelte.config.js vite.config.js ./
COPY src ./src
COPY static ./static

RUN npm run build

# Drop to production dependencies only, for copying into the runtime stage.
RUN npm prune --omit=dev


FROM node:20-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PORT=4173 \
    npm_config_update_notifier=false

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY package.json ./
COPY server ./server
COPY USER_README.md ./USER_README.md

# Reserved, and empty, at the app root.
RUN mkdir -p /app/.browser_screenshots /app/.downloads

# The container-internal port this app listens on. The outside mapping is
# ${APP_PUBLIC_PORT}:4173 and is set by the runner, never here.
EXPOSE 4173

# Run as the unprivileged user the base image already provides.
USER node

# Readiness is the app's own health endpoint.
HEALTHCHECK --interval=15s --timeout=5s --start-period=40s --retries=10 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||4173)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Foreground, bound to 0.0.0.0 by the server itself. This process applies the
# schema and the idempotent seed before it begins listening.
CMD ["node", "server/index.js"]
