#!/usr/bin/env python3
"""Uniqueness must hold under simultaneous requests, not only in application checks."""
import json
import subprocess
import urllib.request
import urllib.error
import uuid
from concurrent.futures import ThreadPoolExecutor

BASE = "http://127.0.0.1:4173"
DB = "postgresql://deku_app:deku-local-dev@postgres:5432/deku"

passed, failed = [], []


def check(name, cond, detail=""):
    (passed if cond else failed).append(name)
    print(f"{'PASS' if cond else 'FAIL'}  {name}" + (f"  :: {detail}" if detail and not cond else ""))


def call(method, path, body=None, token=None):
    req = urllib.request.Request(
        BASE + path, data=json.dumps(body).encode() if body is not None else None, method=method
    )
    if body is not None:
        req.add_header("content-type", "application/json")
    if token:
        req.add_header("authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req) as r:
            raw = r.read().decode()
            return r.status, (json.loads(raw) if raw else None)
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try:
            return e.code, (json.loads(raw) if raw else None)
        except json.JSONDecodeError:
            return e.code, None


def sql(q):
    return subprocess.run(["psql", DB, "-tAc", q], capture_output=True, text=True).stdout.strip()


email = f"conc-{uuid.uuid4().hex[:8]}@example.com"
s, acct = call("POST", "/api/auth/signup",
               {"email": email, "password": "a-good-password", "display_name": "Concurrency"})
tok = acct["access_token"]
aid = acct["id"]

N = 12

print(f"=== {N} simultaneous saves of one solution for one account ===")
with ThreadPoolExecutor(max_workers=N) as ex:
    results = list(ex.map(
        lambda _: call("POST", "/api/saves", {"solution_slug": "steel"}, token=tok), range(N)))
codes = sorted({r[0] for r in results})
rows = sql(f"select count(*) from saved_solutions where account_id={aid} "
           f"and solution_id=(select id from solutions where slug='steel')")
check("exactly one saved row exists after simultaneous saves", rows == "1", f"rows={rows}")
check("no request answered with a server error", all(c < 500 for c in codes), f"codes={codes}")

print(f"\n=== {N} simultaneous saves for one anonymous save_token ===")
st = uuid.uuid4().hex
with ThreadPoolExecutor(max_workers=N) as ex:
    results = list(ex.map(
        lambda _: call("POST", "/api/saves", {"solution_slug": "mining", "save_token": st}), range(N)))
codes = sorted({r[0] for r in results})
rows = sql(f"select count(*) from saved_solutions where save_token='{st}'")
check("exactly one row for the repeated anonymous save", rows == "1", f"rows={rows}")
check("no server error on the anonymous path", all(c < 500 for c in codes), f"codes={codes}")

print(f"\n=== {N} simultaneous access requests from one account ===")
with ThreadPoolExecutor(max_workers=N) as ex:
    results = list(ex.map(
        lambda i: call("POST", "/api/access-request",
                       {"organisation": f"Org {i}", "role_title": "Partner"}, token=tok), range(N)))
codes = sorted({r[0] for r in results})
rows = sql(f"select count(*) from access_requests where account_id={aid}")
check("exactly one access request row afterwards", rows == "1", f"rows={rows}")
check("the others are rejected or folded in, never a partial row",
      all(c < 500 for c in codes), f"codes={codes}")
ref = sql(f"select reference from access_requests where account_id={aid}")
check("the surviving row carries a well-formed reference",
      ref.startswith("IAR-") and len(ref) == 12, ref)

print(f"\n=== {N} simultaneous saved searches under one name ===")
with ThreadPoolExecutor(max_workers=N) as ex:
    results = list(ex.map(
        lambda i: call("POST", "/api/searches",
                       {"name": "Race", "output_kind": "hydrogen"}, token=tok), range(N)))
codes = sorted({r[0] for r in results})
rows = sql(f"select count(*) from saved_searches where account_id={aid} and name='Race'")
check("exactly one saved search row for the name", rows == "1", f"rows={rows}")
check("no server error racing the same name", all(c < 500 for c in codes), f"codes={codes}")

print(f"\n=== {N} simultaneous applications for one job ===")
with ThreadPoolExecutor(max_workers=N) as ex:
    results = list(ex.map(
        lambda i: call("POST", "/api/applications",
                       {"job_slug": "operations-trainer", "name": "Conc", "email": email,
                        "note": "Racing the same job application."}, token=tok), range(N)))
codes = sorted({r[0] for r in results})
rows = sql(f"select count(*) from applications where account_id={aid}")
check("exactly one application row for the job", rows == "1", f"rows={rows}")
check("no server error racing the application", all(c < 500 for c in codes), f"codes={codes}")

print("\n=== enquiry references stay unique across a burst ===")
with ThreadPoolExecutor(max_workers=N) as ex:
    results = list(ex.map(
        lambda i: call("POST", "/api/enquiries",
                       {"name": "Burst", "email": "burst@example.com", "topic": "Technology",
                        "message": "Checking reference uniqueness under load."}), range(N)))
refs = [r[1]["reference"] for r in results if r[0] == 201]
check("every enquiry in the burst got a distinct reference",
      len(refs) == N and len(set(refs)) == N, f"{len(refs)} created, {len(set(refs))} distinct")

print(f"\n{len(passed)} passed, {len(failed)} failed")
for f in failed:
    print("  -", f)
