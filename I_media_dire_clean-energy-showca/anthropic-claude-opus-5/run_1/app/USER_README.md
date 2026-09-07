# Zettajoule

Small high-temperature gas-cooled reactor modules, owned, operated and staffed
by us. The customer buys the energy, not the reactor.

The app is server-rendered with SvelteKit and hydrated islands; the JSON API is
served by Fastify on the same origin under `/api`, from one listener on the
container-internal port `4173`. PostgreSQL is the datastore and mail goes over
real SMTP to Mailpit.

## Signing in

Two accounts are seeded. Both use the same password. It is benchmark fixture
data, not a secret.

Role: visitor
Email: visitor@example.com
Password: deku-demo-pw-2026

Role: visitor
Email: visitor2@example.com
Password: deku-demo-pw-2026

The first account is Ada Moreau. She holds `steel` and `data-centres` saved, the
saved search `Hydrogen sites`, the enquiry `ENQ-7K2M9QD4` in `answered`, and the
investor access request `IAR-4H7N2PQ8` in `approved`, so she is the account that
can open `/investors/room`.

The second account is Ken Adeyemi. He holds `mining` saved, the enquiry
`ENQ-5R8X1CJ2` in `received`, and the access request `IAR-9T3V6BLM` in
`pending`, so `/investors/room` gives him the not-found page. He is the account
to use when checking that one visitor cannot reach another visitor's rows.

Signup is open at `/signup` and creates a further `visitor`.

## The five journeys

1. Go to `/solutions`, choose `Hydrogen` and `550 to 750 C`. The running count
   falls from 8 to 2 and the two cards are `transport` and `steel`. Save
   `steel` without an account, then sign up: `steel` is waiting on `/account`.
2. Sign in as `visitor@example.com`, save five solutions, and open `/compare`.
   Ticking a fifth is refused in place and four are still compared.
3. Send an enquiry from `/contact`. The reference, `ENQ-` plus eight uppercase
   letters and digits, appears on the page, and the acknowledgement carrying it
   arrives at the address given (visible in Mailpit).
4. `visitor@example.com` reads the three documents at `/investors/room`;
   `visitor2@example.com` meets the not-found page there.
5. Enter `251` MW thermal at `/calculator` and read `2`, `4000` and `1800000`.

## Routes

`/`, `/company`, `/technology`, `/edge`, `/team`, `/solutions`,
`/solutions/<slug>`, `/compare`, `/calculator`, `/investors`,
`/investors/room`, `/news`, `/news/<slug>`, `/careers`, `/contact`, `/faq`,
`/account`, `/signin`, `/signup`.

`/account` and `/investors/room` need an account; an unauthenticated visitor is
sent to `/signin?next=<path>` and lands back on `next` after signing in.

## Ownership

Every save, search, enquiry, access request and application belongs to one
account, and this is enforced server-side on every endpoint, not by hiding
buttons. A request naming another account's row by its identifier, to read or to
write, meets the same answer as a row that never existed, and the stored row is
unchanged afterwards. The list endpoints take no account identifier at all, so
no caller can name another account in them.

## Environment

Read at container start, never baked into the image:

- `DATABASE_URL` for PostgreSQL
- `SMTP_HOST`, `SMTP_PORT`, and `SMTP_USER` / `SMTP_PASS` when they are set
- `PORT`, defaulting to the container-internal `4173`

`GET /api/health` returns `200` once the schema, the seed and the listener are
ready. The schema and the idempotent seed are applied by the app itself on
start, so a database created from scratch needs no manual step. Restarting does
not duplicate any row.

## Notes

The build ships no image, video or icon file. The reactor, the logo, the
technical diagrams, the industry plates and the team portraits are all drawn
from code as shapes or generated gradients, so nothing is downloaded at run
time and every drawing stays sharp at any size. Team names, portraits and
stories are stand-ins.
