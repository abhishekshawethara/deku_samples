#!/usr/bin/env python3
"""Mail goes over real SMTP to Mailpit. Read the messages back out of Mailpit itself."""
import json
import urllib.request
import urllib.error
import time

BASE = "http://127.0.0.1:4173"
MAILPIT = "http://mailpit:8025"
PW = "deku-demo-pw-2026"

passed, failed = [], []


def check(name, cond, detail=""):
    (passed if cond else failed).append(name)
    print(f"{'PASS' if cond else 'FAIL'}  {name}" + (f"  :: {detail}" if detail and not cond else ""))


def call(method, path, body=None, token=None, base=BASE):
    req = urllib.request.Request(
        base + path, data=json.dumps(body).encode() if body is not None else None, method=method
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
        return e.code, (json.loads(raw) if raw else None)


def mailpit(path, method="GET"):
    req = urllib.request.Request(MAILPIT + path, method=method)
    with urllib.request.urlopen(req) as r:
        raw = r.read().decode().strip()
        try:
            return json.loads(raw) if raw else None
        except json.JSONDecodeError:
            return raw


print("clearing the Mailpit inbox")
mailpit("/api/v1/messages", "DELETE")
time.sleep(0.5)

_, tokresp = call("POST", "/api/auth/login", {"email": "visitor2@example.com", "password": PW})
ken = tokresp["access_token"]

print("\n=== enquiry sent ===")
s, enq = call("POST", "/api/enquiries", {
    "name": "Mail Check", "email": "mailcheck@example.com", "phone_country": "+31",
    "phone": "6 0000 0000", "topic": "Suppliers",
    "message": "Please acknowledge this enquiry so the mail path is proven."})
ref = enq["reference"]

print("=== access request created ===")
s, ar = call("POST", "/api/access-request",
             {"organisation": "Mail Org", "role_title": "Analyst"}, token=ken)
iar = ar["reference"]

print("=== application submitted ===")
s, app = call("POST", "/api/applications", {
    "job_slug": "licensing-lead", "name": "Ken Adeyemi", "email": "visitor2@example.com",
    "note": "I have assessed advanced reactor submissions from inside a regulator."}, token=ken)

time.sleep(2)
box = mailpit("/api/v1/messages?limit=50")
msgs = box["messages"]
print(f"\nMailpit holds {len(msgs)} message(s)")
for m in msgs:
    print("  -", m["Subject"], "->", [t["Address"] for t in m["To"]])

check("exactly three messages, one per transition", len(msgs) == 3, f"{len(msgs)}")


def find(prefix):
    return next((m for m in msgs if m["Subject"].startswith(prefix)), None)


enq_msg = find("Enquiry received:")
check("enquiry subject begins 'Enquiry received:' then the reference",
      enq_msg is not None and enq_msg["Subject"] == f"Enquiry received: {ref}",
      enq_msg["Subject"] if enq_msg else "missing")
if enq_msg:
    check("enquiry mail is addressed to the one person it concerns",
          [t["Address"] for t in enq_msg["To"]] == ["mailcheck@example.com"], str(enq_msg["To"]))
    check("no cc and no bcc on the enquiry mail",
          not enq_msg.get("Cc") and not enq_msg.get("Bcc"),
          f"cc={enq_msg.get('Cc')} bcc={enq_msg.get('Bcc')}")
    body = mailpit(f"/api/v1/message/{enq_msg['ID']}")["Text"]
    check("enquiry body carries the topic and the reference",
          "Suppliers" in body and ref in body, body[:160])

ar_msg = find("Investor access requested:")
check("access request subject begins 'Investor access requested:' then the reference",
      ar_msg is not None and ar_msg["Subject"] == f"Investor access requested: {iar}",
      ar_msg["Subject"] if ar_msg else "missing")
if ar_msg:
    check("access request mail goes to the requesting account alone",
          [t["Address"] for t in ar_msg["To"]] == ["visitor2@example.com"], str(ar_msg["To"]))
    body = mailpit(f"/api/v1/message/{ar_msg['ID']}")["Text"]
    check("access request body carries the organisation and the reference",
          "Mail Org" in body and iar in body, body[:160])

app_msg = find("Application received:")
check("application subject begins 'Application received:' then the job title",
      app_msg is not None and app_msg["Subject"] == "Application received: Licensing Lead",
      app_msg["Subject"] if app_msg else "missing")
if app_msg:
    body = mailpit(f"/api/v1/message/{app_msg['ID']}")["Text"]
    check("application body carries the job title and the location",
          "Licensing Lead" in body and "Chicago" in body, body[:160])

print("\n=== no other action sends mail ===")
before = mailpit("/api/v1/messages?limit=50")["messages_count"]
call("POST", "/api/saves", {"solution_slug": "mining"}, token=ken)
call("POST", "/api/searches", {"name": "Mail silence check", "output_kind": "heat"}, token=ken)
call("POST", "/api/calculator", {"need_mw": 251, "kind": "thermal"})
call("POST", "/api/auth/login", {"email": "visitor2@example.com", "password": PW})
s, e2 = call("POST", "/api/enquiries", {"name": "Ken", "email": "visitor2@example.com",
                                        "topic": "Careers", "message": "A second enquiry, one mail."},
             token=ken)
call("POST", f"/api/enquiries/{e2['id']}/close", token=ken)
time.sleep(2)
after = mailpit("/api/v1/messages?limit=50")["messages_count"]
check("saves, searches, calculator, login and closing send no mail; only the enquiry did",
      after - before == 1, f"{before} -> {after}")

print(f"\n{len(passed)} passed, {len(failed)} failed")
for f in failed:
    print("  -", f)
