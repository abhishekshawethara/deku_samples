FROM node:20-bookworm-slim

ENV NODE_ENV=production
WORKDIR /app

# Dependencies first, so a source change does not re-resolve the tree.
# devDependencies are needed at build time to compile the SvelteKit bundle.
COPY package.json package-lock.json ./
RUN npm ci --include=dev

# Application source.
COPY svelte.config.js vite.config.js ./
COPY src ./src
COPY static ./static
COPY server ./server
COPY USER_README.md ./

# Build the production bundle. No backing service is reachable during build,
# and nothing here contacts one: the build only compiles the client and server
# bundles into /app/build.
RUN npm run build

# Drop the build-only dependencies from the shipped image.
RUN npm prune --omit=dev && npm cache clean --force

# Reserved directories, present and empty in the image.
RUN mkdir -p /app/.browser_screenshots /app/.downloads

# The container-internal port this app listens on.
EXPOSE 4173

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:4173/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Runs in the foreground, binds 0.0.0.0:4173, reads DATABASE_URL, SMTP_HOST and
# SMTP_PORT from the environment at container start, applies schema and seed,
# then serves the production build. Never a dev server.
CMD ["node", "server/index.js"]
