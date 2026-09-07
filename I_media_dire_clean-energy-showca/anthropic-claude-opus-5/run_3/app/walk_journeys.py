#!/usr/bin/env python3
"""Walk the five journeys in a real browser, as a stranger would.

Judged against the page: values are read back, the console is watched, and one
screenshot per journey is written to /app/.browser_screenshots/.
"""
import json
import re
import subprocess
import urllib.request
import uuid

from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:4173"
SHOTS = "/app/.browser_screenshots"
DB = "postgresql://deku_app:deku-local-dev@postgres:5432/deku"
PW = "deku-demo-pw-2026"

passed, failed = [], []
console_errors = []


def check(name, cond, detail=""):
    (passed if cond else failed).append(name)
    print(f"{'PASS' if cond else 'FAIL'}  {name}" + (f"  :: {detail}" if detail and not cond else ""))


def sql(q):
    return subprocess.run(["psql", DB, "-tAc", q], capture_output=True, text=True).stdout.strip()


def mailpit(path):
    with urllib.request.urlopen("http://mailpit:8025" + path) as r:
        return json.loads(r.read().decode())


expected_refusals = []

# The API answers some requests with a deliberate refusal: the fifth comparison
# is a 400, the document room for a pending account is a 404, and an account
# with no access request yet gets the not-found response. The browser logs those
# network responses to the console; they are the contract working, not a fault.
EXPECTED = [
    ("/api/compare", 400),
    ("/api/documents", 404),
    ("/api/access-request", 404),
]


def watch(page, label):
    page.on("console", lambda m: console_errors.append((label, m.type, m.text))
            if m.type == "error" else None)
    page.on("pageerror", lambda e: console_errors.append((label, "pageerror", str(e))))
    page.on("response", lambda r: expected_refusals.append((label, r.url, r.status))
            if r.status >= 400 else None)


CHROME = "/root/.cache/ms-playwright/chromium_headless_shell-1148/chrome-linux/headless_shell"

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=CHROME)

    # ---------------------------------------------------------------- 1
    print("\n=== Journey 1: filter, save steel signed out, sign up, find it waiting ===")
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    watch(page, "j1")

    page.goto(f"{BASE}/solutions", wait_until="networkidle")
    check("the explorer opens showing all eight",
          "Showing 8 of 8" in page.inner_text("form.filters"), page.inner_text("form.filters")[-80:])

    page.select_option("#f-output", "hydrogen")
    page.wait_for_url("**/solutions?output_kind=hydrogen")
    page.select_option("#f-band", "550 to 750 C")
    page.wait_for_function(
        "() => document.querySelector('form.filters').innerText.includes('Showing 2 of 8')")
    count_text = page.inner_text("form.filters")
    check("the count falls to 2 as the filters combine", "Showing 2 of 8" in count_text)

    cards = page.locator("ul.cards li").all_inner_texts()
    shown = sorted(re.findall(r"transport|steel|Transport|Steel", " ".join(cards)))
    check("the two shown are transport and steel",
          any("Transport" in c for c in cards) and any("Steel" in c for c in cards), str(cards)[:200])

    page.click('button[data-save-slug="steel"]')
    page.wait_for_selector('button[data-save-slug="steel"][data-saved="true"]')
    check("steel saves without an account", True)

    save_token = page.evaluate("() => localStorage.getItem('zj_save_token')")
    check("an opaque save_token is kept in the browser", bool(save_token))
    rows = sql(f"select count(*) from saved_solutions where save_token='{save_token}'")
    check("the anonymous save is a real row in the database", rows == "1", f"rows={rows}")

    page.screenshot(path=f"{SHOTS}/01_explorer_filtered_and_saved.png", full_page=False)

    email = f"stranger-{uuid.uuid4().hex[:8]}@example.com"
    page.goto(f"{BASE}/signup", wait_until="networkidle")
    page.fill("#name", "A Stranger")
    page.fill("#email", email)
    page.fill("#password", "a-good-password")
    page.click('button[type="submit"]')
    page.wait_for_url("**/account", timeout=15000)
    page.wait_for_selector("section[aria-labelledby='l-saves'] ul.rows, .empty-state", timeout=15000)

    saves_text = page.inner_text("section[aria-labelledby='l-saves']")
    check("steel is waiting on the new account", "Steel" in saves_text, saves_text[:200])
    aid = sql(f"select id from accounts where email='{email}'")
    owned = sql(f"select count(*) from saved_solutions where account_id={aid}")
    emptied = sql(f"select count(*) from saved_solutions where save_token='{save_token}'")
    check("the save moved onto the account in the database", owned == "1", f"rows={owned}")
    check("and the save_token bucket is emptied", emptied == "0", f"rows={emptied}")
    page.screenshot(path=f"{SHOTS}/02_signed_up_steel_waiting.png", full_page=False)
    ctx.close()

    # ---------------------------------------------------------------- 2
    print("\n=== Journey 2: a fifth solution on a full /compare is refused ===")
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    watch(page, "j2")

    page.goto(f"{BASE}/signin?next=/compare", wait_until="networkidle")
    page.fill("#email", "visitor@example.com")
    page.fill("#password", PW)
    page.click('button[type="submit"]')
    page.wait_for_url("**/compare", timeout=15000)

    # Ada holds steel and data-centres seeded; save three more so five exist.
    page.wait_for_function("() => localStorage.getItem('zj_token')", timeout=15000)
    token = page.evaluate("() => localStorage.getItem('zj_token')")
    for slug in ["mining", "chemicals", "transport"]:
        req = urllib.request.Request(
            f"{BASE}/api/saves", data=json.dumps({"solution_slug": slug}).encode(), method="POST")
        req.add_header("content-type", "application/json")
        req.add_header("authorization", f"Bearer {token}")
        urllib.request.urlopen(req).read()

    page.reload(wait_until="networkidle")
    page.wait_for_selector("table.compare-table", timeout=15000)
    compared = page.locator("table.compare-table thead th").count() - 1
    check("four saves are compared to begin with", compared == 4, f"{compared}")

    add_buttons = page.locator("div.tray button")
    check("a fifth save is available to add", add_buttons.count() >= 1, str(add_buttons.count()))
    add_buttons.first.click()
    page.wait_for_selector(".banner--fail", timeout=15000)
    refusal = page.inner_text(".banner--fail")
    check("the refusal appears in place and says what happened",
          "four" in refusal.lower() or "at most" in refusal.lower(), refusal)
    still = page.locator("table.compare-table thead th").count() - 1
    check("four are still compared after the refusal", still == 4, f"{still}")
    page.screenshot(path=f"{SHOTS}/03_compare_fifth_refused.png", full_page=False)
    ctx.close()

    # ---------------------------------------------------------------- 3
    print("\n=== Journey 3: send an enquiry, read the reference, find the email ===")
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    watch(page, "j3")

    inbox_email = f"walker-{uuid.uuid4().hex[:6]}@example.com"
    page.goto(f"{BASE}/contact", wait_until="networkidle")
    page.fill("#e-name", "A Walker")
    page.fill("#e-email", inbox_email)
    page.fill("#e-phone", "6 1234 5678")
    page.select_option("#e-topic", "Investor relations")
    page.fill("#e-message", "I would like to understand the module economics for a refinery site.")
    page.click('button[type="submit"]')
    page.wait_for_selector("[data-enquiry-reference]", timeout=20000)

    ref = page.get_attribute("[data-enquiry-reference]", "data-enquiry-reference")
    check("the reference appears in place", bool(ref) and page.inner_text(".banner--ok").count(ref) > 0, str(ref))
    check("the reference is ENQ- plus 8 uppercase letters and digits",
          bool(re.fullmatch(r"ENQ-[A-Z0-9]{8}", ref or "")), str(ref))

    stored = sql(f"select status||'|'||topic||'|'||email from enquiries where reference='{ref}'")
    check("the enquiry is stored received, with its topic and address",
          stored == f"received|Investor relations|{inbox_email}", stored)

    box = mailpit("/api/v1/messages?limit=50")
    mine = [m for m in box["messages"] if m["Subject"] == f"Enquiry received: {ref}"]
    check("the acknowledgement reached that inbox", len(mine) == 1, f"{len(mine)} matching")
    if mine:
        check("addressed to the one person it concerns",
              [t["Address"] for t in mine[0]["To"]] == [inbox_email], str(mine[0]["To"]))
        body = mailpit(f"/api/v1/message/{mine[0]['ID']}")["Text"]
        check("the email body carries the reference and the topic",
              ref in body and "Investor relations" in body, body[:150])
    page.screenshot(path=f"{SHOTS}/04_enquiry_reference_in_place.png", full_page=False)
    ctx.close()

    # ---------------------------------------------------------------- 4
    print("\n=== Journey 4: the document room opens for Ada, not for Ken ===")
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    watch(page, "j4-ada")
    page.goto(f"{BASE}/signin?next=/investors/room", wait_until="networkidle")
    page.fill("#email", "visitor@example.com")
    page.fill("#password", PW)
    page.click('button[type="submit"]')
    page.wait_for_url("**/investors/room", timeout=15000)
    page.wait_for_selector("ul.docs, .notfound", timeout=15000)
    docs = page.locator("ul.docs li").count()
    check("Ada, whose own request is approved, reads the three documents", docs == 3, f"{docs}")
    text = page.inner_text("ul.docs") if docs else ""
    check("the three seeded documents are the ones shown",
          all(t in text for t in ["Investor Deck 2026", "Technology Dossier", "Licensing Roadmap"]),
          text[:200])
    page.screenshot(path=f"{SHOTS}/05_document_room_approved.png", full_page=False)
    ctx.close()

    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    watch(page, "j4-ken")
    page.goto(f"{BASE}/signin?next=/investors/room", wait_until="networkidle")
    page.fill("#email", "visitor2@example.com")
    page.fill("#password", PW)
    page.click('button[type="submit"]')
    page.wait_for_url("**/investors/room", timeout=15000)
    page.wait_for_selector(".notfound, ul.docs", timeout=15000)
    body = page.inner_text("body")
    check("Ken, whose own request is pending, meets the not-found page",
          "We cannot find that page" in body, body[:200])
    check("and no document is on the page for him",
          page.locator("ul.docs li").count() == 0 and "Investor Deck 2026" not in body)
    page.screenshot(path=f"{SHOTS}/06_document_room_pending_not_found.png", full_page=False)
    ctx.close()

    # ---------------------------------------------------------------- 5
    print("\n=== Journey 5: 251 MW thermal reads 2, 4000 and 1800000 ===")
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    watch(page, "j5")
    page.goto(f"{BASE}/calculator", wait_until="networkidle")
    page.fill("#need", "251")
    page.check('input[name="kind"][value="thermal"]')
    page.click('button[type="submit"]')
    page.wait_for_selector('[data-field="modules_required"]', timeout=15000)

    mods = page.inner_text('[data-field="modules_required"]').strip()
    gwh = page.inner_text('[data-field="annual_clean_energy_gwh"]').strip()
    co2 = page.inner_text('[data-field="annual_co2_avoided_tonnes"]').strip()
    check("modules_required reads 2", mods == "2", mods)
    check("annual_clean_energy_gwh reads 4000", gwh.replace("\n", " ").startswith("4,000"), gwh)
    check("annual_co2_avoided_tonnes reads 1800000",
          co2.replace("\n", " ").startswith("1,800,000"), co2)
    page.screenshot(path=f"{SHOTS}/07_calculator_251_thermal.png", full_page=False)

    # a need of zero or less is refused without taking the app down
    page.fill("#need", "0")
    page.click('button[type="submit"]')
    page.wait_for_selector(".banner--fail", timeout=10000)
    check("a need of zero is refused in place, saying what to do next",
          "greater than zero" in page.inner_text(".banner--fail"), page.inner_text(".banner--fail"))
    ctx.close()

    # ------------------------------------------------- extra: responsive + a11y
    print("\n=== responsive and keyboard ===")
    for w, h, label in [(390, 844, "phone"), (768, 1024, "tablet"), (1440, 900, "desktop")]:
        ctx = browser.new_context(viewport={"width": w, "height": h})
        page = ctx.new_page()
        watch(page, f"viewport-{label}")
        page.goto(f"{BASE}/solutions", wait_until="networkidle")
        overflow = page.evaluate(
            "() => document.documentElement.scrollWidth - document.documentElement.clientWidth")
        check(f"no horizontal scrollbar at {label} ({w}px)", overflow <= 1, f"overflow={overflow}px")
        if label == "phone":
            page.screenshot(path=f"{SHOTS}/08_explorer_phone.png", full_page=False)
        ctx.close()

    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    watch(page, "keyboard")
    page.goto(f"{BASE}/team", wait_until="networkidle")
    page.keyboard.press("Tab")
    focused = page.evaluate("() => document.activeElement.className")
    check("the first tab stop is the skip link", "skip-link" in focused, focused)

    page.click("button:has-text('View bio')")
    page.wait_for_selector("div[role='dialog']")
    check("the bio modal opens in the shared shell", page.locator("div[role='dialog']").count() == 1)
    inside = page.evaluate("() => document.querySelector(\"div[role='dialog']\").contains(document.activeElement)")
    check("focus moves inside the modal", inside)
    page.keyboard.press("Escape")
    page.wait_for_selector("div[role='dialog']", state="detached")
    check("Escape closes the modal", page.locator("div[role='dialog']").count() == 0)
    returned = page.evaluate("() => document.activeElement.innerText || ''")
    check("focus returns to the control that opened it", "View bio" in returned, returned[:60])
    page.screenshot(path=f"{SHOTS}/09_team_modal_keyboard.png", full_page=False)
    ctx.close()

    browser.close()

print("\n=== console ===")
print("failing responses seen (each should be a deliberate refusal):")
for label, url, status in expected_refusals:
    print(f"  {label}: {status} {url}")

unexpected_http = [
    (label, url, status) for label, url, status in expected_refusals
    if not any(path in url and status == code for path, code in EXPECTED)
]
check("every failing response was a deliberate refusal the brief calls for",
      not unexpected_http, str(unexpected_http[:4]))
check("no request was answered with a server error",
      all(status < 500 for _, _, status in expected_refusals),
      str([r for r in expected_refusals if r[2] >= 500]))

# A console entry is only a real fault if it is a script error rather than the
# browser reporting one of those deliberate refusals.
scripty = [
    c for c in console_errors
    if "favicon" not in c[2].lower() and "Failed to load resource" not in c[2]
]
check("no script errors during the walk", not scripty, str(scripty[:4]))

print(f"\n{len(passed)} passed, {len(failed)} failed")
for f in failed:
    print("  -", f)
