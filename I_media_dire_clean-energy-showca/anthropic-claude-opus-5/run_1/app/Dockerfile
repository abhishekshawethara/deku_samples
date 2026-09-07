# syntax=docker/dockerfile:1

# ---------- build ----------
# No backing service is reachable during the build, so nothing here touches the
# database or the mail server: this stage only compiles the SvelteKit output.
FROM node:20-bookworm-slim AS build

WORKDIR /app

# Install every dependency, including the dev ones the build needs.
COPY package.json package-lock.json ./
RUN npm ci

# Source needed to produce build/
COPY svelte.config.js vite.config.js ./
COPY src ./src
COPY server ./server

RUN npm run build

# Drop the dev dependencies so only the runtime tree is carried forward.
RUN npm prune --omit=dev


# ---------- run ----------
FROM node:20-bookworm-slim AS runtime

ENV NODE_ENV=production
# The container-internal port the brief names. APP_PUBLIC_PORT is what the
# outside world maps onto it and is never referenced here.
ENV PORT=4173

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY --from=build /app/package.json ./package.json
COPY server ./server
COPY USER_README.md ./USER_README.md

# Reserved and empty in the image; the local copies are excluded by .dockerignore.
RUN mkdir -p .browser_screenshots .downloads

EXPOSE 4173

# DATABASE_URL, SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS are read from the
# environment at container start, never baked in. The entry point applies the
# schema and the idempotent seed, then serves the production build in the
# foreground on 0.0.0.0.
CMD ["node", "server/index.js"]
