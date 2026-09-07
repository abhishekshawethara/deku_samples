#!/bin/sh
# Restart the app detached from this shell, so it outlives the session.
cd /app || exit 1
for pid in $(node -e '
const fs=require("fs");
for (const d of fs.readdirSync("/proc")) {
  if (!/^[0-9]+$/.test(d)) continue;
  try {
    const c = fs.readFileSync("/proc/" + d + "/cmdline", "utf8");
    if (c.includes("server/index.js") && d !== String(process.pid)) console.log(d);
  } catch {}
}'); do
  kill "$pid" 2>/dev/null
done
sleep 2
setsid node /app/server/index.js > /app/server.log 2>&1 &
sleep 6
curl -s -o /dev/null -w "health %{http_code}\n" http://127.0.0.1:4173/api/health
