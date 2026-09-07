#!/bin/bash
# Contract verification against a running instance. Not shipped in the image.
B=${B:-http://localhost:4173/api}
PW='deku-demo-pw-2026'
pass=0; fail=0
ck() { if [ "$2" = "$3" ]; then echo "  PASS $1 ($2)"; pass=$((pass+1)); else echo "  FAIL $1: got [$2] want [$3]"; fail=$((fail+1)); fi; }
jq_() { python3 -c "import sys,json;d=json.load(sys.stdin);print($1)" 2>/dev/null; }

echo "== explorer filters =="
TOT=$(curl -s -D- -o /tmp/f.json "$B/solutions?output_kind=hydrogen&temperature_band=550%20to%20750%20C" | tr -d '\r' | awk 'tolower($1)=="x-total-count:"{print $2}')
ck "hydrogen+550-750 X-Total-Count" "$TOT" "2"
ck "hydrogen+550-750 slugs" "$(cat /tmp/f.json | jq_ "','.join(sorted(x['slug'] for x in d))")" "steel,transport"
ck "all eight" "$(curl -s "$B/solutions" | jq_ "len(d)")" "8"

echo "== calculator =="
for row in "250 thermal 1 2000 900000" "251 thermal 2 4000 1800000" "100 electrical 1 800 360000" "260 electrical 3 2400 1080000"; do
  set -- $row
  got=$(curl -s -X POST $B/calculator -H 'content-type: application/json' -d "{\"need_mw\":$1,\"kind\":\"$2\"}" | jq_ "'%s %s %s'%(d['modules_required'],d['annual_clean_energy_gwh'],d['annual_co2_avoided_tonnes'])")
  ck "calc $1 $2" "$got" "$3 $4 $5"
done
ck "calc need 0 rejected" "$(curl -s -o /dev/null -w '%{http_code}' -X POST $B/calculator -H 'content-type: application/json' -d '{"need_mw":0,"kind":"thermal"}')" "400"
ck "calc need -5 rejected" "$(curl -s -o /dev/null -w '%{http_code}' -X POST $B/calculator -H 'content-type: application/json' -d '{"need_mw":-5,"kind":"thermal"}')" "400"

echo "== auth =="
T1=$(curl -s -X POST $B/auth/login -H 'content-type: application/json' -d "{\"email\":\"visitor@example.com\",\"password\":\"$PW\"}" | jq_ "d['access_token']")
T2=$(curl -s -X POST $B/auth/login -H 'content-type: application/json' -d "{\"email\":\"visitor2@example.com\",\"password\":\"$PW\"}" | jq_ "d['access_token']")
ck "ada token" "$([ -n "$T1" ] && echo yes)" "yes"
ck "ken token" "$([ -n "$T2" ] && echo yes)" "yes"
ck "bad password denied" "$(curl -s -o /dev/null -w '%{http_code}' -X POST $B/auth/login -H 'content-type: application/json' -d '{"email":"visitor@example.com","password":"wrong"}')" "401"
ck "me" "$(curl -s $B/accounts/me -H "authorization: Bearer $T1" | jq_ "d['email']")" "visitor@example.com"
ck "no token denied" "$(curl -s -o /dev/null -w '%{http_code}' $B/accounts/me)" "401"

echo "== anonymous save then claim =="
ST=$(curl -s -X POST $B/saves -H 'content-type: application/json' -d '{"solution_slug":"steel"}' | jq_ "d['save_token']")
curl -s -o /dev/null -X POST $B/saves -H 'content-type: application/json' -d "{\"solution_slug\":\"chemicals\",\"save_token\":\"$ST\"}"
ck "anon saves listed" "$(curl -s "$B/saves?save_token=$ST" | jq_ "len(d)")" "2"
NEW="claim$(date +%s%N | tail -c 7)@example.com"
SU=$(curl -s -X POST $B/auth/signup -H 'content-type: application/json' -d "{\"email\":\"$NEW\",\"password\":\"testpassword123\",\"display_name\":\"Claim Tester\",\"save_token\":\"$ST\"}")
T3=$(echo "$SU" | jq_ "d['access_token']")
ck "claimed onto account" "$(curl -s $B/saves -H "authorization: Bearer $T3" | jq_ "','.join(sorted(x['slug'] for x in d))")" "chemicals,steel"
ck "anon bucket emptied" "$(curl -s "$B/saves?save_token=$ST" | jq_ "len(d)")" "0"

echo "== duplicate save is a no-op =="
before=$(curl -s $B/saves -H "authorization: Bearer $T3" | jq_ "len(d)")
curl -s -o /dev/null -X POST $B/saves -H "authorization: Bearer $T3" -H 'content-type: application/json' -d '{"solution_slug":"steel"}'
curl -s -o /dev/null -X POST $B/saves -H "authorization: Bearer $T3" -H 'content-type: application/json' -d '{"solution_slug":"steel"}'
ck "no second row" "$(curl -s $B/saves -H "authorization: Bearer $T3" | jq_ "len(d)")" "$before"

echo "== concurrent duplicate save =="
for i in 1 2 3 4 5 6; do curl -s -o /dev/null -X POST $B/saves -H "authorization: Bearer $T3" -H 'content-type: application/json' -d '{"solution_slug":"mining"}' & done; wait
ck "concurrent leaves one row" "$(curl -s $B/saves -H "authorization: Bearer $T3" | jq_ "sum(1 for x in d if x['slug']=='mining')")" "1"

echo "== compare cap =="
ck "four compared" "$(curl -s "$B/compare?slugs=steel,mining,chemicals,transport" | jq_ "len(d)")" "4"
ck "fifth rejected" "$(curl -s -o /dev/null -w '%{http_code}' "$B/compare?slugs=steel,mining,chemicals,transport,communities")" "400"

echo "== saved search unique by name =="
curl -s -o /dev/null -X POST $B/searches -H "authorization: Bearer $T3" -H 'content-type: application/json' -d '{"name":"My sites","output_kind":"hydrogen"}'
curl -s -o /dev/null -X POST $B/searches -H "authorization: Bearer $T3" -H 'content-type: application/json' -d '{"name":"My sites","output_kind":"heat"}'
ck "one search row" "$(curl -s $B/searches -H "authorization: Bearer $T3" | jq_ "sum(1 for x in d if x['name']=='My sites')")" "1"
ck "filters replaced" "$(curl -s $B/searches -H "authorization: Bearer $T3" | jq_ "[x['output_kind'] for x in d if x['name']=='My sites'][0]")" "heat"

echo "== enquiry =="
ENQ=$(curl -s -X POST $B/enquiries -H 'content-type: application/json' -d '{"name":"Test Person","email":"test.person@example.com","phone_country":"+31","phone":"600000000","topic":"Solutions","message":"How hot can it run for our kiln line?"}')
REF=$(echo "$ENQ" | jq_ "d['reference']")
EST=$(echo "$ENQ" | jq_ "d['status']")
ck "reference shape" "$(echo "$REF" | grep -cE '^ENQ-[A-Z0-9]{8}$')" "1"
ck "stored received" "$EST" "received"
ck "bad topic rejected" "$(curl -s -o /dev/null -w '%{http_code}' -X POST $B/enquiries -H 'content-type: application/json' -d '{"name":"A","email":"a@b.com","topic":"Nonsense","message":"hi"}')" "400"

echo "== access request =="
ck "ada approved" "$(curl -s $B/access-request -H "authorization: Bearer $T1" | jq_ "d['status']")" "approved"
ck "ken pending" "$(curl -s $B/access-request -H "authorization: Bearer $T2" | jq_ "d['status']")" "pending"
ck "ada documents 3" "$(curl -s $B/documents -H "authorization: Bearer $T1" | jq_ "len(d)")" "3"
ck "ken documents not-found" "$(curl -s -o /dev/null -w '%{http_code}' $B/documents -H "authorization: Bearer $T2")" "404"
ck "anon documents not-found" "$(curl -s -o /dev/null -w '%{http_code}' $B/documents)" "404"
ck "ken doc payload empty" "$(curl -s $B/documents -H "authorization: Bearer $T2" | grep -c 'investor-deck')" "0"

echo "== at most one access request per account =="
R1=$(curl -s -X POST $B/access-request -H "authorization: Bearer $T3" -H 'content-type: application/json' -d '{"organisation":"Alpha Capital","role_title":"Analyst"}')
ck "new request pending" "$(echo "$R1" | jq_ "d['status']")" "pending"
ck "IAR shape" "$(echo "$R1" | jq_ "d['reference']" | grep -cE '^IAR-[A-Z0-9]{8}$')" "1"
curl -s -o /dev/null -X POST $B/access-request -H "authorization: Bearer $T3" -H 'content-type: application/json' -d '{"organisation":"Beta Capital","role_title":"Partner"}'
ck "updated not added" "$(curl -s $B/access-request -H "authorization: Bearer $T3" | jq_ "d['organisation']")" "Beta Capital"
ck "reference unchanged" "$(curl -s $B/access-request -H "authorization: Bearer $T3" | jq_ "d['reference']")" "$(echo "$R1" | jq_ "d['reference']")"

echo "== concurrent access requests =="
NEW2="conc$(date +%s%N | tail -c 7)@example.com"
T4=$(curl -s -X POST $B/auth/signup -H 'content-type: application/json' -d "{\"email\":\"$NEW2\",\"password\":\"testpassword123\",\"display_name\":\"Conc Tester\"}" | jq_ "d['access_token']")
for i in 1 2 3 4 5; do curl -s -o /dev/null -X POST $B/access-request -H "authorization: Bearer $T4" -H 'content-type: application/json' -d '{"organisation":"Race Co","role_title":"CTO"}' & done; wait
ck "exactly one row after race" "$(PGPASSWORD=deku-local-dev psql -h postgres -U deku_app -d deku -tAc "select count(*) from access_requests where account_id=(select id from accounts where email='$NEW2')" 2>/dev/null || echo skip)" "1"

echo "== OWNERSHIP: cross-account denial =="
ADA_SAVE=$(curl -s $B/saves -H "authorization: Bearer $T1" | jq_ "d[0]['id']")
ck "ken deleting ada save -> 404" "$(curl -s -o /dev/null -w '%{http_code}' -X DELETE $B/saves/$ADA_SAVE -H "authorization: Bearer $T2")" "404"
ck "ada save row unchanged" "$(curl -s $B/saves -H "authorization: Bearer $T1" | jq_ "sum(1 for x in d if x['id']==$ADA_SAVE)")" "1"

ADA_SEARCH=$(curl -s $B/searches -H "authorization: Bearer $T1" | jq_ "d[0]['id']")
ck "ken deleting ada search -> 404" "$(curl -s -o /dev/null -w '%{http_code}' -X DELETE $B/searches/$ADA_SEARCH -H "authorization: Bearer $T2")" "404"
ck "ada search row unchanged" "$(curl -s $B/searches -H "authorization: Bearer $T1" | jq_ "sum(1 for x in d if x['id']==$ADA_SEARCH)")" "1"

ADA_ENQ=$(curl -s $B/enquiries -H "authorization: Bearer $T1" | jq_ "d[0]['id']")
ADA_ENQ_STATUS=$(curl -s $B/enquiries -H "authorization: Bearer $T1" | jq_ "d[0]['status']")
ck "ken closing ada enquiry -> 404" "$(curl -s -o /dev/null -w '%{http_code}' -X POST $B/enquiries/$ADA_ENQ/close -H "authorization: Bearer $T2")" "404"
ck "ada enquiry status unchanged" "$(curl -s $B/enquiries -H "authorization: Bearer $T1" | jq_ "[x['status'] for x in d if x['id']==$ADA_ENQ][0]")" "$ADA_ENQ_STATUS"
ck "nonexistent id same answer" "$(curl -s -o /dev/null -w '%{http_code}' -X POST $B/enquiries/99999999/close -H "authorization: Bearer $T2")" "404"

ck "ken sees only own enquiries" "$(curl -s $B/enquiries -H "authorization: Bearer $T2" | jq_ "','.join(x['reference'] for x in d)")" "ENQ-5R8X1CJ2"
ck "ken sees only own saves" "$(curl -s $B/saves -H "authorization: Bearer $T2" | jq_ "','.join(x['slug'] for x in d)")" "mining"
ck "ken access ref is own" "$(curl -s $B/access-request -H "authorization: Bearer $T2" | jq_ "d['reference']")" "IAR-9T3V6BLM"

echo "== close is idempotent-ish: one close, not two =="
MYENQ=$(curl -s -X POST $B/enquiries -H "authorization: Bearer $T3" -H 'content-type: application/json' -d '{"name":"Claim Tester","email":"claim@example.com","topic":"Careers","message":"Question about the academy"}' | jq_ "d['id']")
ck "close once" "$(curl -s -X POST $B/enquiries/$MYENQ/close -H "authorization: Bearer $T3" | jq_ "d['status']")" "closed"
ck "close twice still closed" "$(curl -s -X POST $B/enquiries/$MYENQ/close -H "authorization: Bearer $T3" | jq_ "d['status']")" "closed"
ck "still one row" "$(curl -s $B/enquiries -H "authorization: Bearer $T3" | jq_ "sum(1 for x in d if x['id']==$MYENQ)")" "1"

echo "== applications =="
ck "jobs 3" "$(curl -s $B/jobs | jq_ "len(d)")" "3"
curl -s -o /dev/null -X POST $B/applications -H "authorization: Bearer $T3" -H 'content-type: application/json' -d '{"job_slug":"licensing-lead","name":"Claim Tester","email":"claim@example.com","note":"Ten years of regulatory work."}'
curl -s -o /dev/null -X POST $B/applications -H "authorization: Bearer $T3" -H 'content-type: application/json' -d '{"job_slug":"licensing-lead","name":"Claim Tester","email":"claim@example.com","note":"Updated note."}'
ck "one application row" "$(curl -s $B/applications -H "authorization: Bearer $T3" | jq_ "sum(1 for x in d if x['job_slug']=='licensing-lead')")" "1"
ck "note updated" "$(curl -s $B/applications -H "authorization: Bearer $T3" | jq_ "[x['note'] for x in d if x['job_slug']=='licensing-lead'][0]")" "Updated note."
ck "anon application denied" "$(curl -s -o /dev/null -w '%{http_code}' -X POST $B/applications -H 'content-type: application/json' -d '{"job_slug":"licensing-lead","name":"x","email":"a@b.com","note":"y"}')" "401"

echo "== stories, content =="
ck "stories total" "$(curl -s -D- -o /dev/null "$B/stories" | tr -d '\r' | awk 'tolower($1)=="x-total-count:"{print $2}')" "7"
ck "featured one" "$(curl -s "$B/stories?featured=true" | jq_ "len(d)")" "1"
ck "featured slug" "$(curl -s "$B/stories?featured=true" | jq_ "d[0]['slug']")" "first-module-order"
ck "newest first" "$(curl -s "$B/stories" | jq_ "d[0]['slug']")" "first-module-order"
ck "wall page 1" "$(curl -s "$B/stories?featured=false&limit=3&offset=0" | jq_ "len(d)")" "3"
ck "wall page 2" "$(curl -s "$B/stories?featured=false&limit=3&offset=3" | jq_ "len(d)")" "3"
ck "team 4" "$(curl -s $B/team | jq_ "len(d)")" "4"
ck "team order" "$(curl -s $B/team | jq_ "d[0]['slug']")" "mira-halvorsen"
ck "offices 3" "$(curl -s $B/offices | jq_ "len(d)")" "3"
ck "faqs 6" "$(curl -s $B/faqs | jq_ "len(d)")" "6"
ck "faq search" "$(curl -s "$B/faqs?q=helium" | jq_ "len(d)>=1")" "True"
ck "unknown api route 404" "$(curl -s -o /dev/null -w '%{http_code}' $B/nope)" "404"

echo
echo "PASS=$pass FAIL=$fail"
[ "$fail" = "0" ]
