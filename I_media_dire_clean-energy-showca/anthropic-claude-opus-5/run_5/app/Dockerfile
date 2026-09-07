# syntax=docker/dockerfile:1

# ---- build stage: install every dependency and produce the SvelteKit build ----
FROM node:20-bookworm-slim AS build

WORKDIR /app

# Dependencies first so the layer caches independently of the source.
COPY package.json package-lock.json ./
RUN npm ci

# The application source. No backing service is reachable during the build,
# so nothing here touches PostgreSQL or SMTP.
COPY svelte.config.js vite.config.js ./
COPY src ./src
COPY static ./static

RUN npm run build

# Drop the dev dependencies so only the runtime tree is carried forward.
RUN npm prune --omit=dev


# ---- runtime stage ----
FROM node:20-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV PORT=4173

WORKDIR /app

# The runtime module tree, pruned in the build stage.
COPY --from=build /app/node_modules ./node_modules
# The compiled SvelteKit node build; server/index.js imports ../build/handler.js.
COPY --from=build /app/build ./build

# The Fastify API, the schema and the seed, plus package.json for "type": "module".
COPY package.json ./
COPY server ./server
COPY USER_README.md ./USER_README.md

# Reserved directories, present and empty in the image.
RUN mkdir -p /app/.browser_screenshots /app/.downloads

# Run unprivileged. The node image already ships a "node" user.
RUN chown -R node:node /app
USER node

EXPOSE 4173

# Readiness is the app's own health endpoint.
HEALTHCHECK --interval=10s --timeout=4s --start-period=40s --retries=12 \
  CMD node -e "fetch('http://127.0.0.1:4173/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Foreground, bound to 0.0.0.0 inside server/index.js. Every service address is
# read from the environment at container start: DATABASE_URL, SMTP_HOST,
# SMTP_PORT, SMTP_USER, SMTP_PASS. Migration and the idempotent seed run here.
CMD ["node", "server/index.js"]
