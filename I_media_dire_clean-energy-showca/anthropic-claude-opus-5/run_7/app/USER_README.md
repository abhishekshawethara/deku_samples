# Zettajoule

Zettajoule builds small high-temperature gas-cooled reactor modules and sells the
energy rather than the reactor. This is the public site and a working account: a
visitor reads the technology, narrows eight industry solutions to the ones that
fit, keeps what matters, asks a question, and requests entry to the private
investor material.

## Sign in

Two accounts are seeded. Both use the same password. This is benchmark fixture
data, not a secret.

Role: visitor
Email: visitor@example.com
Password: deku-demo-pw-2026

Role: visitor
Email: visitor2@example.com
Password: deku-demo-pw-2026

The first account is Ada Moreau, whose investor access request is **approved**,
so she can open the document room at `/investors/room`. The second is Ken
Adeyemi, whose request is **pending**, so that route gives him the not-found page.
Signup at `/signup` is open and creates another `visitor`.

## What to try

1. **Narrow the eight and keep one without an account.** Open `/solutions`, set
   Output to `hydrogen` and Temperature to `550 to 750 C`. The running count
   falls to `2` and the two cards left are Transport and Steel. Save Steel while
   signed out, then sign up: Steel is waiting in the new account. The saves were
   held against an opaque `save_token` and moved onto the account at signup.
2. **Compare, and be refused a fifth.** Sign in as `visitor@example.com`, open
   `/compare`, and add a fifth solution to the four already there. The refusal
   appears in place and four are still compared.
3. **Send an enquiry and read the mail.** Fill in `/contact`. The reference
   (`ENQ-` plus eight characters) appears on the page and an acknowledgement
   carrying it arrives at the address you gave, over SMTP to Mailpit.
4. **The document room.** As `visitor@example.com` open `/investors/room` and
   read the three documents. As `visitor2@example.com`, whose request is still
   pending, the same route gives the not-found page and no document.
5. **The calculator.** Enter `251` MW thermal at `/calculator` and read `2`,
   `4000` and `1800000`. The energy figure follows the modules built, not the
   need asked for.

## Ownership

Every saved solution, saved search, enquiry, access request and application
belongs to one account. Authorization is enforced on the server for every
endpoint, not by hiding a button: a direct API call from one signed-in session
naming another account's row by its identifier is refused with the same answer a
row that never existed gives, and the stored row is unchanged afterwards. The
list endpoints take no account identifier at all, so no caller can name another
account in them.

## Routes

| Route | What it is | Auth |
|---|---|---|
| `/` | The reactor sequence and the four outputs | No |
| `/company`, `/technology`, `/edge`, `/team` | The story routes | No |
| `/solutions` | The explorer, four filters and a running count | No |
| `/solutions/<slug>` | One solution in full | No |
| `/compare` | Up to four saves side by side | No |
| `/calculator` | Modules, energy, carbon | No |
| `/investors` | The case, the roadmap, the access request | No |
| `/investors/room` | The document room | Own request `approved` |
| `/news`, `/news/<slug>` | Featured story and the wall | No |
| `/careers` | Culture and the three open jobs | No |
| `/contact` | The enquiry form | No |
| `/faq` | Searchable common questions | No |
| `/account` | The five private lists | Any account |
| `/signin`, `/signup` | Get in | No |

## Running it

The container serves the app in the foreground on container-internal port
`4173`, bound to `0.0.0.0`. The JSON API is on the same origin under `/api`, and
`GET /api/health` returns `200` once the app is ready. Schema, migrations and an
idempotent seed are applied by the image at start, so restarting never
duplicates a row.

Everything is read from the environment at container start: `DATABASE_URL` for
PostgreSQL, and `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER` and `SMTP_PASS` for mail.

## Notes

No image, video or icon file ships. The reactor, every diagram, the logo, the
industry plates and the team portraits are drawn from code as shapes or
generated gradients, so they stay sharp at any size and nothing is downloaded at
run time. The portraits are generated plates and the names are stand-ins.
