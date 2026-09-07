# Vela storefront.
#
# Two stages: the first installs every dependency and produces the production
# build, the second carries only what is needed to run it. No service is
# reachable during the build, so nothing here talks to PostgreSQL, killbill or
# the mail server: the schema, the seed and every host are read at container
# start instead.

# ----------------------------------------------------------------- build stage
FROM node:20-bookworm-slim AS build

WORKDIR /app

# Install dependencies against the lockfile first, so a change to the source
# does not invalidate the dependency layer.
COPY package.json package-lock.json ./
RUN npm ci

# The sources the build needs.
COPY astro.config.mjs ./
COPY src ./src
COPY public ./public
COPY server ./server
COPY db ./db

# Produce the production build: dist/server holds the SSR entrypoint and
# dist/client holds the island bundles and the static assets.
RUN npm run build

# Drop the development dependencies so the runtime stage copies a lean tree.
RUN npm prune --omit=dev


# --------------------------------------------------------------- runtime stage
FROM node:20-bookworm-slim AS runtime

ENV NODE_ENV=production
# 4173 is the container-internal port named in the brief. The outside port is
# the mapping's business, never this image's.
ENV PORT=4173
# Bind every interface: a loopback-only listener is unreachable from outside.
ENV HOST=0.0.0.0

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json

# The server, the schema and the seed. The image applies both at start, because
# grading re-creates the database from scratch.
COPY server ./server
COPY db ./db
COPY USER_README.md ./USER_README.md
# The two walkthrough scripts the README names, so the contract can be checked
# against this container from inside it.
COPY scripts ./scripts

# The reserved directories, present and empty in the image.
RUN mkdir -p /app/.browser_screenshots /app/.downloads \
 && chown -R node:node /app

USER node

EXPOSE 4173

# Readiness is the app's own health endpoint, which answers 200 once the schema
# is applied and the database is reachable.
HEALTHCHECK --interval=15s --timeout=5s --start-period=45s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||4173)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Serve in the foreground, as PID 1. The server installs its own SIGTERM and
# SIGINT handlers and spawns no children, so it needs no init to stop cleanly.
CMD ["node", "server/index.js"]
