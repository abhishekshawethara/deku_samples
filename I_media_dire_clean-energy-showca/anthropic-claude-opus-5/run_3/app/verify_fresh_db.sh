#!/bin/bash
# Grading re-creates the database from scratch, so prove the app's own schema and
# seed apply to an empty database with no manual steps. Every table is dropped
# and the app is asked to rebuild the lot on start.
set -u
DB="postgresql://deku_app:deku-local-dev@postgres:5432/deku"

echo "dropping every application table"
psql "$DB" -qAt -c "
DROP TABLE IF EXISTS applications, saved_solutions, saved_searches, enquiries,
  access_requests, documents, jobs, solutions, stories, team_members, offices,
  faqs, accounts CASCADE;" >/dev/null

left=$(psql "$DB" -tAc "select count(*) from information_schema.tables where table_schema='public'")
echo "tables remaining before start: $left"

echo "starting the app against the empty database"
/app/dev-restart.sh --no-build >/dev/null 2>&1

if [ "$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:4173/api/health)" != "200" ]; then
  echo "FAIL the app never became healthy against an empty database"
  tr -d '\000' < /tmp/zj.log | tail -20
  exit 1
fi
echo "PASS the app migrated and seeded an empty database by itself"

echo "--- row counts rebuilt from nothing ---"
for t in accounts solutions saved_solutions saved_searches enquiries access_requests \
         documents jobs applications stories team_members offices faqs; do
  printf '%-18s %s\n' "$t" "$(psql "$DB" -tAc "select count(*) from $t")"
done

echo "--- the explorer answers from the rebuilt data ---"
curl -s 'http://127.0.0.1:4173/api/solutions?output_kind=hydrogen&temperature_band=550%20to%20750%20C' \
  | python3 -c 'import sys,json;print("hydrogen + 550 to 750 C:", sorted(s["slug"] for s in json.load(sys.stdin)))'

echo "--- a seeded account signs in with the documented password ---"
curl -s -X POST http://127.0.0.1:4173/api/auth/login -H 'content-type: application/json' \
  -d '{"email":"visitor@example.com","password":"deku-demo-pw-2026"}' \
  | python3 -c 'import sys,json;d=json.load(sys.stdin);print("login ok:", bool(d.get("access_token")), d.get("account"))'
