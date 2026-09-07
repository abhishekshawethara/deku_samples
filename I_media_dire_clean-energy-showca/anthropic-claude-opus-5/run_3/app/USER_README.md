# Zettajoule

A public showcase for a company that builds small high-temperature gas-cooled
reactor modules and sells the energy rather than the reactor, and a working
account behind it: narrow eight industry solutions to the ones that fit, keep
what matters, ask a question, and request entry to the private investor
material.

The pages are SvelteKit, server-rendered with hydrated islands. The JSON API is
Fastify on the same origin under `/api`. Both are served by one listener on the
container-internal port `4173`. PostgreSQL is the datastore, read from
`DATABASE_URL`. Mail goes over real SMTP to Mailpit at `SMTP_HOST` and
`SMTP_PORT`. The schema, the migration and the seed are applied by the app
itself on start, and seeding is idempotent, so a restart never duplicates a row.

## Signing in

Both accounts are seeded and both use the same password. This is benchmark
fixture data, not a secret.

Role: visitor
Email: visitor@example.com
Password: deku-demo-pw-2026

Role: visitor
Email: visitor2@example.com
Password: deku-demo-pw-2026

The first account is Ada Moreau, who holds two saved solutions, a saved search,
an answered enquiry and an **approved** investor access request, so the document
room at `/investors/room` opens for her.

The second is Ken Adeyemi, who holds one saved solution, a received enquiry and
a **pending** access request, so the same room answers him the way a room that
never existed would.

Signup is open at `/signup` and creates another `visitor`.

## The five journeys

1. **Save before there is an account.** At `/solutions`, choose `Hydrogen` and
   `550 to 750 C`; the running count falls to `2`, leaving `transport` and
   `steel`. Save `steel` with no account, then sign up: the save follows you in
   and is waiting at `/account`.
2. **A full comparison refuses a fifth.** Sign in as `visitor@example.com` and
   open `/compare`. Four saves compare; adding a fifth is refused by the server,
   the reason appears in place, and four are still compared.
3. **An enquiry returns a reference.** Send one from `/contact`. The reference,
   `ENQ-` plus 8 uppercase letters and digits, appears in place, and an
   acknowledgement carrying it arrives at that address in Mailpit.
4. **The document room is by approval only.** `visitor@example.com` reads the
   three documents at `/investors/room`; `visitor2@example.com`, whose request is
   pending, meets the not-found page with no document in the payload.
5. **The calculator follows the modules built.** Enter `251` MW thermal at
   `/calculator` and read `2`, `4000` and `1800000`.

## Ownership

Every save, search, enquiry, access request and application belongs to one
account, and that is enforced server-side on every endpoint rather than by
hiding a button.

`GET /api/saves`, `/api/searches`, `/api/enquiries`, `/api/access-request` and
`/api/applications` take no account identifier at all, so no caller can name
another account in them. `DELETE /api/saves/{id}`, `DELETE /api/searches/{id}`
and `POST /api/enquiries/{id}/close` address a row by its identifier: an
identifier belonging to another account meets exactly the same answer as one
that never existed, and the row is unchanged afterwards.

Uniqueness holds under simultaneous requests, not only in application checks.
Partial unique indexes back the repeated save, the saved search name, the one
access request per account and the one application per job, so a burst of
identical requests still leaves exactly one row.

## Routes

`/` `/company` `/technology` `/solutions` `/solutions/<slug>` `/compare`
`/calculator` `/edge` `/team` `/investors` `/investors/room` `/news`
`/news/<slug>` `/careers` `/contact` `/faq` `/account` `/signin` `/signup`

An unauthenticated visitor at `/account` or `/investors/room` is sent to
`/signin?next=<path>` and lands on `next` after signing in. Anything mistyped
lands on a tidy not-found card reading `We cannot find that page`.

## Health

`GET /api/health` returns `200` once the database has been migrated and seeded
and the app is ready to serve. Each request is logged as one structured JSON
line to standard output.

## No assets, and no mocks

The build ships no image file, no video file and no icon font. The reactor, the
logo, every technical diagram, every industry plate and every team portrait is
drawn from code as shapes or generated gradients, so nothing is downloaded at
run time and everything stays sharp at any size.

PostgreSQL is the only datastore and Mailpit the only mail server. Nothing is
held in the app's own process in place of a table, and no message is logged in
place of a send: the rows in the database and the messages in Mailpit are the
fact.
