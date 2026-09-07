# Zettajoule

A public showcase and a working account for a company that builds small
high-temperature gas-cooled reactor modules and sells the energy rather than the
reactor.

The app is reachable at `APP_PUBLIC_URL`. The container listens on port `4173`,
bound to `0.0.0.0`. The JSON API is served on the same origin under `/api`, and
`GET /api/health` answers `200` once the app is ready.

## Sign in

Two accounts are seeded. Both use the same password. This is benchmark fixture
data, not a secret.

Role: visitor
Email: visitor@example.com
Password: deku-demo-pw-2026

Role: visitor
Email: visitor2@example.com
Password: deku-demo-pw-2026

`visitor@example.com` is Ada Moreau. She holds `steel` and `data-centres` saved,
the saved search `Hydrogen sites`, the enquiry `ENQ-7K2M9QD4` in `answered`, and
an **approved** investor access request, so the document room at
`/investors/room` opens for her.

`visitor2@example.com` is Ken Adeyemi. He holds `mining` saved, the enquiry
`ENQ-5R8X1CJ2`, and a **pending** access request, so `/investors/room` gives him
the not-found page.

Signing up at `/signup` is open and creates a new `visitor`.

## Walking the app

1. **Narrow the eight and keep one.** At `/solutions` choose the output
   `Hydrogen` and the temperature `550 to 750 C`; the running count falls to
   two, leaving `transport` and `steel`. Save `steel` with no account, then sign
   up: the save follows you in and is waiting at `/account`.
2. **Compare.** Up to four saved solutions sit side by side at `/compare`. A
   fifth is refused in place and the four stay put.
3. **Send an enquiry.** `/contact` returns a reference of the shape
   `ENQ-7K2M9QD4` in place, and a real acknowledgement carrying it is delivered
   over SMTP to the address you gave.
4. **The document room.** `/investors/room` answers only while your own access
   request is `approved`. Any other caller meets the not-found page and no
   document appears in the payload.
5. **The calculator.** `/calculator` with `251` MW thermal reads `2` modules,
   `4000` GWh and `1800000` tonnes. The energy figure follows the modules built
   rather than the need asked for.

## Ownership

Every save, saved search, enquiry, access request and job application belongs to
one account. This is enforced server-side on every endpoint, not by hiding
buttons: the list endpoints take no account identifier and return only the
caller's rows, and a request naming another account's row by its identifier
meets the same answer as one that never existed, leaving that row unchanged.

## What is not here

No payments, no messaging, no uploads, no file attachments, no audio or video,
no analytics, no social login, no external network calls at run time, and no test
or debug routes. The app ships no image, video or icon font: every mark,
diagram, portrait plate and the reactor itself is drawn from code.

## Services

PostgreSQL is the only datastore, read from `DATABASE_URL`. Mail goes over real
SMTP to Mailpit at `SMTP_HOST` and `SMTP_PORT`, authenticating with `SMTP_USER`
and `SMTP_PASS` when they are set. The schema is created and seeded by the
container itself at start, idempotently: restarting does not duplicate rows.
