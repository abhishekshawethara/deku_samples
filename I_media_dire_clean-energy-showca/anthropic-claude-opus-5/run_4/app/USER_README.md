# Zettajoule

A public showcase site and a working account for Zettajoule, which builds small
high-temperature gas-cooled reactor modules and sells the energy rather than the
reactor.

The app is served on the container-internal port `4173`, bound to `0.0.0.0`.
The JSON API is on the same origin under `/api`. `GET /api/health` returns `200`
once the app is ready.

## Sign in

Two accounts are seeded. Both use the same password. This is benchmark fixture
data, not a secret.

Role: visitor
Email: visitor@example.com
Password: deku-demo-pw-2026

Role: visitor
Email: visitor2@example.com
Password: deku-demo-pw-2026

The first account is Ada Moreau, the second is Ken Adeyemi. Signup is open at
`/signup` and creates a further `visitor`.

## What each seeded account holds

Ada Moreau (`visitor@example.com`) holds the solutions `steel` and
`data-centres` saved, the saved search `Hydrogen sites`, the enquiry
`ENQ-7K2M9QD4` on topic `Investor relations` at status `answered`, and the
investor access request `IAR-4H7N2PQ8` at status `approved`. Because her request
is approved, she is the account that can open `/investors/room`.

Ken Adeyemi (`visitor2@example.com`) holds the solution `mining` saved, the
enquiry `ENQ-5R8X1CJ2` on topic `Careers` at status `received`, and the access
request `IAR-9T3V6BLM` at status `pending`. Because his request is pending, he
meets the not-found page at `/investors/room`.

## The five journeys

1. **Narrow, save, sign in, find it waiting.** Open `/solutions`, choose the
   output `Hydrogen` and the temperature `550 to 750 C`. The count falls to `2`,
   leaving `transport` and `steel`. Save `steel` with no account: the save is
   kept against an opaque token. Sign up at `/signup` and `steel` is waiting in
   `/account`.
2. **The fifth is refused.** Signed in as Ada with four solutions in the
   comparison, adding a fifth at `/compare` is refused in place and four are
   still compared.
3. **An enquiry gets a reference and a real email.** Send the form at
   `/contact`. The reference appears in place in the form of `ENQ-` plus eight
   characters, and an acknowledgement carrying it is delivered over SMTP to
   Mailpit, addressed to that one address alone.
4. **The document room.** Ada reads the three documents at `/investors/room`.
   Ken, whose own request is pending, meets the not-found page there.
5. **The calculator.** Enter `251` MW at `/calculator` with the thermal kind and
   read `2` modules, `4000` GWh and `1800000` tonnes.

## Ownership

Every save, search, enquiry, access request and application belongs to one
account, and this is enforced server-side on every endpoint, not by hiding
controls. `GET /api/saves`, `/api/searches`, `/api/enquiries`,
`/api/access-request` and `/api/applications` take no account identifier at all,
so no caller can name another account in them. `DELETE /api/saves/{id}`,
`DELETE /api/searches/{id}` and `POST /api/enquiries/{id}/close` address a row
by its identifier: an identifier belonging to another account meets exactly the
same answer as one that never existed, and the stored row is unchanged
afterwards.

## Routes

`/` home, `/company`, `/technology`, `/edge`, `/team`, `/solutions`,
`/solutions/<slug>`, `/compare`, `/calculator`, `/investors`,
`/investors/room` (needs an approved request), `/news`, `/news/<slug>`,
`/careers`, `/contact`, `/faq`, `/account` (needs sign in), `/signin`,
`/signup`.

An unauthenticated visitor at `/account` or `/investors/room` is sent to
`/signin?next=<path>` and lands on `next` after signing in. Anything mistyped
lands on a card reading `We cannot find that page`.

## Environment

Read at container start, never hardcoded:

- `DATABASE_URL` PostgreSQL, the only datastore. The schema and an idempotent
  seed are applied by the app itself on startup, so a restart never duplicates a
  row.
- `SMTP_HOST`, `SMTP_PORT` Mailpit, the only mail server. `SMTP_USER` and
  `SMTP_PASS` are used for authentication when they are set.
- `PORT` defaults to `4173`.

Mail is sent on exactly three transitions and no others: an enquiry sent, an
access request created and an application submitted.

## Assets

The build ships no image, video, icon font or audio file. The reactor, the
logo, every diagram, every industry plate and every team portrait is drawn from
code as shapes or generated gradients, so nothing is downloaded at run time and
every drawing stays sharp at any size.
