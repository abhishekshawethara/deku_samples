#!/bin/sh
# Execute the Dockerfile by hand, step by step, in a clean tree.
# No Docker daemon is available here, so this is how the image is proved.
set -x
SIM=/tmp/dockersim
rm -rf "$SIM"
mkdir -p "$SIM/build-stage" "$SIM/runtime"

# ---- build stage ----
cd "$SIM/build-stage" || exit 1
cp /app/package.json /app/package-lock.json ./ || exit 1
npm ci > /tmp/sim-npmci.log 2>&1 || { echo "npm ci FAILED"; tail -20 /tmp/sim-npmci.log; exit 1; }
cp /app/svelte.config.js /app/vite.config.js ./ || exit 1
cp -r /app/src ./src || exit 1
cp -r /app/static ./static || exit 1
npm run build > /tmp/sim-build.log 2>&1 || { echo "npm run build FAILED"; tail -30 /tmp/sim-build.log; exit 1; }
npm prune --omit=dev > /tmp/sim-prune.log 2>&1 || { echo "prune FAILED"; exit 1; }

# ---- runtime stage ----
cd "$SIM/runtime" || exit 1
cp -r "$SIM/build-stage/node_modules" ./node_modules || exit 1
cp -r "$SIM/build-stage/build" ./build || exit 1
cp /app/package.json ./ || exit 1
cp -r /app/server ./server || exit 1
cp /app/USER_README.md ./USER_README.md || exit 1
mkdir -p ./.browser_screenshots ./.downloads
set +x

echo ""
echo "=== runtime tree ==="
ls -a "$SIM/runtime"
echo ""
echo "=== starting it exactly as CMD does, NODE_ENV=production PORT=4173 on a spare port ==="
cd "$SIM/runtime" || exit 1
NODE_ENV=production PORT=4998 setsid node server/index.js > /tmp/sim-run.log 2>&1 &
sleep 9
for p in /api/health / /solutions /solutions/steel /news /news/first-module-order /careers /account /faq; do
  printf '%-34s %s\n' "$p" "$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:4998$p")"
done
echo ""
echo "=== bound interfaces ==="
grep -a listening /tmp/sim-run.log
echo ""
echo "=== errors in the log, if any ==="
grep -ai '"level":50\|"level":60' /tmp/sim-run.log | head -5
