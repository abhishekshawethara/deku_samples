#!/bin/bash
# Local development helper only: rebuild and restart the app for this session.
# Not used by the image; the container runs `node server/index.js` directly.
cd /app || exit 1

python3 - <<'PY'
import os, signal, glob
for d in glob.glob('/proc/[0-9]*'):
    try:
        cmd = open(f'{d}/cmdline', 'rb').read().decode(errors='replace')
    except Exception:
        continue
    if 'server/index.js' in cmd:
        try:
            os.kill(int(os.path.basename(d)), signal.SIGKILL)
        except Exception:
            pass
PY
sleep 1

if [ "$1" != "--no-build" ]; then
  npx vite build > /tmp/build.log 2>&1 || { echo "BUILD FAILED"; tail -30 /tmp/build.log; exit 1; }
fi

: > /tmp/zj.log
(setsid node server/index.js >> /tmp/zj.log 2>&1 < /dev/null &)

for i in $(seq 1 40); do
  code=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:4173/api/health 2>/dev/null)
  if [ "$code" = "200" ]; then echo "app ready"; exit 0; fi
  sleep 0.5
done
echo "app did not become ready"
tr -d '\000' < /tmp/zj.log | tail -20
exit 1
