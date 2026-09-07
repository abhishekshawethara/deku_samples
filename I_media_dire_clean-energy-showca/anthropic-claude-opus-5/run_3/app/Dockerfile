# syntax=docker/dockerfile:1
#
# Zettajoule: SvelteKit pages and the Fastify JSON API served from one listener
# on the container-internal port 4173. No service is reachable during the build,
# so nothing here touches PostgreSQL or SMTP: the schema, the seed and every
# service address are read and applied at container start.

FROM node:20-bookworm-slim AS build
WORKDIR /app
ENV NODE_ENV=development

# Dependencies first, so a source-only change does not reinstall them.
COPY package.json package-lock.json ./
RUN npm ci

# The SvelteKit build needs the config, the source and the static directory.
COPY svelte.config.js vite.config.js ./
COPY static ./static
COPY src ./src
RUN npm run build


FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Production dependencies only. Fastify, pg and nodemailer are runtime
# dependencies; SvelteKit and Vite were only needed to produce ./build.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# The compiled SvelteKit output and the server that hosts it.
COPY --from=build /app/build ./build
COPY server ./server
COPY USER_README.md ./USER_README.md

# Reserved, and empty, at the app root.
RUN mkdir -p /app/.browser_screenshots /app/.downloads

# The port mapping is ${APP_PUBLIC_PORT}:4173. 4173 is the container-internal
# port; the outside port is the host's business, never hardcoded here.
ENV PORT=4173
EXPOSE 4173

# Run as an unprivileged user. The node image ships one.
RUN chown -R node:node /app
USER node

# Bind 0.0.0.0 (done in server/index.js), serve in the foreground, and let the
# health endpoint report readiness once the database is migrated and seeded.
HEALTHCHECK --interval=10s --timeout=5s --start-period=40s --retries=6 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||4173)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server/index.js"]
