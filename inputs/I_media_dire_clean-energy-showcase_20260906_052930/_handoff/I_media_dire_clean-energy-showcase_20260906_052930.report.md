# Build report -- I_media_dire_clean-energy-showcase_20260906_052930

## Identity

| Field | Value |
|---|---|
| task code | `I_media_dire_clean-energy-showcase_20260906_052930` |
| task id | `deku/clean-energy-showcase` |
| cell | individual / media-consumption / directory-matching |
| service_profile | `P2-db-email` |
| providers | db `postgres`, email `mailpit` |
| variant | `a` (no variant axes; axes are required only from `b`) |
| language | `typescript` |
| design_direction | `brutalist-utility` (sha256 of the archetype, index 6 of 8) |
| capability_flags | `aesthetic` |
| spec_sections_given | overview, roles, features, flow, uiux, frontend, techrequirements, datamodel, constraints, contract |
| shard | 1 of 1 (no device sharding configured) |
| contributor | `yasir.aliint17@ethara.ai` |
| authors | seven email IDs; no personal name appears in `task.toml`, and both author keys carry the email so Harbor's author model still loads (authoring decision 16) |

## Derived-design draws

Every value below is `sha256(archetype)` at a fixed byte offset, per
`generate_instruction.md` 2.9 / 2.10 and `reference/L` L.4. None is a preference.

| Axis | Value |
|---|---|
| `render_model` | `ssr-islands` |
| `backend` | `Fastify` |
| `frontend` | `SvelteKit` |
| `design_direction` | `brutalist-utility` |
| `nav` | `top-nav` |
| `work_surface` | `card-grid` |
| `create_flow` | `modal` |
| `feedback` | `inline-banner` |

`brutalist-utility` carries `split-pane` as its layout archetype; the 2.10 navigation
draw is `top-nav` and wins per reference/L L.6. The override is recorded in
the authoring decisions file that travels beside this bundle, entry 6.

## Feature resolution

| Candidate (from the companion PRD) | Verdict | Where it landed | Reason |
|---|---|---|---|
| Scroll-bound reactor sequence | INCLUDED | `## Front-end specification`, reactor layer | PRD sections 1, 6, 7, 8; graded by browser substeps and rubric J4 |
| Solutions explorer with four filters and a running count | INCLUDED | `## Core features` rules 1-2 | the pattern's own surface; the two-result boundary is seeded |
| Anonymous save claimed on sign-in | INCLUDED | `## Core features` rules 3-4 | PRD section 20; idempotency anchor |
| Four-way comparison | INCLUDED | `## Core features` rule 5 | PRD sections 20-21 |
| Enquiries with a reference and an acknowledgement | INCLUDED | `## Core features` rules 8-9, 14 | PRD sections 19-20; the email slot |
| Investor access request and the document room | INCLUDED | `## Core features` rules 10-11 | PRD section 16; the entitlement boundary |
| Per-account row isolation | INCLUDED | `## Core features` rule 7 | the pattern's critical focus |
| Module calculator | INCLUDED | `## Core features` rule 12, `## Data model` | PRD section 21; the derived-number anchor |
| Newsroom wall with paging | INCLUDED | `## Front-end specification`, Route: Newsroom | PRD section 17 |
| Careers with applications | INCLUDED | `## Core features` rule 13 | PRD section 18 |
| Saved searches | INCLUDED | `## Core features` rule 6 | PRD section 21 |
| Company, technology, edge, team, investors, contact, FAQ content | INCLUDED | `## Front-end specification` route sections | PRD sections 11-19 |
| Resume attachment on a job application | DROPPED | `## Constraints` | P2-db-email declares no storage slot, so there is nowhere for bytes to live; the written note replaces it |
| Live operations screen and its live link | DROPPED | `## Constraints` | needs the realtime slot this profile does not declare |
| Map site planner | DROPPED | `## Constraints` | needs a mapping provider outside the closed provider world |
| Smart assistant | DROPPED | `## Constraints` | no provider surface exists for it |
| Language and unit switching | DROPPED | `## Constraints` | not gradeable through any declared channel |
| Editor console | DROPPED | `## Constraints` | needs an admin role the category collapses away; INV4 forbids requiring admin work |
| Alert mail on a saved search | DROPPED | `## Constraints` | needs a scheduler this environment does not provide |
| Three-dimensional reactor | DROPPED | `## Constraints` | the zero-asset rule keeps the reactor drawn; the scroll sequence carries the same information |
| Approval performed inside the product | DROPPED | `## Constraints` | INV4: no task may require admin-credential work; approval states are seeded instead |
| Passwordless sign-in by emailed code | RECAST | `## Core features`, Auth | 2.1 fixes email and password with bearer tokens as a contract value; recorded as authoring decision 4 |

## Slot obligations

| Slot | Provider | Verdict | Observed by |
|---|---|---|---|
| `db` | `postgres` | MET | every store assertion reads the PostgreSQL backend through `capabilities.make_backend`; 51 tests reconcile an API answer against stored rows |
| `email` | `mailpit` | MET | five tests read the Mailpit inbox: three transition messages, the recipient rule, and the two non-transition cases |

No slot is UNMET, so there is no blocking finding to carry into the handoff.

## Grading surface

| Measure | Value |
|---|---|
| workflows | 11 (individual band 6-11) |
| browser substeps | 54 |
| pytest substeps | 81 |
| browser : pytest ratio | 0.67 (G45 floor 0.40) |
| critical substeps | 38 |
| non-happy-path workflow ids | `comparison_holds_four_saves_at_most`, `investor_room_is_denied_without_approval`, `cross_account_rows_cannot_be_read`, `unauthenticated_visitor_is_sent_to_sign_in` |
| pytest module | `tests/test_showcase.py`, one module, 81 tests |
| module sections | reachability, auth, explorer, saving, saved searches, enquiries, investor access, isolation, calculator, content, applications, mail |
| checklist items | 454 |
| judged rubric criteria | 12 (12 positive, 0 negative) |
| compiled rubric items | 14, compiled-weight share 1.0 against a 0.60 floor |
| IF overlay constraints | 15 across all six categories, none recorded not-applicable |
| code-quality criteria | 8 across scope_discipline and internal_consistency |

### Rubric dimension shares

| Dimension | Criteria | Positive points | Share | Target | Within 0.10 |
|---|---|---|---|---|---|
| `instruction_following` | 2 | 10 | 0.294 | 0.30 | yes |
| `functionality` | 2 | 8 | 0.235 | 0.25 | yes |
| `ux_flow` | 2 | 6 | 0.176 | 0.15 | yes |
| `ui_visual` | 3 | 7 | 0.206 | 0.15 | yes |
| `motion` | 1 | 1 | 0.029 | 0.05 | yes |
| `accessibility` | 1 | 1 | 0.029 | 0.05 | yes |
| `responsiveness` | 1 | 1 | 0.029 | 0.05 | yes |

## Grading window

```
section        H2                chars  target  flag
core_features  Core features      2469    2400  over-reference
user_flow      User flow          1890    1900  ok
ui_ux_notes    UI/UX notes        1954    1700  over-reference
constraints    Constraints         773     800  ok
user_roles     User roles         1026    1000  over-reference
overview       Overview            688     700  ok
joined total                      8800    8800  ok
first four                        7086    7100  ok
```

Every judged section sits inside the 2,500-character slice and the join is exactly at
the 8,800 kit target against the 9,000 runtime cap, so no graded rule is truncated.
Four sections sit above their individual kit targets; that is recorded as the C7 WARN
in the QC receipt.

## Literals ledger

147 entries. Every value appears verbatim in every carrier it declares, and every
carrier really contains it (G6, both directions).

| Class | Count | Values |
|---|---|---|
| `account` | 2 | `visitor@example.com`, `visitor2@example.com` |
| `credential` | 1 | `deku-demo-pw-2026` |
| `endpoint` | 18 | `/api/health`, `/api/auth/signup`, `/api/auth/login`, `/api/solutions`, `/api/saves`, `/api/compare`, `/api/searches`, `/api/enquiries`, `/api/access-request`, `/api/documents`, `/api/stories`, `/api/jobs`, `/api/applications`, `/api/calculator`, `/api/team`, `/api/offices`, `/api/faqs`, `/api/accounts/me` |
| `env_var` | 9 | `DATABASE_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `APP_PUBLIC_URL`, `APP_PUBLIC_PORT`, `DB_ADMIN_URL`, `EMAIL_INBOX_API_URL` |
| `number` | 15 | `250`, `750`, `8000`, `450`, `100`, `251`, `2000`, `4000`, `800`, `360000`, `900000`, `1800000`, `1080000`, `2400`, `260` |
| `route` | 16 | `/company`, `/technology`, `/edge`, `/team`, `/solutions`, `/compare`, `/calculator`, `/investors/room`, `/investors`, `/news`, `/careers`, `/contact`, `/faq`, `/account`, `/signin`, `/signup` |
| `scheme` | 14 | `ENQ-`, `IAR-`, `Enquiry received:`, `Investor access requested:`, `Application received:`, `save_token`, `modules_required`, `annual_clean_energy_gwh`, `annual_co2_avoided_tonnes`, `output_kind`, `temperature_band`, `deployment`, `module_count`, `Authorization: Bearer` |
| `seed_record` | 65 | `oil-and-gas`, `chemicals`, `transport`, `steel`, `mining`, `data-centres`, `communities`, `desalination`, `Oil and Gas`, `Chemicals`, `Transport`, `Steel`, `Mining`, `Data Centres`, `Communities`, `Desalination`, `Ada Moreau`, `Ken Adeyemi`, `ENQ-7K2M9QD4`, `ENQ-5R8X1CJ2`, `IAR-4H7N2PQ8`, `IAR-9T3V6BLM`, `Hydrogen sites`, `investor-deck-2026`, `technology-dossier`, `licensing-roadmap`, `Investor Deck 2026`, `Technology Dossier`, `Licensing Roadmap`, `reactor-systems-engineer`, `licensing-lead`, `operations-trainer`, `Reactor Systems Engineer`, `Licensing Lead`, `Operations Trainer`, `Rotterdam`, `Chicago`, `Tokyo`, `first-module-order`, `helium-loop-milestone`, `steel-partnership`, `licensing-step-cleared`, `academy-first-cohort`, `desalination-study`, `helium-supply-signed`, `First module order signed`, `mira-halvorsen`, `tobias-ruiz`, `anneke-vos`, `daniel-okoye`, `Mira Halvorsen`, `Tobias Ruiz`, `Anneke Vos`, `Daniel Okoye`, `heat-and-power`, `hydrogen`, `electricity`, `up to 250 C`, `250 to 550 C`, `550 to 750 C`, `single-module`, `multi-module`, `Investor relations`, `Careers`, `Suppliers` |
| `status` | 7 | `received`, `answered`, `closed`, `pending`, `approved`, `declined`, `reviewing` |

Two entries are `verifier_only` and carry `task.toml` alone as their carrier:
`DB_ADMIN_URL` and `EMAIL_INBOX_API_URL`. Neither appears in `instruction.md` or in
`[environment].env` (INV4).

## Authoring documents

| Document | Fed |
|---|---|
| `<authoring>/00-decisions.md` | the eight `draw:` lines and the recorded judgment calls |
| `<authoring>/01-PRD.md` | `## Overview`, `## Core features`, `## Constraints` |
| `<authoring>/02-TRD.md` | `## Technical requirements` |
| `<authoring>/03-app-flow.md` | `## User flow` |
| `<authoring>/04-uiux-brief.md` | `## UI/UX notes`, `## Front-end specification` |
| `<authoring>/05-backend-schema.md` | `## Data model`, `## User roles` |
| `<authoring>/06-implementation-plan.md` | nothing: `## Build plan` is not emitted at baseline |

## Kit gate log

Rendered from `_handoff/I_media_dire_clean-energy-showcase_20260906_052930.gates.jsonl`. Every row carries the SHA-256 of every
file it read. No verdict below was transcribed.

| Gate | Tool | Exit | Verdict |
|---|---|---|---|
| G2/G16 | `validate_task.py` | 0 | PASS |
| G1/G12 | `layout_lint.py` | 0 | PASS |
| G46 | `structure_lint.py` | 0 | PASS |
| G50 | `docker_lint.py` | 0 | PASS |
| G55 | `runtime_deps_lint.py` | 0 | PASS |
| G63 | `secret_lint.py` | 0 | PASS |
| G48/G58 | `truth_lint.py` | 0 | PASS |
| G51 | `source_lint.py` | 2 | ? |
| G52 | `rubric_context_lint.py` | 0 | PASS |
| G54 | `comment_lint.py` | 0 | PASS |
| G17 | `secret_hygiene_lint.py` | 0 | PASS |
| G11 | `leak_scan.py` | 0 | PASS |
| G33 | `window_lint.py` | 0 | PASS |
| G4/G5 | `contract_lint.py` | 0 | PASS |
| G43 | `prescription_lint.py` | 0 | PASS |
| G44 | `disclosure_lint.py` | 0 | PASS |
| G10 | `no_sdk_lint.py` | 0 | PASS |
| G31 | `determinism_lint.py` | 0 | PASS |
| G14 | `reward_path_lint.py` | 0 | PASS |
| G27/G30 | `rubric_lint.py` | 0 | PASS |
| G41 | `flag_lint.py` | 0 | PASS |
| G56 | `if_lint.py` | 0 | PASS |
| G57 | `if_lint.py` | 0 | PASS |
| G59/G60 | `codequality_lint.py` | 0 | PASS |
| G7/G8/G9/G32/G45 | `workflow_lint.py` | 0 | PASS |
| G6 | `fixture_lint.py` | 0 | PASS |
| G24 | `coverage_map.py` | 0 | PASS |
| G37 | `checklist_qc.py` | 0 | PASS |
| G39 | `rubric_align_lint.py` | 0 | PASS |
| G28/G29 | `channel_lint.py` | 0 | PASS |
| G40 | `prompt_receipt_lint.py` | 0 | WARN |
| G0/INV5 | `vendor_check.py` | 0 | PASS |
| G47 | `output_qc.py` | 0 | PASS |

Two rows need reading alongside their commands.

**G51 reads `exit=2` in the sweep because `revalidate.py` invokes `source_lint.py`
with no `--source`.** The sweep cannot know a companion document was supplied. Run
separately against the PRD this Task Order arrived with, G51 is a PASS:

```
python3 "$KIT/tools/source_lint.py" "$OUT/I_media_dire_clean-energy-showcase_20260906_052930/instruction.md" \
    --source "<path>/zettajoule_prd_plain.md" \
    --waive "Evidence gaps" --waive "Acceptance checklist"
```

    note  zettajoule_prd_plain.md: topic '30. Evidence gaps and substitutions' waived by the author
      note  zettajoule_prd_plain.md: topic '31. Acceptance checklist' waived by the author
      note  zettajoule_prd_plain.md: 33/33 topic(s) carried into the brief
    VERDICT  PASS   G51: every supplied source document is carried into instruction.md (/Users/macbookpro/Documents/genkit/Output/I_media_dire_clean-energy-showcase_20260906_052930/instruction.md)

**G40 reads WARN, not PASS.** Every certification prompt carries a current,
bundle-bound receipt with the scorecard its own registry declares, and every receipt
names `self` as the verifier. The kit's rule is owner != verifier, so those are
recorded verdicts rather than independent ones. The receipts carry three WARN checks
with their findings: QC_instruction B1 and C7, and QC_spec S5.

## Blocking findings

None mechanical. Three authoring facts a reviewer should hold:

1. **The Task Order was re-keyed.** It arrived as `energy-information` /
   `content-exploration` / `clean-energy-company-showcase`, none of which is legal:
   the domain and pattern enums are closed and an archetype is exactly three kebab
   tokens. The tasker chose `media-consumption` / `directory-matching` /
   `clean-energy-showcase`. Recorded as authoring decision 1.
2. **Only the plain half of the companion PRD was supplied.** That document names a
   technical twin carrying the exact colours, timings and coordinates; the twin was
   not provided and the plain half contains no hex value, no font family and no type
   size. Nothing was invented to fill the gap: `## UI/UX notes` states colour by role
   and tone and type by personality, which is what section 4 requires of it in any
   case. Recorded as authoring decision 3 and as the QC_spec S5 WARN.
3. **Six checklist items were removed as ungradeable.** The framework names, the Node
   major, the structured-log line, the direct-dependency rule and the object-store
   absence cannot be observed by any channel this bundle carries; the code-quality
   rubric grades them and G24 does not join that channel. The brief still states all
   six. Recorded as authoring decision 14.

## Versions

| Component | Version |
|---|---|
| generation kit | `deku-green-field` (kit self-test G38 green, 32 checks) |
| vendored grader | `0.22.0` (byte-identical, INV5) |
| target schema | `1.4` |
| harbor | `0.20.0` |
| verifier mode | `shared` |

## Budget estimate

`turns_expected = 150`, `tokens_expected = 5500000`. Nineteen routes, thirteen tables,
two providers, a scroll-bound visual layer with a reduced-motion path, and a zero-asset
rule that forces every mark to be drawn rather than fetched. That is above a
single-surface CRUD build and below an enterprise multi-role workflow, which is the
standard tier these two values encode.

## Exit state

```
MECHANICALLY-GREEN, NO-SOLUTION
```

NOT ADMISSIBLE. `solution/app/` carries no code (D20, app-deferred). Nothing here
counts toward corpus targets until the app is generated from `solution/checklist.md`
and `harbor run -a oracle` returns `1.0` twice.
