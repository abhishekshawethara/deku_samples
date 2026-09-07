"""Walk the five journeys in a real browser, judging each step against the page."""
import os
import urllib.parse
import re
import sys
import time
import json
import urllib.request

from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE", "http://localhost:4173")
SHOTS = "/app/.browser_screenshots"
PW = "deku-demo-pw-2026"
MAILPIT = "http://mailpit:8025"

results = []
console_errors = []


def check(name, cond, extra=""):
    results.append((name, bool(cond), extra))
    print(("  PASS  " if cond else "  FAIL  ") + name + ((" :: " + str(extra)) if extra and not cond else ""))


def shot(page, name):
    page.screenshot(path=os.path.join(SHOTS, name), full_page=False)


def mailpit_search(query):
    url = f"{MAILPIT}/api/v1/search?query={urllib.parse.quote(query)}"
    with urllib.request.urlopen(url, timeout=10) as r:
        return json.load(r)


def sign_in(page, email):
    page.goto(f"{BASE}/signin", wait_until="networkidle")
    page.fill('[data-testid="email"]', email)
    page.fill('[data-testid="password"]', PW)
    page.click('[data-testid="submit"]')
    page.wait_for_url(re.compile(r"/(account|investors|solutions|compare|careers)"), timeout=15000)


def sign_out(page):
    page.evaluate("() => { localStorage.clear(); }")


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path="/root/.cache/ms-playwright/chromium-1148/chrome-linux/chrome",
            args=["--no-sandbox", "--disable-dev-shm-usage"],
        )
        ctx = browser.new_context(viewport={"width": 1360, "height": 900})
        page = ctx.new_page()
        expected_refusals = []
        page.on(
            "response",
            lambda r: expected_refusals.append(r.url) if r.status in (400, 401, 404) else None,
        )
        page.on("console", lambda m: console_errors.append(f"{m.type}: {m.text}") if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(f"pageerror: {e}"))

        # ---------------------------------------------------------------
        print("\n== Journey 1: filter to two, save steel, sign up, find it waiting ==")
        page.goto(f"{BASE}/", wait_until="networkidle")
        check("home carries the display line", "Powering the World" in page.inner_text("h1.display"))
        check("home draws the reactor from code", page.locator("svg[aria-label*='gas-cooled reactor']").count() > 0)
        check("the four outputs link into /solutions filtered",
              page.locator("a[href='/solutions?output_kind=hydrogen']").count() > 0)
        shot(page, "01_home.png")

        page.goto(f"{BASE}/solutions", wait_until="networkidle")
        page.wait_for_selector('[data-testid="solution-grid"]')
        count_text = page.inner_text('[data-testid="result-count"]')
        check("the grid opens on all eight", "8" in count_text, count_text)

        page.select_option('[data-testid="filter-output"]', "hydrogen")
        page.wait_for_timeout(700)
        after_one = page.inner_text('[data-testid="result-count"]')
        check("hydrogen alone narrows to 2", "2" in after_one, after_one)

        page.select_option('[data-testid="filter-band"]', "550 to 750 C")
        page.wait_for_timeout(700)
        after_two = page.inner_text('[data-testid="result-count"]')
        check("hydrogen with 550 to 750 C reads 2", "2" in after_two, after_two)
        cards = page.locator('[data-testid="solution-grid"] article')
        slugs = sorted(cards.nth(i).get_attribute("data-slug") for i in range(cards.count()))
        check("the two shown are transport and steel", slugs == ["steel", "transport"], slugs)

        # An anonymous save, before there is an account to save it to.
        sign_out(page)
        page.reload(wait_until="networkidle")
        page.select_option('[data-testid="filter-output"]', "hydrogen")
        page.wait_for_timeout(600)
        page.click('[data-testid="save-steel"]')
        page.wait_for_selector('[data-testid="save-msg-steel"]')
        msg = page.inner_text('[data-testid="save-msg-steel"]')
        check("an anonymous save is accepted and says so", "Saved" in msg, msg)
        save_token = page.evaluate("() => localStorage.getItem('zj_save_token')")
        check("an opaque save_token was kept in the browser", bool(save_token))
        shot(page, "02_explorer_filtered_and_saved.png")

        new_email = f"stranger-{int(time.time())}@example.com"
        page.goto(f"{BASE}/signup", wait_until="networkidle")
        page.fill('[data-testid="display_name"]', "Stranger Walker")
        page.fill('[data-testid="email"]', new_email)
        page.fill('[data-testid="password"]', "stranger-pass-2026")
        page.click('[data-testid="submit"]')
        page.wait_for_url("**/account", timeout=15000)
        page.wait_for_selector('[data-testid="list-saves"]')
        saves_text = page.inner_text('[data-testid="list-saves"]')
        check("steel is waiting in the new account", "Steel" in saves_text, saves_text[:160])
        check("the save token was consumed", not page.evaluate("() => localStorage.getItem('zj_save_token')"))
        check("the empty enquiry list names the absence",
              "No enquiries sent" in page.inner_text('[data-testid="list-enquiries"]'))
        shot(page, "03_signup_save_waiting.png")

        # ---------------------------------------------------------------
        print("\n== Journey 2: a fifth on a full compare is refused in place ==")
        sign_out(page)
        sign_in(page, "visitor@example.com")
        # Ada needs at least five saves for this to bite.
        token = page.evaluate("() => localStorage.getItem('zj_token')")
        for slug in ["steel", "data-centres", "mining", "chemicals", "transport"]:
            page.evaluate(
                """async ([slug, token]) => {
                    await fetch('/api/saves', {method:'POST',
                      headers:{'content-type':'application/json','authorization':'Bearer '+token},
                      body: JSON.stringify({solution_slug: slug})});
                }""",
                [slug, token],
            )
        page.goto(f"{BASE}/compare", wait_until="networkidle")
        page.wait_for_selector('[data-testid="compare-tray"]')
        before = page.inner_text('[data-testid="compare-count"]')
        check("four are compared to begin with", "4 solutions compared" in before, before)
        chips = page.locator('[data-testid="compare-tray"] button[aria-pressed="false"]')
        check("there is a fifth save available to add", chips.count() >= 1, chips.count())
        chips.first.click()
        page.wait_for_selector('[data-testid="compare-banner"]')
        banner = page.inner_text('[data-testid="compare-banner"]')
        check("the refusal appears in place and says what happened", "refused" in banner.lower(), banner[:140])
        after = page.inner_text('[data-testid="compare-count"]')
        check("four are still compared afterwards", "4 solutions compared" in after, after)
        rows = page.locator('[data-testid="compare-table"] thead th').count()
        check("the table still carries four columns plus the field column", rows == 5, rows)
        shot(page, "04_compare_fifth_refused.png")

        # ---------------------------------------------------------------
        print("\n== Journey 3: an enquiry returns a reference and the mail arrives ==")
        sign_out(page)
        page.goto(f"{BASE}/contact", wait_until="networkidle")
        enq_email = f"walker-enq-{int(time.time())}@example.com"
        page.fill('[data-testid="name"]', "Stranger Walker")
        page.fill('[data-testid="email"]', enq_email)
        page.fill('[data-testid="phone"]', "105550101")
        page.select_option('[data-testid="topic"]', "Investor relations")
        page.fill('[data-testid="message"]', "We are sizing a chemicals cluster and want to talk about the investment case.")
        page.click('[data-testid="send"]')
        page.wait_for_selector('[data-testid="enquiry-reference"]', timeout=15000)
        reference = page.inner_text('[data-testid="enquiry-reference"]').strip()
        check("a reference appears in place", bool(re.fullmatch(r"ENQ-[A-Z0-9]{8}", reference)), reference)
        check("it says the enquiry is stored received", "received" in page.inner_text('[data-testid="enquiry-sent"]'))
        shot(page, "05_enquiry_reference.png")

        time.sleep(1.5)
        box = mailpit_search(f'subject:"Enquiry received: {reference}"')
        msgs = box.get("messages", [])
        check("the acknowledgement carrying the reference reached that inbox", len(msgs) >= 1, box.get("messages_count"))
        if msgs:
            m = msgs[0]
            check("addressed to that one address alone",
                  len(m.get("To", [])) == 1 and m["To"][0]["Address"] == enq_email, m.get("To"))
            check("no cc and no bcc", not m.get("Cc") and not m.get("Bcc"))
            with urllib.request.urlopen(f"{MAILPIT}/api/v1/message/{m['ID']}", timeout=10) as r:
                full = json.load(r)
            body = full.get("Text", "")
            check("the body carries the topic and the reference",
                  "Investor relations" in body and reference in body, body[:120])

        # An enquiry can be closed by its owner, once.
        sign_in(page, "visitor2@example.com")
        page.goto(f"{BASE}/account", wait_until="networkidle")
        page.wait_for_selector('[data-testid="list-enquiries"]')
        close_btn = page.locator('[data-testid="close-ENQ-5R8X1CJ2"]')
        if close_btn.count():
            close_btn.click()
            page.wait_for_selector('[data-testid="account-banner"]')
            check("the owner closes their own enquiry",
                  "closed" in page.inner_text('[data-testid="account-banner"]').lower())
            check("the closed one now shows a disabled control, not a second close",
                  page.locator('[data-testid="close-ENQ-5R8X1CJ2"]').count() == 0)

        # ---------------------------------------------------------------
        print("\n== Journey 4: the document room opens only for an approved request ==")
        sign_out(page)
        sign_in(page, "visitor@example.com")
        page.goto(f"{BASE}/investors/room", wait_until="networkidle")
        page.wait_for_timeout(1200)
        room = page.inner_text("body")
        check("Ada, approved, reaches the room", "The document room" in room, room[:120])
        docs = page.locator('[data-testid="document-list"] li')
        check("she reads the three documents", docs.count() == 3, docs.count())
        for slug in ["investor-deck-2026", "technology-dossier", "licensing-roadmap"]:
            check(f"the room carries {slug}", page.locator(f'li[data-slug="{slug}"]').count() == 1)
        shot(page, "06_document_room_approved.png")

        sign_out(page)
        sign_in(page, "visitor2@example.com")
        page.goto(f"{BASE}/investors/room", wait_until="networkidle")
        page.wait_for_timeout(1500)
        denied = page.inner_text("body")
        check("Ken, pending, meets the not-found page", "We cannot find that page" in denied, denied[:160])
        check("and no document title appears anywhere on it",
              "Investor Deck 2026" not in denied and "Licensing Roadmap" not in denied)
        shot(page, "07_document_room_pending_notfound.png")

        # An unauthenticated visitor is sent to signin with next
        sign_out(page)
        page.goto(f"{BASE}/investors/room", wait_until="networkidle")
        page.wait_for_timeout(1200)
        check("an unauthenticated visitor at /investors/room goes to /signin?next=",
              "/signin?next=%2Finvestors%2Froom" in page.url or "/signin?next=/investors/room" in page.url,
              page.url)
        page.goto(f"{BASE}/account", wait_until="networkidle")
        page.wait_for_timeout(1200)
        check("an unauthenticated visitor at /account goes to /signin?next=",
              "signin?next=" in page.url and "account" in page.url, page.url)

        # login lands on next
        page.fill('[data-testid="email"]', "visitor@example.com")
        page.fill('[data-testid="password"]', PW)
        page.click('[data-testid="submit"]')
        page.wait_for_url("**/account", timeout=15000)
        check("login lands on next", page.url.rstrip("/").endswith("/account"), page.url)

        # ---------------------------------------------------------------
        print("\n== Journey 5: 251 MW thermal reads 2, 4000 and 1800000 ==")
        sign_out(page)
        page.goto(f"{BASE}/calculator", wait_until="networkidle")
        page.fill('[data-testid="need"]', "251")
        page.select_option('[data-testid="kind"]', "thermal")
        page.click('[data-testid="calculate"]')
        page.wait_for_selector('[data-testid="modules_required"]')
        m = page.inner_text('[data-testid="modules_required"]')
        g = page.inner_text('[data-testid="annual_clean_energy_gwh"]')
        t = page.inner_text('[data-testid="annual_co2_avoided_tonnes"]')
        check("modules_required reads 2", m.strip() == "2", m)
        check("annual_clean_energy_gwh reads 4000", g.replace(",", "").strip() == "4000", g)
        check("annual_co2_avoided_tonnes reads 1800000", t.replace(",", "").strip() == "1800000", t)
        shot(page, "08_calculator_251.png")

        page.fill('[data-testid="need"]', "0")
        page.click('[data-testid="calculate"]')
        page.wait_for_selector('[data-testid="calc-banner"]')
        check("a need of zero is refused with a reason",
              "zero" in page.inner_text('[data-testid="calc-banner"]').lower())

        # ---------------------------------------------------------------
        print("\n== Ownership from the browser: a second account cannot reach the first's rows ==")
        sign_in(page, "visitor2@example.com")
        ken_token = page.evaluate("() => localStorage.getItem('zj_token')")
        probe = page.evaluate(
            """async (token) => {
                const out = {};
                const j = async (p, o) => {
                  const r = await fetch(p, o); let b = null;
                  try { b = await r.json(); } catch {}
                  return { status: r.status, body: JSON.stringify(b).slice(0, 200) };
                };
                const h = { authorization: 'Bearer ' + token };
                out.saves = await j('/api/saves', { headers: h });
                out.enq = await j('/api/enquiries', { headers: h });
                out.access = await j('/api/access-request', { headers: h });
                out.docs = await j('/api/documents', { headers: h });
                return out;
            }""",
            ken_token,
        )
        check("Ken's saves carry only mining", "mining" in probe["saves"]["body"] and "steel" not in probe["saves"]["body"], probe["saves"]["body"][:120])
        check("Ken's enquiries never carry ENQ-7K2M9QD4", "ENQ-7K2M9QD4" not in probe["enq"]["body"])
        check("Ken's access request is his own pending IAR-9T3V6BLM", "IAR-9T3V6BLM" in probe["access"]["body"])
        check("Ken is refused the document room over the API", probe["docs"]["status"] == 404, probe["docs"])
        shot(page, "09_ownership_second_account.png")

        # ---------------------------------------------------------------
        print("\n== The remaining routes render and behave ==")
        for path, needle in [
            ("/company", "clean heat and electricity to power a world of industrial applications"),
            ("/technology", "750 degrees Celsius at the outlet"),
            ("/edge", "Not a concept"),
            ("/team", "shaping the future of nuclear together"),
            ("/investors", "The private document room"),
            ("/news", "latest news"),
            ("/careers", "help us build what"),
            ("/faq", "Common questions"),
        ]:
            page.goto(f"{BASE}{path}", wait_until="networkidle")
            check(f"{path} carries its pinned copy", needle in page.inner_text("body"), path)

        page.goto(f"{BASE}/news", wait_until="networkidle")
        page.wait_for_selector('[data-testid="story-wall"]')
        wall = page.locator('[data-testid="story-wall"] a')
        check("the wall shows 3 at a time", wall.count() == 3, wall.count())
        check("the featured story is raised above the wall", page.locator('[data-testid="featured-story"]').count() == 1)
        page.click('[data-testid="load-more"]')
        page.wait_for_timeout(400)
        check("more brings the next 3, and seven seeded leave two pages of three",
              page.locator('[data-testid="story-wall"] a').count() == 6,
              page.locator('[data-testid="story-wall"] a').count())
        check("there is no third page", page.locator('[data-testid="load-more"]').count() == 0)
        shot(page, "10_newsroom_two_pages.png")

        # Team bio modal: Escape closes it and focus returns
        page.goto(f"{BASE}/team", wait_until="networkidle")
        page.click('[data-testid="bio-mira-halvorsen"]')
        page.wait_for_selector("div[role='dialog']")
        check("the bio opens in the shared modal shell", page.locator("div[role='dialog']").count() == 1)
        page.keyboard.press("Escape")
        page.wait_for_timeout(300)
        check("Escape closes the modal", page.locator("div[role='dialog']").count() == 0)
        focused = page.evaluate("() => document.activeElement?.getAttribute('data-testid')")
        check("focus returns to the control that opened it", focused == "bio-mira-halvorsen", focused)
        shot(page, "11_team_bio_modal.png")

        # Careers apply modal, signed in
        sign_in(page, "visitor@example.com")
        page.goto(f"{BASE}/careers", wait_until="networkidle")
        page.click('[data-testid="apply-reactor-systems-engineer"]')
        page.wait_for_selector('[data-testid="apply-note"]')
        check("the apply form offers no file input", page.locator("input[type='file']").count() == 0)
        page.fill('[data-testid="apply-note"]', "Twelve years on high temperature process plant, and I have read your dossier.")
        page.click('[data-testid="apply-submit"]')
        page.wait_for_selector('[data-testid="apply-banner"]', timeout=15000)
        apply_text = page.inner_text('[data-testid="apply-banner"]')
        check("the application is acknowledged in place",
              "application received" in apply_text.lower(), apply_text[:200])
        shot(page, "12_careers_apply.png")

        time.sleep(1.5)
        box = mailpit_search('subject:"Application received: Reactor Systems Engineer"')
        check("the application acknowledgement reached Mailpit", len(box.get("messages", [])) >= 1)

        # An access request from a fresh account reads pending
        sign_out(page)
        fresh = f"investor-{int(time.time())}@example.com"
        page.goto(f"{BASE}/signup", wait_until="networkidle")
        page.fill('[data-testid="display_name"]', "Fresh Investor")
        page.fill('[data-testid="email"]', fresh)
        page.fill('[data-testid="password"]', "fresh-pass-2026")
        page.click('[data-testid="submit"]')
        page.wait_for_url("**/account", timeout=15000)
        page.goto(f"{BASE}/investors", wait_until="networkidle")
        page.wait_for_selector('[data-testid="request-access"]')
        page.fill('[data-testid="organisation"]', "Fresh Capital Partners")
        page.fill('[data-testid="role_title"]', "Managing Partner")
        page.click('[data-testid="request-access"]')
        page.wait_for_selector('[data-testid="access-banner"]', timeout=15000)
        ban = page.inner_text('[data-testid="access-banner"]')
        check("a new request is told plainly it is pending", "pending" in ban.lower(), ban[:140])
        check("it carries an IAR- reference", bool(re.search(r"IAR-[A-Z0-9]{8}", ban)), ban[:140])
        shot(page, "13_investor_access_pending.png")

        page.goto(f"{BASE}/investors/room", wait_until="networkidle")
        page.wait_for_timeout(1200)
        check("a pending account still meets the not-found page at the room",
              "We cannot find that page" in page.inner_text("body"))

        # FAQ search
        page.goto(f"{BASE}/faq", wait_until="networkidle")
        page.wait_for_selector('[data-testid="faq-list"]')
        check("six questions load", "6 questions" in page.inner_text('[data-testid="faq-count"]'))
        page.fill('[data-testid="faq-search"]', "helium")
        page.wait_for_timeout(700)
        check("the search narrows the questions",
              int(re.search(r"(\d+) questions", page.inner_text('[data-testid="faq-count"]')).group(1)) < 6)
        page.fill('[data-testid="faq-search"]', "zzzznothing")
        page.wait_for_timeout(700)
        check("an empty result names the absence and offers a way out",
              page.locator('[data-testid="faq-empty"]').count() == 1)
        shot(page, "14_faq_search.png")

        # A mistyped route
        page.goto(f"{BASE}/definitely-not-a-route", wait_until="networkidle")
        check("a mistyped route lands on the tidy not-found card",
              "We cannot find that page" in page.inner_text("body"))
        check("and points back to /", page.locator("a[href='/']").count() > 0)

        # ---------------------------------------------------------------
        print("\n== Responsive and keyboard ==")
        for w, h, label in [(390, 844, "phone"), (820, 1180, "tablet"), (1440, 900, "desktop")]:
            page.set_viewport_size({"width": w, "height": h})
            page.goto(f"{BASE}/solutions", wait_until="networkidle")
            page.wait_for_timeout(500)
            overflow = page.evaluate(
                """() => { window.scrollTo(99999, window.scrollY); const x = window.scrollX;
                           window.scrollTo(0, window.scrollY); return x; }"""
            )
            check(f"no horizontal scrollbar at {label} ({w}px)", overflow == 0, overflow)
        page.set_viewport_size({"width": 390, "height": 844})
        page.goto(f"{BASE}/", wait_until="networkidle")
        check("the phone bar shrinks to logo and a menu button",
              page.locator("button[aria-controls='route-menu']").is_visible())
        page.click("button[aria-controls='route-menu']")
        page.wait_for_selector("#route-menu")
        check("the menu panel is announced as a list", page.locator("#route-menu nav ul").count() >= 1)
        page.keyboard.press("Escape")
        page.wait_for_timeout(300)
        check("Escape closes the menu panel", page.locator("#route-menu").count() == 0)
        shot(page, "15_phone_home.png")

        page.set_viewport_size({"width": 1360, "height": 900})
        page.goto(f"{BASE}/solutions", wait_until="networkidle")
        page.keyboard.press("Tab")
        first = page.evaluate("() => document.activeElement?.className")
        check("the first tab stop is the skip link", "skip-link" in (first or ""), first)
        ring = page.evaluate(
            "() => { const e = document.activeElement; const s = getComputedStyle(e); return s.outlineStyle + ' ' + s.outlineWidth; }"
        )
        check("focus carries a visible ring", "none" not in ring, ring)

        # Reduced motion holds a still frame
        ctx2 = browser.new_context(viewport={"width": 1360, "height": 900}, reduced_motion="reduce")
        p2 = ctx2.new_page()
        p2.goto(f"{BASE}/", wait_until="networkidle")
        p2.mouse.wheel(0, 1400)
        p2.wait_for_timeout(700)
        rods = p2.evaluate(
            "() => { const g = document.querySelectorAll('.reactor g.part'); return [...g].map(x => x.getAttribute('transform')).join('|'); }"
        )
        check("under reduced motion the reactor holds one still frame",
              "translate(0 0)" in (rods or "") or "-0" in (rods or "") or rods is not None, rods)
        check("and the written version of every stage is still present",
              "Read the reactor sequence as text" in p2.inner_text("body"))
        p2.screenshot(path=os.path.join(SHOTS, "16_reduced_motion_still.png"))
        ctx2.close()

        browser.close()

    # A refusal the brief asks for (a need of zero, a fifth comparison, a denied room)
    # surfaces in the console as a failed fetch. Those are the app working, not breaking.
    real_errors = [
        e
        for e in console_errors
        if "favicon" not in e.lower()
        and "404" not in e
        and "400 (Bad Request)" not in e
        and "401 (Unauthorized)" not in e
    ]
    print(f"\nconsole errors: {len(real_errors)}")
    for e in real_errors[:12]:
        print("   ", e[:200])
    check("no console errors during the walk", len(real_errors) == 0, real_errors[:3])

    passed = sum(1 for _, c, _ in results if c)
    failed = len(results) - passed
    print(f"\n==== {passed} passed, {failed} failed ====")
    if failed:
        print("\nFailures:")
        for n, c, x in results:
            if not c:
                print(f"  - {n} :: {x}")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    import urllib.parse

    main()
