# syntax=docker/dockerfile:1

# ---- build stage: produce the server-rendered pages ----
FROM node:20-bookworm-slim AS build
WORKDIR /app

# every dependency, dev included, so the SvelteKit build can run
COPY package.json package-lock.json ./
RUN npm ci

COPY svelte.config.js vite.config.js ./
COPY src ./src
COPY static ./static

# writes /app/build, the adapter-node output the server imports at runtime.
# No backing service is reachable during a build and none is contacted here.
RUN npm run build


# ---- runtime stage ----
FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4173

# runtime dependencies only; both pg and bcryptjs are pure JavaScript,
# so no compiler or native toolchain is needed in this stage
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# the built pages and the API server
COPY --from=build /app/build ./build
COPY server ./server
COPY USER_README.md ./USER_README.md

# reserved directories, present and empty
RUN mkdir -p /app/.browser_screenshots /app/.downloads && chown -R node:node /app

# The process waits for PostgreSQL, applies the schema, seeds idempotently,
# then serves the pages and the /api routes from one listener on 0.0.0.0:4173.
# Every service address is read from the environment at container start.
EXPOSE 4173
USER node
CMD ["node", "server/index.js"]
