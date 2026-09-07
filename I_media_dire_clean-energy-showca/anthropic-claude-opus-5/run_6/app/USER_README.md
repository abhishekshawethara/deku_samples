# Zettajoule

Small high-temperature gas-cooled reactor modules. The company sells the energy,
not the reactor. This is the public site and a working account area.

## Sign-in credentials

Both seeded accounts use the same password. It is benchmark fixture data, not a
secret.

Role: visitor
Email: visitor@example.com
Password: deku-demo-pw-2026

Role: visitor
Email: visitor2@example.com
Password: deku-demo-pw-2026

The first account is Ada Moreau, the second is Ken Adeyemi. Signup is open at
`/signup` and creates another `visitor`.

### What each seeded account holds

Ada Moreau (`visitor@example.com`)

- Saved solutions: `steel`, `data-centres`
- Saved search: `Hydrogen sites` on an `output_kind` of `hydrogen`
- Enquiry `ENQ-7K2M9QD4`, topic `Investor relations`, status `answered`
- Access request `IAR-4H7N2PQ8`, status `approved`, so `/investors/room` opens

Ken Adeyemi (`visitor2@example.com`)

- Saved solution: `mining`
- Enquiry `ENQ-5R8X1CJ2`, topic `Careers`, status `received`
- Access request `IAR-9T3V6BLM`, status `pending`, so `/investors/room` gives
  the not-found page

## Walking the app

1. **Filter and save without an account.** Open `/solutions`, set the output to
   `Hydrogen` and the temperature to `550 to 750 C`. The count falls to 2,
   leaving `transport` and `steel`. Save `steel`, then sign up at `/signup`:
   the save follows you onto the new account.
2. **The compare cap.** Sign in as `visitor@example.com` and open `/compare`.
   Four saves compare side by side; adding a fifth is refused in place and the
   four already compared stay compared.
3. **Send an enquiry.** `/contact` takes a name, email, phone, topic and
   message. The reference appears in place as `ENQ-` plus 8 characters and the
   acknowledgement carrying it is delivered over SMTP to Mailpit.
4. **The document room.** As `visitor@example.com`, `/investors/room` lists
   three documents. As `visitor2@example.com`, whose request is `pending`, the
   same address gives the not-found page.
5. **The calculator.** `/calculator` with `251` MW thermal reads `2` modules,
   `4000` GWh and `1800000` tonnes of carbon avoided.

## Ownership

Every save, saved search, enquiry, access request and application belongs to one
account, and this is enforced on the server for every endpoint, not by hiding
controls. A request naming another account's row by its identifier meets the
same answer as a row that never existed, and the stored row is unchanged
afterwards. The list endpoints take no account identifier at all, so no caller
can name another account in them.

## Running it

The container serves both the pages and the JSON API from one listener on the
container-internal port `4173`, bound to `0.0.0.0`.

- `DATABASE_URL` — PostgreSQL connection string; the schema and seed are applied
  at start-up and are idempotent, so restarting never duplicates a row.
- `SMTP_HOST`, `SMTP_PORT` — the Mailpit server that real mail is sent through.
- `SMTP_USER`, `SMTP_PASS` — used to authenticate when they are set.

`GET /api/health` answers `200` once the database is reachable and the app is
ready.

Mail is sent on exactly three transitions and no others: an enquiry sent, an
access request created, and an application submitted. Each goes to the one
person it concerns, with no cc and no bcc.

## Notes

The build ships no image, video or icon font. The reactor, the logo, every
diagram, every industry plate and every team portrait is drawn from code as
shapes or generated gradients. The team members and the news stories are
stand-ins, not real people or real events.
