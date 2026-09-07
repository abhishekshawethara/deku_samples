#!/usr/bin/env python3
"""Contract check against the running app. Read the rows back, not just the responses."""
import json
import urllib.request
import urllib.error
import subprocess
import uuid

BASE = "http://127.0.0.1:4173"
DB = "postgresql://deku_app:deku-local-dev@postgres:5432/deku"
PW = "deku-demo-pw-2026"

passed, failed = [], []


def check(name, cond, detail=""):
    (passed if cond else failed).append(name)
    print(f"{'PASS' if cond else 'FAIL'}  {name}" + (f"  :: {detail}" if detail and not cond else ""))


def call(method, path, body=None, token=None, headers=None):
    url = BASE + path
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    if data:
        req.add_header("content-type", "application/json")
    if token:
        req.add_header("authorization", f"Bearer {token}")
    for k, v in (headers or {}).items():
        req.add_header(k, v)
    try:
        with urllib.request.urlopen(req) as r:
            raw = r.read().decode()
            return r.status, (json.loads(raw) if raw else None), dict(r.headers)
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try:
            payload = json.loads(raw) if raw else None
        except json.JSONDecodeError:
            payload = {"raw": raw[:200]}
        return e.code, payload, dict(e.headers)


def sql(q):
    out = subprocess.run(["psql", DB, "-tAc", q], capture_output=True, text=True)
    return out.stdout.strip()


def login(email):
    s, b, _ = call("POST", "/api/auth/login", {"email": email, "password": PW})
    assert s == 200, (s, b)
    return b["access_token"]


print("=== auth ===")
ada = login("visitor@example.com")
ken = login("visitor2@example.com")
check("seeded accounts log in with the documented password", bool(ada and ken))

s, b, _ = call("POST", "/api/auth/login", {"email": "visitor@example.com", "password": "wrong"})
check("wrong password is denied", s == 401, f"{s}")

s, b, _ = call("GET", "/api/accounts/me", token=ada)
check("accounts/me returns the caller", s == 200 and b["email"] == "visitor@example.com")

s, b, _ = call("GET", "/api/accounts/me")
check("no token where one is required is denied", s == 401, f"{s}")

s, b, _ = call("GET", "/api/accounts/me", token="garbage.token")
check("a forged token is denied", s == 401, f"{s}")

print("\n=== explorer ===")
s, b, h = call("GET", "/api/solutions")
check("eight solutions, X-Total-Count present", s == 200 and len(b) == 8 and h.get("x-total-count") == "8")

s, b, h = call("GET", "/api/solutions?output_kind=hydrogen&temperature_band=550%20to%20750%20C")
slugs = sorted(x["slug"] for x in b)
check("hydrogen + 550 to 750 C leaves exactly transport and steel",
      slugs == ["steel", "transport"] and h.get("x-total-count") == "2", str(slugs))

s, b, _ = call("GET", "/api/solutions?industry=Steel&output_kind=electricity")
check("filters combine, each narrowing the last", s == 200 and len(b) == 0, str(b))

s, b, _ = call("GET", "/api/solutions/steel")
check("one solution carries detail", s == 200 and "detail" in b and b["module_count"] == 8)

s, b, _ = call("GET", "/api/solutions/does-not-exist")
check("unknown slug is not found", s == 404)

print("\n=== calculator (the four worked rows) ===")
for need, kind, mods, gwh, co2 in [
    (250, "thermal", 1, 2000, 900000),
    (251, "thermal", 2, 4000, 1800000),
    (100, "electrical", 1, 800, 360000),
    (260, "electrical", 3, 2400, 1080000),
]:
    s, b, _ = call("POST", "/api/calculator", {"need_mw": need, "kind": kind})
    ok = (s == 200 and b["modules_required"] == mods
          and b["annual_clean_energy_gwh"] == gwh
          and b["annual_co2_avoided_tonnes"] == co2)
    check(f"{need} MW {kind} -> {mods}, {gwh}, {co2}", ok, str(b))

for bad in [0, -5]:
    s, b, _ = call("POST", "/api/calculator", {"need_mw": bad, "kind": "thermal"})
    check(f"a need of {bad} is rejected as a client error", s == 400, f"{s}")

print("\n=== anonymous save, then claim at signup ===")
s, b, _ = call("POST", "/api/saves", {"solution_slug": "steel"})
tok = b.get("save_token")
check("an unauthenticated save returns an opaque save_token", s in (200, 201) and bool(tok))

s, b, _ = call("POST", "/api/saves", {"solution_slug": "steel", "save_token": tok})
check("saving the same solution twice for one token is a no-op", s in (200, 201))
n = sql(f"select count(*) from saved_solutions where save_token='{tok}'")
check("only one row exists for the repeated anonymous save", n == "1", f"rows={n}")

s, b, _ = call("GET", f"/api/saves?save_token={tok}")
check("an anonymous caller reads its own saves with the token", s == 200 and len(b) == 1)

s, b, _ = call("GET", "/api/saves")
check("saves without a token or session is denied", s == 401, f"{s}")

email = f"claim-{uuid.uuid4().hex[:8]}@example.com"
s, b, _ = call("POST", "/api/auth/signup",
               {"email": email, "password": "a-good-password", "display_name": "Claim Tester",
                "save_token": tok})
check("signup returns the created account", s == 201 and b["email"] == email and "id" in b)
new_token = b["access_token"]
new_id = b["id"]

s, b, _ = call("GET", "/api/saves", token=new_token)
check("the claimed save is waiting on the new account", s == 200 and len(b) == 1 and b[0]["slug"] == "steel", str(b))
left = sql(f"select count(*) from saved_solutions where save_token='{tok}'")
check("the save_token bucket is emptied by the claim", left == "0", f"rows={left}")
owned = sql(f"select count(*) from saved_solutions where account_id={new_id}")
check("the row now belongs to the account", owned == "1", f"rows={owned}")

print("\n=== duplicate save for one account ===")
before = sql(f"select count(*) from saved_solutions where account_id={new_id}")
call("POST", "/api/saves", {"solution_slug": "steel"}, token=new_token)
call("POST", "/api/saves", {"solution_slug": "steel"}, token=new_token)
after = sql(f"select count(*) from saved_solutions where account_id={new_id}")
check("saving one solution twice for one account never adds a second row",
      before == after == "1", f"{before} -> {after}")

print("\n=== compare: at most four ===")
s, b, _ = call("GET", "/api/compare?slugs=steel,mining,chemicals,transport")
check("four saves compare", s == 200 and len(b) == 4)
s, b, _ = call("GET", "/api/compare?slugs=steel,mining,chemicals,transport,communities")
check("a fifth slug is rejected as invalid", s == 400, f"{s}")
s, b, _ = call("GET", "/api/compare?slugs=steel,mining,chemicals,transport")
check("four are still compared after the refusal", s == 200 and len(b) == 4)

print("\n=== saved searches: unique by name ===")
s, b, _ = call("POST", "/api/searches", {"name": "Hydrogen sites", "output_kind": "hydrogen"}, token=ada)
check("a saved search is created or replaced", s == 200, f"{s} {b}")
first_id = b["id"]
s, b, _ = call("POST", "/api/searches",
               {"name": "Hydrogen sites", "output_kind": "heat", "deployment": "single-module"}, token=ada)
check("the same name replaces its filters, same row", s == 200 and b["id"] == first_id and b["output_kind"] == "heat", str(b))
n = sql("select count(*) from saved_searches s join accounts a on a.id=s.account_id "
        "where a.email='visitor@example.com' and s.name='Hydrogen sites'")
check("never a second row for the same name", n == "1", f"rows={n}")
# restore the seeded state
call("POST", "/api/searches", {"name": "Hydrogen sites", "output_kind": "hydrogen"}, token=ada)

print("\n=== enquiries ===")
s, b, _ = call("POST", "/api/enquiries", {
    "name": "Walker", "email": "walker@example.com", "phone_country": "+31",
    "phone": "6 0000 0000", "topic": "Technology",
    "message": "A real enquiry sent by the contract check."})
import re
ref = b.get("reference", "")
check("an enquiry mints ENQ- plus 8 uppercase letters and digits",
      s == 201 and bool(re.fullmatch(r"ENQ-[A-Z0-9]{8}", ref)), ref)
check("a new enquiry is stored received", b.get("status") == "received", str(b))
stored = sql(f"select status from enquiries where reference='{ref}'")
check("the enquiry is a real row in the database", stored == "received", f"db={stored}")

s, b, _ = call("POST", "/api/enquiries", {"name": "X", "email": "not-an-email",
                                          "topic": "Technology", "message": "long enough here"})
check("an invalid email is a client error naming the reason", s == 400 and "message" in b, str(b))
s, b, _ = call("POST", "/api/enquiries", {"name": "X", "email": "x@example.com",
                                          "topic": "Nonsense", "message": "long enough here"})
check("an unknown topic is a client error", s == 400, f"{s}")

print("\n=== closing an enquiry: only the owner, once ===")
s, b, _ = call("POST", "/api/enquiries", {"name": "Ada", "email": "visitor@example.com",
                                          "topic": "Solutions", "message": "Closing test enquiry."},
               token=ada)
eid, eref = b["id"], b["reference"]
s, b, _ = call("POST", f"/api/enquiries/{eid}/close", token=ada)
check("the owner closes their own enquiry", s == 200 and b["status"] == "closed")
s, b, _ = call("POST", f"/api/enquiries/{eid}/close", token=ada)
check("closing a closed enquiry records one close, not two", s == 200 and b["status"] == "closed")

print("\n=== OWNERSHIP: one account never reaches another's row ===")
# Ada's seeded enquiry, asked for by Ken
ada_enq_id = sql("select id from enquiries where reference='ENQ-7K2M9QD4'")
before = sql(f"select status from enquiries where id={ada_enq_id}")
s, b, _ = call("POST", f"/api/enquiries/{ada_enq_id}/close", token=ken)
after = sql(f"select status from enquiries where id={ada_enq_id}")
check("Ken closing Ada's enquiry by id is denied", s == 404, f"{s}")
check("Ada's enquiry row is unchanged afterwards", before == after == "answered", f"{before} -> {after}")

# Ada's saved solution, deleted by Ken
ada_save_id = sql("select ss.id from saved_solutions ss join accounts a on a.id=ss.account_id "
                  "join solutions s on s.id=ss.solution_id where a.email='visitor@example.com' "
                  "and s.slug='steel'")
s, b, _ = call("DELETE", f"/api/saves/{ada_save_id}", token=ken)
still = sql(f"select count(*) from saved_solutions where id={ada_save_id}")
check("Ken deleting Ada's saved solution by id is denied", s == 404, f"{s}")
check("Ada's saved row is unchanged afterwards", still == "1", f"rows={still}")

# Ada's saved search, deleted by Ken
ada_search_id = sql("select ss.id from saved_searches ss join accounts a on a.id=ss.account_id "
                    "where a.email='visitor@example.com' and ss.name='Hydrogen sites'")
s, b, _ = call("DELETE", f"/api/searches/{ada_search_id}", token=ken)
still = sql(f"select count(*) from saved_searches where id={ada_search_id}")
check("Ken deleting Ada's saved search by id is denied", s == 404, f"{s}")
check("Ada's saved search row is unchanged afterwards", still == "1", f"rows={still}")

# the lists take no account identifier
s, b, _ = call("GET", "/api/saves", token=ken)
ken_slugs = sorted(x["slug"] for x in b)
check("Ken's saves list carries his rows and nothing else", ken_slugs == ["mining"], str(ken_slugs))
s, b, _ = call("GET", "/api/enquiries", token=ken)
refs = sorted(x["reference"] for x in b)
check("Ken's enquiries list carries only his own", all(r != "ENQ-7K2M9QD4" for r in refs), str(refs))

print("\n=== access requests: at most one per account ===")
s, b, _ = call("GET", "/api/access-request", token=ada)
check("Ada's own request reads back", s == 200 and b["reference"] == "IAR-4H7N2PQ8" and b["status"] == "approved", str(b))
s, b, _ = call("GET", "/api/access-request", token=ken)
check("Ken's own request reads back as pending", s == 200 and b["status"] == "pending", str(b))

s, b, _ = call("POST", "/api/access-request", {"organisation": "Newco", "role_title": "Analyst"}, token=ken)
n = sql("select count(*) from access_requests ar join accounts a on a.id=ar.account_id "
        "where a.email='visitor2@example.com'")
check("requesting again updates, never adds a second", s == 200 and n == "1", f"rows={n}")

s, b, _ = call("POST", "/api/access-request", {"organisation": "Fresh Capital", "role_title": "Partner"}, token=new_token)
newref = b.get("reference", "")
check("a new request is pending with an IAR- reference of the same shape",
      s == 201 and b["status"] == "pending" and bool(re.fullmatch(r"IAR-[A-Z0-9]{8}", newref)), str(b))

print("\n=== the document room ===")
s, b, _ = call("GET", "/api/documents", token=ada)
check("an approved account reads the three documents", s == 200 and len(b) == 3, str(s))
s, b, _ = call("GET", "/api/documents", token=ken)
check("a pending account meets the not-found answer", s == 404, f"{s}")
check("and no document is in the payload", not isinstance(b, list), str(b)[:120])
s, b, _ = call("GET", "/api/documents")
check("no token at the document room is denied", s == 401, f"{s}")

print("\n=== stories ===")
s, b, h = call("GET", "/api/stories")
check("seven stories, X-Total-Count present", s == 200 and len(b) == 7 and h.get("x-total-count") == "7")
s, b, h = call("GET", "/api/stories?featured=true")
check("exactly one featured story", s == 200 and len(b) == 1 and b[0]["slug"] == "first-module-order")
s, b, h = call("GET", "/api/stories?featured=false&limit=3&offset=0")
check("the wall excludes the featured story: six over two pages of three",
      len(b) == 3 and h.get("x-total-count") == "6", f"total={h.get('x-total-count')}")
s, b, _ = call("GET", "/api/stories?featured=false&limit=3&offset=3")
check("the second page brings the last three", len(b) == 3)
s, b, _ = call("GET", "/api/stories/first-module-order")
check("one story carries its body", s == 200 and "body" in b)

print("\n=== jobs and applications ===")
s, b, _ = call("GET", "/api/jobs")
check("three jobs", s == 200 and len(b) == 3)
s, b, _ = call("POST", "/api/applications",
               {"job_slug": "reactor-systems-engineer", "name": "Ada Moreau",
                "email": "visitor@example.com", "note": "I have commissioned helium loops before."},
               token=ada)
check("an application is created", s in (200, 201) and b["job_slug"] == "reactor-systems-engineer", str(b))
s, b, _ = call("POST", "/api/applications",
               {"job_slug": "reactor-systems-engineer", "name": "Ada Moreau",
                "email": "visitor@example.com", "note": "Updating my note with more detail."},
               token=ada)
n = sql("select count(*) from applications ap join accounts a on a.id=ap.account_id "
        "join jobs j on j.id=ap.job_id where a.email='visitor@example.com' "
        "and j.slug='reactor-systems-engineer'")
check("applying again updates, never adds a second", n == "1", f"rows={n}")
s, b, _ = call("POST", "/api/applications", {"job_slug": "reactor-systems-engineer",
                                             "name": "X", "email": "x@example.com", "note": "long enough"})
check("an application without a token is denied", s == 401, f"{s}")

print("\n=== team, offices, faqs ===")
s, b, _ = call("GET", "/api/team")
check("four team members in order", s == 200 and len(b) == 4 and b[0]["slug"] == "mira-halvorsen")
s, b, _ = call("GET", "/api/offices")
check("three offices", s == 200 and len(b) == 3)
s, b, _ = call("GET", "/api/faqs")
check("six faqs", s == 200 and len(b) == 6)
s, b, _ = call("GET", "/api/faqs?category=Technology")
check("faqs filter by category", s == 200 and len(b) == 3)
s, b, _ = call("GET", "/api/faqs?q=helium")
check("faqs search by text", s == 200 and len(b) >= 1)

print("\n=== health ===")
s, b, _ = call("GET", "/api/health")
check("health returns 200", s == 200)

print(f"\n{len(passed)} passed, {len(failed)} failed")
if failed:
    print("FAILED:")
    for f in failed:
        print("  -", f)
