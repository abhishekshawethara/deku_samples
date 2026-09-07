# Checklist: Clean Energy Showcase

Source: instruction.md
Sections present: overview, roles, features, flow, uiux, technical, datamodel, frontend, constraints, deployment
Sections absent: buildplan
Items: 454
Unpinned values flagged: 2

## C-OV Overview

- [ ] `C-OV-01` `ui` The product presents a public showcase site for one clean-energy company. `src: Overview para 1`
- [ ] `C-OV-02` `capability` A visitor requests entry to the private investor material. `src: Overview para 1`
- [ ] `C-OV-03` `ui` The solutions explorer shows a running count of the solutions matching the current filters. `src: Overview para 2`
- [ ] `C-OV-04` `capability` A solution is saved before the visitor has an account. `src: Overview para 2`
- [ ] `C-OV-05` `capability` Signing in claims the saves made before the account existed. `src: Overview para 2`
- [ ] `C-OV-06` `constraint` The product carries no payment feature. `src: Overview para 3`
- [ ] `C-OV-07` `constraint` One account never reads another account rows. `src: Overview para 3`

## C-RL User roles

- [ ] `C-RL-01` `role` A `visitor` reads every public route with no account. `src: User roles table row 1`
- [ ] `C-RL-02` `role` A signed-in `visitor` saves a solution. `src: User roles table row 1`
- [ ] `C-RL-03` `role` A signed-in `visitor` saves a search. `src: User roles table row 1`
- [ ] `C-RL-04` `role` A signed-in `visitor` compares up to four saved solutions. `src: User roles table row 1`
- [ ] `C-RL-05` `role` A signed-in `visitor` sends an enquiry. `src: User roles table row 1`
- [ ] `C-RL-06` `role` A signed-in `visitor` closes an enquiry the same account sent. `src: User roles table row 1`
- [ ] `C-RL-07` `role` A signed-in `visitor` requests investor access once. `src: User roles table row 1`
- [ ] `C-RL-08` `role` A signed-in `visitor` applies to a job. `src: User roles table row 1`
- [ ] `C-RL-09` `role` A signed-in `visitor` holding an `approved` request reads the document room. `src: User roles table row 1`
- [ ] `C-RL-10` `role` A `visitor` is denied reading another account saved solutions. `src: User roles table row 1`
- [ ] `C-RL-11` `role` A `visitor` is denied reading another account enquiries. `src: User roles table row 1`
- [ ] `C-RL-12` `role` A `visitor` is denied reading another account access requests. `src: User roles table row 1`
- [ ] `C-RL-13` `role` A `visitor` is denied approving any access request. `src: User roles table row 1`
- [ ] `C-RL-14` `role` A `visitor` is denied editing seeded content. `src: User roles table row 1`
- [ ] `C-RL-15` `role` A `visitor` holding a `pending` request is denied the document room. `src: User roles table row 1`
- [ ] `C-RL-16` `role` The server rejects a direct API call from one `visitor` session to another `visitor` row. `src: User roles para 1`
- [ ] `C-RL-17` `role` A rejected unauthorized request leaves the protected state unchanged. `src: User roles para 1`
- [ ] `C-RL-18` `capability` Signup is open to anyone. `src: User roles para 2`
- [ ] `C-RL-19` `literal` Signup creates an account with the role `visitor`. `src: User roles para 2`
- [ ] `C-RL-20` `literal` The seeded account `visitor@example.com` exists at first start. `src: User roles para 2`
- [ ] `C-RL-21` `literal` The seeded account `visitor2@example.com` exists at first start. `src: User roles para 2`
- [ ] `C-RL-22` `literal` Every seeded account signs in with the password `deku-demo-pw-2026`. `src: User roles para 2`

## C-CF Core features

- [ ] `C-CF-01` `capability` Login with an email plus a password returns a bearer token. `src: Core features, Auth para 1`
- [ ] `C-CF-02` `literal` The client sends the token as the header value `Authorization: Bearer <token>`. `src: Core features, Auth para 1`
- [ ] `C-CF-03` `constraint` Passwords are stored hashed. `src: Core features, Auth para 1`
- [ ] `C-CF-04` `capability` Each of the four explorer filters narrows the set left by the filters already applied. `src: Core features rule 1`
- [ ] `C-CF-05` `ui` The explorer grid states how many of the eight solutions the current filters leave. `src: Core features rule 1`
- [ ] `C-CF-06` `literal` The output filter `hydrogen` combined with the temperature filter `550 to 750 C` leaves exactly two solutions. `src: Core features rule 1`
- [ ] `C-CF-07` `literal` The two solutions left by that combination are `transport` plus `steel`. `src: Core features rule 1`
- [ ] `C-CF-08` `capability` Each of the four output links on `/` opens `/solutions` carrying that output as a filter. `src: Core features rule 2`
- [ ] `C-CF-09` `literal` An unauthenticated save returns an opaque `save_token`. `src: Core features rule 3`
- [ ] `C-CF-10` `capability` Signing in with a save token moves the saves held against that token onto the account. `src: Core features rule 3`
- [ ] `C-CF-11` `capability` Signing in with a save token leaves that token holding no saves. `src: Core features rule 3`
- [ ] `C-CF-12` `constraint` Saving one solution twice for the same owner creates no second row. `src: Core features rule 4`
- [ ] `C-CF-13` `constraint` The comparison holds at most four saved solutions. `src: Core features rule 5`
- [ ] `C-CF-14` `constraint` A fifth solution added to a full comparison is rejected as invalid. `src: Core features rule 5`
- [ ] `C-CF-15` `constraint` A comparison that rejected a fifth solution still holds four solutions. `src: Core features rule 5`
- [ ] `C-CF-16` `constraint` A saved search name is unique within one account. `src: Core features rule 6`
- [ ] `C-CF-17` `capability` Saving a search under a name the account already holds replaces the filters on the existing row. `src: Core features rule 6`
- [ ] `C-CF-18` `constraint` Saving a search under a name the account already holds creates no second row. `src: Core features rule 6`
- [ ] `C-CF-19` `data` Every saved solution belongs to exactly one account. `src: Core features rule 7`
- [ ] `C-CF-20` `data` Every enquiry belongs to exactly one account. `src: Core features rule 7`
- [ ] `C-CF-21` `role` A read naming another account row by its identifier is denied by the server. `src: Core features rule 7`
- [ ] `C-CF-22` `role` A write naming another account row by its identifier is denied by the server. `src: Core features rule 7`
- [ ] `C-CF-23` `data` A denied cross-account request leaves the addressed database row unchanged. `src: Core features rule 7`
- [ ] `C-CF-24` `role` The cross-account denial holds on the direct API call, not only on the listing pages. `src: Core features rule 7`
- [ ] `C-CF-25` `literal` A sent enquiry mints a `reference` starting `ENQ-`. `src: Core features rule 8`
- [ ] `C-CF-26` `literal` An enquiry reference carries `8` uppercase letters or digits after the prefix. `src: Core features rule 8`
- [ ] `C-CF-27` `constraint` An enquiry reference is unique across the whole application. `src: Core features rule 8`
- [ ] `C-CF-28` `literal` A newly sent enquiry is stored with the status `received`. `src: Core features rule 8`
- [ ] `C-CF-29` `role` Only the account owning an enquiry closes that enquiry. `src: Core features rule 9`
- [ ] `C-CF-30` `constraint` Closing an enquiry already `closed` records one close, never two. `src: Core features rule 9`
- [ ] `C-CF-31` `constraint` One account holds at most one access request. `src: Core features rule 10`
- [ ] `C-CF-32` `capability` Requesting investor access again updates the existing request row. `src: Core features rule 10`
- [ ] `C-CF-33` `constraint` Requesting investor access again creates no second row. `src: Core features rule 10`
- [ ] `C-CF-34` `literal` A newly created access request carries the status `pending`. `src: Core features rule 10`
- [ ] `C-CF-35` `literal` An access request mints a `reference` starting `IAR-`. `src: Core features rule 10`
- [ ] `C-CF-36` `role` The document room answers only a caller whose own request is `approved`. `src: Core features rule 11`
- [ ] `C-CF-37` `role` A caller whose request is `pending` meets the answer a route that never existed gives. `src: Core features rule 11`
- [ ] `C-CF-38` `role` A caller whose request is `declined` meets the answer a route that never existed gives. `src: Core features rule 11`
- [ ] `C-CF-39` `data` A refused document-room response carries no document. `src: Core features rule 11`
- [ ] `C-CF-40` `capability` A megawatt need plus an output kind produces a module count. `src: Core features rule 12`
- [ ] `C-CF-41` `capability` A megawatt need plus an output kind produces an annual clean energy figure. `src: Core features rule 12`
- [ ] `C-CF-42` `constraint` The module count rounds up to a whole module. `src: Core features rule 12`
- [ ] `C-CF-43` `constraint` A need of zero or less is rejected as invalid. `src: Core features rule 12`
- [ ] `C-CF-44` `constraint` One account holds at most one application per job. `src: Core features rule 13`
- [ ] `C-CF-45` `capability` Applying to the same job again updates the existing application row. `src: Core features rule 13`
- [ ] `C-CF-46` `constraint` Applying to the same job again creates no second row. `src: Core features rule 13`
- [ ] `C-CF-47` `capability` A sent enquiry sends one message over the SMTP server. `src: Core features rule 14`
- [ ] `C-CF-48` `capability` A submitted application sends one message over the SMTP server. `src: Core features rule 14`
- [ ] `C-CF-49` `constraint` Each sent message is addressed to one recipient only. `src: Core features rule 14`
- [ ] `C-CF-50` `constraint` No action other than the three named transitions sends mail. `src: Core features rule 14`

## C-UF User flow

- [ ] `C-UF-01` `ui` The route `/` shows the reactor sequence. `src: User flow route table row 1`
- [ ] `C-UF-02` `ui` The route `/company` shows the vision, the naming story, the offices. `src: User flow route table row 2`
- [ ] `C-UF-03` `ui` The route `/technology` shows the reactor cutaway. `src: User flow route table row 2`
- [ ] `C-UF-04` `ui` The route `/edge` shows the proven-design case. `src: User flow route table row 2`
- [ ] `C-UF-05` `ui` The route `/team` shows the leaders. `src: User flow route table row 2`
- [ ] `C-UF-06` `ui` The route `/solutions` shows the explorer. `src: User flow route table row 3`
- [ ] `C-UF-07` `ui` The route `/solutions/<slug>` shows one industry solution. `src: User flow route table row 4`
- [ ] `C-UF-08` `ui` The route `/compare` shows up to four saves side by side. `src: User flow route table row 5`
- [ ] `C-UF-09` `ui` The route `/calculator` shows the module figures. `src: User flow route table row 6`
- [ ] `C-UF-10` `ui` The route `/investors` shows the investor case with the roadmap. `src: User flow route table row 7`
- [ ] `C-UF-11` `role` The route `/investors/room` answers only an account holding an `approved` request. `src: User flow route table row 8`
- [ ] `C-UF-12` `ui` The route `/news` shows the featured story above the story wall. `src: User flow route table row 9`
- [ ] `C-UF-13` `ui` The route `/news/<slug>` shows one story. `src: User flow route table row 10`
- [ ] `C-UF-14` `ui` The route `/careers` shows the culture story with the open jobs. `src: User flow route table row 11`
- [ ] `C-UF-15` `ui` The route `/contact` shows the enquiry form. `src: User flow route table row 12`
- [ ] `C-UF-16` `ui` The route `/faq` shows the common questions. `src: User flow route table row 13`
- [ ] `C-UF-17` `role` The route `/account` answers only a signed-in account. `src: User flow route table row 14`
- [ ] `C-UF-18` `ui` The route `/signin` shows the sign-in form. `src: User flow route table row 15`
- [ ] `C-UF-19` `ui` The route `/signup` creates a new `visitor` account. `src: User flow route table row 16`
- [ ] `C-UF-20` `capability` An unauthenticated visitor at `/account` is sent to `/signin?next=<path>`. `src: User flow, Entry and redirects`
- [ ] `C-UF-21` `capability` Signing in with a `next` parameter lands the visitor on that path. `src: User flow, Entry and redirects`
- [ ] `C-UF-22` `capability` Signing in with no `next` parameter lands the visitor on `/account`. `src: User flow, Entry and redirects`
- [ ] `C-UF-23` `capability` Signing out returns the visitor to `/`. `src: User flow, Entry and redirects`
- [ ] `C-UF-24` `capability` A visitor whose token expired is sent to `/signin?next=<current>`. `src: User flow, Entry and redirects`
- [ ] `C-UF-25` `role` A signed-in visitor without an `approved` request meets the not-found page at `/investors/room`. `src: User flow, Entry and redirects`
- [ ] `C-UF-26` `ui` Every list on every route has an empty state naming the absence. `src: User flow, States`
- [ ] `C-UF-27` `ui` Every route has a loading state. `src: User flow, States`
- [ ] `C-UF-28` `ui` A refusal states what happened, then what to do next. `src: User flow, States`

## C-UX UI and UX notes

- [ ] `C-UX-01` `ui` The register is editorial on the showcase routes. `src: UI/UX notes para 1`
- [ ] `C-UX-02` `ui` The register is operational on the explorer. `src: UI/UX notes para 1`
- [ ] `C-UX-03` `ui` Every rule earns its place by separating two things. `src: UI/UX notes para 2`
- [ ] `C-UX-04` `ui` Headings are set in a heavy grotesque. `src: UI/UX notes para 2`
- [ ] `C-UX-05` `ui` Body copy is set in a plain unstyled-feeling face. `src: UI/UX notes para 2`
- [ ] `C-UX-06` `ui` The one display line on `/` is the only place the heading family runs in its thinnest cut. `src: UI/UX notes para 2`
- [ ] `C-UX-07` `ui` Density is compact on the explorer grid. `src: UI/UX notes para 2`
- [ ] `C-UX-08` `ui` Density is open on the showcase routes. `src: UI/UX notes para 2`
- [ ] `C-UX-09` `ui` A filter result lands at once with no easing. `src: UI/UX notes para 3`
- [ ] `C-UX-10` `ui` Only the focus ring animates. `src: UI/UX notes para 3`
- [ ] `C-UX-11` `ui` The reactor sequence is bound to scroll position rather than to a duration. `src: UI/UX notes para 3`
- [ ] `C-UX-12` `ui` Scrolling back up runs the reactor sequence backwards. `src: UI/UX notes para 3`
- [ ] `C-UX-13` `ui` Reduced motion holds the reactor on one still frame. `src: UI/UX notes para 3`
- [ ] `C-UX-14` `ui` One warm charcoal tone carries the reading text. `src: UI/UX notes para 4`
- [ ] `C-UX-15` `ui` White grounds the working routes. `src: UI/UX notes para 4`
- [ ] `C-UX-16` `ui` One friendly blue marks a link. `src: UI/UX notes para 4`
- [ ] `C-UX-17` `ui` The pointer state of the primary action is a deeper shade of the same blue. `src: UI/UX notes para 4`
- [ ] `C-UX-18` `ui` A pale sky tint sits behind the portraits. `src: UI/UX notes para 4`
- [ ] `C-UX-19` `ui` A deep navy grounds the footer. `src: UI/UX notes para 4`
- [ ] `C-UX-20` `ui` One hue means failure. `src: UI/UX notes para 4`
- [ ] `C-UX-21` `ui` Neither the failure hue nor the success hue nor the pending hue appears decoratively. `src: UI/UX notes para 4`
- [ ] `C-UX-22` `ui` The route `/` opens on a wash from a cool blue tint to a warm cream tint. `src: UI/UX notes para 4`
- [ ] `C-UX-23` `ui` The wash on `/` settles to light grey as the visitor scrolls. `src: UI/UX notes para 4`
- [ ] `C-UX-24` `ui` Exactly one section on `/` inverts to a near-black ground. `src: UI/UX notes para 4`
- [ ] `C-UX-25` `ui` No section other than that one inverts anywhere on the site. `src: UI/UX notes para 4`
- [ ] `C-UX-26` `ui` Navigation is one slim bar across the top. `src: UI/UX notes para 4`
- [ ] `C-UX-27` `ui` Reading text meets WCAG AA contrast. `src: UI/UX notes para 5`
- [ ] `C-UX-28` `ui` Touch targets are comfortably sized. `src: UI/UX notes para 5`
- [ ] `C-UX-29` `ui` Keyboard navigation reaches every control. `src: UI/UX notes para 5`
- [ ] `C-UX-30` `ui` A focused control shows a visible focus ring. `src: UI/UX notes para 5`
- [ ] `C-UX-31` `ui` Every icon-only control carries a text name. `src: UI/UX notes para 5`
- [ ] `C-UX-32` `ui` No meaning is carried by colour alone. `src: UI/UX notes para 5`
- [ ] `C-UX-33` `ui` The layout holds at every viewport width between the named breakpoints. `src: UI/UX notes para 5`

## C-TR Technical requirements

- [ ] `C-TR-01` `contract` The browser receives complete HTML on first paint. `src: Technical requirements para 1`
- [ ] `C-TR-02` `contract` Only the interactive regions become live in the client. `src: Technical requirements para 1`
- [ ] `C-TR-03` `contract` The API is served on the same origin as the pages. `src: Technical requirements para 1`
- [ ] `C-TR-04` `literal` The API is served under the `/api` prefix. `src: Technical requirements para 1`
- [ ] `C-TR-05` `literal` One listener serves the container-internal port `4173`. `src: Technical requirements para 1`
- [ ] `C-TR-06` `contract` PostgreSQL is the datastore. `src: Technical requirements para 1`
- [ ] `C-TR-07` `literal` The datastore connection is read from `DATABASE_URL`. `src: Technical requirements para 1`
- [ ] `C-TR-08` `contract` Mail goes over real SMTP to Mailpit. `src: Technical requirements para 1`
- [ ] `C-TR-09` `literal` The mail host is read from `SMTP_HOST`. `src: Technical requirements para 1`
- [ ] `C-TR-10` `literal` The mail port is read from `SMTP_PORT`. `src: Technical requirements para 1`
- [ ] `C-TR-11` `literal` The mail user is read from `SMTP_USER` when set. `src: Technical requirements para 1`
- [ ] `C-TR-12` `literal` The mail password is read from `SMTP_PASS` when set. `src: Technical requirements para 1`
- [ ] `C-TR-13` `contract` Auth is implemented inside the application, never by an external identity provider. `src: Technical requirements para 1`
- [ ] `C-TR-14` `literal` The route `GET /api/health` returns `200` once the application is ready. `src: Technical requirements para 1`
- [ ] `C-TR-15` `constraint` No second database is introduced. `src: Technical requirements para 2`
- [ ] `C-TR-16` `constraint` No mail vendor other than Mailpit is introduced. `src: Technical requirements para 2`
- [ ] `C-TR-17` `constraint` The application ships no image file. `src: Technical requirements para 3`
- [ ] `C-TR-18` `ui` Every mark is drawn from code as shapes. `src: Technical requirements para 3`
- [ ] `C-TR-19` `ui` Every portrait plate is a generated gradient. `src: Technical requirements para 3`
- [ ] `C-TR-20` `ui` The reactor is drawn from code as shapes. `src: Technical requirements para 3`

## C-DM Data model

- [ ] `C-DM-01` `data` The schema carries thirteen tables. `src: Data model para 1`
- [ ] `C-DM-02` `data` All stored timestamps are UTC. `src: Data model para 1`
- [ ] `C-DM-03` `literal` Every seeded account signs in with `deku-demo-pw-2026`. `src: Data model para 2`
- [ ] `C-DM-04` `contract` Each seeded account is written into `/app/USER_README.md`. `src: Data model para 2`
- [ ] `C-DM-05` `data` The `accounts` table carries `id`, `email`, `password_hash`, `display_name`, `created_at`. `src: Data model, accounts`
- [ ] `C-DM-06` `constraint` An account email is unique across accounts. `src: Data model, accounts`
- [ ] `C-DM-07` `data` The `solutions` table carries a unique `slug`. `src: Data model, solutions`
- [ ] `C-DM-08` `literal` A solution `output_kind` is one of `heat`, `heat-and-power`, `hydrogen`, `electricity`. `src: Data model, solutions`
- [ ] `C-DM-09` `literal` A solution `temperature_band` is one of `up to 250 C`, `250 to 550 C`, `550 to 750 C`. `src: Data model, solutions`
- [ ] `C-DM-10` `literal` A solution `deployment` is one of `single-module`, `multi-module`. `src: Data model, solutions`
- [ ] `C-DM-11` `data` The `solutions` table carries `industry`, `title`, `summary`, `detail`, `module_count`. `src: Data model, solutions`
- [ ] `C-DM-12` `data` A `saved_solutions` row sets exactly one of `account_id` or `save_token`. `src: Data model, saved_solutions`
- [ ] `C-DM-13` `constraint` At most one `saved_solutions` row exists for one account with one solution. `src: Data model, saved_solutions`
- [ ] `C-DM-14` `constraint` At most one `saved_solutions` row exists for one save token with one solution. `src: Data model, saved_solutions`
- [ ] `C-DM-15` `constraint` A repeated save leaves the stored state unchanged rather than adding a second row. `src: Data model, saved_solutions`
- [ ] `C-DM-16` `constraint` The single-save rule holds under simultaneous requests, never only in application-level logic. `src: Data model, saved_solutions`
- [ ] `C-DM-17` `data` The `saved_searches` table carries `name`, `query`, plus the four filter columns. `src: Data model, saved_searches`
- [ ] `C-DM-18` `constraint` At most one `saved_searches` row exists for one account with one name. `src: Data model, saved_searches`
- [ ] `C-DM-19` `constraint` An enquiry `reference` is unique across the whole application. `src: Data model, enquiries`
- [ ] `C-DM-20` `literal` An enquiry `topic` is one of `Technology`, `Solutions`, `Investor relations`, `Careers`, `Suppliers`. `src: Data model, enquiries`
- [ ] `C-DM-21` `literal` An enquiry `status` is one of `received`, `answered`, `closed`. `src: Data model, enquiries`
- [ ] `C-DM-22` `data` An enquiry carries `name`, `email`, `phone_country`, `phone`, `message`. `src: Data model, enquiries`
- [ ] `C-DM-23` `data` An enquiry sent by an unauthenticated visitor carries no `account_id`. `src: Data model, enquiries`
- [ ] `C-DM-24` `constraint` An access request `reference` is unique across the whole application. `src: Data model, access_requests`
- [ ] `C-DM-25` `constraint` At most one `access_requests` row exists per account. `src: Data model, access_requests`
- [ ] `C-DM-26` `literal` An access request `status` is one of `pending`, `approved`, `declined`. `src: Data model, access_requests`
- [ ] `C-DM-27` `data` An access request carries `organisation` plus `role_title`. `src: Data model, access_requests`
- [ ] `C-DM-28` `constraint` Two simultaneous access requests from one account leave exactly one row. `src: Data model, access_requests`
- [ ] `C-DM-29` `constraint` A rejected simultaneous access request leaves no partial row. `src: Data model, access_requests`
- [ ] `C-DM-30` `data` The `documents` table carries a unique `slug`, `title`, `category`, `published_at`. `src: Data model, documents`
- [ ] `C-DM-31` `data` The `jobs` table carries a unique `slug`, `title`, `location`, `team`, `description`. `src: Data model, jobs`
- [ ] `C-DM-32` `literal` An application `status` is one of `received`, `reviewing`, `closed`. `src: Data model, applications`
- [ ] `C-DM-33` `constraint` At most one `applications` row exists for one account with one job. `src: Data model, applications`
- [ ] `C-DM-34` `data` An application carries `name`, `email`, `note`. `src: Data model, applications`
- [ ] `C-DM-35` `data` The `stories` table carries a unique `slug`, `title`, `outlet`, `published_at`, `featured`, `body`. `src: Data model, stories`
- [ ] `C-DM-36` `constraint` Exactly one story row is `featured`. `src: Data model, stories`
- [ ] `C-DM-37` `data` The `team_members` table carries a unique `slug`, `name`, `role_title`, `bio`, `profile_url`, `sort_order`. `src: Data model, team_members`
- [ ] `C-DM-38` `data` The `offices` table carries `city`, `country`, `role_label`. `src: Data model, offices`
- [ ] `C-DM-39` `data` The `faqs` table carries `question`, `answer`, `category`. `src: Data model, faqs`
- [ ] `C-DM-40` `data` The explorer running count is computed on read, never stored. `src: Data model, Derived`
- [ ] `C-DM-41` `data` The three calculator outputs are computed on read, never stored. `src: Data model, Derived`
- [ ] `C-DM-42` `literal` One module delivers `250` MW thermal. `src: Data model, calculator arithmetic`
- [ ] `C-DM-43` `literal` Electrical conversion runs at `40` percent. `src: Data model, calculator arithmetic`
- [ ] `C-DM-44` `literal` One module delivers `100` MW electrical. `src: Data model, calculator arithmetic`
- [ ] `C-DM-45` `literal` One module runs `8000` hours a year. `src: Data model, calculator arithmetic`
- [ ] `C-DM-46` `literal` Each GWh delivered avoids `450` tonnes of carbon. `src: Data model, calculator arithmetic`
- [ ] `C-DM-47` `data` The module count is the need divided by the per-module output for the chosen kind, rounded up. `src: Data model, calculator arithmetic`
- [ ] `C-DM-48` `data` The annual energy figure follows the modules built rather than the need asked for. `src: Data model, calculator arithmetic`
- [ ] `C-DM-49` `literal` A thermal need of `251` MW yields `2` modules. `src: Data model, calculator worked row 2`
- [ ] `C-DM-50` `literal` A thermal need of `251` MW yields `4000` GWh. `src: Data model, calculator worked row 2`
- [ ] `C-DM-51` `literal` A thermal need of `251` MW yields `1800000` tonnes avoided. `src: Data model, calculator worked row 2`
- [ ] `C-DM-52` `literal` An electrical need of `100` MW yields `800` GWh. `src: Data model, calculator worked row 3`
- [ ] `C-DM-53` `literal` An electrical need of `260` MW yields `3` modules. `src: Data model, calculator worked row 4`
- [ ] `C-DM-54` `constraint` Every message carries no cc. `src: Data model, Mail para 1`
- [ ] `C-DM-55` `literal` The enquiry message subject begins `Enquiry received:` then a space then the reference. `src: Data model, Mail table row 1`
- [ ] `C-DM-56` `data` The enquiry message body carries the topic plus the reference. `src: Data model, Mail table row 1`
- [ ] `C-DM-57` `literal` The access request message subject begins `Investor access requested:` then a space then the reference. `src: Data model, Mail table row 2`
- [ ] `C-DM-58` `data` The access request message body carries the organisation plus the reference. `src: Data model, Mail table row 2`
- [ ] `C-DM-59` `literal` The application message subject begins `Application received:` then a space then the job title. `src: Data model, Mail table row 3`
- [ ] `C-DM-60` `data` The application message body carries the job title plus the location. `src: Data model, Mail table row 3`
- [ ] `C-DM-61` `literal` The seeded account `visitor@example.com` carries the display name `Ada Moreau`. `src: Data model, Seed data para 1`
- [ ] `C-DM-62` `literal` The seeded account `visitor2@example.com` carries the display name `Ken Adeyemi`. `src: Data model, Seed data para 1`
- [ ] `C-DM-63` `literal` Eight solutions are seeded. `src: Data model, Seed data solutions table`
- [ ] `C-DM-64` `literal` The seeded solution `steel` carries output `hydrogen`. `src: Data model, Seed data solutions table row 4`
- [ ] `C-DM-65` `literal` The seeded solution `mining` carries deployment `single-module`. `src: Data model, Seed data solutions table row 5`
- [ ] `C-DM-66` `literal` The first seeded account holds `steel` saved. `src: Data model, Seed data para 2`
- [ ] `C-DM-67` `literal` The first seeded account holds `data-centres` saved. `src: Data model, Seed data para 2`
- [ ] `C-DM-68` `literal` The first seeded account holds the saved search `Hydrogen sites`. `src: Data model, Seed data para 2`
- [ ] `C-DM-69` `literal` The first seeded account holds the enquiry `ENQ-7K2M9QD4`. `src: Data model, Seed data para 2`
- [ ] `C-DM-70` `literal` The first seeded account holds the access request `IAR-4H7N2PQ8` as `approved`. `src: Data model, Seed data para 2`
- [ ] `C-DM-71` `literal` The second seeded account holds `mining` saved. `src: Data model, Seed data para 3`
- [ ] `C-DM-72` `literal` The second seeded account holds the enquiry `ENQ-5R8X1CJ2`. `src: Data model, Seed data para 3`
- [ ] `C-DM-73` `literal` The second seeded account holds the access request `IAR-9T3V6BLM` as `pending`. `src: Data model, Seed data para 3`
- [ ] `C-DM-74` `literal` Three documents are seeded. `src: Data model, Seed data para 4`
- [ ] `C-DM-75` `literal` Three jobs are seeded. `src: Data model, Seed data para 5`
- [ ] `C-DM-76` `literal` Seven stories are seeded. `src: Data model, Seed data para 6`
- [ ] `C-DM-77` `constraint` Restarting the application duplicates no seeded row. `src: Data model, Seed data closing line`

## C-FE Front-end specification

- [ ] `C-FE-01` `ui` The reactor stands on a ground fading from a cool blue tint to a warm cream tint. `src: Front-end specification, Product overview`
- [ ] `C-FE-02` `ui` A huge thin display line wraps around the reactor on the first screen. `src: Front-end specification, Product overview`
- [ ] `C-FE-03` `ui` The metal resolves into a technical line drawing at the end of the sequence. `src: Front-end specification, Product overview`
- [ ] `C-FE-04` `ui` Scrolling back up puts the reactor together again. `src: Front-end specification, Product overview`
- [ ] `C-FE-05` `ui` Headings rise into place one line at a time. `src: Front-end specification, Product overview`
- [ ] `C-FE-06` `ui` A machine unable to carry the sequence falls back to a still version. `src: Front-end specification, Product overview`
- [ ] `C-FE-07` `capability` Routes swap without a full page reload. `src: Front-end specification, Information architecture`
- [ ] `C-FE-08` `ui` A cover slides across during each route change. `src: Front-end specification, Information architecture`
- [ ] `C-FE-09` `constraint` No route outside the nineteen named routes exists. `src: Front-end specification, Information architecture`
- [ ] `C-FE-10` `ui` A mistyped address lands on a not-found card. `src: Front-end specification, Information architecture`
- [ ] `C-FE-11` `ui` The not-found card links back to `/`. `src: Front-end specification, Information architecture`
- [ ] `C-FE-12` `ui` Corners are gently rounded rather than sharp. `src: Front-end specification, Design system`
- [ ] `C-FE-13` `ui` Rules are hair-thin. `src: Front-end specification, Design system`
- [ ] `C-FE-14` `ui` The showcase routes carry a lot of calm empty space. `src: Front-end specification, Design system`
- [ ] `C-FE-15` `ui` The layering order runs reactor, then words, then fixed chrome, then menu panel, then loading cover. `src: Front-end specification, Design system`
- [ ] `C-FE-16` `ui` The accent pointer state is a deeper shade of the accent hue rather than a different hue. `src: Front-end specification, Design system para 2`
- [ ] `C-FE-17` `ui` The supporting sky colour is a tint of the accent hue. `src: Front-end specification, Design system para 2`
- [ ] `C-FE-18` `ui` The footer navy is a dark shade of the accent hue. `src: Front-end specification, Design system para 2`
- [ ] `C-FE-19` `ui` The muted text colour is a tint of the charcoal rather than an unrelated grey. `src: Front-end specification, Design system para 2`
- [ ] `C-FE-20` `ui` No small picture is a photograph. `src: Front-end specification, Iconography`
- [ ] `C-FE-21` `ui` The logo is a set of stacked lens-shaped bands beside the company name in letters. `src: Front-end specification, Iconography`
- [ ] `C-FE-22` `ui` Buttons carry a neat up-right arrow. `src: Front-end specification, Iconography`
- [ ] `C-FE-23` `ui` The menu carries an X to close. `src: Front-end specification, Iconography`
- [ ] `C-FE-24` `ui` Selects carry a downward chevron. `src: Front-end specification, Iconography`
- [ ] `C-FE-25` `ui` The checkbox carries a tick. `src: Front-end specification, Iconography`
- [ ] `C-FE-26` `ui` A downward hint pulses near the bottom of the first screen until the visitor scrolls. `src: Front-end specification, Iconography`
- [ ] `C-FE-27` `ui` A plain white cover holds on first load until the reactor is ready. `src: Front-end specification, Global chrome`
- [ ] `C-FE-28` `ui` The loading counter reflects the real download rather than a guess. `src: Front-end specification, Global chrome`
- [ ] `C-FE-29` `ui` The top bar gains a faint ground once the page scrolls. `src: Front-end specification, Global chrome`
- [ ] `C-FE-30` `ui` On a phone the top bar shrinks to the logo plus a menu button. `src: Front-end specification, Global chrome`
- [ ] `C-FE-31` `ui` The phone menu button opens a full panel. `src: Front-end specification, Global chrome`
- [ ] `C-FE-32` `ui` Every route ends with a get-in-touch invitation. `src: Front-end specification, Global chrome`
- [ ] `C-FE-33` `ui` The footer carries the routes, the social marks, the legal notices. `src: Front-end specification, Global chrome`
- [ ] `C-FE-34` `ui` Photographic plates drift as the visitor scrolls. `src: Front-end specification, Motion language`
- [ ] `C-FE-35` `ui` Technical diagrams draw themselves on as the visitor scrolls. `src: Front-end specification, Motion language`
- [ ] `C-FE-36` `ui` Reduced motion shows everything already finished, then still. `src: Front-end specification, Motion language`
- [ ] `C-FE-37` `ui` The page glides with momentum rather than jumping. `src: Front-end specification, Scroll system`
- [ ] `C-FE-38` `ui` Scroll-bound movement follows the scroll distance rather than a timer. `src: Front-end specification, Scroll system`
- [ ] `C-FE-39` `ui` The control rods lift up, then pull free. `src: Front-end specification, reactor layer`
- [ ] `C-FE-40` `ui` The rounded lid rises off after the rods pull free. `src: Front-end specification, reactor layer`
- [ ] `C-FE-41` `ui` A dark column of fuel is laid bare once the lid rises. `src: Front-end specification, reactor layer`
- [ ] `C-FE-42` `literal` The first key fact reads `High-temperature gas-cooled reactor`. `src: Front-end specification, reactor layer`
- [ ] `C-FE-43` `literal` The second key fact reads `250 MW thermal a module`. `src: Front-end specification, reactor layer`
- [ ] `C-FE-44` `literal` The third key fact reads `750 degrees Celsius at the outlet`. `src: Front-end specification, reactor layer`
- [ ] `C-FE-45` `ui` The four outputs fade in beside the exposed fuel column. `src: Front-end specification, reactor layer`
- [ ] `C-FE-46` `ui` Every stage of the reactor sequence is available as plain written text. `src: Front-end specification, reactor layer`
- [ ] `C-FE-47` `constraint` The product plays no sound anywhere. `src: Front-end specification, media layer`
- [ ] `C-FE-48` `constraint` No audio element exists. `src: Front-end specification, media layer`
- [ ] `C-FE-49` `ui` Every photographic area fades softly at its edges. `src: Front-end specification, media layer`
- [ ] `C-FE-50` `literal` The home display line reads `Powering the World`. `src: Front-end specification, Route: Home`
- [ ] `C-FE-51` `ui` A one-line promise sits under the home display line. `src: Front-end specification, Route: Home`
- [ ] `C-FE-52` `ui` The home ground turns light grey once the reactor has come apart. `src: Front-end specification, Route: Home`
- [ ] `C-FE-53` `ui` A short passage on `/` explains the company name. `src: Front-end specification, Route: Home`
- [ ] `C-FE-54` `ui` A row of industry cards slides past further down `/`. `src: Front-end specification, Route: Home`
- [ ] `C-FE-55` `ui` One near-black section on `/` carries the unmatched-heat statement. `src: Front-end specification, Route: Home`
- [ ] `C-FE-56` `ui` The company route opens with the pinned company opening line. `src: Front-end specification, Route: Company`
- [ ] `C-FE-57` `ui` The company route tells the vision for the future. `src: Front-end specification, Route: Company`
- [ ] `C-FE-58` `ui` The company route tells the mission to provide clean reliable heat. `src: Front-end specification, Route: Company`
- [ ] `C-FE-59` `ui` The company route explains the meaning behind the company name. `src: Front-end specification, Route: Company`
- [ ] `C-FE-60` `ui` The three offices arrive as small cards one by one. `src: Front-end specification, Route: Company`
- [ ] `C-FE-61` `ui` The company route states the company owns the reactor. `src: Front-end specification, Route: Company`
- [ ] `C-FE-62` `ui` The technology route shows the reactor as a diagram the visitor picks apart. `src: Front-end specification, Route: Technology`
- [ ] `C-FE-63` `ui` The technology route explains the fuel as uranium grains wrapped in tough shells. `src: Front-end specification, Route: Technology`
- [ ] `C-FE-64` `ui` The technology route explains the graphite around the fuel. `src: Front-end specification, Route: Technology`
- [ ] `C-FE-65` `ui` The technology route explains the helium gas that cools the core. `src: Front-end specification, Route: Technology`
- [ ] `C-FE-66` `ui` The technology route explains the living digital copy used to spot problems early. `src: Front-end specification, Route: Technology`
- [ ] `C-FE-67` `ui` The technology route states the safety case rests on a real reactor running since the late 1990s. `src: Front-end specification, Route: Technology`
- [ ] `C-FE-68` `ui` The technology route states the reactors are built in modules. `src: Front-end specification, Route: Technology`
- [ ] `C-FE-69` `ui` The explorer filter row offers an industry choice. `src: Front-end specification, Route: Solutions`
- [ ] `C-FE-70` `ui` An opened solution explains what the reactor does for that industry block by block. `src: Front-end specification, Route: Solutions`
- [ ] `C-FE-71` `ui` An opened solution offers a save action. `src: Front-end specification, Route: Solutions`
- [ ] `C-FE-72` `ui` An opened solution offers an enquire action. `src: Front-end specification, Route: Solutions`
- [ ] `C-FE-73` `ui` The explorer cards sit tight so a full filtered set fits one screen. `src: Front-end specification, Route: Solutions`
- [ ] `C-FE-74` `ui` The explorer card row becomes a single-card swipe on a phone. `src: Front-end specification, Route: Solutions`
- [ ] `C-FE-75` `ui` The edge route states the design is a modernized version of a reactor that already exists. `src: Front-end specification, Route: Our Edge`
- [ ] `C-FE-76` `ui` The edge route states the reactor runs hotter than ordinary water-cooled reactors. `src: Front-end specification, Route: Our Edge`
- [ ] `C-FE-77` `ui` The edge route states the reactor comes in one or several modules. `src: Front-end specification, Route: Our Edge`
- [ ] `C-FE-78` `ui` The edge route explains the business model where the customer buys only the energy. `src: Front-end specification, Route: Our Edge`
- [ ] `C-FE-79` `literal` The team route opens with the line `shaping the future of nuclear together`. `src: Front-end specification, Route: Our Team`
- [ ] `C-FE-80` `ui` The team route shows the four leaders as a grid. `src: Front-end specification, Route: Our Team`
- [ ] `C-FE-81` `ui` Each leader shows a portrait plate on a soft blue-white tint. `src: Front-end specification, Route: Our Team`
- [ ] `C-FE-82` `ui` Each leader carries a small link to a professional profile. `src: Front-end specification, Route: Our Team`
- [ ] `C-FE-83` `ui` Each leader carries a view-bio action opening the fuller description in the shared modal. `src: Front-end specification, Route: Our Team`
- [ ] `C-FE-84` `ui` The investors route sets out the size of the world future energy need. `src: Front-end specification, Route: Investors`
- [ ] `C-FE-85` `ui` The investors route explains why a proven reactor sold as a service is a strong business. `src: Front-end specification, Route: Investors`
- [ ] `C-FE-86` `ui` The investors route shows a dated roadmap from licensing to deployment. `src: Front-end specification, Route: Investors`
- [ ] `C-FE-87` `ui` The investors route states plainly that a new request stays pending until approval. `src: Front-end specification, Route: Investors`
- [ ] `C-FE-88` `literal` The newsroom heading reads `latest news`. `src: Front-end specification, Route: Newsroom`
- [ ] `C-FE-89` `ui` Each story card shows a generated plate. `src: Front-end specification, Route: Newsroom`
- [ ] `C-FE-90` `ui` Each story card shows where the story ran. `src: Front-end specification, Route: Newsroom`
- [ ] `C-FE-91` `ui` The featured story sits raised above the story wall. `src: Front-end specification, Route: Newsroom`
- [ ] `C-FE-92` `literal` The story wall shows `3` stories at a time. `src: Front-end specification, Route: Newsroom`
- [ ] `C-FE-93` `capability` A more action brings in the next batch of stories. `src: Front-end specification, Route: Newsroom`
- [ ] `C-FE-94` `literal` The careers heading reads `help us build what's next in nuclear energy`. `src: Front-end specification, Route: Careers`
- [ ] `C-FE-95` `ui` The careers route tells the culture story. `src: Front-end specification, Route: Careers`
- [ ] `C-FE-96` `ui` The careers route lists the three open jobs. `src: Front-end specification, Route: Careers`
- [ ] `C-FE-97` `ui` Each job carries an apply action opening the short form in the shared modal. `src: Front-end specification, Route: Careers`
- [ ] `C-FE-98` `data` The apply form takes a name, an email, a written note. `src: Front-end specification, Route: Careers`
- [ ] `C-FE-99` `literal` The careers route introduces the training arm as the `Operations Academy`. `src: Front-end specification, Route: Careers`
- [ ] `C-FE-100` `constraint` No file is attached anywhere in the application. `src: Front-end specification, Route: Careers`
- [ ] `C-FE-101` `ui` The contact route explains the form serves careers, investor, supplier enquiries. `src: Front-end specification, Route: Contact`
- [ ] `C-FE-102` `data` The contact form takes a name, an email, a phone country, a phone, a topic, a message. `src: Front-end specification, Route: Contact`
- [ ] `C-FE-103` `ui` The contact route shows the reference in place once the enquiry is sent. `src: Front-end specification, Route: Contact`
- [ ] `C-FE-104` `ui` The account route holds the list of solutions saved. `src: Front-end specification, Account section`
- [ ] `C-FE-105` `ui` The account route holds the list of enquiries sent with each status. `src: Front-end specification, Account section`
- [ ] `C-FE-106` `ui` A form result appears as an inline banner rather than a floating toast. `src: Front-end specification, Account section`
- [ ] `C-FE-107` `capability` A visitor searches the solutions in plain language. `src: Front-end specification, Extended feature set`
- [ ] `C-FE-108` `ui` The calculator draws a simple bar chart beside the three figures. `src: Front-end specification, Extended feature set`
- [ ] `C-FE-109` `capability` The reactor diagram on `/technology` turns when dragged. `src: Front-end specification, Extended feature set`
- [ ] `C-FE-110` `capability` A tapped reactor part on `/technology` explains that part. `src: Front-end specification, Extended feature set`
- [ ] `C-FE-111` `data` Every piece of wording comes from the database rather than from the build. `src: Front-end specification, Extended feature set`
- [ ] `C-FE-112` `ui` On a phone the display line stacks. `src: Front-end specification, Responsive behaviour`
- [ ] `C-FE-113` `ui` On a phone the four outputs become a list. `src: Front-end specification, Responsive behaviour`
- [ ] `C-FE-114` `ui` On a tablet the layout goes two up. `src: Front-end specification, Responsive behaviour`
- [ ] `C-FE-115` `ui` On a large screen the layout runs multi-column with the reactor at full size. `src: Front-end specification, Responsive behaviour`
- [ ] `C-FE-116` `ui` The reactor stays crisp on a high-resolution screen because the shape is drawn rather than sampled. `src: Front-end specification, Responsive behaviour`
- [ ] `C-FE-117` `ui` On touch a hover becomes a tap. `src: Front-end specification, Responsive behaviour`
- [ ] `C-FE-118` `ui` No viewport width produces a horizontal scrollbar. `src: Front-end specification, Responsive behaviour`
- [ ] `C-FE-119` `ui` The route menu is announced as a list. `src: Front-end specification, Accessibility`
- [ ] `C-FE-120` `ui` The solutions grid carries a plain written equivalent. `src: Front-end specification, Accessibility`
- [ ] `C-FE-121` `ui` Keyboard focus stays inside an open modal until the modal closes. `src: Front-end specification, Accessibility`
- [ ] `C-FE-122` `ui` Keyboard focus returns to the control that opened a modal once the modal closes. `src: Front-end specification, Accessibility`
- [ ] `C-FE-123` `contract` The bars, the words, the first view of the reactor are usable before the whole sequence has arrived. `src: Front-end specification, Performance`
- [ ] `C-FE-124` `contract` The heavier extras load only when the visitor reaches them. `src: Front-end specification, Performance`
- [ ] `C-FE-125` `literal` The menu carries the nine route labels of the copy deck. `src: Front-end specification, Copy deck`
- [ ] `C-FE-126` `literal` The header action label reads `Get in Touch`. `src: Front-end specification, Copy deck`
- [ ] `C-FE-127` `literal` The not-found card reads `We cannot find that page`. `src: Front-end specification, Copy deck`
- [ ] `C-FE-128` `ui` The four output labels are the four pinned output strings. `src: Front-end specification, Copy deck`
- [ ] `C-FE-129` `ui` Each reactor part stays separately nameable so the sequence addresses that part. `src: Front-end specification, Zero-asset substitution`
- [ ] `C-FE-130` `ui` The reactor surface carries a hand-made metallic shine. `src: Front-end specification, Zero-asset substitution`
- [ ] `C-FE-131` `ui` Every technical diagram is drawn as clean lines. `src: Front-end specification, Zero-asset substitution`
- [ ] `C-FE-132` `ui` Every industry plate is a soft generated gradient in the site own tones. `src: Front-end specification, Zero-asset substitution`
- [ ] `C-FE-133` `ui` Every control carries five states: resting, pointed at, pressed, focused, unavailable. `src: Front-end specification, Components`
- [ ] `C-FE-134` `ui` A destructive action confirms before the action runs. `src: Front-end specification, Components`
- [ ] `C-FE-135` `ui` The product commits to a light scheme designed fully, with a dark scheme optional. `src: Front-end specification, Components`

## C-CN Constraints

- [ ] `C-CN-01` `constraint` The product carries one role only. `src: Constraints para 1`
- [ ] `C-CN-02` `constraint` No account shares a row with another account. `src: Constraints para 1`
- [ ] `C-CN-03` `constraint` The product carries no subscription. `src: Constraints para 1`
- [ ] `C-CN-04` `constraint` The product carries no pricing surface. `src: Constraints para 1`
- [ ] `C-CN-05` `constraint` The product carries no notification feed. `src: Constraints para 1`
- [ ] `C-CN-06` `constraint` A saved search raises no alert. `src: Constraints para 1`
- [ ] `C-CN-07` `constraint` No approval happens inside the product. `src: Constraints para 1`
- [ ] `C-CN-08` `constraint` The product carries no editor console. `src: Constraints para 1`
- [ ] `C-CN-09` `constraint` The product carries no live operations telemetry screen. `src: Constraints para 1`
- [ ] `C-CN-10` `constraint` The product carries no map site planner. `src: Constraints para 1`
- [ ] `C-CN-11` `constraint` The product carries no assistant. `src: Constraints para 1`
- [ ] `C-CN-12` `constraint` The product carries no language switch. `src: Constraints para 1`
- [ ] `C-CN-13` `constraint` The product carries no three-dimensional reactor. `src: Constraints para 1`
- [ ] `C-CN-14` `constraint` The product carries no analytics integration. `src: Constraints para 1`
- [ ] `C-CN-15` `constraint` The product carries no social login. `src: Constraints para 1`
- [ ] `C-CN-16` `constraint` The product carries no external content system. `src: Constraints para 1`
- [ ] `C-CN-17` `constraint` The product carries no mapping provider. `src: Constraints para 1`
- [ ] `C-CN-18` `constraint` The product carries no object store. `src: Constraints para 1`
- [ ] `C-CN-19` `constraint` The application makes no external network call at run time. `src: Constraints para 1`
- [ ] `C-CN-20` `constraint` The product ships no native application. `src: Constraints para 1`
- [ ] `C-CN-21` `constraint` No debug route ships. `src: Constraints para 1`
- [ ] `C-CN-22` `constraint` The application stays responsive with hundreds of rows per account list. `src: Constraints para 1`

## C-DC Deployment contract

- [ ] `C-DC-01` `contract` The application is reachable at `APP_PUBLIC_URL`. `src: Deployment contract bullet 1`
- [ ] `C-DC-02` `literal` The port mapping is `${APP_PUBLIC_PORT}:4173`. `src: Deployment contract bullet 1`
- [ ] `C-DC-03` `contract` Both the public port plus the public URL are read from the environment. `src: Deployment contract bullet 1`
- [ ] `C-DC-04` `contract` The HTTP API is served on the same origin as the pages. `src: Deployment contract bullet 2`
- [ ] `C-DC-05` `literal` The route `GET /api/health` returns `200` once the application is ready. `src: Deployment contract bullet 3`
- [ ] `C-DC-06` `contract` The application starts from the environment image with no manual step. `src: Deployment contract bullet 4`
- [ ] `C-DC-07` `contract` Login credentials are written to `/app/USER_README.md`. `src: Deployment contract bullet 5`
- [ ] `C-DC-08` `contract` Each account is written into that file as three plain lines outside any table. `src: Deployment contract bullet 5`
- [ ] `C-DC-09` `literal` The first of those three lines reads `Role: <role>`. `src: Deployment contract bullet 5`
- [ ] `C-DC-10` `contract` A `.browser_screenshots/` directory exists at the application root. `src: Deployment contract bullet 6`
- [ ] `C-DC-11` `contract` Both reserved directories are empty. `src: Deployment contract bullet 6`
- [ ] `C-DC-12` `contract` A production build is served behind a static or preview server. `src: Deployment contract bullet 7`
- [ ] `C-DC-13` `contract` The server keeps running after the session ends. `src: Deployment contract bullet 8`
- [ ] `C-DC-14` `literal` The server binds `0.0.0.0`. `src: Deployment contract bullet 9`
- [ ] `C-DC-15` `contract` The server binds neither the loopback address nor the loopback name. `src: Deployment contract bullet 9`
- [ ] `C-DC-16` `contract` Neither backing service is downloaded, installed, compiled or started by the application. `src: Deployment contract bullet 10`
- [ ] `C-DC-17` `constraint` No edge function is used. `src: Deployment contract bullet 11`
- [ ] `C-DC-18` `constraint` No persistent volume is declared. `src: Deployment contract bullet 12`
- [ ] `C-DC-19` `literal` The route `POST /api/auth/signup` creates an account. `src: Deployment contract, API shapes row 1`
- [ ] `C-DC-20` `literal` The route `POST /api/auth/login` returns an `access_token`. `src: Deployment contract, API shapes row 2`
- [ ] `C-DC-21` `capability` A save token supplied at signup claims the saves held against that token. `src: Deployment contract, API shapes row 1`
- [ ] `C-DC-22` `capability` A save token supplied at login claims the saves held against that token. `src: Deployment contract, API shapes row 2`
- [ ] `C-DC-23` `literal` The route `GET /api/solutions` returns the matching solutions as a top-level array. `src: Deployment contract, API shapes row 4`
- [ ] `C-DC-24` `literal` The route `GET /api/solutions` carries the match count in the header `X-Total-Count`. `src: Deployment contract, API shapes row 4`
- [ ] `C-DC-25` `literal` The route `GET /api/solutions/{slug}` returns one solution with `detail`. `src: Deployment contract, API shapes row 5`
- [ ] `C-DC-26` `literal` The route `GET /api/saves` returns the caller own saved solutions. `src: Deployment contract, API shapes row 6`
- [ ] `C-DC-27` `literal` The route `POST /api/saves` returns the saved row. `src: Deployment contract, API shapes row 7`
- [ ] `C-DC-28` `literal` The route `DELETE /api/saves/{id}` removes the caller own saved row. `src: Deployment contract, API shapes row 8`
- [ ] `C-DC-29` `literal` The route `GET /api/compare` returns up to four solutions. `src: Deployment contract, API shapes row 9`
- [ ] `C-DC-30` `literal` The route `GET /api/searches` returns the caller own saved searches. `src: Deployment contract, API shapes row 10`
- [ ] `C-DC-31` `literal` The route `POST /api/searches` returns the saved search. `src: Deployment contract, API shapes row 11`
- [ ] `C-DC-32` `literal` The route `DELETE /api/searches/{id}` removes the caller own saved search. `src: Deployment contract, API shapes row 12`
- [ ] `C-DC-33` `literal` The route `POST /api/enquiries` returns the enquiry with a `reference`. `src: Deployment contract, API shapes row 13`
- [ ] `C-DC-34` `literal` The route `GET /api/enquiries` returns the caller own enquiries. `src: Deployment contract, API shapes row 14`
- [ ] `C-DC-35` `literal` The route `POST /api/enquiries/{id}/close` sets the caller own enquiry to `closed`. `src: Deployment contract, API shapes row 15`
- [ ] `C-DC-36` `literal` The route `GET /api/access-request` returns the caller own request. `src: Deployment contract, API shapes row 16`
- [ ] `C-DC-37` `literal` The route `POST /api/access-request` returns the caller own request as `pending`. `src: Deployment contract, API shapes row 17`
- [ ] `C-DC-38` `literal` The route `GET /api/documents` answers only a caller whose own request is `approved`. `src: Deployment contract, API shapes row 18`
- [ ] `C-DC-39` `literal` The route `GET /api/stories` carries the story count in the header `X-Total-Count`. `src: Deployment contract, API shapes row 19`
- [ ] `C-DC-40` `literal` The route `GET /api/stories/{slug}` returns one story with `body`. `src: Deployment contract, API shapes row 20`
- [ ] `C-DC-41` `literal` The route `GET /api/jobs` returns the jobs as a top-level array. `src: Deployment contract, API shapes row 21`
- [ ] `C-DC-42` `literal` The route `POST /api/applications` returns the application with a `status`. `src: Deployment contract, API shapes row 22`
- [ ] `C-DC-43` `literal` The route `GET /api/applications` returns the caller own applications. `src: Deployment contract, API shapes row 23`
- [ ] `C-DC-44` `literal` The route `POST /api/calculator` returns `modules_required`. `src: Deployment contract, API shapes row 24`
- [ ] `C-DC-45` `literal` The route `POST /api/calculator` returns `annual_clean_energy_gwh`. `src: Deployment contract, API shapes row 24`
- [ ] `C-DC-46` `literal` The route `POST /api/calculator` returns `annual_co2_avoided_tonnes`. `src: Deployment contract, API shapes row 24`
- [ ] `C-DC-47` `literal` The calculator `kind` field takes `thermal` or `electrical`. `src: Deployment contract, API shapes row 24`
- [ ] `C-DC-48` `literal` The route `GET /api/team` returns the team members as a top-level array. `src: Deployment contract, API shapes row 25`
- [ ] `C-DC-49` `literal` The route `GET /api/offices` returns the offices as a top-level array. `src: Deployment contract, API shapes row 26`
- [ ] `C-DC-50` `literal` The route `GET /api/faqs` returns the matching questions as a top-level array. `src: Deployment contract, API shapes row 27`
- [ ] `C-DC-51` `literal` The route `GET /api/accounts/me` returns the caller own account. `src: Deployment contract, API shapes row 28`
- [ ] `C-DC-52` `role` A request missing a bearer token where one is required is denied. `src: Deployment contract, API shapes closing para 1`
- [ ] `C-DC-53` `constraint` A business-rule violation is rejected as a client error carrying a reason. `src: Deployment contract, API shapes closing para 1`
- [ ] `C-DC-54` `constraint` A business-rule violation is never a server error. `src: Deployment contract, API shapes closing para 1`
- [ ] `C-DC-55` `role` The five private list routes take no account identifier. `src: Deployment contract, API shapes closing para 2`
- [ ] `C-DC-56` `role` An identifier belonging to another account meets the answer a row that never existed gives. `src: Deployment contract, API shapes closing para 2`
- [ ] `C-DC-57` `constraint` Mailpit is the only mail server. `src: Deployment contract, No mocks`
- [ ] `C-DC-58` `constraint` PostgreSQL is the only datastore. `src: Deployment contract, No mocks`
- [ ] `C-DC-59` `constraint` An in-process mail stub is a contract violation. `src: Deployment contract, No mocks`
- [ ] `C-DC-60` `constraint` Saved solutions held in the application process rather than the database are a contract violation. `src: Deployment contract, No mocks`

## Pinned literals

| Value | What it is | Item | Stated in |
|---|---|---|---|
| `visitor` | the one role name | C-RL-19 | User roles para 2 |
| `visitor@example.com` | first seeded account email | C-RL-20 | User roles para 2 |
| `visitor2@example.com` | second seeded account email | C-RL-21 | User roles para 2 |
| `deku-demo-pw-2026` | seeded password for every account | C-RL-22 | User roles para 2 |
| `Authorization: Bearer <token>` | the bearer header the client sends | C-CF-02 | Core features, Auth para 1 |
| `hydrogen` | an output kind | C-CF-06 | Core features rule 1 |
| `550 to 750 C` | a temperature band | C-CF-06 | Core features rule 1 |
| `transport` | a seeded solution slug | C-CF-07 | Core features rule 1 |
| `steel` | a seeded solution slug | C-CF-07 | Core features rule 1 |
| `save_token` | the anonymous save handle | C-CF-09 | Core features rule 3 |
| `reference` | the reference field name | C-CF-25 | Core features rule 8 |
| `ENQ-` | the enquiry reference prefix | C-CF-25 | Core features rule 8 |
| `8` | characters after a reference prefix | C-CF-26 | Core features rule 8 |
| `received` | the new enquiry status | C-CF-28 | Core features rule 8 |
| `pending` | the new access request status | C-CF-34 | Core features rule 10 |
| `IAR-` | the access request reference prefix | C-CF-35 | Core features rule 10 |
| `/api` | the API prefix | C-TR-04 | Technical requirements para 1 |
| `4173` | container-internal port | C-TR-05 | Technical requirements para 1 |
| `DATABASE_URL` | datastore connection variable | C-TR-07 | Technical requirements para 1 |
| `SMTP_HOST` | mail host variable | C-TR-09 | Technical requirements para 1 |
| `SMTP_PORT` | mail port variable | C-TR-10 | Technical requirements para 1 |
| `SMTP_USER` | mail user variable | C-TR-11 | Technical requirements para 1 |
| `SMTP_PASS` | mail password variable | C-TR-12 | Technical requirements para 1 |
| `GET /api/health` | health route | C-TR-14 | Technical requirements para 1 |
| `200` | health ready response code | C-TR-14 | Technical requirements para 1 |
| `output_kind` | the solution output column | C-DM-08 | Data model, solutions |
| `heat` | an output kind | C-DM-08 | Data model, solutions |
| `heat-and-power` | an output kind | C-DM-08 | Data model, solutions |
| `electricity` | an output kind | C-DM-08 | Data model, solutions |
| `temperature_band` | the solution temperature column | C-DM-09 | Data model, solutions |
| `up to 250 C` | a temperature band | C-DM-09 | Data model, solutions |
| `250 to 550 C` | a temperature band | C-DM-09 | Data model, solutions |
| `deployment` | the solution deployment column | C-DM-10 | Data model, solutions |
| `single-module` | a deployment value | C-DM-10 | Data model, solutions |
| `multi-module` | a deployment value | C-DM-10 | Data model, solutions |
| `topic` | the enquiry topic column | C-DM-20 | Data model, enquiries |
| `Technology` | an enquiry topic | C-DM-20 | Data model, enquiries |
| `Solutions` | an enquiry topic | C-DM-20 | Data model, enquiries |
| `Investor relations` | an enquiry topic | C-DM-20 | Data model, enquiries |
| `Careers` | an enquiry topic | C-DM-20 | Data model, enquiries |
| `Suppliers` | an enquiry topic | C-DM-20 | Data model, enquiries |
| `status` | a status column | C-DM-21 | Data model, enquiries |
| `answered` | the answered enquiry status | C-DM-21 | Data model, enquiries |
| `closed` | the closed enquiry status | C-DM-21 | Data model, enquiries |
| `approved` | the entitled access request status | C-DM-26 | Data model, access_requests |
| `declined` | the refused access request status | C-DM-26 | Data model, access_requests |
| `reviewing` | an application status | C-DM-32 | Data model, applications |
| `250` | MW thermal a module | C-DM-42 | Data model, calculator arithmetic |
| `40` | percent electrical conversion | C-DM-43 | Data model, calculator arithmetic |
| `100` | MW electrical a module | C-DM-44 | Data model, calculator arithmetic |
| `8000` | operating hours a year | C-DM-45 | Data model, calculator arithmetic |
| `450` | tonnes of carbon avoided per GWh | C-DM-46 | Data model, calculator arithmetic |
| `251` | the worked thermal need proving the round up | C-DM-49 | Data model, calculator worked row 2 |
| `2` | modules for a 251 MW thermal need | C-DM-49 | Data model, calculator worked row 2 |
| `4000` | GWh for a 251 MW thermal need | C-DM-50 | Data model, calculator worked row 2 |
| `1800000` | tonnes avoided for a 251 MW thermal need | C-DM-51 | Data model, calculator worked row 2 |
| `800` | GWh for a 100 MW electrical need | C-DM-52 | Data model, calculator worked row 3 |
| `260` | the worked electrical need | C-DM-53 | Data model, calculator worked row 4 |
| `3` | stories shown at a time | C-DM-53 | Data model, calculator worked row 4 |
| `Enquiry received:` | enquiry mail subject prefix | C-DM-55 | Data model, Mail table row 1 |
| `Investor access requested:` | access request mail subject prefix | C-DM-57 | Data model, Mail table row 2 |
| `Application received:` | application mail subject prefix | C-DM-59 | Data model, Mail table row 3 |
| `Ada Moreau` | first seeded display name | C-DM-61 | Data model, Seed data para 1 |
| `Ken Adeyemi` | second seeded display name | C-DM-62 | Data model, Seed data para 1 |
| `mining` | a seeded solution slug | C-DM-65 | Data model, Seed data solutions table row 5 |
| `data-centres` | a seeded solution slug | C-DM-67 | Data model, Seed data para 2 |
| `Hydrogen sites` | the seeded saved search name | C-DM-68 | Data model, Seed data para 2 |
| `ENQ-7K2M9QD4` | the first seeded enquiry reference | C-DM-69 | Data model, Seed data para 2 |
| `IAR-4H7N2PQ8` | the approved seeded request | C-DM-70 | Data model, Seed data para 2 |
| `ENQ-5R8X1CJ2` | the second seeded enquiry reference | C-DM-72 | Data model, Seed data para 3 |
| `IAR-9T3V6BLM` | the pending seeded request | C-DM-73 | Data model, Seed data para 3 |
| `High-temperature gas-cooled reactor` | the first key fact copy | C-FE-42 | Front-end specification, reactor layer |
| `250 MW thermal a module` | the second key fact copy | C-FE-43 | Front-end specification, reactor layer |
| `750 degrees Celsius at the outlet` | the third key fact copy | C-FE-44 | Front-end specification, reactor layer |
| `Powering the World` | the home display line | C-FE-50 | Front-end specification, Route: Home |
| `shaping the future of nuclear together` | the team opening line | C-FE-79 | Front-end specification, Route: Our Team |
| `latest news` | the newsroom heading | C-FE-88 | Front-end specification, Route: Newsroom |
| `help us build what's next in nuclear energy` | the careers heading | C-FE-94 | Front-end specification, Route: Careers |
| `Operations Academy` | the training arm name | C-FE-99 | Front-end specification, Route: Careers |
| `Get in Touch` | the header action label | C-FE-126 | Front-end specification, Copy deck |
| `We cannot find that page` | the not-found card copy | C-FE-127 | Front-end specification, Copy deck |
| `${APP_PUBLIC_PORT}:4173` | the port mapping | C-DC-02 | Deployment contract bullet 1 |
| `Role: <role>` | credentials file line one | C-DC-09 | Deployment contract bullet 5 |
| `0.0.0.0` | the bind address | C-DC-14 | Deployment contract bullet 9 |
| `POST /api/auth/signup` | signup route | C-DC-19 | Deployment contract, API shapes row 1 |
| `POST /api/auth/login` | login route | C-DC-20 | Deployment contract, API shapes row 2 |
| `access_token` | the login response field | C-DC-20 | Deployment contract, API shapes row 2 |
| `GET /api/solutions` | solution list route | C-DC-23 | Deployment contract, API shapes row 4 |
| `X-Total-Count` | the count header | C-DC-24 | Deployment contract, API shapes row 4 |
| `GET /api/solutions/{slug}` | one solution route | C-DC-25 | Deployment contract, API shapes row 5 |
| `detail` | the solution long copy field | C-DC-25 | Deployment contract, API shapes row 5 |
| `GET /api/saves` | save list route | C-DC-26 | Deployment contract, API shapes row 6 |
| `POST /api/saves` | save create route | C-DC-27 | Deployment contract, API shapes row 7 |
| `DELETE /api/saves/{id}` | save remove route | C-DC-28 | Deployment contract, API shapes row 8 |
| `GET /api/compare` | comparison route | C-DC-29 | Deployment contract, API shapes row 9 |
| `GET /api/searches` | search list route | C-DC-30 | Deployment contract, API shapes row 10 |
| `POST /api/searches` | search create route | C-DC-31 | Deployment contract, API shapes row 11 |
| `DELETE /api/searches/{id}` | search remove route | C-DC-32 | Deployment contract, API shapes row 12 |
| `POST /api/enquiries` | enquiry create route | C-DC-33 | Deployment contract, API shapes row 13 |
| `GET /api/enquiries` | enquiry list route | C-DC-34 | Deployment contract, API shapes row 14 |
| `POST /api/enquiries/{id}/close` | enquiry close route | C-DC-35 | Deployment contract, API shapes row 15 |
| `GET /api/access-request` | access request read route | C-DC-36 | Deployment contract, API shapes row 16 |
| `POST /api/access-request` | access request create route | C-DC-37 | Deployment contract, API shapes row 17 |
| `GET /api/documents` | document room route | C-DC-38 | Deployment contract, API shapes row 18 |
| `GET /api/stories` | story list route | C-DC-39 | Deployment contract, API shapes row 19 |
| `GET /api/stories/{slug}` | one story route | C-DC-40 | Deployment contract, API shapes row 20 |
| `body` | the story long copy field | C-DC-40 | Deployment contract, API shapes row 20 |
| `GET /api/jobs` | job list route | C-DC-41 | Deployment contract, API shapes row 21 |
| `POST /api/applications` | application create route | C-DC-42 | Deployment contract, API shapes row 22 |
| `GET /api/applications` | application list route | C-DC-43 | Deployment contract, API shapes row 23 |
| `POST /api/calculator` | calculator route | C-DC-44 | Deployment contract, API shapes row 24 |
| `modules_required` | calculator output field | C-DC-44 | Deployment contract, API shapes row 24 |
| `annual_clean_energy_gwh` | calculator output field | C-DC-45 | Deployment contract, API shapes row 24 |
| `annual_co2_avoided_tonnes` | calculator output field | C-DC-46 | Deployment contract, API shapes row 24 |
| `kind` | the calculator input field | C-DC-47 | Deployment contract, API shapes row 24 |
| `thermal` | a calculator kind | C-DC-47 | Deployment contract, API shapes row 24 |
| `electrical` | a calculator kind | C-DC-47 | Deployment contract, API shapes row 24 |
| `GET /api/team` | team route | C-DC-48 | Deployment contract, API shapes row 25 |
| `GET /api/offices` | office route | C-DC-49 | Deployment contract, API shapes row 26 |
| `GET /api/faqs` | question route | C-DC-50 | Deployment contract, API shapes row 27 |
| `GET /api/accounts/me` | the caller account route | C-DC-51 | Deployment contract, API shapes row 28 |
| `Heat` | the first output label | C-FE-128 | Front-end specification, Copy deck |
| `Heat and power` | the combined output label | C-FE-128 | Front-end specification, Copy deck |
| `Hydrogen` | the hydrogen output label | C-FE-128 | Front-end specification, Copy deck |
| `Electricity` | the electricity output label | C-FE-128 | Front-end specification, Copy deck |
| `clean heat and electricity to power a world of industrial applications` | the company opening line | C-FE-56 | Front-end specification, Route: Company |
| `npm ci` | the run manifest install command | C-DC-12 | run manifest, install |
| `npm run build` | the run manifest build command | C-DC-12 | run manifest, build |
| `node build/index.js` | the run manifest serve command | C-DC-13 | run manifest, serve |

### Referenced but not pinned

| What the instruction calls it | Item | Why it matters |
|---|---|---|
| the SMTP user value | C-TR-11 | named as an environment variable with no literal given |
| the SMTP password value | C-TR-12 | named as an environment variable with no literal given |

## Coverage ledger

| Section | Obligation-bearing sentences | Items produced |
|---|---|---|
| Overview | 1 | 7 |
| User roles | 2 | 22 |
| Core features | 9 | 50 |
| User flow | 4 | 28 |
| UI and UX notes | 0 | 33 |
| Technical requirements | 3 | 20 |
| Data model | 10 | 77 |
| Front-end specification | 18 | 135 |
| Constraints | 1 | 22 |
| Deployment contract | 11 | 60 |

