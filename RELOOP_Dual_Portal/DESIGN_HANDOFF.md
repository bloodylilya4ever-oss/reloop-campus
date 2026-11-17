# RELOOP Dual Portal — Phase A Design & Phase B Implementation Handoff

## Sources / precedence

Business rules: Part 2 (Campus Exchange), part 3 (Sustainability, Governance, Risk), part 4 (Architecture). Source ZIP and `ReLoop_Dual_Portal_Design_Skill.zip` guided implementation. Priority applied: course RFP > Part 2–4 > working original front-end behavior > external UI references. RFP project is a hypothetical 15,000-student campus.

## Existing features and gaps

| Feature | Existing V1 | New V2 |
|---|---|---|
| Public RELOOP visual identity | Original hero, olive/lime and SVG assets | Retained, added portal selection |
| Marketplace | Search, sort, favorites, publish, reserve, 2 confirmation steps | Kept; ownership, listing review queue, reporting and profile activity added |
| Circular actions / rewards | Pending submission, basic staff approve/reject and wallet | Staff reason/time, single issuance, student history and ledger event references |
| Operations | Overview, synthetic location bars, work order create/resolve | Task-first workspace, expanded staff tabs, audit and stated target limitations |
| Role separation | Staff tab visible to everyone | Demo role gating at navigation, route and event / form levels |
| User profile | None | My Home and My Profile with five activity sections |
| Audit | No event schema | Illustrative event trail with role/time/object/action/reason |

## IA / Wireframes (text)

**Public**: Landing (original illustrated hero and content) → two large role cards, Student / Staff. Role selector always indicates DEMO; switch returns to landing without deleting business state.

**Student desktop**: top ReLoop nav (Home, My Home, Marketplace, Circular actions, My profile), simple editorial heading, 3 horizontally aligned status cards, quick action grid, personal activity column. My Profile uses green identity band + horizontally scrolling segment navigation + focused record list.

**Student 375px**: header condensed, wallet in My Home instead of header, full-width kpi stack with two small lower cards, quick actions 2×2 and activity below. My Profile tabs scroll horizontally, records stack vertically.

**Staff desktop**: light-green sidebar (Overview / Verification / Listings & Disputes / Collection Points & Work Orders / Sustainability / Audit), main branded heading, compact task-driven list and details. Existing 128/36 numbers are synthetic starting scenarios; additions from clicks are displayed separately.

**Staff 375px**: sticky global header + horizontally scrollable staff navigation, vertically stacked cards/list items, no page-level horizontal overflow.

## Role × operation matrix

| Operation | Student | Staff |
|---|---|---|
| Browse, search, save, post, reserve and confirm | Yes | No |
| Submit circular action, view own history and rewards | Yes | No |
| Staff circular verify/deny with reason | No | Yes |
| Review flagged listings and reports | No | Yes |
| Create and resolve work orders | No | Yes |
| View aggregated operations/sustainability and audit | No | Yes (demo staff only) |

The implementation checks visible navigation, requested routes including `#operations`, and event/submit dispatch. It does NOT provide server-side authorization.

## Shared data / information flow

Main state keeps the original `reloop-campus-showcase-v3` key while migrating to schema v4. Entities are: `items`, `reservations`, `submissions`, `ledger`, `workOrders`, `reports`, `auditEvents` plus simulated `favorites`, `featuredCredits`, and illustrative starting counts. `meta.schemaVersion = 4`. Separate `reloop-campus-role-v1` controls the demo persona. Unique record IDs and timestamps added to new events.

**Flow A**: student `submit` → `submissions[id].status=Pending` → staff review with reason → `Approved` or `Rejected` → only approved writes one `ledger[source=CA-id]` → student activity and staff counts rerender → localStorage persists.

**Flow B**: post (basic illustrative keyword screen / human review if flagged) → marketplace → reserve → seller accepts → `sellerScan` and `buyerScan` simulated independently → `Completed` only if both done → one ledger entry `EX-id` → manager summary increments. Report on active or completed exchange sets `Disputed` and freezes record until manual staff resolution.

**Flow C**: staff sees synthetic sample `North Residence: 24/100` incorrectly sorted → create work order → duplicate open task prevention → resolve and log outcome. Subsequent physical reinspection is NOT simulated as a measured result.

Mutation chain: UI event → role guard and validation → shared state mutation → audit event → localStorage save → render derived status in Student/Staff views. UI interactivity can be modified by users and is only for presentation.

## Original Part 2 policy vs implementation

| Policy | Prototype |
|---|---|
| Listing title/category/condition, Sell/Free/Donate, location/window | Available; illustration stands in for one photo |
| 1–5 genuine item photos | Design-only; no file upload |
| Basic content screening, human review if needed, reason code | Simplified demo keyword routing + human review and notes; not real campus policy |
| 24h hold / 12h seller reply | Displayed; real time expiration & reminder not enforced |
| QR tied to exchange, single-use and ±2h window | Two buttons model both sides and prevent repeated completion; QR artwork not scannable or cryptographically signed; real time validity not enforced |
| First missed meeting warning; second in-semester ban | Design-only; human oversight needed; no automatic punishment |
| Reports freeze transaction / staff response within 2 days | Report freeze and manual staff decision implemented; 2-day SLA described, not enforced |
| Featured slot ≤10% per category, labeled, rotating, auditable | Demo credit can be acquired; slot placement not enabled for short categories; no claim of real guaranteed exposure |

## Part 3 / Part 4 governance and architecture boundary

**Targets (not observed outcomes)**: 45 tonnes landfill diversion/year, 2,800 reuse/donation/repair transactions/year, ≥80% traceable waste records, ≥30% monthly active students/staff, 7–9 paid ambassadors. No real annual weight, user denominator or traceability coverage available. The UI marks these unavailable.

**Synthetic scenario**: North Residence 24/100, South Residence 11/100, Science Building 14/100 incorrectly sorted; 49/300 = 16.3% illustrative overall. The original V1 also has 128 simulated completed exchanges and 36 simulated approved circular actions; newly performed local demo events are added separately.

**Four-layer proposal**: User interface, Application/API, Shared Data, Campus Integration Adapters. Only the local UI and client-side simulation exist; no live API, SSO, payment, full PWA service worker, real audit immutability, campus systems or security guarantees. 24-month personal inactivity deletion and 3-year audit retention are governance proposals, not coded behavior.

## External reference mapping

| Reference | Borrowed pattern | Not copied |
|---|---|---|
| GreenRoots, Land-book | Olive/lime palette, editorial spacing, oversized headings | Brand, logos, templates, imagery |
| GivePulse User Dashboard / Verification | Student quick stats, activity states, pending/verified | Volunteering-specific measures and email workflows |
| Sharetribe | Marketplace listing/search and moderation workflow | Commerce platform and payments |
| Bower | Circular participation → reward visibility | Barcode network or cashback |
| MaintainX | Staff task navigation, list/detail and work-order states | Enterprise ERP and real service APIs |
| WATS | Location-based sustainability view | Supplier operations, OCR, commercial integration |

All original RELOOP SVGs are reused unchanged.

## P0/P1/P2 and changed files

P0: Retain modules A/B/C, frontend prototype, responsive, original style, real-user testing template. P1: Dual portal, profile, shared events, staff moderation, role gate and audit. P2: Real sustainability calculations, automated timers/notifications, physical QR, production resilience and external integrations (out of scope or design-only).

Modified: `index.html`, `styles.css`, `app.js`, `README.md`. Preserved `assets/*.svg`. New handoff docs, test result JSON, and preview images. No npm/build system added.

## Verification evidence / limits

`TEST_RESULTS.json`: 35/35 tests passed. `EDGE_TEST_RESULTS.json`: 10/10 tests passed. Zero JS page errors in those Chromium runs. Testing covers 375px, 768px, and 1440px. The runner injected the original CSS/JS and inline SVGs via `page.set_content`, with a mock localStorage API because this environment blocked navigation to file URLs and local hosts. This tests actual interaction code but is not full in-browser file-loading validation. The standalone file is designed to remove asset dependencies; confirm it in your own browser before presentation. Three real human usability tests remain required by the RFP.
