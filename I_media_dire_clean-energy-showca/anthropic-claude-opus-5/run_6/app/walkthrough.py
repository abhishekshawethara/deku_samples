"""Drives the five journeys in a real browser, as a stranger would.
Reads values back off the page rather than trusting that it rendered.
Not shipped in the image."""
import re
import sys
import time
import json
import urllib.request

from playwright.sync_api import sync_playwright

BASE = "http://localhost:4173"
SHOTS = "/app/.browser_screenshots"
PW = "deku-demo-pw-2026"

results = []
console_errors = []


def check(name, got, want):
    ok = got == want
    results.append((ok, name, got, want))
    print(("  PASS " if ok else "  FAIL ") + f"{name}: got {got!r}" + ("" if ok else f" want {want!r}"))
    return ok


def check_true(name, cond, detail=""):
    return check(name + (f" [{detail}]" if detail and not cond else ""), bool(cond), True)


def mailpit_find(subject_part, to=None):
    for _ in range(20):
        with urllib.request.urlopen("http://mailpit:8025/api/v1/messages?limit=60") as r:
            data = json.load(r)
        for m in data["messages"]:
            if subject_part in m["Subject"]:
                if to and to not in [t["Address"] for t in m["To"]]:
                    continue
                return m
        time.sleep(0.5)
    return None


def attach_console(page):
    page.on("console", lambda m: console_errors.append(f"{page.url} :: {m.type} :: {m.text}")
            if m.type == "error" else None)
    page.on("pageerror", lambda e: console_errors.append(f"{page.url} :: pageerror :: {e}"))


def run(p):
    import glob

    exe = None
    for pattern in (
        "/root/.cache/ms-playwright/chromium_headless_shell-*/chrome-linux/headless_shell",
        "/root/.cache/ms-playwright/chromium-*/chrome-linux/chrome",
    ):
        hits = sorted(glob.glob(pattern))
        if hits:
            exe = hits[-1]
            break
    browser = p.chromium.launch(executable_path=exe, args=["--no-sandbox"])

    # ---------- Journey 1: filter, save anonymously, sign up, find it waiting ----------
    print("\n== Journey 1: filter to 2, save steel, sign up, save follows ==")
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    attach_console(page)
    page.goto(f"{BASE}/solutions", wait_until="networkidle")

    page.select_option("#f-out", "hydrogen")
    page.select_option("#f-temp", "550 to 750 C")
    page.wait_for_timeout(600)

    count_text = page.get_by_test_id("result-count").inner_text()
    check("count falls to 2", re.search(r"Showing\s+2\s+of\s+8", count_text) is not None, True)

    cards = page.locator(".s-card h2 a")
    titles = [cards.nth(i).inner_text() for i in range(cards.count())]
    check("two cards shown", len(titles), 2)
    industries = sorted(page.locator(".s-ind").nth(i).inner_text().title()
                        for i in range(page.locator(".s-ind").count()))
    check("the two are Steel and Transport", industries, ["Steel", "Transport"])

    # save steel without an account
    steel_card = page.locator(".s-card", has=page.locator(".s-ind", has_text="Steel"))
    steel_card.get_by_role("button", name=re.compile("Save")).click()
    page.wait_for_timeout(800)
    check("steel reads Saved", steel_card.get_by_role("button", name=re.compile("Saved")).count(), 1)
    page.screenshot(path=f"{SHOTS}/01_explorer_filtered_and_saved.png", full_page=False)

    # sign up; the anonymous save must follow
    email = f"walk{int(time.time())}@example.com"
    page.goto(f"{BASE}/signup", wait_until="networkidle")
    page.fill("#name", "Walk Tester")
    page.fill("#email", email)
    page.fill("#password", "walkthrough-pw-1")
    page.click("button[type=submit]")
    page.wait_for_url(re.compile(r"/account"), timeout=15000)
    page.wait_for_timeout(1200)

    saved_text = page.locator("section[aria-labelledby=h-saves]").inner_text()
    check("steel waiting on the new account", "Steel" in saved_text, True)
    page.screenshot(path=f"{SHOTS}/02_signup_save_claimed.png", full_page=False)
    ctx.close()

    # ---------- Journey 2: fifth save refused, four still compared ----------
    print("\n== Journey 2: a fifth on a full compare is refused in place ==")
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    attach_console(page)

    # sign in as Ada, then give her five saves so the cap can be hit
    page.goto(f"{BASE}/signin", wait_until="networkidle")
    page.fill("#email", "visitor@example.com")
    page.fill("#password", PW)
    page.click("button[type=submit]")
    page.wait_for_url(re.compile(r"/account"), timeout=15000)
    page.wait_for_timeout(800)

    token = page.evaluate("() => localStorage.getItem('zj_token')")
    for slug in ["chemicals", "transport", "mining", "communities"]:
        page.evaluate(
            """async ([slug, t]) => {
                await fetch('/api/saves', {method:'POST',
                  headers:{'content-type':'application/json','authorization':'Bearer '+t},
                  body: JSON.stringify({solution_slug: slug})});
            }""",
            [slug, token],
        )

    page.goto(f"{BASE}/compare", wait_until="networkidle")
    page.wait_for_timeout(1200)
    check("four selected by default", page.get_by_test_id("compare-count").inner_text(), "4 of 4 in the comparison")

    # click a chip that is not already in the comparison -> refusal in place
    off_chip = page.locator(".chip[aria-pressed=false]").first
    off_chip.click()
    page.wait_for_timeout(600)

    banner = page.get_by_test_id("compare-banner")
    check("refusal banner appears in place", banner.is_visible(), True)
    check("refusal names the cap", "at most 4" in banner.inner_text(), True)
    check("still four compared", page.get_by_test_id("compare-count").inner_text(), "4 of 4 in the comparison")
    cols = page.locator("table.compare thead th").count() - 1
    check("table still shows four columns", cols, 4)
    page.screenshot(path=f"{SHOTS}/03_compare_fifth_refused.png", full_page=False)
    ctx.close()

    # ---------- Journey 3: enquiry returns a reference, email arrives with it ----------
    print("\n== Journey 3: enquiry reference in place, acknowledgement carries it ==")
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    attach_console(page)
    page.goto(f"{BASE}/contact", wait_until="networkidle")

    enq_email = f"enq{int(time.time())}@example.com"
    page.fill("#c-name", "Enquiry Walker")
    page.fill("#c-email", enq_email)
    page.fill("#c-phone", "600123456")
    page.select_option("#c-topic", "Solutions")
    page.fill("#c-message", "We run a kiln line at 700 C and want to know what a block would look like.")
    page.click("button[type=submit]")
    page.wait_for_selector("[data-testid=enquiry-success]", timeout=15000)

    ref = page.get_by_test_id("enquiry-reference").inner_text().strip()
    check("reference shape ENQ-XXXXXXXX", re.fullmatch(r"ENQ-[A-Z0-9]{8}", ref) is not None, True)
    page.screenshot(path=f"{SHOTS}/04_enquiry_reference.png", full_page=False)

    msg = mailpit_find(ref, to=enq_email)
    check_true("acknowledgement reached that inbox", msg is not None)
    if msg:
        check("subject carries the reference", msg["Subject"], f"Enquiry received: {ref}")
        check("one recipient only", len(msg["To"]), 1)
        check("no cc", len(msg.get("Cc") or []), 0)
        check("no bcc", len(msg.get("Bcc") or []), 0)
        with urllib.request.urlopen("http://mailpit:8025/api/v1/message/" + msg["ID"]) as r:
            full = json.load(r)
        body = full["Text"]
        check("body carries the reference", ref in body, True)
        check("body carries the topic", "Solutions" in body, True)
    ctx.close()

    # ---------- Journey 4: room opens for approved, not-found for pending ----------
    print("\n== Journey 4: document room, approved vs pending ==")
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    attach_console(page)
    page.goto(f"{BASE}/signin", wait_until="networkidle")
    page.fill("#email", "visitor@example.com")
    page.fill("#password", PW)
    page.click("button[type=submit]")
    page.wait_for_url(re.compile(r"/account"), timeout=15000)

    page.goto(f"{BASE}/investors/room", wait_until="networkidle")
    page.wait_for_timeout(1200)
    docs = page.locator(".doc")
    check("Ada reads three documents", docs.count(), 3)
    doc_titles = sorted(page.locator(".d-body h2").nth(i).inner_text() for i in range(3))
    check("the three documents", doc_titles,
          ["Investor Deck 2026", "Licensing Roadmap", "Technology Dossier"])
    page.screenshot(path=f"{SHOTS}/05_document_room_approved.png", full_page=False)
    ctx.close()

    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    attach_console(page)
    page.goto(f"{BASE}/signin", wait_until="networkidle")
    page.fill("#email", "visitor2@example.com")
    page.fill("#password", PW)
    page.click("button[type=submit]")
    page.wait_for_url(re.compile(r"/account"), timeout=15000)

    page.goto(f"{BASE}/investors/room", wait_until="networkidle")
    page.wait_for_timeout(1200)
    body_text = page.locator("main").inner_text()
    check("Ken meets the not-found card", "We cannot find that page" in body_text, True)
    check("no document leaks into the page", "Investor Deck 2026" in body_text, False)
    page.screenshot(path=f"{SHOTS}/06_document_room_pending_notfound.png", full_page=False)
    ctx.close()

    # ---------- Journey 5: calculator 251 MW thermal ----------
    print("\n== Journey 5: 251 MW thermal reads 2, 4000, 1800000 ==")
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    attach_console(page)
    page.goto(f"{BASE}/calculator", wait_until="networkidle")
    page.fill("#need", "251")
    page.check("input[value=thermal]")
    page.click("button[type=submit]")
    page.wait_for_selector("[data-testid=modules_required]", timeout=15000)
    page.wait_for_timeout(400)

    check("modules_required", page.get_by_test_id("modules_required").inner_text(), "2")
    check("annual_clean_energy_gwh", page.get_by_test_id("annual_clean_energy_gwh").inner_text(), "4,000")
    check("annual_co2_avoided_tonnes", page.get_by_test_id("annual_co2_avoided_tonnes").inner_text(), "1,800,000")
    page.screenshot(path=f"{SHOTS}/07_calculator_251_thermal.png", full_page=False)

    # a need of zero or less is invalid
    page.fill("#need", "0")
    page.click("button[type=submit]")
    page.wait_for_timeout(500)
    check("zero is refused with a reason", page.locator("#need-err").is_visible(), True)
    ctx.close()

    # ---------- Redirects and ownership from the browser ----------
    print("\n== Redirects, and one account cannot reach another's row ==")
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    attach_console(page)
    page.goto(f"{BASE}/account", wait_until="networkidle")
    page.wait_for_timeout(900)
    check("anonymous /account -> signin?next", "/signin?next=%2Faccount" in page.url, True)

    page.goto(f"{BASE}/investors/room", wait_until="networkidle")
    page.wait_for_timeout(900)
    check("anonymous /investors/room -> signin?next", "next=%2Finvestors%2Froom" in page.url, True)

    # login lands on next
    page.fill("#email", "visitor2@example.com")
    page.fill("#password", PW)
    page.click("button[type=submit]")
    page.wait_for_timeout(2000)
    check("login lands on next", "/investors/room" in page.url, True)

    # Ken asks for Ada's rows by identifier, directly against the API
    ken_token = page.evaluate("() => localStorage.getItem('zj_token')")
    probe = page.evaluate(
        """async (t) => {
            const out = {};
            const j = async (u, o) => { const r = await fetch(u, o); return r.status; };
            const h = {'authorization': 'Bearer ' + t};
            out.delete_ada_save = await j('/api/saves/1', {method:'DELETE', headers:h});
            out.delete_ada_search = await j('/api/searches/1', {method:'DELETE', headers:h});
            out.close_ada_enquiry = await j('/api/enquiries/1/close', {method:'POST', headers:h});
            const r = await fetch('/api/enquiries', {headers:h});
            out.own_refs = (await r.json()).map(e => e.reference);
            return out;
        }""",
        ken_token,
    )
    check("deleting Ada's save denied", probe["delete_ada_save"], 404)
    check("deleting Ada's search denied", probe["delete_ada_search"], 404)
    check("closing Ada's enquiry denied", probe["close_ada_enquiry"], 404)
    check("Ken's list carries only his own", probe["own_refs"], ["ENQ-5R8X1CJ2"])
    page.screenshot(path=f"{SHOTS}/08_ownership_denied.png", full_page=False)
    ctx.close()

    # ---------- Ada's rows unchanged after those attempts ----------
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    attach_console(page)
    page.goto(f"{BASE}/signin", wait_until="networkidle")
    page.fill("#email", "visitor@example.com")
    page.fill("#password", PW)
    page.click("button[type=submit]")
    page.wait_for_url(re.compile(r"/account"), timeout=15000)
    page.wait_for_timeout(1500)
    acct = page.locator("main").inner_text()
    low = acct.lower()
    check("Ada's enquiry still answered", "enq-7k2m9qd4" in low and "answered" in low, True)
    check("Ada's saved search still there", "Hydrogen sites" in acct, True)
    check("Ada's access request approved", "iar-4h7n2pq8" in low and "approved" in low, True)
    page.screenshot(path=f"{SHOTS}/09_account_rows_unchanged.png", full_page=False)
    ctx.close()

    # ---------- Responsive: no horizontal scrollbar ----------
    print("\n== Layout holds, no horizontal scrollbar ==")
    for w, h, label in [(375, 800, "phone"), (768, 1024, "tablet"), (1440, 900, "desktop")]:
        ctx = browser.new_context(viewport={"width": w, "height": h})
        page = ctx.new_page()
        attach_console(page)
        for route in ["/", "/solutions", "/account", "/calculator"]:
            page.goto(f"{BASE}{route}", wait_until="networkidle")
            page.wait_for_timeout(500)
            overflow = page.evaluate(
                "() => document.documentElement.scrollWidth - document.documentElement.clientWidth"
            )
            check(f"{label} {route} no h-scroll", overflow <= 1, True)
        if label == "phone":
            page.goto(f"{BASE}/solutions", wait_until="networkidle")
            page.wait_for_timeout(400)
            page.screenshot(path=f"{SHOTS}/10_phone_solutions.png", full_page=False)
        ctx.close()

    browser.close()


with sync_playwright() as p:
    run(p)

print("\n== console errors ==")
EXPECTED_404 = ("/account", "/investors/room")
real = [
    e for e in console_errors
    if "favicon" not in e.lower()
    and not ("404" in e and any(r in e for r in EXPECTED_404))
]
print("  (404s from /api/access-request and /api/documents are the contract's"
      " not-found answer and are expected)")
for e in real:
    print("  ", e)
print(f"  {len(real)} console error(s)")

failed = [r for r in results if not r[0]]
print(f"\nPASS={len(results) - len(failed)} FAIL={len(failed)}")
for _, name, got, want in failed:
    print(f"  FAILED {name}: got {got!r} want {want!r}")
sys.exit(1 if failed or real else 0)
