"""Walk the five journeys in a browser, as a stranger would, and leave evidence."""
import re
import time
from playwright.sync_api import sync_playwright, expect

BASE = "http://127.0.0.1:4173"
SHOTS = "/app/.browser_screenshots"
PW = "deku-demo-pw-2026"

results = []
console_errors = []


def note(name, ok, extra=""):
    results.append((name, ok, extra))
    print(("  ok  " if ok else "FAIL  ") + name + ((" :: " + str(extra)) if extra and not ok else ""))


def attach(page):
    page.on("console", lambda m: console_errors.append(f"{page.url} [{m.type}] {m.text}")
            if m.type == "error" else None)
    page.on("pageerror", lambda e: console_errors.append(f"{page.url} [pageerror] {e}"))


def sign_in(page, email):
    page.goto(f"{BASE}/signin")
    page.fill('[data-testid="signin-email"]', email)
    page.fill('[data-testid="signin-password"]', PW)
    page.click('[data-testid="signin-submit"]')
    page.wait_for_url(re.compile(r"/(account|investors|solutions|careers).*"), timeout=15000)


def journey_1(page):
    """Filter to hydrogen + 550 to 750 C, watch the count fall to 2, save steel,
    sign up, and find steel waiting."""
    page.goto(f"{BASE}/solutions")
    page.wait_for_selector('[data-testid="result-count"]')
    note("explorer opens with all eight", "8" in page.inner_text('[data-testid="result-count"]'),
         page.inner_text('[data-testid="result-count"]'))

    page.select_option("#f-output", "hydrogen")
    page.wait_for_function(
        "() => document.querySelectorAll('[data-testid=\"solution-grid\"] li').length === 2 "
        "|| document.querySelectorAll('[data-testid=\"solution-grid\"] li').length === 4",
        timeout=10000)
    page.select_option("#f-band", "550 to 750 C")
    page.wait_for_function(
        "() => document.querySelectorAll('[data-testid=\"solution-grid\"] li').length === 2",
        timeout=10000)

    count_text = page.inner_text('[data-testid="result-count"]')
    note("count falls to 2 of 8", "2" in count_text and "8" in count_text, count_text)
    cards = page.inner_text('[data-testid="solution-grid"]')
    note("exactly transport and steel", "Transport" in cards and "Steel" in cards
         and "Mining" not in cards, cards[:200])

    page.click('[data-testid="save-steel"]')
    page.wait_for_timeout(900)
    note("anonymous save is confirmed in place",
         "Saved" in page.inner_text('[data-testid="save-steel"]'))
    tok = page.evaluate("() => window.localStorage.getItem('zj.save_token')")
    note("an opaque save_token is kept", bool(tok), tok)

    page.screenshot(path=f"{SHOTS}/01_explorer_filtered_and_saved.png", full_page=True)

    email = f"stranger{int(time.time())}@example.com"
    page.goto(f"{BASE}/signup")
    page.fill('[data-testid="signup-name"]', "Stranger Walker")
    page.fill('[data-testid="signup-email"]', email)
    page.fill('[data-testid="signup-password"]', "stranger-pw-2026")
    page.click('[data-testid="signup-submit"]')
    page.wait_for_url("**/account", timeout=15000)
    page.wait_for_selector('[data-testid="saved-solutions"]', timeout=15000)
    saved = page.inner_text('[data-testid="saved-solutions"]')
    note("steel is waiting on the new account", "Steel" in saved or "steel" in saved, saved[:200])
    note("the save_token bucket was emptied",
         not page.evaluate("() => window.localStorage.getItem('zj.save_token')"))
    page.screenshot(path=f"{SHOTS}/02_signup_claims_the_save.png", full_page=True)
    return email


def journey_2(page):
    """Ada adds a fifth solution to a full /compare: the refusal appears in place
    and four are still compared."""
    sign_in(page, "visitor@example.com")
    page.goto(f"{BASE}/solutions")
    page.wait_for_selector('[data-testid="solution-grid"]')
    # save enough solutions that five are available
    for slug in ["oil-and-gas", "chemicals", "transport", "steel", "mining"]:
        btn = page.query_selector(f'[data-testid="save-{slug}"]')
        if btn and "Saved" not in btn.inner_text():
            btn.click()
            page.wait_for_timeout(500)

    page.goto(f"{BASE}/compare?slugs=oil-and-gas,chemicals,transport,steel")
    page.wait_for_selector('[data-testid="compare-table"]', timeout=15000)
    note("four are compared", "4 of a maximum of 4" in page.inner_text('[data-testid="compare-count"]'),
         page.inner_text('[data-testid="compare-count"]'))

    page.wait_for_selector(".chip", timeout=10000)
    page.click(".chip")  # a fifth
    page.wait_for_selector('[data-testid="compare-banner"]', timeout=10000)
    banner = page.inner_text('[data-testid="compare-banner"]')
    note("the refusal appears in place", "rejected" in banner.lower(), banner)
    note("four are still compared",
         "4 of a maximum of 4" in page.inner_text('[data-testid="compare-count"]'))
    cols = page.query_selector_all('[data-testid="compare-table"] thead th')
    note("still four columns plus the attribute column", len(cols) == 5, len(cols))
    page.screenshot(path=f"{SHOTS}/03_compare_fifth_refused.png", full_page=True)


def journey_3(page):
    """Anyone sends an enquiry from /contact; the reference appears in place and
    the acknowledgement carrying it reaches that inbox."""
    ctx = page.context.browser.new_context()
    p = ctx.new_page()
    attach(p)
    inbox = f"walker{int(time.time())}@example.com"
    p.goto(f"{BASE}/contact")
    p.fill("#eq-name", "Stranger Walker")
    p.fill("#eq-email", inbox)
    p.fill("#eq-phone", "612345678")
    p.select_option("#eq-topic", "Investor relations")
    p.fill("#eq-message", "We would like to discuss a two module block for a coastal site.")
    p.click('[data-testid="enquiry-submit"]')
    p.wait_for_selector('[data-testid="enquiry-reference"]', timeout=20000)
    ref = p.inner_text('[data-testid="enquiry-reference"]').strip()
    note("a reference appears in place", bool(re.fullmatch(r"ENQ-[A-Z0-9]{8}", ref)), ref)
    p.screenshot(path=f"{SHOTS}/04_enquiry_reference_in_place.png", full_page=True)

    # the acknowledgement really arrives, over SMTP, at that one inbox
    time.sleep(1.5)
    mail = p.request.get(f"http://mailpit:8025/api/v1/search?query=to:{inbox}")
    data = mail.json()
    msgs = data.get("messages", [])
    hit = next((m for m in msgs if m["Subject"] == f"Enquiry received: {ref}"), None)
    note("the acknowledgement carrying the reference reached that inbox", bool(hit),
         [m["Subject"] for m in msgs])
    if hit:
        note("addressed to that one address alone", len(hit["To"]) == 1
             and hit["To"][0]["Address"] == inbox, hit["To"])
        full = p.request.get(f"http://mailpit:8025/api/v1/message/{hit['ID']}").json()
        note("the body carries the topic and the reference",
             ref in full["Text"] and "Investor relations" in full["Text"], full["Text"][:160])
    ctx.close()
    return ref


def journey_4(page):
    """Ada reads the three documents at /investors/room; Ken meets the not-found page."""
    sign_in(page, "visitor@example.com")
    page.goto(f"{BASE}/investors/room")
    page.wait_for_selector('[data-testid="document-list"]', timeout=20000)
    docs = page.query_selector_all('[data-testid="document-list"] li')
    note("the approved account reads three documents", len(docs) == 3, len(docs))
    body = page.inner_text('[data-testid="document-list"]')
    note("the three seeded documents are named",
         "Investor Deck 2026" in body and "Technology Dossier" in body
         and "Licensing Roadmap" in body, body[:200])
    page.screenshot(path=f"{SHOTS}/05_document_room_approved.png", full_page=True)

    ctx = page.context.browser.new_context()
    p2 = ctx.new_page()
    attach(p2)
    sign_in(p2, "visitor2@example.com")
    p2.goto(f"{BASE}/investors/room")
    p2.wait_for_selector("h1", timeout=20000)
    p2.wait_for_timeout(800)
    text = p2.inner_text("main")
    note("the pending account meets the not-found page", "We cannot find that page" in text,
         text[:160])
    note("no document appears on the refused page", "Investor Deck 2026" not in text)
    p2.screenshot(path=f"{SHOTS}/06_document_room_not_found.png", full_page=True)
    ctx.close()


def journey_5(page):
    """Anyone enters 251 MW thermal at /calculator and reads 2, 4000 and 1800000."""
    page.goto(f"{BASE}/calculator")
    page.fill('[data-testid="calc-need"]', "251")
    page.select_option('[data-testid="calc-kind"]', "thermal")
    page.click('[data-testid="calc-submit"]')
    page.wait_for_selector('[data-testid="calc-results"]', timeout=15000)
    m = page.inner_text('[data-testid="calc-modules"]').replace(",", "")
    g = page.inner_text('[data-testid="calc-energy"]').replace(",", "")
    c = page.inner_text('[data-testid="calc-co2"]').replace(",", "")
    note("251 MW thermal reads 2, 4000 and 1800000",
         m == "2" and g == "4000" and c == "1800000", [m, g, c])
    page.screenshot(path=f"{SHOTS}/07_calculator_251_thermal.png", full_page=True)

    page.fill('[data-testid="calc-need"]', "0")
    page.click('[data-testid="calc-submit"]')
    page.wait_for_timeout(900)
    note("a need of zero is refused with a reason, not an error page",
         "Not calculated" in page.inner_text("main"), page.inner_text("main")[:200])


def extra_checks(page):
    # redirects
    ctx = page.context.browser.new_context()
    p = ctx.new_page()
    attach(p)
    p.goto(f"{BASE}/account")
    p.wait_for_url("**/signin?next=%2Faccount", timeout=15000)
    note("an unauthenticated visitor at /account goes to /signin?next=/account",
         "next=%2Faccount" in p.url, p.url)
    p.goto(f"{BASE}/investors/room")
    p.wait_for_url("**/signin?next=**", timeout=15000)
    note("an unauthenticated visitor at /investors/room goes to /signin?next=/investors/room",
         "investors" in p.url and "next=" in p.url, p.url)
    # login lands on next
    p.fill('[data-testid="signin-email"]', "visitor@example.com")
    p.fill('[data-testid="signin-password"]', PW)
    p.click('[data-testid="signin-submit"]')
    p.wait_for_url("**/investors/room", timeout=15000)
    note("login lands on next", p.url.endswith("/investors/room"), p.url)
    ctx.close()

    # the home outputs carry output_kind into the explorer
    page.goto(BASE)
    page.wait_for_selector(".outputs")
    hrefs = page.eval_on_selector_all(".outputs a", "els => els.map(e => e.getAttribute('href'))")
    note("the four outputs link into /solutions carrying output_kind",
         hrefs == ["/solutions?output_kind=heat", "/solutions?output_kind=heat-and-power",
                   "/solutions?output_kind=hydrogen", "/solutions?output_kind=electricity"], hrefs)
    note("the display line is on the home route",
         "Powering the World" in page.inner_text("h1.display"))
    page.screenshot(path=f"{SHOTS}/08_home_reactor.png", full_page=False)

    # newsroom paging: 3 at a time, featured excluded, two pages of three
    page.goto(f"{BASE}/news")
    page.wait_for_selector('[data-testid="story-wall"]')
    first = page.query_selector_all('[data-testid="story-wall"] li')
    note("the wall shows three at a time", len(first) == 3, len(first))
    note("the featured story is raised above the wall and excluded from it",
         "First module order signed" not in page.inner_text('[data-testid="story-wall"]'))
    page.click("button:has-text('More stories')")
    page.wait_for_timeout(600)
    second = page.query_selector_all('[data-testid="story-wall"] li')
    note("a more action brings in the next three, six in all", len(second) == 6, len(second))
    page.screenshot(path=f"{SHOTS}/09_newsroom_two_pages.png", full_page=True)

    # Escape closes a modal and focus returns to the control that opened it
    page.goto(f"{BASE}/team")
    page.wait_for_selector(".member")
    page.click("button:has-text('View bio')")
    page.wait_for_selector("[role='dialog']")
    note("the shared modal opens with a bio", "Mira Halvorsen" in page.inner_text("[role='dialog']"))
    page.screenshot(path=f"{SHOTS}/10_team_bio_modal.png", full_page=False)
    page.keyboard.press("Escape")
    page.wait_for_timeout(400)
    note("Escape closes the modal", page.query_selector("[role='dialog']") is None)
    focused = page.evaluate("() => document.activeElement && document.activeElement.textContent")
    note("focus returns to the control that opened it", "View bio" in (focused or ""), focused)

    # the account lists are private: ada's rows never appear for ken
    sign_in(page, "visitor2@example.com")
    page.goto(f"{BASE}/account")
    page.wait_for_selector("h1")
    page.wait_for_timeout(1200)
    text = page.inner_text("main")
    note("ken's account shows his own name", "Ken Adeyemi" in text, text[:120])
    note("ken never sees ada's enquiry reference", "ENQ-7K2M9QD4" not in text)
    note("ken never sees ada's access reference", "IAR-4H7N2PQ8" not in text)
    page.screenshot(path=f"{SHOTS}/11_account_private_lists.png", full_page=True)

    # a direct API call from ken's session to ada's row is refused, server-side
    ken_token = page.evaluate("() => window.localStorage.getItem('zj.token')")
    res = page.request.get(f"{BASE}/api/enquiries", headers={"Authorization": f"Bearer {ken_token}"})
    note("ken's enquiry list carries only his own rows",
         all("7K2M9QD4" not in e["reference"] for e in res.json()), res.json())
    denied = page.request.post(f"{BASE}/api/enquiries/1/close",
                               headers={"Authorization": f"Bearer {ken_token}"})
    note("a direct call naming ada's enquiry by its identifier is denied",
         denied.status == 404, denied.status)

    # a refusal says what happened without taking the app down
    page.goto(f"{BASE}/nowhere-at-all")
    page.wait_for_selector("h1")
    note("a mistyped address lands on the tidy not-found card",
         "We cannot find that page" in page.inner_text("main"))
    note("the not-found card points back to /",
         page.query_selector("main a[href='/']") is not None)
    page.screenshot(path=f"{SHOTS}/12_not_found.png", full_page=False)

    # responsive: no horizontal scrollbar at any named width
    for width, label in [(360, "phone"), (768, "tablet"), (1280, "desktop"), (1600, "large")]:
        page.set_viewport_size({"width": width, "height": 900})
        for route in ["/", "/solutions", "/account", "/calculator"]:
            page.goto(BASE + route)
            page.wait_for_timeout(400)
            overflow = page.evaluate(
                "() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1")
            note(f"no horizontal scrollbar at {label} on {route}", not overflow)
    page.set_viewport_size({"width": 390, "height": 850})
    page.goto(BASE + "/solutions")
    page.wait_for_timeout(500)
    page.screenshot(path=f"{SHOTS}/13_phone_explorer.png", full_page=False)
    page.set_viewport_size({"width": 1280, "height": 900})


def main():
    with sync_playwright() as pw:
        browser = pw.chromium.launch(
            executable_path="/root/.cache/ms-playwright/chromium-1148/chrome-linux/chrome",
            args=["--no-sandbox", "--disable-dev-shm-usage"],
        )
        ctx = browser.new_context(viewport={"width": 1280, "height": 900})
        page = ctx.new_page()
        attach(page)

        journey_1(page)
        journey_2(page)
        journey_3(page)
        journey_4(page)
        journey_5(page)
        extra_checks(page)

        ctx.close()
        browser.close()

    ok = sum(1 for _, o, _ in results if o)
    bad = [r for r in results if not r[1]]
    print(f"\n{ok} passed, {len(bad)} failed")
    for name, _, extra in bad:
        print(" - " + name + " :: " + str(extra))
    if console_errors:
        print("\nconsole errors:")
        for c in console_errors[:20]:
            print("  " + c)
    raise SystemExit(1 if bad or console_errors else 0)


main()
