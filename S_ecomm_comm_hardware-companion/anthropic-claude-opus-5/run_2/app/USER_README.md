# Vela — how to sign in and what to look at

Vela sells two cameras and supports them afterwards. The front page is a letter;
everything after it is an operational surface.

## Login credentials

Both seeded accounts use the same password.

| Email | Name | Password |
|---|---|---|
| `customer@example.com` | Iris Vantaa | `deku-demo-pw-2026` |
| `customer2@example.com` | Rune Halden | `deku-demo-pw-2026` |

This is benchmark fixture data, not a secret. Passwords are stored hashed
(scrypt); the literal above is what works at the sign-in form.

Signup is open, so you may also create your own account at `/sign-up`.
**An account is never required to buy** — guest checkout is the default path.

## The seeded journey

1. Open `/` and read the letter: the title `the table`, the dateline
   `June 1, 2026`, sixteen paragraphs and the closing line `See you soon.`
   Scroll: the picture behind the writing darkens in exact proportion to how far
   you have scrolled, and lifts again when you scroll back up. Follow `Shop` in
   the footer.
2. On `/shop` open `Vela Cricket`, choose **Graphite**, add one to the cart. Open
   `Travel Case` and add one. `/cart` reads a subtotal of **$378.00**. Leave the
   protection toggle unticked and continue.
3. Enter `customer@example.com` and a US address, choose **Standard**, and review
   a tax line of **$37.80** and a total of **$415.80**. Place the order. You land
   on `/orders/VE-2026-0002` reading
   `Order VE-2026-0002 is confirmed. We have emailed customer@example.com.`
4. Sign in as `customer@example.com`, open `/account/cameras`, type
   `VA2609KTMHX4` into the register row and submit. The camera joins the grid
   reading `Not yet connected`.
5. Open `/downloads`, expand `Arranger 1.4.3` in the archive, then follow
   `Firmware install (web-based)` to `/doctor`.
6. On `/doctor` accept the warning, enter the serial `VC2609PVDA7Q`, and follow
   the installer through to `Done. Your camera is running 7.2.`

## Where the facts actually live

Nothing important is held inside this app alone.

- **The invoice is in killbill.** Placing the seeded order creates or reuses the
  account whose `externalKey` is `customer@example.com` and raises one invoice on
  it for `415.80` `USD`.

  Note on reading it back: this killbill's
  `GET /1.0/kb/invoices/pagination` returns *shallow* invoices — it does not load
  invoice items, so it reports `amount` as `0.0` for every invoice on the tenant,
  including ones created by other means. To see the real figure, read the invoice
  itself or the account's invoices with components:

  ```
  GET /1.0/kb/accounts/{accountId}/invoices?withItems=true&includeInvoiceComponents=true
  GET /1.0/kb/invoices/{invoiceId}
  ```

- **The confirmation mail is in Mailpit**, sent over real SMTP. Exactly one mail
  per confirmed order, to the order's address alone with no cc and no bcc,
  subject `Order confirmed: VE-2026-0002`.
- **Orders, stock, devices, ownership and flash sessions are in PostgreSQL.**

Submitting the same order twice with one `Idempotency-Key` produces one order,
one invoice and one mail.

## Serial numbers you can use

| Serial | Camera | State |
|---|---|---|
| `VA2609KTMHX4` | Vela A1, Graphite | sold, unowned — **register this one** |
| `VC2609PVDA7Q` | Vela Cricket, Graphite | owned by `customer@example.com`, firmware 7.0 — flash this one to 7.2 |
| `VA2609NRWB2Z` | Vela A1, Sand | owned by `customer2@example.com` — refused as `That camera is registered to someone else.` |
| `VC2609WJ3DKT` | Vela Cricket, Yellow | blocked, `reported_stolen` — refused as blocked |

A serial is twelve characters: two letters of model code (`VA` or `VC`), two
digits of year, two of production week, then six from an alphabet that omits
`I`, `O`, `0` and `1`. Anything else is refused before any lookup happens.

## The ownership boundary

Signed in as `customer@example.com`, try to open
`/account/cameras/VA2609NRWB2Z` (Rune's camera). It answers **not found**, never
"forbidden" with detail. The same holds for another customer's order number. A
direct API call from a signed-out session to any `/api/account/*` endpoint is
rejected by the server with `401`, not merely hidden in the interface.

## Routes

| Route | What |
|---|---|
| `/` | the letter |
| `/shop`, `/shop/<handle>` | catalogue and one product |
| `/cart` | the cart |
| `/checkout/where-it-goes`, `/checkout/how-it-gets-there`, `/checkout/payment` | the three steps |
| `/orders/<number>` | one order by its access token |
| `/downloads`, `/downloads/<version>` | Arranger, firmware and the whole archive |
| `/doctor` | the browser firmware installer |
| `/sign-in`, `/sign-up` | account entry |
| `/account`, `/account/orders`, `/account/cameras` | the account |
| `/api/health` | `200` once ready |

## Running it

The container serves on port `4173` bound to `0.0.0.0`, and reads
`DATABASE_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`,
`PAYMENTS_API_URL`, `PAYMENTS_API_KEY`, `PAYMENTS_API_SECRET`,
`PAYMENTS_ADMIN_USER` and `PAYMENTS_ADMIN_PASSWORD` from the environment at
start. The schema and the seed are applied by the image itself on boot, and
seeding is idempotent, so a restart never duplicates a row.

## Checking it yourself

Two scripts walk the contract end to end against a running server:

```
node scripts/smoke.mjs http://localhost:4173     # the API, killbill and the mail server
python3 scripts/journeys.py http://localhost:4173 # the six journeys, in a browser
```

The second writes one screenshot per journey into `.browser_screenshots/`.
