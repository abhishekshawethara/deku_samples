"""Walks the five journeys in the brief as a stranger would, reading values back
off the page rather than trusting that it rendered. Saves one screenshot per
journey into .browser_screenshots/."""

import glob
import os
import re
import sys
import time
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:4173"
SHOTS = "/app/.browser_screenshots"
PW = "deku-demo-pw-2026"

# This image ships a chromium build whose revision differs from the one this
# Playwright expects, so point at the binary that is actually here.
_found = glob.glob("/root/.cache/ms-playwright/chromium-*/chrome-linux/chrome")
CHROME = _found[0] if _found else None

results = []
console_errors = []


def check(name, cond, detail=""):
    results.append((name, bool(cond), detail))
    print(("  ok   " if cond else "  FAIL ") + name + ("  " + str(detail) if detail and not cond else ""))


def shot(page, name):
    page.screenshot(path=f"{SHOTS}/{name}", full_page=False)


def sign_in(page, email):
    page.goto(f"{BASE}/signin", wait_until="networkidle")
    page.get_by_test_id("email").fill(email)
    page.get_by_test_id("password").fill(PW)
    page.get_by_test_id("signin-submit").click()
    page.wait_for_url(re.compile(r"/(account|compare|investors|solutions)"), timeout=15000)


def run(pw):
    browser = pw.chromium.launch(executable_path=CHROME) if CHROME else pw.chromium.launch()
    ctx = browser.new_context(viewport={"width": 1360, "height": 900})
    page = ctx.new_page()
    page.on("console", lambda m: console_errors.append(f"{page.url} :: {m.text}") if m.type == "error" else None)
    page.on("pageerror", lambda e: console_errors.append(f"{page.url} :: {e}"))

    # ---------------------------------------------------------------- journey 1
    print("\n== journey 1: filter to 2, save steel, sign up, find it waiting")
    page.goto(f"{BASE}/solutions", wait_until="networkidle")
    count_text = page.get_by_test_id("result-count").inner_text()
    check("explorer opens on all eight", "8" in count_text, count_text)
    check("eight cards are drawn", page.locator("[data-slug]").count() == 8)

    page.select_option("#f-output", "hydrogen")
    page.wait_for_timeout(700)
    page.select_option("#f-band", "550 to 750 C")
    page.wait_for_timeout(900)

    count_text = page.get_by_test_id("result-count").inner_text()
    check("the count falls to 2", re.search(r"\b2\b", count_text) is not None, count_text)
    slugs = sorted(page.locator("[data-slug]").evaluate_all("els => els.map(e => e.dataset.slug)"))
    check("and they are transport and steel", slugs == ["steel", "transport"], slugs)
    check("the url carries the filters", "output_kind=hydrogen" in page.url, page.url)

    page.get_by_test_id("save-steel").click()
    page.wait_for_timeout(900)
    check("the save control reports it saved", "Saved" in page.get_by_test_id("save-steel").inner_text())
    shot(page, "01_explorer_filtered_to_two.png")

    email = f"stranger.{int(time.time())}@example.com"
    page.goto(f"{BASE}/signup", wait_until="networkidle")
    page.get_by_test_id("display-name").fill("A Stranger")
    page.get_by_test_id("email").fill(email)
    page.get_by_test_id("password").fill("stranger-pw-2026")
    page.get_by_test_id("signup-submit").click()
    page.wait_for_url("**/account", timeout=15000)
    page.wait_for_timeout(1400)

    saves = page.get_by_test_id("saves-list")
    check("the new account lands on its account page", "/account" in page.url, page.url)
    check("steel is waiting on the account", saves.count() > 0 and "Steel" in saves.inner_text(), saves.inner_text()[:120] if saves.count() else "no list")
    check("the other four lists show an empty state", page.locator(".empty").count() >= 4, page.locator(".empty").count())
    shot(page, "02_signed_up_steel_waiting.png")

    # ---------------------------------------------------------------- journey 2
    print("\n== journey 2: a fifth save on a full compare is refused, four still compared")
    sign_in(page, "visitor@example.com")
    # give Ada five saves so a fifth can be attempted
    for slug in ["mining", "chemicals", "transport", "communities"]:
        page.goto(f"{BASE}/solutions/{slug}", wait_until="networkidle")
        page.get_by_test_id(f"save-{slug}").click()
        page.wait_for_timeout(500)

    page.goto(f"{BASE}/compare", wait_until="networkidle")
    page.wait_for_timeout(1500)
    boxes = page.locator(".picker input[type=checkbox]")
    check("compare offers more than four saves to pick from", boxes.count() >= 5, boxes.count())
    check("exactly four start compared", "Comparing 4 of 4" in page.get_by_test_id("compare-count").inner_text(), page.get_by_test_id("compare-count").inner_text())

    unchecked = [i for i in range(boxes.count()) if not boxes.nth(i).is_checked()]
    check("there is a fifth save available to add", len(unchecked) > 0)
    if unchecked:
        boxes.nth(unchecked[0]).check()
        page.wait_for_timeout(700)
        refusal = page.get_by_test_id("compare-refusal")
        check("the refusal appears in place", refusal.count() > 0 and refusal.is_visible())
        if refusal.count():
            check("and it says what to do next", "Remove one" in refusal.inner_text(), refusal.inner_text())
        check("four are still compared", "Comparing 4 of 4" in page.get_by_test_id("compare-count").inner_text(), page.get_by_test_id("compare-count").inner_text())
        headers = page.locator("[data-testid=compare-table] thead th").count()
        check("the table still holds four columns plus the field column", headers == 5, headers)
    shot(page, "03_compare_refuses_a_fifth.png")

    # ---------------------------------------------------------------- journey 3
    print("\n== journey 3: send an enquiry, reference in place, email arrives with it")
    enq_addr = f"walker.{int(time.time())}@example.com"
    page.goto(f"{BASE}/contact", wait_until="networkidle")
    page.get_by_test_id("enq-name").fill("A Walker")
    page.get_by_test_id("enq-email").fill(enq_addr)
    page.get_by_test_id("enq-phone").fill("610000123")
    page.select_option("#topic", "Technology")
    page.get_by_test_id("enq-message").fill("What outlet temperature can you hold on a continuous duty?")
    page.get_by_test_id("enquiry-submit").click()
    page.wait_for_selector("[data-testid=enquiry-success]", timeout=15000)

    ref = page.get_by_test_id("enquiry-reference").inner_text().strip()
    check("a reference appears in place", re.fullmatch(r"ENQ-[A-Z0-9]{8}", ref) is not None, ref)
    check("and the banner names the status", "received" in page.get_by_test_id("enquiry-success").inner_text())
    shot(page, "04_enquiry_reference_in_place.png")

    time.sleep(2)
    import urllib.request, json
    try:
        url = f"http://mailpit:8025/api/v1/search?query={urllib.parse.quote('to:' + enq_addr)}&limit=20"
        with urllib.request.urlopen(url, timeout=10) as r:
            msgs = json.load(r).get("messages", [])
        subjects = [m.get("Subject", "") for m in msgs]
        check("an acknowledgement reached that inbox", len(msgs) >= 1, subjects)
        check("carrying the reference in its subject", f"Enquiry received: {ref}" in subjects, subjects)
        if msgs:
            mid = [m for m in msgs if m.get("Subject") == f"Enquiry received: {ref}"][0]["ID"]
            with urllib.request.urlopen(f"http://mailpit:8025/api/v1/message/{mid}", timeout=10) as r:
                full = json.load(r)
            body = full.get("Text", "")
            check("the body carries the reference", ref in body)
            check("the body carries the topic", "Technology" in body)
            check("addressed to that one person alone", len(full.get("To", [])) == 1 and not full.get("Cc") and not full.get("Bcc"))
    except Exception as exc:
        check("mailpit was reachable for the check", False, exc)

    # ---------------------------------------------------------------- journey 4
    print("\n== journey 4: Ada reads three documents, Ken meets the not-found page")
    sign_in(page, "visitor@example.com")
    page.goto(f"{BASE}/investors/room", wait_until="networkidle")
    page.wait_for_timeout(1500)
    docs = page.get_by_test_id("documents")
    check("Ada's approved request opens the room", docs.count() > 0)
    if docs.count():
        items = docs.locator("li").count()
        check("and there are three documents", items == 3, items)
        text = docs.inner_text()
        for title in ["Investor Deck 2026", "Technology Dossier", "Licensing Roadmap"]:
            check(f"the room lists {title}", title in text)
    shot(page, "05_document_room_open_for_ada.png")

    # sign out fully, then in as Ken
    page.goto(f"{BASE}/account", wait_until="networkidle")
    page.wait_for_timeout(800)
    page.get_by_role("button", name="Sign out").first.click()
    page.wait_for_url(f"{BASE}/", timeout=15000)
    sign_in(page, "visitor2@example.com")
    page.goto(f"{BASE}/investors/room", wait_until="networkidle")
    page.wait_for_timeout(1500)
    nf = page.get_by_test_id("not-found")
    check("Ken's pending request meets the not-found page", nf.count() > 0 and nf.is_visible())
    if nf.count():
        check("reading 'We cannot find that page'", "We cannot find that page" in nf.inner_text())
        check("with a link back to /", nf.locator("a[href='/']").count() > 0)
    check("and no document is on the page", page.get_by_test_id("documents").count() == 0)
    check("no document title leaks into the html", "Investor Deck 2026" not in page.content())
    shot(page, "06_document_room_not_found_for_ken.png")

    # ---------------------------------------------------------------- journey 5
    print("\n== journey 5: 251 MW thermal reads 2, 4000 and 1800000")
    page.goto(f"{BASE}/calculator", wait_until="networkidle")
    page.get_by_test_id("need-input").fill("251")
    page.check("input[name=kind][value=thermal]")
    page.get_by_test_id("calc-submit").click()
    page.wait_for_selector("[data-testid=calc-results]", timeout=15000)
    modules = page.get_by_test_id("modules-required").inner_text().strip()
    gwh = page.get_by_test_id("annual-gwh").inner_text().strip().replace(",", "")
    co2 = page.get_by_test_id("annual-co2").inner_text().strip().replace(",", "")
    check("modules_required reads 2", modules == "2", modules)
    check("annual_clean_energy_gwh reads 4000", gwh == "4000", gwh)
    check("annual_co2_avoided_tonnes reads 1800000", co2 == "1800000", co2)

    page.get_by_test_id("need-input").fill("0")
    page.get_by_test_id("calc-submit").click()
    page.wait_for_timeout(600)
    check("a need of zero is refused in place", page.locator(".field-error").count() > 0)
    shot(page, "07_calculator_251_thermal.png")

    # ------------------------------------------------------------ every route
    print("\n== every route renders, and a mistyped one lands on the tidy card")
    routes = ["/", "/company", "/technology", "/edge", "/team", "/solutions", "/solutions/steel",
              "/compare", "/calculator", "/investors", "/news", "/news/first-module-order",
              "/careers", "/contact", "/faq", "/account", "/signin", "/signup"]
    for r in routes:
        resp = page.goto(f"{BASE}{r}", wait_until="domcontentloaded")
        status = resp.status if resp else 0
        body = page.locator("body").inner_text()
        check(f"{r} serves 200 with content", status == 200 and len(body) > 200, f"status={status} len={len(body)}")

    resp = page.goto(f"{BASE}/does-not-exist", wait_until="domcontentloaded")
    check("a mistyped route answers 404", resp.status == 404, resp.status)
    check("with the tidy not-found card", "We cannot find that page" in page.locator("body").inner_text())

    # server-rendered HTML on first paint (hydrated islands, not a blank shell)
    import urllib.request as ur
    html = ur.urlopen(f"{BASE}/solutions").read().decode()
    check("the explorer arrives as complete HTML", "Oil and Gas" in html and "Desalination" in html)
    html_home = ur.urlopen(f"{BASE}/").read().decode()
    check("the home display line is in the first paint", "Powering the World" in html_home)
    check("and the reactor is drawn in that HTML", "reactor-core" in html_home and "reactor-rods" in html_home)

    # ------------------------------------------------------- redirects, a11y
    print("\n== entry, redirects and keyboard reach")
    ctx2 = browser.new_context(viewport={"width": 1360, "height": 900})
    p2 = ctx2.new_page()
    p2.goto(f"{BASE}/account", wait_until="networkidle")
    p2.wait_for_timeout(1200)
    check("an unauthenticated visitor at /account goes to /signin?next=/account", "/signin?next=%2Faccount" in p2.url or "/signin?next=/account" in p2.url, p2.url)
    p2.goto(f"{BASE}/investors/room", wait_until="networkidle")
    p2.wait_for_timeout(1200)
    check("and at /investors/room likewise", "next=%2Finvestors%2Froom" in p2.url or "next=/investors/room" in p2.url, p2.url)

    # login lands on next
    p2.get_by_test_id("email").fill("visitor@example.com")
    p2.get_by_test_id("password").fill(PW)
    p2.get_by_test_id("signin-submit").click()
    p2.wait_for_timeout(2500)
    check("login lands on next", "/investors/room" in p2.url, p2.url)

    # an expired / cleared token bounces back to signin
    p2.evaluate("localStorage.setItem('zj_token','not-a-real-token')")
    p2.goto(f"{BASE}/account", wait_until="networkidle")
    p2.wait_for_timeout(1500)
    check("a bad token is cleared and sent to /signin?next=", "/signin" in p2.url and "next=" in p2.url, p2.url)

    # keyboard: focus ring reaches the nav
    p2.goto(f"{BASE}/", wait_until="networkidle")
    p2.keyboard.press("Tab")
    first = p2.evaluate("document.activeElement.textContent")
    check("the first tab stop is the skip link", "Skip to content" in (first or ""), first)
    reached = []
    for _ in range(14):
        p2.keyboard.press("Tab")
        reached.append(p2.evaluate("document.activeElement.tagName + ':' + (document.activeElement.textContent||'').trim().slice(0,22)"))
    check("tabbing reaches the routes in the bar", any("Solutions" in r for r in reached), reached[:8])

    # modal: escape closes and focus returns to the opener
    p2.goto(f"{BASE}/team", wait_until="networkidle")
    p2.get_by_test_id("bio-mira-halvorsen").click()
    p2.wait_for_timeout(600)
    check("the bio modal opens in the shared shell", p2.locator("[role=dialog]").count() > 0)
    check("focus moved inside it", p2.evaluate("!!document.activeElement.closest('[role=dialog]')"))
    p2.keyboard.press("Escape")
    p2.wait_for_timeout(600)
    check("Escape closes it", p2.locator("[role=dialog]").count() == 0)
    check("and focus returns to the control that opened it", p2.evaluate("document.activeElement.dataset.testid") == "bio-mira-halvorsen", p2.evaluate("document.activeElement.dataset.testid"))

    # icon-only controls carry a text name
    p2.set_viewport_size({"width": 390, "height": 844})
    p2.goto(f"{BASE}/", wait_until="networkidle")
    menu = p2.locator("header button[aria-controls=route-panel]")
    check("the phone bar shows a menu button", menu.count() > 0 and menu.is_visible())
    check("the icon-only menu button carries a text name", "Open the route menu" in menu.inner_text(), menu.inner_text())
    menu.click()
    p2.wait_for_timeout(500)
    check("the panel opens as a list of routes", p2.locator("#route-panel nav ul li").count() >= 9)
    p2.keyboard.press("Escape")
    p2.wait_for_timeout(400)
    check("Escape closes the panel", p2.locator("#route-panel").count() == 0)

    # no horizontal scrollbar at any named width
    for w in [360, 390, 768, 1024, 1280, 1600]:
        p2.set_viewport_size({"width": w, "height": 900})
        for r in ["/", "/solutions", "/account", "/calculator"]:
            p2.goto(f"{BASE}{r}", wait_until="networkidle")
            p2.wait_for_timeout(350)
            overflow = p2.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
            check(f"{r} at {w}px has no horizontal scrollbar", overflow <= 1, overflow)

    ctx2.close()
    ctx.close()
    browser.close()


with sync_playwright() as pw:
    try:
        run(pw)
    except Exception as exc:
        import traceback
        traceback.print_exc()
        check("the walk completed without crashing", False, exc)

# A 404 on /api/access-request or /api/documents is the app correctly refusing,
# not a fault: those are the "answer a room that never existed gives".
EXPECTED = ("favicon", "status of 404")
real_errors = [e for e in console_errors if not any(x in e.lower() for x in EXPECTED)]
print(f"\nconsole errors: {len(real_errors)}")
for e in real_errors[:12]:
    print("  !", e)

passed = sum(1 for _, c, _ in results if c)
failed = [(n, d) for n, c, d in results if not c]
print(f"\n{passed} passed, {len(failed)} failed")
for n, d in failed:
    print(f"  - {n}  {d}")
sys.exit(1 if failed or real_errors else 0)
