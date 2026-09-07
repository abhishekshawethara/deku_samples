# syntax=docker/dockerfile:1

########## build stage ##########
FROM node:20-bookworm-slim AS build

WORKDIR /app

# Install every dependency, dev included: vite and the SvelteKit plugin are needed
# to produce the production build. No backing service is reachable at build time,
# and nothing here contacts one.
COPY package.json package-lock.json ./
RUN npm ci

# Sources needed to build the client and server bundles.
COPY svelte.config.js vite.config.js ./
COPY src ./src
COPY static ./static

RUN npm run build

# Drop the dev dependencies so only what the runtime needs is carried forward.
RUN npm prune --omit=dev


########## runtime stage ##########
FROM node:20-bookworm-slim AS runtime

ENV NODE_ENV=production \
    PORT=4173

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY package.json ./
COPY server ./server
COPY USER_README.md ./USER_README.md

# Reserved, and empty, at the app root.
RUN mkdir -p /app/.browser_screenshots /app/.downloads

# The container-internal port this brief names. The outside mapping is
# ${APP_PUBLIC_PORT}:4173 and is not this image's business.
EXPOSE 4173

# Every service address is read from the environment at container start.
# The entrypoint migrates, seeds idempotently, then serves in the foreground
# on 0.0.0.0 as PID 1.
CMD ["node", "server/index.js"]
