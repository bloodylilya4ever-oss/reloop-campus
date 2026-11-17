# RELOOP Campus — Dual Portal Interactive Prototype (V2)

A responsive, frontend-only enhancement of the original RELOOP Campus prototype for the **CCRE-SWMIS / BUS4093** tender simulation. The brand look, original illustrations, three modules, and HTML/CSS/JavaScript architecture are retained.

**All users, items, balances, environmental samples, work orders, and events in this version are fictional.** There is no real university account, payment, physical recycling check, QR validation, API or remote database.

## Run locally

1. Download and extract the source ZIP.
2. Open `index.html` in Chrome / Edge / Safari / Firefox. No Node, npm or server is required.
3. Choose **Continue as student** or **Continue as staff** on the public landing page.
4. Use **Switch portal** in the header to return to the public landing page and choose the other demo role. Switching preserves the browser-local shared state.
5. Use **Reset demo** in the top banner, confirm the dialog, and the data will return to the original synthetic seed.

If a browser restricts the local file `file://` origin, use a local development server from this folder:

```
python -m http.server 8000
```

Then open `http://localhost:8000` in your own browser. The fully self-contained standalone file (`RELOOP_Dual_Portal_Standalone.html`) embeds CSS, JavaScript and all SVG assets and can be opened directly.

## Role views vs modules

- **Student Portal**: My Home, Marketplace (Module A), Circular Actions & Rewards (Module B), My Profile with Listings / Reservations / Circular Activities / Points Ledger / Saved Items.
- **Staff Portal**: Module C Overview, Verification Queue (Module B review), Listings & Disputes (Module A governance), Collection Points / Work Orders, Sustainability, Demo Audit Trail.
- **Public Landing**: original ReLoop brand page with two visible role entry choices.

The role selector is **for UI demonstration only**. It does not represent campus authentication or secure access control. There are UI/navigation/event guards, but a user with browser developer tools can modify the local state.

## Presentation script (same browser, same tab)

### A. Student exchange → rewards

1. Continue as Student → Marketplace → open **Intro to MIS textbook**.
2. Reserve item → simulate seller acceptance → simulate the seller scan.
3. Observe the **Complete** button is disabled until the buyer scan is also simulated.
4. Simulate buyer scan → Complete → open **My Profile / Reservations** and **Points Ledger** to show the completed status and single **+20 demo points** entry.

### B. Student circular action → staff verification → student

1. Student → Circular Actions → submit a recycling, donation, or repair record.
2. See the `Pending` state in My Profile / Circular Activities. No points are awarded yet.
3. Switch portal → Staff → Verification queue → review the same record ID, enter an approval reason, and approve.
4. Switch portal → Student → Profile / Circular Activities, see `Approved`, and visit the ledger to see the points event. Rejecting a separate submission shows the reason with no points awarded.

### C. Facilities issue → work order

1. Staff → Overview / Collection Points: review the **synthetic** North Residence 24% example (24 incorrect items of 100 audited).
2. Create the signage work order, view it in Facilities, and mark it Resolved.
3. View Audit Trail for the action history. **Resolved** means the demo task status changed, not that the waste outcome was improved in reality.

### D. Optional moderation demonstration

1. Student publishes a title including the example term `knife` (used **only** as a demo screening keyword).
2. This item becomes `Pending review` and stays out of public marketplace results.
3. Staff → Listings & disputes → manually review with an explanation → return to Student.
4. A student can report an item from item details. Active or completed exchange reports freeze the transaction until a staff human decision.

## Important scope / implementation status

**Implemented locally**: searchable/sortable marketplace, demo listing, category filter, favorites, reservation and seller acceptance buttons, two-person confirmation simulation, circular record submission, staff approval / rejection with reason and idempotent points ledger, staff listing moderation / report processing, simulated facilities work orders, profile timeline, portal switching, localStorage persistence and v3 schema migration, event audit, responsive layout.

**Simulated / illustrative**: item illustrations, signed-QR concept (not a scannable QR), staff decisions, reward amounts, all people and operational data, North Residence audit rate, starting exchange/actions totals (128 and 36) plus newly performed local demo events. Paid partner voucher and listing promotion credit are not real benefits. Credits are stored; promotional placement is not automatically applied when a category has fewer than ten products, to avoid violating the proposed 10% limit.

**Design only / not built**: real item-photo upload (formal policy requires 1–5 images), genuine moderation policy engine, reservation expiry after 24 hours, automatic reminder for seller response within 12 hours, QR token signing / validity window ±2 hours, missed-meeting enforcement (human oversight required), real notifications, cross-device synchronization, offline service worker / installable PWA, production encryption, tamper-proof logs, school identity / housing / asset / reward / facilities interfaces, staff identity authorization, environmental measurement verification, actual data retention or regulatory compliance.

## Local data

- `localStorage` main key: `reloop-campus-showcase-v3` (preserved for compatibility; schema upgraded to `meta.schemaVersion = 4`).
- Role demo key: `reloop-campus-role-v1`.
- All activity and state changes occur on the current browser origin; data do not synchronize across browsers or devices.
- Old v3 stores with `items`, `points`, `ledger`, `submissions`, and `workOrders` are migrated on load and saved back to storage. The demo uses only structural validation and does not offer production-grade protection against corrupted or adversarial data.

## Testing

Two automated Chromium test scripts were run using `page.set_content` and an in-memory localStorage shim because navigation to local files and localhost was blocked in the available browser environment. The tests exercised real DOM events and the production JS/CSS, but did **not** verify opening the packaged file directly over `file://` on a user's machine.

- `TEST_RESULTS.json`: 35/35 functional, role, persistence and 375px/768px/1440px responsive checks passed.
- `EDGE_TEST_RESULTS.json`: 10/10 moderation, dispute freeze/release, accessibility escape shortcut and v3 migration checks passed.
- Both test sets reported zero JavaScript page errors.
- The test result files provide exact per-case evidence; see `DESIGN_HANDOFF.md` and `USABILITY_TEST_PLAN.md` for scope and Section 9 testing.

## Source files

- `index.html` — original sections plus the role selector, Student Home/Profile, Staff workspace.
- `styles.css` — original design tokens and responsive CSS plus portal components.
- `app.js` — original core behavior extended for shared state, role gates, moderation, verification and audit.
- `assets/*.svg` — original RELOOP artwork and favicon, unchanged.
- `DESIGN_HANDOFF.md` — requirements mapping, IA, flows, role matrix and limitations.
- `USABILITY_TEST_PLAN.md` — template for **three real user tests**, which are not performed by the automated tests.

## Creative component reminder

The course requires at least **three real usability-test participants** and a short summary if your group uses the interactive-prototype option. Automated Chromium checks and fictional records are not substitutes for real participants.
