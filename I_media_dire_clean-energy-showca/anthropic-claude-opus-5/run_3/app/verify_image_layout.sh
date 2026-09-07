#!/bin/bash
# No Docker daemon here, so reproduce the runtime stage by hand: copy in exactly
# the files the Dockerfile COPYs, install production dependencies only, and run
# the result the way the image's CMD does.
set -u
STAGE=/tmp/zj-image
DB="postgresql://deku_app:deku-local-dev@postgres:5432/deku"

rm -rf "$STAGE"
mkdir -p "$STAGE"

echo "=== files the runtime stage receives ==="
cp /app/package.json /app/package-lock.json "$STAGE"/
cp -r /app/build "$STAGE"/build
cp -r /app/server "$STAGE"/server
cp /app/USER_README.md "$STAGE"/
mkdir -p "$STAGE"/.browser_screenshots "$STAGE"/.downloads
find "$STAGE" -maxdepth 1 -printf '  %f\n' | sort

echo
echo "=== npm ci --omit=dev, as the image does ==="
(cd "$STAGE" && NODE_ENV=production npm ci --omit=dev 2>&1 | tail -3)

echo
echo "=== what landed in node_modules (top level) ==="
ls "$STAGE"/node_modules | grep -vE '^\.' | head -20
echo "  total: $(ls "$STAGE"/node_modules | grep -vcE '^\.')"
echo "  sveltekit present? $(ls "$STAGE"/node_modules/@sveltejs 2>/dev/null || echo 'no (correct: build-only)')"

echo
echo "=== run it exactly as CMD does, on a spare port ==="
(cd "$STAGE" && NODE_ENV=production PORT=4188 DATABASE_URL="$DB" \
   SMTP_HOST=mailpit SMTP_PORT=1025 \
   setsid node server/index.js > /tmp/zj-image.log 2>&1 < /dev/null &)

ready=0
for i in $(seq 1 60); do
  if [ "$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:4188/api/health)" = "200" ]; then
    ready=1; break
  fi
  sleep 0.5
done

if [ "$ready" != "1" ]; then
  echo "FAIL the simulated image never became healthy"
  tr -d '\000' < /tmp/zj-image.log | tail -25
else
  echo "PASS health answers 200 from the simulated image"
  echo -n "  home route:        "; curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:4188/
  echo -n "  explorer filtered: "
  curl -s 'http://127.0.0.1:4188/api/solutions?output_kind=hydrogen&temperature_band=550%20to%20750%20C' \
    | python3 -c 'import sys,json;print(sorted(s["slug"] for s in json.load(sys.stdin)))'
  echo -n "  calculator 251:    "
  curl -s -X POST http://127.0.0.1:4188/api/calculator -H 'content-type: application/json' \
    -d '{"need_mw":251,"kind":"thermal"}'
  echo
  echo -n "  seeded login:      "
  curl -s -X POST http://127.0.0.1:4188/api/auth/login -H 'content-type: application/json' \
    -d '{"email":"visitor@example.com","password":"deku-demo-pw-2026"}' \
    | python3 -c 'import sys,json;print("ok", bool(json.load(sys.stdin).get("access_token")))'
  echo "  binds 0.0.0.0?     $(tr -d '\000' < /tmp/zj-image.log | grep -o '"host":"0.0.0.0"' | head -1)"
  echo "  a structured log line:"
  tr -d '\000' < /tmp/zj-image.log | grep '"event":"request"' | tail -1 | cut -c1-160
fi

for pid in $(grep -l 'server/index.js' /proc/*/cmdline 2>/dev/null | sed 's|/proc/||;s|/cmdline||'); do
  if tr -d '\000' < /proc/$pid/environ 2>/dev/null | grep -q 'PORT=4188'; then kill -9 "$pid" 2>/dev/null; fi
done
rm -rf "$STAGE"
echo "simulated image torn down"
