# Build report: S_ecomm_comm_hardware-companion-storefront_20260901_123839

| | |
|---|---|
| Task code | `S_ecomm_comm_hardware-companion-storefront_20260901_123839` |
| Task id | `deku/hardware-companion-storefront` |
| Cell | solo_founder / ecommerce-retail / commerce-checkout |
| Service profile | `P5-db-pay-email` |
| Providers | `backend: postgres` (PostgreSQL 16.4), `payments: killbill` (Kill Bill 0.24.21), `email: mailpit` (Mailpit v1.30.6) |
| Variant | `a`, no variant axes |
| Language | `typescript` |
| Capability flags | `aesthetic,concurrency_hardening,observability,data_scale` |
| Design direction | `dense-ops-console` (sha256 over the archetype, index 1 of 8) |
| Spec sections given | overview, roles, features, flow, uiux, frontend, techrequirements, datamodel, constraints, contract |
| Companion document | `prd-generator/output/opalcamera/opalcamera_prd.md`, 9718 lines |
| Spec folder | `output_01sep/_spec/S_ecomm_comm_hardware-companion-storefront_20260901_123839/`, seven docs |
| Shard | 1 of 1 (single-task run) |
| Kit | deku-green-field, grader pin `0.22.0`, target schema `1.4` |
| Exit state | **MECHANICALLY-GREEN, NO-SOLUTION** (two red gates, G2 and G46, both recorded below) |

## Task Order mapping

The supplied order named a domain and a pattern outside the kit's closed enums. Both were
mapped to their nearest legal cell before the mint, and the mapping is recorded here rather
than left implicit:

| Supplied | Minted | Why |
|---|---|---|
| `domain: hardware-iot` | `ecommerce-retail` | `hardware-iot` is not a level-2 code. The product sells its own hardware direct to consumers, and `ecommerce-retail` is the only solo_founder domain that carries a catalogue, a cart and an order. |
| `pattern: transactional-checkout` | `commerce-checkout` | `transactional-checkout` is not a level-3 code. `commerce-checkout` is its exact counterpart and is legal in `solo_founder`. |
| `category: solo_founder` | unchanged | |
| `archetype: hardware-companion-storefront` | unchanged | three lowercase kebab tokens, unclaimed in the ledger |
| `Task_contributor` | `dishita.aryaint17@ethara.ai` | seventh `[task].authors` entry, after the six fixed team addresses |

## The authoring spec folder

Seven docs at `output_01sep/_spec/S_ecomm_comm_hardware-companion-storefront_20260901_123839/`,
authored in the order `01 -> 05 -> 02 -> 03 -> 04 -> 06` plus `00-decisions.md`. The folder is
authoring-side: it is a sibling of the bundle, never inside it (CON-5 and G1 both forbid a
`spec/` directory in a bundle), and the agent never sees it.

It exists for three reasons that are not decorative. `00-decisions.md` carries the eight `draw:`
lines that `tools/diversity_lint.py` (G49) reads to compute corpus concentration; without them
this bundle would be silently excluded from the anti-monoculture denominator as the corpus grows.
`04-uiux-brief.md` carries the literal palette, type scale, motion values and accessibility
floors that `instruction.md` deliberately withholds, so the design record is complete without the
brief becoming a spec sheet the model echoes back. And `QC_spec.md` (the second of G34's two
prompts) has an artifact to review rather than a hollow NOT-APPLICABLE.

It was authored after the bundle rather than before it, because CON-1 states the folder is
retired while `stage-2-instruction.md` still names it as Phase 1 and two tools still read it. The
first reading was followed and then corrected; no bundle file changed.

## Derived-design draws (R4, sha256 over the archetype)

```
draw: render_model = ssr-islands
draw: backend = Hono
draw: frontend = Astro + islands
draw: design_direction = dense-ops-console
draw: nav = sidebar-nav
draw: work_surface = card-grid
draw: create_flow = inline-row
draw: feedback = toast
```

The `dense-ops-console` layout archetype (`sidebar-nav`) and the §2.10 navigation draw agree,
so no override was needed. The direction is scoped in the brief rather than applied flatly: the
letter is the one editorial surface, and every commerce, account, download and installer surface
is information-dense with tabular numerals and mechanical motion. The `inline-row` create flow
replaced the PRD's dedicated `/account/devices/register` route with a register row at the head of
the camera grid, per §2.10 ("pattern proposes, draw disposes").

## Feature resolution against the supplied PRD

| Candidate | Verdict | Where it landed | Reason |
|---|---|---|---|
| The founder letter over a full-screen film, its scroll-driven darkening and the dot-matrix footer | INCLUDED | `## Front-end specification`, `## UI/UX notes` | The Task Order names the letter and the film as the front page |
| Catalogue, product detail, variant selection, availability states | INCLUDED | `## User flow`, `## Front-end specification`, `## Data model` | The Task Order names buying a camera and its accessories |
| Server-side cart, price-change notice, three-step checkout, shipment protection ladder | INCLUDED | `## Core features`, `## Front-end specification` | The pattern's critical focus is the checkout |
| Billing account and invoice in `killbill`, keyed by the order email | INCLUDED | `## Core features` rule 4 | `commerce-checkout` critical focus: an invoice exists on the account for the right amount |
| Order confirmation mail over real SMTP | INCLUDED | `## Core features` rules 9 and 10 | The `email` slot the P5 profile declares |
| Account, sign-in, order history, device registry, ownership transfer and release | INCLUDED | `## User roles`, `## Core features` rules 5 and 6 | The Task Order names registering the device to an account |
| Download page, release archive with its four note groups, deep links, build-number ordering | INCLUDED | `## Front-end specification`, `## Core features` | The Task Order names downloading the application and reading its release notes |
| Browser firmware installer, its safety sequence and its read-back | INCLUDED | `## Core features` rules 7 and 8, `## Front-end specification` | The Task Order names flashing firmware from the browser |
| Magic-link sign-in and password reset by mail | DROPPED | `## Constraints` | The kit's fixed baseline is app-implemented email and password with bearer tokens |
| Staff operations console, audit log, two-person firmware promotion, rollout and halt | DROPPED | `## Constraints` | No staff role is in the `commerce-checkout` row, and no channel could observe one |
| Returns, RMA, warranty claims, refunds | DROPPED | `## Constraints` | Kill Bill's refund surface is not referenceable (reference/K K.4), so no grader could see one |
| Jobs page and the application flow | DROPPED | `## Constraints` | A separate submission product, unrelated to the checkout the pattern grades |
| Legal document library and the scroll-linked contents rail | DROPPED | `## Constraints` | A content subsystem with its own versioning; no slot observes it |
| Analytics, consent banner, product telemetry | DROPPED | `## Constraints` | No outbound network call is permitted at run time |
| Search, caching layers, read models, background job runner, webhooks | DROPPED | `## Constraints` | Each needs a slot this profile does not declare |
| Carrier integration, address validation, tax service, cross-border zones | DROPPED | `## Constraints` | Third-party services with no provider in reference/C |

## Slot obligations

| Slot | Provider | Critical substep | Observing test | State |
|---|---|---|---|---|
| `backend` | `postgres` | yes | `test_seeded_catalogue_rows_exist_as_specified` and 15 others naming stored rows | MET |
| `payments` | `killbill` | yes | `test_confirmed_order_invoice_exists_in_billing_platform_for_total` and 5 others naming the checkout or the invoice | MET |
| `email` | `mailpit` | yes | `test_confirmed_order_email_delivered_to_buyer_only` and 1 other naming mail | MET |

## Grading surface

- Workflows: **16** (solo_founder band 10 to 16).
- Substeps: **32 browser**, **28 pytest**; **28** carry `critical`.
- Non-happy-path workflow ids: 8 - `duplicate_order_submission_creates_no_second_invoice`,
  `concurrent_checkout_for_the_last_unit_allows_exactly_one`,
  `registering_a_camera_owned_by_another_account_is_denied`,
  `invalid_and_blocked_serials_are_rejected`,
  `concurrent_registration_of_one_serial_allows_exactly_one`,
  `unauthenticated_account_routes_are_denied`,
  `firmware_downgrade_and_model_mismatch_are_rejected`,
  `seeded_state_survives_a_restart_with_no_duplicate_rows`.
- Checklist: **440** obligations across ten section codes, every one cited by at least one channel.
- Judged rubric: **17** criteria, 15 positive and 2 negative, across all seven dimensions at the
  0.30 / 0.25 / 0.15 / 0.15 / 0.05 / 0.05 / 0.05 budget. The dropped criterion judged two pinned
  copy strings (`That did not work.`, `That page does not exist.`); string equality is the
  deterministic channel's work, and both obligations moved to the sign-in browser substep.
- Compiled answer key: **28** rubric items, all `mode: compiled`, compiled-weight share 1.0.
- IF overlay: **18** constraints across all six categories, every target reusing existing evidence.
- Code rubric: **9** criteria on the two authored dimensions, restating nothing the product rubric judges.

## Gate log

Rendered from `_handoff/S_ecomm_comm_hardware-companion-storefront_20260901_123839.gates.jsonl`,
32 rows, each carrying its exit code and the SHA-256 of every file it read. Never transcribed.

| Gate | Exit | Verdict |
|---|---|---|
| G2/G16 `validate_task.py` | 1 | **FAIL** (authors carry no `name`; instructed, see below) |
| G1/G12 `layout_lint.py` | 0 | PASS |
| G46 `structure_lint.py` | 1 | **FAIL** |
| G50 `docker_lint.py` | 0 | PASS |
| G55 `runtime_deps_lint.py` | 0 | PASS |
| G48/G58 `truth_lint.py` | 0 | PASS |
| G51 `source_lint.py` | 2 | NOT-APPLICABLE |
| G52 `rubric_context_lint.py` | 0 | PASS |
| G54 `comment_lint.py` | 0 | PASS |
| G17 `secret_hygiene_lint.py` | 0 | PASS |
| G11 `leak_scan.py` | 0 | PASS |
| G33 `window_lint.py` | 0 | PASS |
| G4/G5 `contract_lint.py` | 0 | PASS |
| G43 `prescription_lint.py` | 0 | PASS |
| G44 `disclosure_lint.py` | 0 | PASS |
| G10 `no_sdk_lint.py` | 0 | PASS |
| G31 `determinism_lint.py` | 0 | PASS |
| G14 `reward_path_lint.py` | 0 | PASS |
| G27/G30 `rubric_lint.py` | 0 | PASS |
| G41 `flag_lint.py` | 0 | PASS |
| G56 `if_lint.py` | 0 | PASS |
| G57 `if_lint.py` | 0 | PASS |
| G59/G60 `codequality_lint.py` | 0 | PASS |
| G7/G8/G9/G32/G45 `workflow_lint.py` | 0 | PASS |
| G6 `fixture_lint.py` | 0 | PASS |
| G24 `coverage_map.py` | 0 | PASS |
| G37 `checklist_qc.py` | 0 | PASS |
| G39 `rubric_align_lint.py` | 0 | PASS |
| G28/G29 `channel_lint.py` | 0 | PASS |
| G40 `prompt_receipt_lint.py` | 0 | WARN (self-attested; 7 certification prompts, 286 checks answered) |
| G0/INV5 `vendor_check.py` | 0 | PASS |
| G47 `output_qc.py` | 1 | **FAIL** (downstream of G2 and G46 only) |

Corpus-level, run once over the output root: G42 NOT-APPLICABLE and G49 NOT-APPLICABLE (one
bundle, nothing to compare against), G26/G61 PASS with the standing advisory that no bundle
carries a difficulty until a pass@8 sweep has run. G38 `kit_selftest.py` PASS, 32 checks.

## The two red gates

**G2 `[task].authors` carries no `name`.** Every entry in `[task].authors` is
`{ email = "..." }` with the `name` half omitted, on the tasker's explicit and reaffirmed
instruction that no author names appear in `task.toml`. All seven configured addresses are
present, verbatim and in the kit-config order, and `contributor_id` carries the contributor
address. The consequence is stated rather than worked around: Harbor's author model requires
both keys, so `TaskConfig.model_validate_toml()` raises `task.authors.0.name Field required`
and `Task.is_valid_dir()` rejects the whole task directory before it loads. `qc_toml.md`
META-007 is Critical for exactly this reason and is recorded FAIL in the G36 receipt. Repair,
if the constraint is ever lifted, is one edit: give each entry the `name` half from kit-config
`authors_fixed` (`Suryansh`, `Sarvex`, `Madhur Parwal`, `Utsav Jain`, `Abhishek Shaw`,
`Kaustubh Dalvi`, `Dishita Aryaint`). No other file changes.

**G46 CON-1 placement.** The bundle sits at
`C:\Users\LENOVO\Desktop\prd\GreenField-GenKit2\output_01sep\`, which is inside the generation
kit. CON-1 requires the output root to be a sibling of the kit rather than a child of it, so
that generated corpus data is never inside the tree that gets cloned, wiped or redistributed.

This is a placement decision, not a defect in the bundle: every other structural check in
`structure_lint.py` passes, and G47 is red only because it refuses to certify an output carrying
any red gate. Nothing inside the bundle changes when it moves.

The remedy is two steps and touches no bundle file:

1. Move `output_01sep/` to `C:\Users\LENOVO\Desktop\prd\output_01sep\`, a sibling of the kit.
2. Set `output_root` in `deku-green-field/config/kit-config.yaml` to that path.

Then re-run `revalidate.py` on the moved bundle; G46 goes green, and the `output-qc ledger`
finding clears once `ledger.jsonl` sits beside the moved bundle. G47 stays red only while G2
is red.

## Divergences from the kit defaults, on the record

1. **The grading window now fits, and this is a reversal.** The six budgeted sections used to
   join to 13,845 characters against `run_rubric.py`'s 9,000-character slice, which truncated
   `## Overview` entirely and most of `## User roles`, and `## UI/UX notes` alone lost 2,458
   characters off its own 2,500-character per-section slice. They now join to **8,996** with no
   section over 2,500: Core features 2,379, User flow 2,084, UI/UX notes 2,057, Constraints 795,
   User roles 995, Overview 703. Nothing in the brief is judged on a truncated body any more.
   The per-surface detail, the concrete type scale and the layout tokens moved into
   `## Front-end specification`, which reference/G G.3 holds for exactly this overflow and which
   the agent reads in full; every `dense-ops-console` direction phrase, the motion character, the
   density statement and the accessibility floors stay inside `## UI/UX notes`, and G41 still
   finds all three required phrases. The route table stays in `## User flow` because
   `generate_instruction.md` fixes that section's four blocks and `rubric_context_lint.py` (G52)
   builds its anchor vocabulary from that table. Recorded in the G34 receipt as check C7 PASS.
2. **No hex anywhere in `instruction.md`, and typography is now stated as values.** The palette
   is still specified by role and exclusivity rather than by hex, on the governing guideline's
   rule that the brief states intent; reference/G G.9 recommends the opposite and the guideline
   wins. **Typography is the deliberate exception, on the tasker's instruction to match the PRD's
   font family, style and sizes while never giving a font colour as a hex code.**
   `## Front-end specification` carries `### Type and layout`: the two families (one grotesque at
   weights 400 and 700, `font-style: normal`, no italic, `font-display: swap` over
   `system-ui, sans-serif` with the four metric overrides from PRD 47.2; and the system-only
   monospace stack for identifiers), the whole measured scale with line heights and tracking from
   PRD 4.8-4.9, the two fluid tokens and their pinned landing values, the deliberately
   non-monotonic width behaviour, and the frame values that hang off the type from PRD 4.10-4.14.
   `instruction.md` still contains zero hex colour literals.
3. **G51 is NOT-APPLICABLE by choice.** The PRD was not passed to `source_lint.py` with
   `--source`, because check (a) of that gate requires every hex colour in the source document to
   appear verbatim in `instruction.md`, which is the exact opposite of the governing guideline.
   The PRD's subjects were carried by hand instead, and the dropped ones are listed in the
   feature-resolution table above. The colours themselves are not lost: they are recorded in
   `_spec/.../04-uiux-brief.md`, on the authoring side where the guideline does not reach.
4. **Two Kill Bill seed addresses were changed.** reference/K K.4 pins the `orbit-acme` and
   `orbit-northwind` account addresses on an RFC-6761 reserved top-level domain. G55 RD-6 rejects
   those outright, because an address on a reserved TLD cannot be registered, so
   `environment/killbill-init.sh` seeds both on the RFC-2606 corpus domain instead. Neither
   address is asserted anywhere in this task; the external keys the brief names are unchanged.

## Honest exit state

`MECHANICALLY-GREEN, NO-SOLUTION`, with two standing reds and neither of them a defect in the
bundle's content: G2 because the tasker requires `task.toml` to carry no author names, and G46
because of where the folder sits. `solution/app/` carries a run manifest and a credentials file
and no application code. Nothing here has been compiled, booted or run. Every gate above is
static analysis of the authored bytes except the self-attested prompt receipt.

## Channel partition

Browser, pytest and rubric now partition all 440 checklist obligations with no intersection in
any direction and no obligation graded twice inside its own channel: 206 browser, 200 pytest,
34 rubric. Five obligations were re-homed. Three were graded twice: `C-DM-36` (the
`VELA-A1-YELLOW` seed) moved off the `/shop/flagship` browser substep to the seed pytest that
already asserted it, `C-DM-22` (one live ownership row per device) moved to the concurrency test
that actually proves the invariant, and `C-DM-66` (the A1 firmware seed row) moved to the seed
test. Two were the wrong CHANNEL rather than duplicated: `C-FE-105` (`That did not work.`) and
`C-FE-106` (`That page does not exist.`) are `literal`-tagged, and the rubric criterion that
judged them quoted both strings verbatim in its evaluation rule --- string equality is
deterministic work. That criterion is gone from the judged rubric and both obligations moved to
the sign-in browser substep. Every rubric-owned checklist item is now tagged `ui`, `constraint`
or `capability` and never `literal`, so no pinned string is judged by the LLM channel.
