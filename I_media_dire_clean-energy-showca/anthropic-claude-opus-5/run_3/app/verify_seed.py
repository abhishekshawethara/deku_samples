#!/usr/bin/env python3
"""Seeding must be idempotent: restarting the app must not duplicate rows."""
import subprocess
import time
import urllib.request

DB = "postgresql://deku_app:deku-local-dev@postgres:5432/deku"
TABLES = ["accounts", "solutions", "saved_solutions", "saved_searches", "enquiries",
          "access_requests", "documents", "jobs", "applications", "stories",
          "team_members", "offices", "faqs"]


def sql(q):
    return subprocess.run(["psql", DB, "-tAc", q], capture_output=True, text=True).stdout.strip()


def counts():
    return {t: sql(f"select count(*) from {t}") for t in TABLES}


before = counts()
print("before restart:", before)

subprocess.run(["/app/dev-restart.sh", "--no-build"], capture_output=True, text=True)
subprocess.run(["/app/dev-restart.sh", "--no-build"], capture_output=True, text=True)
time.sleep(1)

after = counts()
print("after two restarts:", after)

ok = before == after
print(("PASS" if ok else "FAIL"), "restarting the app does not duplicate any row")
if not ok:
    for t in TABLES:
        if before[t] != after[t]:
            print(f"  {t}: {before[t]} -> {after[t]}")

# the seeded fixtures are still exactly as the brief pins them
checks = [
    ("eight solutions", sql("select count(*) from solutions"), "8"),
    ("seven stories", sql("select count(*) from stories"), "7"),
    ("exactly one featured story", sql("select count(*) from stories where featured"), "1"),
    ("three documents", sql("select count(*) from documents"), "3"),
    ("three jobs", sql("select count(*) from jobs"), "3"),
    ("four team members", sql("select count(*) from team_members"), "4"),
    ("three offices", sql("select count(*) from offices"), "3"),
    ("six faqs", sql("select count(*) from faqs"), "6"),
    ("three technology faqs", sql("select count(*) from faqs where category='Technology'"), "3"),
    ("three deployment faqs", sql("select count(*) from faqs where category='Deployment'"), "3"),
    ("Ada holds the approved IAR-4H7N2PQ8",
     sql("select status from access_requests where reference='IAR-4H7N2PQ8'"), "approved"),
    ("Ken holds the pending IAR-9T3V6BLM",
     sql("select status from access_requests where reference='IAR-9T3V6BLM'"), "pending"),
    ("ENQ-7K2M9QD4 is answered on Investor relations",
     sql("select status||'|'||topic from enquiries where reference='ENQ-7K2M9QD4'"),
     "answered|Investor relations"),
    ("ENQ-5R8X1CJ2 is received on Careers",
     sql("select status||'|'||topic from enquiries where reference='ENQ-5R8X1CJ2'"),
     "received|Careers"),
    ("password hashes are stored hashed, never in the clear",
     sql("select count(*) from accounts where password_hash like '%deku-demo-pw-2026%'"), "0"),
    ("every saved row has exactly one owner",
     sql("select count(*) from saved_solutions where (account_id is null) = (save_token is null)"), "0"),
]
fails = 0
for name, got, want in checks:
    good = got == want
    fails += 0 if good else 1
    print(("PASS" if good else "FAIL"), name, "" if good else f":: got {got!r} want {want!r}")

# the app comes back up healthy after the restarts
code = urllib.request.urlopen("http://127.0.0.1:4173/api/health").status
print(("PASS" if code == 200 else "FAIL"), "health answers 200 after restart")

print("\nall good" if ok and not fails and code == 200 else "\nSOMETHING FAILED")
