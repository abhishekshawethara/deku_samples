#!/usr/bin/env python3
"""Entry, redirects and the expired-token path, driven in a real browser."""
import json
import urllib.parse
import urllib.request

from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:4173"
CHROME = "/root/.cache/ms-playwright/chromium_headless_shell-1148/chrome-linux/headless_shell"
PW = "deku-demo-pw-2026"

passed, failed = [], []


def check(name, cond, detail=""):
    (passed if cond else failed).append(name)
    print(f"{'PASS' if cond else 'FAIL'}  {name}" + (f"  :: {detail}" if detail and not cond else ""))


with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=CHROME)

    print("=== unauthenticated entry ===")
    for path in ["/account", "/investors/room"]:
        ctx = browser.new_context()
        page = ctx.new_page()
        page.goto(BASE + path, wait_until="networkidle")
        page.wait_for_url("**/signin**", timeout=15000)
        url = urllib.parse.unquote(page.url)
        check(f"an unauthenticated visitor at {path} goes to /signin?next={path}",
              "/signin" in url and url.endswith(f"next={path}"), url)
        ctx.close()

    print("\n=== login lands on next ===")
    ctx = browser.new_context()
    page = ctx.new_page()
    page.goto(f"{BASE}/signin?next=/calculator", wait_until="networkidle")
    page.fill("#email", "visitor@example.com")
    page.fill("#password", PW)
    page.click('button[type="submit"]')
    page.wait_for_url("**/calculator", timeout=15000)
    check("login lands on next when one is given", page.url.endswith("/calculator"), page.url)
    ctx.close()

    print("\n=== login with no next lands on /account ===")
    ctx = browser.new_context()
    page = ctx.new_page()
    page.goto(f"{BASE}/signin", wait_until="networkidle")
    page.fill("#email", "visitor@example.com")
    page.fill("#password", PW)
    page.click('button[type="submit"]')
    page.wait_for_url("**/account", timeout=15000)
    check("login with no next lands on /account", page.url.endswith("/account"), page.url)

    print("\n=== logout returns to / ===")
    page.click("button:has-text('Sign out')")
    page.wait_for_url(f"{BASE}/", timeout=15000)
    check("logout returns to /", page.url.rstrip("/").endswith("4173"), page.url)
    token_after = page.evaluate("() => localStorage.getItem('zj_token')")
    check("and the session is cleared", token_after in (None, ""), str(token_after))
    ctx.close()

    print("\n=== an expired token is cleared and sends them to /signin?next=<current> ===")
    ctx = browser.new_context()
    page = ctx.new_page()
    page.goto(f"{BASE}/", wait_until="networkidle")
    page.evaluate("""() => {
        localStorage.setItem('zj_token', 'ZXhwaXJlZA.notarealsignature');
        localStorage.setItem('zj_account', JSON.stringify({id:1,email:'visitor@example.com',display_name:'Ada Moreau'}));
    }""")
    page.goto(f"{BASE}/account", wait_until="networkidle")
    page.wait_for_url("**/signin**", timeout=15000)
    check("a bad or expired token sends the visitor to signin carrying the route",
          "/signin" in page.url and "next=/account" in urllib.parse.unquote(page.url), page.url)
    ctx.close()

    print("\n=== a signed-in visitor without an approved request gets the not-found page ===")
    ctx = browser.new_context()
    page = ctx.new_page()
    page.goto(f"{BASE}/signin?next=/investors/room", wait_until="networkidle")
    page.fill("#email", "visitor2@example.com")
    page.fill("#password", PW)
    page.click('button[type="submit"]')
    page.wait_for_url("**/investors/room", timeout=15000)
    page.wait_for_selector(".notfound, ul.docs", timeout=15000)
    body = page.inner_text("body")
    check("the pending account meets 'We cannot find that page'",
          "We cannot find that page" in body, body[:150])
    ctx.close()

    print("\n=== a mistyped address lands on the not-found card ===")
    ctx = browser.new_context()
    page = ctx.new_page()
    resp = page.goto(f"{BASE}/not-a-real-route", wait_until="networkidle")
    check("an unknown route answers 404", resp.status == 404, str(resp.status))
    body = page.inner_text("body")
    check("and shows the not-found card with a link back to /",
          "We cannot find that page" in body and page.locator("a[href='/']").count() > 0, body[:150])
    ctx.close()

    print("\n=== the four outputs on / link into /solutions carrying output_kind ===")
    ctx = browser.new_context()
    page = ctx.new_page()
    page.goto(BASE, wait_until="networkidle")
    hrefs = page.eval_on_selector_all(
        "a[href*='/solutions?output_kind=']", "els => els.map(e => e.getAttribute('href'))")
    kinds = sorted({h.split("output_kind=")[1] for h in hrefs})
    check("all four output kinds link through",
          kinds == ["electricity", "heat", "heat-and-power", "hydrogen"], str(kinds))

    page.click("a[href='/solutions?output_kind=hydrogen']")
    page.wait_for_url("**/solutions?output_kind=hydrogen", timeout=15000)
    page.wait_for_selector("form.filters")
    check("the explorer opens already filtered to hydrogen",
          "Showing 2 of 8" in page.inner_text("form.filters"), page.inner_text("form.filters")[-90:])
    ctx.close()

    browser.close()

print(f"\n{len(passed)} passed, {len(failed)} failed")
for f in failed:
    print("  -", f)
