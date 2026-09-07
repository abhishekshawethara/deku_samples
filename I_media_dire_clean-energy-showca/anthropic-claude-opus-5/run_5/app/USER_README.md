# Zettajoule

A public showcase site and a working account for a company that builds small
high-temperature gas-cooled reactor modules and sells the energy rather than the
reactor.

The app is served on the container-internal port `4173`, bound to `0.0.0.0`.
Pages are server-rendered by SvelteKit and the JSON API is served by Fastify on
the same origin under the `/api` prefix, from one listener. PostgreSQL is read
from `DATABASE_URL`; mail goes over real SMTP to `SMTP_HOST` and `SMTP_PORT`.

`GET /api/health` returns `200` once the app is ready.

## Sign in

Both seeded accounts use the same password. It is benchmark fixture data, not a
secret.

Role: visitor
Email: visitor@example.com
Password: deku-demo-pw-2026

Role: visitor
Email: visitor2@example.com
Password: deku-demo-pw-2026

The first account is Ada Moreau. She holds `steel` and `data-centres` saved, the
saved search `Hydrogen sites`, the enquiry `ENQ-7K2M9QD4` in `answered`, and the
investor access request `IAR-4H7N2PQ8` in `approved`, so the document room at
`/investors/room` opens for her.

The second account is Ken Adeyemi. He holds `mining` saved, the enquiry
`ENQ-5R8X1CJ2` in `received`, and the access request `IAR-9T3V6BLM` in
`pending`, so `/investors/room` gives him the not-found page.

Signup is open at `/signup` and creates a further `visitor`.

## What to try

1. **Narrow the eight solutions.** At `/solutions`, choose `Hydrogen` and
   `550 to 750 C`. The running count falls to `2` and only `transport` and
   `steel` are left.
2. **Save without an account.** Press Save on a card while signed out. The save
   is kept against an opaque `save_token`. Sign up or sign in and it is waiting
   in your account: signing in claims those saves and empties the anonymous set.
3. **Compare.** `/compare` holds at most four saved solutions. Adding a fifth is
   refused in place and the four already compared are unchanged.
4. **Send an enquiry.** `/contact` returns a reference of the form `ENQ-` plus
   eight uppercase letters and digits, in place, and a real acknowledgement
   carrying that reference is sent to the address you gave.
5. **Request investor access.** `/investors` takes one request per account. It
   reads `pending` until approved; approval happens outside the product.
6. **Calculate.** `/calculator` with `251` MW thermal reads `2` modules,
   `4000` GWh and `1800000` tonnes. The energy figure follows the modules built,
   not the need asked for.

## Ownership

Every save, saved search, enquiry, access request and application belongs to one
account. The list endpoints take no account identifier, so no caller can name
another account in them. The endpoints that address a row by its identifier,
`DELETE /api/saves/{id}`, `DELETE /api/searches/{id}` and
`POST /api/enquiries/{id}/close`, answer an identifier belonging to another
account exactly as they answer one that never existed, and the row is unchanged
afterwards. This is enforced server-side on every mutating endpoint, not by
hiding a button.

## Routes

`/`, `/company`, `/technology`, `/edge`, `/team`, `/solutions`,
`/solutions/<slug>`, `/compare`, `/calculator`, `/investors`,
`/investors/room`, `/news`, `/news/<slug>`, `/careers`, `/contact`, `/faq`,
`/account`, `/signin`, `/signup`.

An unauthenticated visitor at `/account` or `/investors/room` is sent to
`/signin?next=<path>`; login lands on `next`, otherwise `/account`.

## Notes

The build ships no image file, no video file and no icon font. The reactor, the
logo, every diagram, every industry plate and every team portrait is drawn from
code as shapes or generated gradients, so nothing is downloaded at run time and
every drawing stays sharp at any size. The team names and portraits are
stand-ins.
