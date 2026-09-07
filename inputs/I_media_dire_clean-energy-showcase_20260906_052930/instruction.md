# Clean Energy Showcase

Build and deploy a working web application from this brief. There is no starting
codebase. When you are done, a stranger must be able to open the app in a
browser, narrow eight industry solutions down to the ones that fit them, save
one, send an enquiry and get a real acknowledgement email carrying its
reference, without hitting an error page. The hard part is that everything a
visitor keeps is theirs alone: a second account asking for the first account's
saved list, enquiry or investor access request by its identifier must be
refused, and the row must be unchanged afterwards. A list the interface simply
declines to draw is not enough; the rows stored in the database are the fact.

---

## Overview

Zettajoule builds small high-temperature gas-cooled reactor modules and sells
the energy rather than the reactor. This is its public site, and also a working
account: a `visitor` reads the technology, narrows the eight industries it
serves to the ones that fit, keeps what matters, asks a question, and requests
entry to the private investor material.

The solutions explorer is the centre of it. Four filters cut eight solution
cards down with a running count, and a card can be saved before there is an
account to save it to; signing in claims those saves.

Absent by design: no payments, no messaging, no uploads. The hard part is that
one account never reaches another account's rows.

---

## User roles

| Role | Can do |
|---|---|
| `visitor` | Reads every public route with no account. Signed in: saves and unsaves solutions, saves searches, compares up to four saves, sends and closes their own enquiries, requests investor access once, applies to a job, and reads the document room while their own request is `approved`. **Cannot** touch another account's saves, searches, enquiries, access requests or applications; **cannot** approve or decline an access request, edit seeded content, or enter the document room on a `pending` or `declined` request. |

Authorization is enforced **server-side on every mutating endpoint**. Hiding a
button in the UI is not authorization: a direct API call from one `visitor`
session to another `visitor`'s row is rejected by the server (denied, not
served), leaving the protected state unchanged. Scope is by row ownership.

Signup is open, creating a `visitor`. Two accounts are seeded,
`visitor@example.com` (Ada Moreau) and `visitor2@example.com` (Ken Adeyemi),
using `deku-demo-pw-2026`.

---

## Core features

### Auth
Email and password; login returns a bearer token sent as
`Authorization: Bearer <token>`; passwords are stored hashed.

### The explorer
1. The four filters combine, each narrowing the last, and the grid states how
   many of the eight it shows: `hydrogen` with `550 to 750 C` leaves exactly
   `transport` and `steel`.
2. The four outputs on `/` link into `/solutions` carrying that `output_kind`.

### Saving and comparing
3. An unauthenticated save returns an opaque `save_token`; signing in with it
   moves those saves onto the account and empties it.
4. Saving one solution twice for the same owner is a no-op: never a second row.
5. The comparison holds at most four saves; a fifth is rejected as invalid and
   four are still compared.
6. A saved search is unique by name in an account; the same name replaces its
   filters, never adding a row.

### Ownership
7. **Every save, search, enquiry, access request and application belongs to one
   account. A request naming another account's row by its identifier, to read
   or to write, is denied by the server and that database row must not change.
   This holds on the direct API call, not only on the pages that list them.**

### Enquiries, access
8. An enquiry mints a unique `reference` of `ENQ-` plus 8 uppercase letters
   and digits, for example `ENQ-7K2M9QD4`, and is stored `received`.
9. Only the owner closes their own enquiry; closing a `closed` one records one
   close, not two.
10. An account holds at most one access request; requesting again updates it,
    never adds a second. A new one is `pending` with an `IAR-` reference of the
    same shape, `IAR-4H7N2PQ8`.
11. The document room answers only while the caller's own request is
    `approved`; any other meets the answer a room that never existed gives,
    with no document in the payload.

### Calculator, jobs, mail
12. A need in megawatts and an output kind give `modules_required`,
    `annual_clean_energy_gwh` and `annual_co2_avoided_tonnes` by the worked
    rows in `## Data model`; modules round up and a need of zero or less is
    invalid.
13. An account holds at most one application per job; applying again updates
    it, never adding a second.
14. An enquiry sent, an access request created and an application submitted
    each send one message over the SMTP server at `SMTP_HOST` and `SMTP_PORT`,
    to that one address alone, carrying the subject and body `## Data model`
    pins. No other action sends mail.

---

## User flow

| Route | Purpose | Auth |
|---|---|---|
| `/` | Reactor sequence, outputs | No |
| `/company`, `/technology`, `/edge`, `/team` | The story routes | No |
| `/solutions` | The explorer | No |
| `/solutions/<slug>` | One solution | No |
| `/compare` | Four saves | No |
| `/calculator` | Modules, energy | No |
| `/investors` | Case, roadmap | No |
| `/investors/room` | Document room | `approved` |
| `/news` | Featured story, wall | No |
| `/news/<slug>` | One story | No |
| `/careers` | Culture, jobs | No |
| `/contact` | The enquiry form | No |
| `/faq` | Common questions | No |
| `/account` | The five private lists | Any |
| `/signin` | Sign in | No |
| `/signup` | New `visitor` account | No |

**Entry and redirects.** An unauthenticated visitor at `/account` or
`/investors/room` goes to `/signin?next=<path>`; login lands on `next`, else
`/account`; logout returns to `/`. An expired token is cleared and sends them
to `/signin?next=<current>`. A signed-in visitor without an `approved`
request gets the not-found page at `/investors/room`.

**Journeys.**

1. Anyone filters `/solutions` to `hydrogen` and `550 to 750 C`, watches the
   count fall to 2, saves `steel`, signs up, and finds `steel` waiting.
2. `visitor@example.com` adds a fifth solution to a full `/compare`; the
   refusal appears in place and four are still compared.
3. Anyone sends an enquiry from `/contact`; the reference appears in place and
   the acknowledgement carrying it reaches that inbox.
4. `visitor@example.com` reads the three documents at `/investors/room`;
   `visitor2@example.com` there meets the not-found page.
5. Anyone enters `251` MW thermal at `/calculator` and reads `2`, `4000` and
   `1800000`.

**States.** Every list has an empty state naming the absence and a way out, every route a loading state, and a refusal says what happened and what to do next without taking the app down.

---

## UI/UX notes

North star: somebody landing sees one engineered object that comes apart to
explain itself. The register is editorial on the showcase routes, operational
on the explorer and the account.

The direction is raw and structural: every rule and edge earns its place by
separating two things. Headings are a heavy grotesque, body
a plain unstyled-feeling face, and the one display line on `/` is the single
place that family runs at its lightest weight and largest size. Density is
compact on the explorer grid and the account lists, open elsewhere.

Motion is none-except-focus: filters, saves and results land at once, nothing
eases in, only the focus ring animates. The reactor and the heading reveals are
bound to scroll position rather than a duration, so they run backwards on the
way up and hold one still frame under reduced motion.

Colour by role, never by name: a warm charcoal for reading text, white for the
working routes, one friendly blue for links and the primary action with a
deeper shade of itself under the pointer, a pale sky tint behind portraits, a
deep navy at the foot. One hue means failure, one success, one pending, none
of the three decoratively. The home route opens on a wash from a
cool blue tint to a warm cream tint and settles to light grey, and one section
inverts to near-black while nothing else does. Shades and sizes are yours if
they hold these rules. Layout is top-nav: one slim bar carries the logo, the
routes and a Get in Touch action.

The product commits to light, dark optional. Controls carry resting,
pointed-at, pressed, focused, unavailable states; Escape closes any modal; a
destructive action confirms first.

Contract, not taste: WCAG AA contrast on reading text, comfortably sized touch
targets, keyboard navigation reaching everything with a visible focus ring, a
text name on every icon-only control, meaning never by colour alone, and a layout holding at every viewport width between its breakpoints.

---

## Technical requirements

The rendering model is server-rendered pages with hydrated islands: the browser
receives complete HTML on first paint, and only the interactive regions (the
explorer filters, the save control, the calculator, the compare tray, the
modals and the account lists) become live in the client. The pages are built
with SvelteKit and the JSON API is served by Fastify on the same origin under
the `/api` prefix, from one listener on the container-internal port `4173`. Node
20 is the runtime. PostgreSQL is the datastore, read from `DATABASE_URL`. Mail
goes over real SMTP to Mailpit at `SMTP_HOST` and `SMTP_PORT`, authenticating
with `SMTP_USER` and `SMTP_PASS` when they are set. Auth is app-implemented
email and password with bearer tokens and hashed passwords. `GET /api/health`
returns `200` once the app is ready. Each request is logged as one structured
line to standard output.

Use only the libraries named here plus their direct dependencies. Do not
introduce a second database, cache, queue, object store, identity provider or
mail vendor: the only backing services available in this environment are
PostgreSQL and Mailpit, and reaching for anything else is a contract violation.

The application ships no image file, no video file and no icon font. Every mark,
diagram, portrait plate and the reactor itself is drawn from code as shapes or
generated gradients, so nothing has to be downloaded at run time and every
drawing stays sharp at any size.

---

## Data model

Thirteen tables. All timestamps are UTC.

**Every seeded account uses the password `deku-demo-pw-2026`.** It is benchmark
fixture data, not a secret. Hash it as normal; the exact literal must work at
login, and it must be written into `/app/USER_README.md` alongside each account
so a grader can sign in.

### accounts
`id`, `email` (unique across accounts), `password_hash`, `display_name`,
`created_at`.

### solutions
`id`, `slug` (unique), `industry`, `title`, `summary`, `detail`, `output_kind`
(one of `heat`, `heat-and-power`, `hydrogen`, `electricity`),
`temperature_band` (one of `up to 250 C`, `250 to 550 C`, `550 to 750 C`),
`deployment` (one of `single-module`, `multi-module`), `module_count`.

### saved_solutions
`id`, `account_id` (null for an anonymous save), `save_token` (null once
claimed), `solution_id`, `created_at`. Exactly one of `account_id` and
`save_token` is set on any row. At most one row exists for a given
(`account_id`, `solution_id`) and at most one for a given (`save_token`,
`solution_id`); a repeated save leaves the stored state unchanged rather than
adding a second row, and this holds under simultaneous requests, not only in
application-level checks.

### saved_searches
`id`, `account_id`, `name`, `query`, `industry`, `output_kind`,
`temperature_band`, `deployment`, `created_at`. At most one row for a given
(`account_id`, `name`).

### enquiries
`id`, `reference` (unique app-wide), `account_id` (null when sent signed out),
`name`, `email`, `phone_country`, `phone`, `topic` (one of `Technology`,
`Solutions`, `Investor relations`, `Careers`, `Suppliers`), `message`, `status`
(one of `received`, `answered`, `closed`), `created_at`.

### access_requests
`id`, `reference` (unique app-wide), `account_id` (at most one row per
account), `organisation`, `role_title`, `status` (one of `pending`, `approved`,
`declined`), `created_at`. Two simultaneous requests from one account must not
both create a row: exactly one row exists afterwards and the other request is
rejected or folded into it, never left as a partial row.

### documents
`id`, `slug` (unique), `title`, `category`, `published_at`.

### jobs
`id`, `slug` (unique), `title`, `location`, `team`, `description`.

### applications
`id`, `account_id`, `job_id`, `name`, `email`, `note`, `status` (one of
`received`, `reviewing`, `closed`), `created_at`. At most one row for a given
(`account_id`, `job_id`).

### stories
`id`, `slug` (unique), `title`, `outlet`, `published_at`, `featured`, `body`.
Exactly one row is `featured`.

### team_members
`id`, `slug` (unique), `name`, `role_title`, `bio`, `profile_url`,
`sort_order`.

### offices
`id`, `city`, `country`, `role_label`.

### faqs
`id`, `question`, `answer`, `category`.

### Derived, never stored

The explorer's running count, the number of solutions matching any filter
combination, and all three calculator outputs are computed on read.

### The calculator arithmetic

One module delivers `250` MW thermal, and at `40` percent electrical conversion
`100` MW electrical. A module runs `8000` hours a year. Each GWh delivered
avoids `450` tonnes of carbon.

`modules_required` is the need divided by the per-module output for the chosen
kind, rounded **up** to a whole module. `annual_clean_energy_gwh` is
`modules_required` times the per-module output in MW times `8000`, divided by
`1000`. `annual_co2_avoided_tonnes` is `annual_clean_energy_gwh` times `450`.
The energy figure follows the modules built, never the need asked for, which is
what the second row below settles.

| Need | Kind | `modules_required` | `annual_clean_energy_gwh` | `annual_co2_avoided_tonnes` |
|---|---|---|---|---|
| `250` MW | thermal | `1` | `2000` | `900000` |
| `251` MW | thermal | `2` | `4000` | `1800000` |
| `100` MW | electrical | `1` | `800` | `360000` |
| `260` MW | electrical | `3` | `2400` | `1080000` |

### Mail

Every message is addressed to the one person it concerns, with no cc and no
bcc, over real SMTP.

| Transition | Subject | Body carries |
|---|---|---|
| Enquiry sent | begins `Enquiry received:` then a space and the reference, for example `Enquiry received: ENQ-7K2M9QD4` | the topic and the reference |
| Access request created | begins `Investor access requested:` then a space and the reference, for example `Investor access requested: IAR-4H7N2PQ8` | the organisation and the reference |
| Application submitted | begins `Application received:` then a space and the job title, for example `Application received: Reactor Systems Engineer` | the job title and the location |

No other action sends mail.

### Seed data

Accounts: `visitor@example.com` as Ada Moreau, `visitor2@example.com` as Ken
Adeyemi.

Solutions, all eight:

| `slug` | `industry` | `output_kind` | `temperature_band` | `deployment` | `module_count` |
|---|---|---|---|---|---|
| `oil-and-gas` | Oil and Gas | `heat` | `250 to 550 C` | `multi-module` | `4` |
| `chemicals` | Chemicals | `heat-and-power` | `550 to 750 C` | `multi-module` | `3` |
| `transport` | Transport | `hydrogen` | `550 to 750 C` | `multi-module` | `6` |
| `steel` | Steel | `hydrogen` | `550 to 750 C` | `multi-module` | `8` |
| `mining` | Mining | `electricity` | `up to 250 C` | `single-module` | `1` |
| `data-centres` | Data Centres | `electricity` | `up to 250 C` | `single-module` | `2` |
| `communities` | Communities | `heat-and-power` | `up to 250 C` | `single-module` | `1` |
| `desalination` | Desalination | `heat` | `250 to 550 C` | `single-module` | `2` |

Ada Moreau holds `steel` and `data-centres` saved, the saved search
`Hydrogen sites` on `output_kind` of `hydrogen`, the enquiry `ENQ-7K2M9QD4` on
topic `Investor relations` in `answered`, and the access request `IAR-4H7N2PQ8`
in `approved`.

Ken Adeyemi holds `mining` saved, the enquiry `ENQ-5R8X1CJ2` on topic `Careers`
in `received`, and the access request `IAR-9T3V6BLM` in `pending`.

Documents, three: `investor-deck-2026` (Investor Deck 2026, Financials),
`technology-dossier` (Technology Dossier, Technology), `licensing-roadmap`
(Licensing Roadmap, Regulatory).

Jobs, three: `reactor-systems-engineer` (Reactor Systems Engineer, Rotterdam,
Engineering), `licensing-lead` (Licensing Lead, Chicago, Regulatory),
`operations-trainer` (Operations Trainer, Rotterdam, Operations Academy).

Stories, seven, newest first, exactly one `featured`:
`first-module-order` (First module order signed, Company news, `2026-08-18`,
featured), `helium-loop-milestone` (Helium loop completes a 1000 hour run,
Company news, `2026-07-02`), `steel-partnership` (Steel partnership targets the
hydrogen route, Industry Week, `2026-05-14`), `licensing-step-cleared`
(Licensing step cleared, Energy Monitor, `2026-03-09`), `academy-first-cohort`
(Operations Academy takes its first cohort, Company news, `2026-02-11`),
`desalination-study` (Desalination study opens in the Gulf, Water Report,
`2026-01-20`), `helium-supply-signed` (Helium supply agreement signed, Company
news, `2025-11-05`).

Team, four, in this order: `mira-halvorsen` (Mira Halvorsen, Chief Executive),
`tobias-ruiz` (Tobias Ruiz, Chief Technology Officer), `anneke-vos` (Anneke Vos,
Head of Licensing), `daniel-okoye` (Daniel Okoye, Head of Operations Academy).

Offices, three: Rotterdam (Netherlands, Headquarters), Chicago (United States,
Licensing), Tokyo (Japan, Engineering).

FAQs, six, three under `Technology` and three under `Deployment`.

Seeding must be idempotent: restarting the app must not duplicate rows.

---

## Front-end specification

This section carries the visual and behavioural detail the six graded sections
have no room for. Nothing here overrides `## Core features`; where a rule
appears in both, the rule is the same rule.

### Product overview and the feeling of the thing

The finished product should feel calm, bright and exact the moment it loads: a
gleaming metal reactor standing on a soft ground that fades from a cool blue
tint at the top to a warm cream tint at the bottom, with a huge thin display
line wrapped around it. As the visitor scrolls, the reactor comes apart, the
rods lift out, the dome opens, the core is exposed, and the metal turns into a
clean technical drawing while small facts and the four outputs appear around it.
Scrolling back puts it together again. Headings rise into place a line at a
time. It stays smooth on an ordinary laptop and falls back to a calm still
version when a machine cannot carry the moving picture.

### Information architecture

The site behaves as one connected set of routes that scroll smoothly and swap
without a jarring reload, sliding a cover across during each change. The routes
a visitor cares about are the nineteen in `## User flow` and no others: there
are no leftover test or debug addresses, and anything mistyped lands on a tidy
not-found card that points back to `/`.

### Design system

Everything is built from one small kit so the whole reads as a single carefully
made object. White grounds, warm charcoal text, and one friendly blue for links
and highlights, with a pale sky-blue tint and a deep navy shade in support.
Headings are the heavy grotesque family; the reading text is a plain, clear
face. Corners are gently rounded rather than sharp, rules are hair-thin, and
there is a lot of calm empty space on the showcase routes. Soft blurs and gentle
gradients give the whole thing a precise, engineered, daylight feel. The layering order, back to front, is: the reactor
and the generated plates, then the words, then the fixed chrome, then the menu
panel, then the loading cover.

The palette is stated by role and by tone, never by a code. Give each role its
own value and hold these relationships: the accent hover is a deeper shade of
the accent, not a different hue; the supporting sky is a tint of the accent hue;
the footer navy is a dark shade of that same hue; the muted text is a tint of
the charcoal, never a grey from somewhere else. Failure, success and pending
each get a hue of their own and appear nowhere decoratively.

### Components

Every control carries five states: resting, pointed at, pressed, focused,
unavailable. Unavailable is never signalled by colour alone. Escape closes any
open modal or panel and returns focus to the control that opened it. A
destructive action confirms before it runs. The bio modal, the apply modal and
the enquiry modal share one shell. The product commits to a light scheme and
designs it fully; a dark scheme is optional rather than expected.

### Iconography

None of the small pictures are photographs or icon files; every one is described
as shapes so it stays razor-sharp at any size. The logo is a set of stacked
lens-shaped bands suggesting a particle circling a core, next to the company
name spelled in letters. The small controls are a neat up-right arrow inside the
buttons, an X to close the menu, a downward chevron on the selects, and a tick
in the checkbox. A gentle downward hint pulses near the bottom of the first
screen until the visitor scrolls. The technical reactor diagram is drawn line by
line rather than shown as a picture.

### Global chrome

A few things are always there. On first load a plain white cover waits until the
reactor is ready to draw, then lifts; its counter reflects the real
download rather than a guess. Along the top sit the logo, the routes, and one
soft blue Get in Touch action that deepens under the pointer; the bar quietly
gains a faint ground once the page scrolls. On a phone the bar shrinks to the
logo and a menu button that opens a full panel. Every route change sweeps a
cover across so the change feels deliberate. At the bottom of every route is a
get-in-touch invitation and a footer with the routes, the social marks and the
legal notices.

### Motion language

Motion comes in three kinds, and no others: the scroll-bound big moves (the
reactor coming apart and the headings rising), tied to scroll position so they
run forwards and backwards with the visitor's finger; a couple of small spinning
loaders while something is genuinely in flight; and the two chrome exemptions
named below. Every other state change lands at once.

Two chrome elements are exempt from none-except-focus, and only these two: the
downward scroll hint near the bottom of the first screen, which pulses until the
visitor scrolls, and the cover that sweeps across on a route change. The signature moves are the reactor taking
itself apart and headings splitting into lines that rise into place from behind
an edge, with the generated plates drifting gently and the technical diagrams
drawing themselves on. If the visitor has asked their device for reduced motion,
everything appears already finished and still, the reactor holds one clean
frame, and nothing is lost. Under every setting the interface itself stays
none-except-focus apart from the two chrome exemptions named above: no other
state change eases.

### Scroll system

Scrolling is not the usual jerky jump; the page glides with a little weight and
momentum, and most of the movement is glued to how far the visitor has scrolled
rather than to a timer. Headings rise, plates drift, lists come in one item at a
time, and the reactor comes apart, all exactly in step with the finger; scrolling
back runs them all backwards to where they were. It should feel like dragging
the sequence directly rather than starting it.

### The reactor visualization layer

The centrepiece stands in the middle of the first screen and slowly takes itself
apart. First it is whole and metallic. Then the tall control rods lift up and
pull free, the rounded lid rises off, and the inside, a dark column of fuel, is
laid bare, while the three key facts fade in beside it (a high-temperature
gas-cooled reactor, `250` MW thermal a module, `750` degrees Celsius at the
outlet) along with the four outputs: heat, heat and power, hydrogen, and
electricity. Finally the metal resolves into a clean technical line drawing.
Scrolling back reassembles it. On a machine that cannot carry the moving version
it shows the whole reactor as a still drawing and reveals the facts on scroll,
and nothing is lost. Every stage of the sequence is also available as plain
written text, so no fact is only reachable by aiming at something moving.

### The media and audio layer

The heavy part of this product is what is seen, not what is heard: there is no
sound anywhere, and no audio element exists. The moving reactor may be built as
a strip of frames that plays forward and backward with scroll, with a still
poster until it is ready. Every photographic area, the industry plates, the team
portraits and the route backgrounds, drifts and grows gently on scroll and fades
softly at its edges. None of those pictures and no film are real files: all of
them are generated from code, per the zero-asset substitution rule below.

### Route: Home

The first screen is the reactor on the blue-to-cream wash with the enormous thin
line `Powering the World` wrapped around it and a one-line promise underneath.
On scroll the reactor comes apart, the ground turns to a light grey, the key
facts and the four outputs appear, and a short passage explains the company name
and the size of the future energy need it is built for. Further down, a row of
industry cards slides past and a preview of the technology drifts in. One
section turns almost black for a single bold moment about the reactor's
unmatched heat, the hottest and most striking beat of the route, before the site
returns to its calm bright self. The four outputs each link into `/solutions`
carrying that `output_kind`.

### Route: Company

Opens with the line `clean heat and electricity to power a world of industrial
applications` and then tells the story on scroll: the vision for the future, the
mission to provide clean reliable heat and power, and the meaning behind the
company name, which is built from the units of energy the world will need. The
three offices are small cards that arrive one by one. It closes by explaining
that the company does not only build the reactor: it owns it, runs it and staffs
it for the customer.

### Route: Technology

The deep engineering story, and it reuses the reactor from the home route, this
time as a diagram the visitor can pick apart. It lays out the key facts (the
reactor type, `250` MW thermal a module, `750` degrees Celsius), then explains
the fuel (tiny uranium grains wrapped in tough shells that hold together at
extreme heat), the graphite around it, and the helium gas that cools it and
stays chemically calm around everything it touches. It shows how a living
digital copy of the reactor is used to spot problems early and keep costs down,
makes the safety case built on a real test reactor running since the late 1990s,
and explains that the reactors are built in modules so they are quick to deploy
and easy to scale up.

### Route: Solutions and the industry explorer

Answers the question "what can this power?" The eight industries are the cards.
Along the top the visitor chooses an industry, what they want out of it, how hot
they need it, and how it would be deployed, and the cards narrow with a running
count reading how many of the eight are showing. Opening a card explains, for
that industry exactly, what the reactor does for it, block by block with clean
line diagrams, and offers save, enquire and contact. The four outputs on the
home route jump straight here already filtered. The grid is the card-grid work
surface: cards sit tight so a full filtered set fits one screen, and the row
becomes a single-card swipe on a phone.

### Route: Our Edge

Makes the case for why this company is different. It leans on one strong point:
the design is a modernized version of a real, proven reactor that already
exists, not a paper concept, which makes it far more believable and quicker to
license. It shows that the reactor runs much hotter than ordinary water-cooled
reactors, so it can do jobs they simply cannot, and that it comes in one or
several modules for flexibility. It explains the business model, that the
company owns, runs and staffs the reactor so the customer just buys the energy,
and restates the four outputs.

### Route: Our Team

Says who is behind the company. It opens with `shaping the future of nuclear
together` and a line about being an international group of recognised experts,
then shows the four leaders as a grid. Each leader has a portrait plate on a
soft blue-white tint, their name and job title, a small link to their
professional profile, and a view-bio action that opens the fuller description in
the shared modal. The portraits are generated plates, not photographs, and the
names are stand-ins.

### Route: Investors

Makes the money case. It sets out how large the world's future energy need is,
why a proven modernized reactor sold as a service is a strong business, how the
company stacks up against the alternatives, and the roadmap from licensing to
deployment as a dated timeline running from the proven test reactor to first
deployment. Serious investors request access to the private document room from
here, and are told plainly that it is pending until approved. Only an account
whose own request is `approved` sees that room.

### Route: Newsroom

The giant words `latest news` over a line inviting the visitor to browse company
news, press coverage and media. Below is a wall of story cards, each with a
generated plate, where and when it ran, and its headline, with the one `featured`
story raised above the wall. The wall shows `3` at a time and a more action
brings in the next `3`; the wall excludes the featured story, so seven seeded
stories leave exactly two pages of three. Opening a card shows the full story.

### Route: Careers

Sells the workplace with `help us build what's next in nuclear energy` and a
line about doing right by partners, the planet and employees. It tells the
culture story and lists the three open jobs, each with an apply action that
opens the short form in the shared modal: name, email and a written note. The
form offers no file input and no attachment control. It
also introduces the company's training and operations arm, the Operations
Academy, which is how it staffs the reactors it runs. No file is attached
anywhere: the note is the whole application.

### Route: Contact

A simple, clear contact page with a short explanation that it is for careers,
investor and supplier enquiries, then the form: name, email, phone with a
country picker, a topic and a message. It checks itself as the visitor fills it
in and, once sent, shows the reference in place.

### Account, saved solutions, enquiry and investor access

This is where the site stops being a showcase and starts doing something. The
account holds five lists: the solutions saved, the searches saved, the enquiries
sent with where each stands, the access request made, and the job applications
sent. Saving works before there is an account and follows the visitor in on sign
in, and up to four saved solutions sit side by side at `/compare`. Sending an
enquiry gives back a reference. An investor request reads `pending` until it is
`approved`. Every form checks itself as it is filled in and shows clear progress
and either the result or a specific reason it was refused, in place, as an
inline banner rather than a floating toast.

### Extended feature set

On top of the showcase sits the working part. A visitor searches the solutions
in plain language and saves that search under a name to come back to. The
calculator turns a site's heat or power need into a module count, the clean
energy that delivers and the carbon it avoids, drawn as a simple bar chart
beside the three figures. The reactor diagram on `/technology` can be turned and
tapped to learn each part. The investors roadmap is a timeline from the proven
test reactor to first deployment. Up to four saved solutions compare side by
side. A searchable set of common questions sits at `/faq`. Every piece of
wording, every solution, technology fact, story, team member and job comes from
the database rather than from the build, so it can be changed without rebuilding
the application.

### Responsive behaviour

Built for everything from a small phone to a large desktop. On a phone the top
bar shrinks to the logo and a menu button, the display line stacks, the reactor
centres and shrinks, the four outputs become a list, and the card rows turn into
single-card swipes. On a tablet things go two up. On a large screen the full
multi-column layout and the reactor at full size. On sharp high-resolution
screens the reactor and the diagrams stay crisp because they are drawn, not
sampled. On touch, hovers become taps, and the reactor and the diagrams respond
to dragging and pinching. The layout holds at every viewport width between the
named breakpoints, with no horizontal scrollbar at any of them.

### Accessibility

The whole thing has to work for somebody who never uses a mouse, somebody
listening rather than looking, and somebody who finds motion or low contrast
hard. Everything is reachable and operable from the keyboard with a clear
outline showing where focus sits. The route menu is announced as a list. The
reactor holds still for anyone who has asked for reduced motion. Reading text
meets WCAG AA contrast. The reactor, the solutions grid and the calculator each
carry a plain written or list version, so no information is only available by
aiming at a moving picture. When the menu or a modal opens, keyboard focus stays
inside it until it closes, and then returns to the control that opened it. Every
icon-only control carries a text name, and no state is signalled by colour
alone.

### Performance

The hard part is keeping a heavy moving reactor smooth while large generated
plates paint, on machines of every size. The readable site (the bars, the words,
the first view of the reactor) is usable before the whole sequence has arrived,
and the loading counter reflects the real download. The sequence is tuned to
stay smooth on an ordinary laptop, loading the most important thing first, and
if a machine still cannot keep up it shows the reactor as a clean still instead
of stuttering. The heavier extras load only when the visitor reaches them.

### Copy deck

Every pinned string, in one place. Menu: `Company`, `Technology`, `Solutions`,
`Our Edge`, `Our Team`, `Investors`, `News`, `Careers`, `Contact`, and the
action `Get in Touch`. Home display line: `Powering the World`. Company opening
line: `clean heat and electricity to power a world of industrial applications`.
Team opening line: `shaping the future of nuclear together`. Newsroom heading:
`latest news`. Careers heading: `help us build what's next in nuclear energy`.
The four outputs read `Heat`, `Heat and power`, `Hydrogen` and `Electricity`.
The three key facts read `High-temperature gas-cooled reactor`, `250 MW thermal
a module` and `750 degrees Celsius at the outlet`. The not-found card reads
`We cannot find that page` with a link back to `/`. The straight-line dashes of
the source have been turned into commas so the text survives being copied
around.

### Zero-asset substitution

The build ships no asset files at all, and every stand-in is made of pure code.
The reactor, its rods, dome, core and base are built from simple shapes and each
part stays separately nameable so the sequence can address it. Its surface gets
a hand-made metallic shine, which is the part most worth getting right. Every
technical diagram is drawn as clean lines. Every photograph, the industry
plates, the team portraits and the route grounds, becomes a soft generated
gradient in the site's own tones. This is a zero-asset substitution and it will
read plainer than a build with real art in it; the shapes, the names and the
behaviour are what must be faithful.

---

## Constraints

One role, no team accounts, no sharing. Absent features: no payments, no
subscriptions, no messaging, no notification feed, no alert on a saved search,
no approval inside the product, no editor console. Absent surfaces the source
names and this build does not carry: the live telemetry screen and the live
link feeding it, the map site planner, the assistant, the language and unit
switch, a three-dimensional reactor. Absent integrations: no
analytics, no social login, no external content system, no mapping provider, no
object store, no file upload. Absent channels: no audio, no video, no push, no
SMS. No external network calls at run time, no native app,
no test or debug routes. The app stays responsive with `8`
solutions, `7` stories and hundreds of rows per list.

---

## Deployment contract

- The app must be reachable at `APP_PUBLIC_URL`. The port mapping is
  `${APP_PUBLIC_PORT}:4173`, where `4173` is the container-internal port and
  `APP_PUBLIC_PORT` is what the outside world uses. Read both from the
  environment; never hardcode either.
- The HTTP API is served on that same origin under the `/api` prefix.
- `GET /api/health` returns `200` once the app is ready.
- The app starts from the environment image with no manual steps.
- Login credentials, or an explicit statement that there are none, are written
  to `/app/USER_README.md`. Each account is written there as three plain lines
  outside any table, `Role: <role>`, then `Email: <address>`, then
  `Password: <password>`, so the file reads correctly line by line and not only
  as a rendered page.
- Reserved `.browser_screenshots/` and `.downloads/` directories exist at the
  app root, empty.
- Serve a production build behind a static or preview server, never a dev
  server.
- The server must keep running after this session ends and must not be a child
  of the shell. An ordinary background job dies with its shell, and the app will
  not be running when it is next opened.
- Bind `0.0.0.0`, never `127.0.0.1` or `localhost`. A loopback-only listener is
  unreachable from outside the container.
- The backing services named in this brief are already running and reachable at
  their environment variables. Do not download, install, compile or start a copy
  of any of them.
- Use only the providers named in this brief. No edge functions.
- No persistent volumes, no fixed container names, no custom networks.

### API shapes

Field names are exact. List endpoints return a JSON array at the top level.

| Endpoint | Request body / query | Returns |
|---|---|---|
| `POST /api/auth/signup` | `{"email","password","display_name","save_token"}` | the created account with `id`, `email` and `display_name`; `save_token` is optional and claims those saves |
| `POST /api/auth/login` | `{"email","password","save_token"}` | `{"access_token": str, ...}`; `save_token` is optional and claims those saves |
| `GET /api/health` | - | readiness |
| `GET /api/solutions` | `?industry=&output_kind=&temperature_band=&deployment=&q=` | array of matching solutions, each with `slug`, `industry`, `title`, `summary`, `output_kind`, `temperature_band`, `deployment` and `module_count`, under the header `X-Total-Count` carrying the count of matches |
| `GET /api/solutions/{slug}` | - | one solution with those fields plus `detail` |
| `GET /api/saves` | `?save_token=` | array of the caller's own saved solutions, each with `id`, `solution_id` and `slug` |
| `POST /api/saves` | `{"solution_slug","save_token"}` | the saved row with `id` and, for an anonymous save, the `save_token` to keep |
| `DELETE /api/saves/{id}` | - | the caller's own saved row removed |
| `GET /api/compare` | `?slugs=` | up to four solutions side by side; a fifth slug is rejected as invalid |
| `GET /api/searches` | - | array of the caller's own saved searches |
| `POST /api/searches` | `{"name","query","industry","output_kind","temperature_band","deployment"}` | the saved search with `id` and `name` |
| `DELETE /api/searches/{id}` | - | the caller's own saved search removed |
| `POST /api/enquiries` | `{"name","email","phone_country","phone","topic","message"}` | the enquiry with `id`, `reference` and `status` |
| `GET /api/enquiries` | - | array of the caller's own enquiries |
| `POST /api/enquiries/{id}/close` | - | the caller's own enquiry with `status` set to `closed` |
| `GET /api/access-request` | - | the caller's own request with `reference`, `organisation`, `role_title` and `status`, or the not-found response when there is none |
| `POST /api/access-request` | `{"organisation","role_title"}` | the caller's own request with `reference` and `status` set to `pending` |
| `GET /api/documents` | - | array of documents with `slug`, `title`, `category` and `published_at`, answered only while the caller's own request is `approved` |
| `GET /api/stories` | `?limit=&offset=&featured=` | array of stories with `slug`, `title`, `outlet`, `published_at` and `featured`, under the header `X-Total-Count` |
| `GET /api/stories/{slug}` | - | one story with those fields plus `body` |
| `GET /api/jobs` | - | array of jobs with `slug`, `title`, `location`, `team` and `description` |
| `POST /api/applications` | `{"job_slug","name","email","note"}` | the application with `id`, `job_slug` and `status` |
| `GET /api/applications` | - | array of the caller's own applications |
| `POST /api/calculator` | `{"need_mw","kind"}` | `{"modules_required","annual_clean_energy_gwh","annual_co2_avoided_tonnes"}`, where `kind` is `thermal` or `electrical` |
| `GET /api/team` | - | array of team members with `slug`, `name`, `role_title`, `bio` and `profile_url` |
| `GET /api/offices` | - | array of offices with `city`, `country` and `role_label` |
| `GET /api/faqs` | `?q=&category=` | array of matching questions with `question`, `answer` and `category` |
| `GET /api/accounts/me` | - | the caller with `id`, `email` and `display_name` |

Every endpoint requires a valid bearer token except `POST /api/auth/signup`,
`POST /api/auth/login`, `GET /api/health`, `GET /api/solutions`,
`GET /api/solutions/{slug}`, `GET /api/compare`, `POST /api/enquiries`,
`GET /api/stories`, `GET /api/stories/{slug}`, `GET /api/jobs`,
`POST /api/calculator`, `GET /api/team`, `GET /api/offices` and
`GET /api/faqs`; `GET /api/saves` and `POST /api/saves` answer an anonymous
caller only when a `save_token` is supplied. A request without a token where
one is required is denied, not served. A business-rule violation is rejected as
a client error with a message naming the reason, never as a server error and
never as a silent success.

`GET /api/saves`, `GET /api/searches`, `GET /api/enquiries`,
`GET /api/access-request` and `GET /api/applications` carry the caller's own
rows and nothing else, and they take no account identifier, so no caller can
name another account in them. `DELETE /api/saves/{id}`,
`DELETE /api/searches/{id}` and `POST /api/enquiries/{id}/close` address a row
by its identifier: an identifier belonging to another account meets the same
answer as one that never existed, and that row is unchanged afterwards.

### No mocks

Mailpit is the only mail server and PostgreSQL is the only datastore. An
in-process mail stub, an in-memory list of sent messages, a logged line standing
in for a send, a second embedded database, or saved solutions and enquiries held
in the app's own process instead of the database are each a contract violation
however correct the screen looks. The named provider is the fact - the app's UI
and its own tables can only reflect what lives in the provider, never substitute
for it.

---

## Definition of done

A visitor can narrow eight industry solutions to the ones that fit, save one
without an account, sign in and find it waiting, and send an enquiry that
returns a reference and arrives as a real email carrying it. A second account
asking for the first account's saved list, enquiry or investor request by its
identifier is refused and that row is unchanged. The document room opens only
for an account whose own request is approved, and the calculator turns a heat or
power need into a module count, an annual energy figure and a carbon figure that
follow the modules built.
