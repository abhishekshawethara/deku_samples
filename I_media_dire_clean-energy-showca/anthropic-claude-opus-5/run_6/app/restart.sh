#!/bin/bash
# Dev restart helper. Not shipped in the image.
cd /app || exit 1
for pid in $(grep -l 'server/index.js' /proc/*/cmdline 2>/dev/null | cut -d/ -f3); do
  kill -9 "$pid" 2>/dev/null && echo "stopped $pid"
done
sleep 1
LOG=${LOG:-/tmp/zj.log}
: > "$LOG"
setsid nohup node server/index.js > "$LOG" 2>&1 < /dev/null &
for i in $(seq 1 40); do
  sleep 0.5
  if [ "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:4173/api/health)" = "200" ]; then
    echo "up after $((i / 2))s"
    exit 0
  fi
done
echo "did not come up; log:"
tr -d '\000' < "$LOG" | tail -20
exit 1
