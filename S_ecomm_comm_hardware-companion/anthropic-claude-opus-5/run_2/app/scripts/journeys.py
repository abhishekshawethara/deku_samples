"""
Walks the six journeys in the brief through a real browser, reading values back
off the page rather than judging by eye, and watching the console.

Saves one screenshot per journey into /app/.browser_screenshots/.
"""
import os
import re
import sys
import json
import urllib.request
import base64

from playwright.sync_api import sync_playwright, expect

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:4173"
SHOTS = "/app/.browser_screenshots"
PASSWORD = "deku-demo-pw-2026"

failures = []
console_errors = []


def check(name, ok, detail=""):
    print(f"{'PASS' if ok else 'FAIL'}  {name}{('  ' + str(detail)) if detail else ''}")
    if not ok:
        failures.append(name)


def kb_get(path):
    url = os.environ["PAYMENTS_API_URL"] + path
    req = urllib.request.Request(url)
    req.add_header("X-Killbill-ApiKey", os.environ["PAYMENTS_API_KEY"])
    req.add_header("X-Killbill-ApiSecret", os.environ["PAYMENTS_API_SECRET"])
    creds = f"{os.environ['PAYMENTS_ADMIN_USER']}:{os.environ['PAYMENTS_ADMIN_PASSWORD']}"
    req.add_header("Authorization", "Basic " + base64.b64encode(creds.encode()).decode())
    req.add_header("Accept", "application/json")
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.load(r)


def mailpit(path):
    url = os.environ.get("MAILPIT_URL", "http://mailpit:8025") + path
    with urllib.request.urlopen(url, timeout=20) as r:
        return json.load(r)


def chromium_path():
    """Use whichever Chromium this environment actually has installed."""
    import glob
    for pattern in (
        "/root/.cache/ms-playwright/chromium-*/chrome-linux/chrome",
        "/root/.cache/ms-playwright/chromium_headless_shell-*/chrome-linux/headless_shell",
    ):
        found = sorted(glob.glob(pattern))
        if found:
            return found[-1]
    return None


with sync_playwright() as pw:
    exe = chromium_path()
    browser = pw.chromium.launch(executable_path=exe) if exe else pw.chromium.launch()
    ctx = browser.new_context(viewport={"width": 1440, "height": 960})
    page = ctx.new_page()
    page.on("console", lambda m: console_errors.append(f"{m.type}: {m.text}")
            if m.type == "error" else None)
    page.on("pageerror", lambda e: console_errors.append(f"pageerror: {e}"))

    # ---------------------------------------------------------- journey 1
    print("\n=== 1. The letter")
    page.goto(BASE + "/", wait_until="networkidle")

    check("title reads 'the table'", page.locator("h1.title").inner_text().strip() == "the table")
    check("dateline reads 'June 1, 2026'",
          page.locator("p.dateline").inner_text().strip() == "June 1, 2026")
    paras = page.locator("article.letter p.para").count()
    check("sixteen paragraphs in normal flow", paras == 16, f"found {paras}")
    check("closing line reads 'See you soon.'",
          page.locator("p.closing").inner_text().strip() == "See you soon.")

    # The film is inert: hidden from assistive technology and not focusable.
    check("the stage is hidden from assistive technology",
          page.locator("#letter-stage").get_attribute("aria-hidden") == "true")
    check("the driven layer is hidden from assistive technology",
          page.locator("#letter-driven").get_attribute("aria-hidden") == "true")

    # The darkening is a pure function of scroll position.
    def darken():
        return float(page.evaluate(
            "getComputedStyle(document.getElementById('letter-stage'))"
            ".getPropertyValue('--darken') || 0"))

    # A quarter and a half of the *scrollable* distance, not of the document.
    def scroll_to_fraction(f):
        page.evaluate(
            "f => window.scrollTo(0, "
            "(document.documentElement.scrollHeight - window.innerHeight) * f)", f)
        page.wait_for_timeout(260)

    top = darken()
    scroll_to_fraction(0.25)
    quarter = darken()
    scroll_to_fraction(0.5)
    half = darken()
    scroll_to_fraction(1.0)
    bottom = darken()
    # Scrolling back up lifts it in exact proportion.
    scroll_to_fraction(0.25)
    back = darken()

    check("darkening rises in proportion to scroll",
          top < quarter < half < bottom, f"{top} -> {quarter} -> {half} -> {bottom}")
    check("darkening is fully drawn by the end", bottom == 1.0, bottom)
    check("darkening tracks a scroll backwards precisely", abs(back - quarter) < 0.02,
          f"quarter={quarter} back={back}")
    check("stopping halfway leaves it halfway", 0.0 < half < 1.0, half)

    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    page.wait_for_timeout(300)
    footer_links = page.locator(".letter-footer .links a, .letter-footer .links span")
    check("footer carries six links", footer_links.count() == 6, footer_links.count())
    check("footer links read in the required order",
          [footer_links.nth(i).inner_text().strip() for i in range(6)] ==
          ["Shop", "Support", "Terms", "Privacy", "Jobs", "Contact"])
    check("'All rights reserved' is present",
          "All rights reserved" in page.locator(".letter-footer").inner_text())
    page.screenshot(path=f"{SHOTS}/01_letter.png", full_page=False)

    # Follow Shop in the footer.
    page.locator(".letter-footer .links a", has_text="Shop").click()
    page.wait_for_load_state("networkidle")
    check("footer Shop link leads to /shop", page.url.endswith("/shop"), page.url)

    # ---------------------------------------------------------- journey 2
    print("\n=== 2. Catalogue to cart")
    page.goto(BASE + "/shop", wait_until="networkidle")
    page.get_by_role("heading", name="Vela Cricket").click()
    page.wait_for_load_state("networkidle")
    check("landed on the Cricket", "/shop/compact" in page.url, page.url)

    page.get_by_role("radio", name=re.compile("Graphite")).check()
    page.wait_for_timeout(200)
    check("choosing an option puts it in the address", "variant=VELA-CRICKET-GRAPHITE" in page.url,
          page.url)
    check("price reads $299.00", page.locator("[data-price]").inner_text().strip() == "$299.00")

    page.get_by_role("button", name="Add to cart").click()
    page.wait_for_timeout(700)

    page.goto(BASE + "/shop/case", wait_until="networkidle")
    page.get_by_role("button", name="Add to cart").click()
    page.wait_for_timeout(700)

    page.goto(BASE + "/cart", wait_until="networkidle")
    subtotal = page.locator('[data-total="subtotal"]').inner_text().strip()
    check("cart subtotal reads $378.00", subtotal == "$378.00", subtotal)
    check("protection is unticked by default",
          not page.locator("input[data-protection]").is_checked())
    check("the estimate note is present",
          "Estimated. We will show the exact amount once we know where it is going."
          in page.locator(".summary").inner_text())
    page.screenshot(path=f"{SHOTS}/02_cart.png", full_page=False)

    # ---------------------------------------------------------- journey 3
    print("\n=== 3. Guest checkout")
    page.get_by_role("link", name="Continue").click()
    page.wait_for_load_state("networkidle")
    check("step one is its own route", page.url.endswith("/checkout/where-it-goes"), page.url)

    page.fill("#email", "customer@example.com")
    page.fill("#name", "Iris Vantaa")
    page.fill("#line1", "44 Harbour Road")
    page.fill("#city", "Portland")
    page.fill("#region", "OR")
    page.fill("#postal_code", "97204")
    page.get_by_role("button", name="Continue to delivery").click()
    page.wait_for_load_state("networkidle")
    check("step two is its own route", page.url.endswith("/checkout/how-it-gets-there"), page.url)

    # No method is preselected.
    checked = page.locator('input[name="shipping_method"]:checked').count()
    check("no delivery method is preselected", checked == 0, checked)

    page.get_by_role("radio", name=re.compile("Standard")).check()
    page.get_by_role("button", name="Continue to payment").click()
    page.wait_for_load_state("networkidle")
    check("step three is its own route", page.url.endswith("/checkout/payment"), page.url)

    # Every entered value survives a back navigation and a reload.
    page.go_back()
    page.wait_for_load_state("networkidle")
    page.go_back()
    page.wait_for_load_state("networkidle")
    check("email survives a back navigation",
          page.input_value("#email") == "customer@example.com")
    check("address survives a back navigation", page.input_value("#line1") == "44 Harbour Road")
    page.reload(wait_until="networkidle")
    check("email survives a reload", page.input_value("#email") == "customer@example.com")

    # What the providers hold before the order, so the checks below measure this
    # order rather than what earlier runs left behind.
    acct_before = kb_get("/1.0/kb/accounts?externalKey=customer%40example.com")
    invoices_before = len(kb_get(
        f"/1.0/kb/accounts/{acct_before['accountId']}/invoices"
        "?withItems=true&includeInvoiceComponents=true"))
    mail_before = mailpit("/api/v1/messages?limit=1")["messages_count"]

    page.goto(BASE + "/checkout/payment", wait_until="networkidle")
    body = page.locator("main").inner_text()
    tax = page.locator(".final-totals div:nth-child(3) dd").inner_text().strip()
    total = page.locator(".final-total dd").inner_text().strip()
    check("tax line reads $37.80", tax == "$37.80", tax)
    check("total reads $415.80", total == "$415.80", total)
    page.screenshot(path=f"{SHOTS}/03_checkout_payment.png", full_page=False)

    page.get_by_role("button", name="Place order").click()
    page.wait_for_url(re.compile(r"/orders/VE-"), timeout=45000)
    page.wait_for_load_state("networkidle")

    number = re.search(r"/orders/(VE-\d{4}-\d{4})", page.url).group(1)
    check("landed on /orders/VE-2026-0002", number == "VE-2026-0002", number)
    confirm = page.locator(".confirmed").inner_text().strip()
    expected = f"Order {number} is confirmed. We have emailed customer@example.com."
    check("confirmation copy is exact", confirm == expected, confirm)
    check("a control reads 'Keep track of this order'",
          page.get_by_role("link", name="Keep track of this order").count() == 1)
    order_total = page.locator(".totals-final dd").inner_text().strip()
    check("order total reads $415.80 USD", order_total == "$415.80 USD", order_total)
    page.screenshot(path=f"{SHOTS}/04_order_confirmed.png", full_page=False)

    # The money is a real record held outside this app. Compare against what the
    # provider held before this order, so records left by an earlier run of this
    # script do not read as duplicates of this one.
    acct = kb_get("/1.0/kb/accounts?externalKey=customer%40example.com")
    invoices = kb_get(
        f"/1.0/kb/accounts/{acct['accountId']}/invoices"
        "?withItems=true&includeInvoiceComponents=true")
    mine = [i for i in invoices
            if any(it.get("description") == f"Vela order {number}" for it in i.get("items", []))]
    check("killbill raised exactly one invoice for this order",
          len(invoices) == invoices_before + 1,
          f"account held {invoices_before}, now holds {len(invoices)}")
    check("an invoice exists on the order email for this order", len(mine) >= 1, len(mine))
    check("that invoice is 415.80 USD",
          mine and float(mine[0]["amount"]) == 415.80 and mine[0]["currency"] == "USD",
          f"{mine[0]['amount']} {mine[0]['currency']}" if mine else "none")

    mail_after = mailpit("/api/v1/messages?limit=1")["messages_count"]
    check("exactly one mail was sent for this order", mail_after == mail_before + 1,
          f"mailbox held {mail_before}, now holds {mail_after}")
    mail = mailpit(f"/api/v1/search?query={number}")
    if mail["messages"]:
        m = mail["messages"][0]
        check("subject reads 'Order confirmed: VE-2026-0002'",
              m["Subject"] == f"Order confirmed: {number}", m["Subject"])
        check("it went to the order email alone",
              len(m["To"]) == 1 and m["To"][0]["Address"] == "customer@example.com")
        check("no cc and no bcc", not m.get("Cc") and not m.get("Bcc"))

    # ---------------------------------------------------------- journey 4
    print("\n=== 4. Register a camera")
    page.goto(BASE + "/sign-in", wait_until="networkidle")
    page.fill("#email", "customer@example.com")
    page.fill("#password", PASSWORD)
    page.get_by_role("button", name="Sign in").click()
    page.wait_for_load_state("networkidle")
    check("signing in with no intended path lands on /account", page.url.endswith("/account"),
          page.url)

    page.goto(BASE + "/account/cameras", wait_until="networkidle")
    page.fill("#serial", "VA2609KTMHX4")
    page.get_by_role("button", name="Register").click()
    page.wait_for_timeout(1200)

    grid_text = page.locator("[data-camera-grid]").inner_text()
    check("the camera joined the grid", "VA2609KTMHX4" in grid_text)
    check("it reads 'Not yet connected'", "Not yet connected" in grid_text)
    page.screenshot(path=f"{SHOTS}/05_cameras.png", full_page=False)

    # The ownership boundary is real.
    page.fill("#serial", "VA2609NRWB2Z")
    page.get_by_role("button", name="Register").click()
    page.wait_for_timeout(900)
    msg = page.locator("[data-register-message]").inner_text().strip()
    check("another customer's camera is refused with the exact copy",
          msg == "That camera is registered to someone else.", msg)

    page.goto(BASE + "/account/cameras/VA2609NRWB2Z")
    check("another customer's camera reads as not found",
          page.locator("h1").inner_text().strip() == "That page does not exist.")

    # ---------------------------------------------------------- journey 5
    print("\n=== 5. Downloads")
    page.goto(BASE + "/downloads", wait_until="networkidle")
    check("the requirement line is exact",
          "Arranger requires macOS 13.0 or later. Download the app below."
          in page.locator("main").inner_text())
    check("the primary control names the newest version",
          page.get_by_role("link", name="Download Arranger 2.0.0").count() == 1)

    titles = page.locator(".release .release-title").all_inner_texts()
    check("the archive orders by build descending",
          [t.strip() for t in titles] ==
          ["Arranger 2.0.0", "Arranger 1.4.4", "Arranger 1.4.3", "Arranger 1.4.2"], titles)

    opened = page.locator(".release[open]").count()
    check("only the newest release is expanded on arrival", opened == 1, opened)

    # The whole archive is in the markup whatever the collapse state.
    html = page.content()
    check("collapsed releases are still in the markup",
          "Frames now import in the order the camera recorded them." in html)

    page.locator(".release", has_text="Arranger 1.4.3").locator("summary").click()
    page.wait_for_timeout(200)
    check("a collapsed release expands",
          page.locator(".release", has_text="Arranger 1.4.3").get_attribute("open") is not None)
    page.screenshot(path=f"{SHOTS}/06_downloads.png", full_page=False)

    check("the web path carries its warning",
          "Only use this if Arranger cannot see your camera."
          in page.locator("main").inner_text())
    page.get_by_role("link", name="Firmware install (web-based)").click()
    page.wait_for_load_state("networkidle")
    check("it leads to /doctor", page.url.endswith("/doctor"), page.url)

    # ---------------------------------------------------------- journey 6
    print("\n=== 6. The firmware installer")
    text = page.locator("main").inner_text()
    check("the warning copy is exact",
          "This replaces the software inside your camera. It takes about ninety seconds. "
          "Do not unplug the camera and do not let your computer go to sleep. "
          "If you are on a laptop, plug it in." in " ".join(text.split()))
    check("the connect control is unavailable before the warning is accepted",
          page.locator("[data-connect]").is_disabled())
    check("unavailability is not signalled by colour alone",
          page.locator("[data-connect-blocked]").is_visible())

    page.get_by_role("button", name="I understand").click()
    page.wait_for_timeout(200)
    check("accepting the warning enables the connect control",
          not page.locator("[data-connect]").is_disabled())

    page.fill("[data-serial]", "VC2609PVDA7Q")
    page.get_by_role("button", name="Find my camera").click()
    page.wait_for_timeout(1200)

    identity = page.locator("[data-identity]").inner_text().strip()
    check("the page states the model, serial and current version",
          identity == "Vela Cricket, serial VC2609PVDA7Q, currently running 7.0", identity)

    page.get_by_role("button", name="Install this version").click()
    page.wait_for_selector("[data-result]:not([hidden])", timeout=45000)
    result = page.locator("[data-result]").inner_text().strip()
    check("it closes by stating the version read back from the device",
          result == "Done. Your camera is running 7.2.", result)
    page.screenshot(path=f"{SHOTS}/07_doctor.png", full_page=False)

    # ------------------------------------------------- narrow viewport check
    print("\n=== Layout at a narrow width")
    narrow = ctx.new_page()
    narrow.set_viewport_size({"width": 390, "height": 844})
    for path in ["/", "/shop", "/cart", "/downloads", "/doctor", "/account/cameras"]:
        narrow.goto(BASE + path, wait_until="networkidle")
        overflow = narrow.evaluate(
            "document.documentElement.scrollWidth > document.documentElement.clientWidth + 1")
        check(f"{path} never scrolls sideways at 390px", not overflow)
    narrow.goto(BASE + "/shop", wait_until="networkidle")
    check("the rail collapses to one control on a narrow viewport",
          narrow.locator(".rail-toggle-button").is_visible())
    narrow.screenshot(path=f"{SHOTS}/08_narrow_shop.png", full_page=False)
    narrow.close()

    # ------------------------------------------------------- skip link check
    print("\n=== Accessibility")
    page.goto(BASE + "/shop", wait_until="networkidle")
    page.keyboard.press("Tab")
    focused = page.evaluate("document.activeElement.className")
    check("the skip link is the first focusable element", "skip-link" in (focused or ""), focused)

    page.goto(BASE + "/", wait_until="networkidle")
    page.keyboard.press("Tab")
    focused = page.evaluate(
        "({cls: document.activeElement.className, href: document.activeElement.getAttribute('href')})")
    check("the letter's skip link targets the writing",
          "skip-link" in (focused["cls"] or "") and focused["href"] == "#letter", focused)

    browser.close()

print("\n=== console")
# The walk deliberately provokes two server refusals: registering a camera owned
# by somebody else (409) and opening that camera's page (404). The browser logs
# a resource error for each, and those are the app working, not breaking.
expected_noise = re.compile(r"status of (404|409)|favicon", re.I)
real = [e for e in console_errors if not expected_noise.search(e)]
check("no unexpected console errors during the walk", len(real) == 0, "; ".join(real[:4]))

print(f"\n{'ALL JOURNEYS PASSED' if not failures else str(len(failures)) + ' CHECK(S) FAILED'}")
for f in failures:
    print(f"  - {f}")
sys.exit(0 if not failures else 1)
